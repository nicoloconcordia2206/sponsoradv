"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquareText, Send, Trash2 } from "lucide-react";
import ChatDialog from "@/components/ChatDialog";
import { supabase } from "@/lib/supabaseClient";
import { showError, showSuccess } from "@/utils/toast";
import { SIMULATED_SUPPORT_ID } from "@/lib/constants"; // Import from constants

interface Conversation {
  partnerId: string;
  partnerName: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  text: string;
  timestamp: string;
  read: boolean;
}

const MessagesPage = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedChatPartnerId, setSelectedChatPartnerId] = useState<string | null>(null);
  const [selectedChatPartnerName, setSelectedChatPartnerName] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    fetchUser();
  }, []);

  const fetchConversations = useCallback(async () => {
    if (!currentUserId) return;
    setLoading(true);
    try {
      // Fetch all messages involving the current user
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`)
        .order('timestamp', { ascending: false }); // Order by latest message

      if (messagesError) {
        console.error("Error fetching messages for conversations:", messagesError);
        showError("Errore nel caricamento dei messaggi per le conversazioni.");
        setLoading(false);
        return;
      }

      const conversationMap = new Map<string, Conversation>();

      // Add the simulated support chat as a base
      conversationMap.set(SIMULATED_SUPPORT_ID, {
        partnerId: SIMULATED_SUPPORT_ID,
        partnerName: "Supporto ConnectHub",
        lastMessage: "Nessun messaggio recente.",
        lastMessageTime: "",
        unreadCount: 0,
      });

      // Process messages to build conversations
      for (const msg of messagesData || []) {
        const partnerId = msg.sender_id === currentUserId ? msg.receiver_id : msg.sender_id;

        if (!conversationMap.has(partnerId)) {
          // Fetch partner name if not already in map (and not support chat)
          let partnerName = "Utente Sconosciuto";
          if (partnerId !== SIMULATED_SUPPORT_ID) {
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('full_name, username')
              .eq('id', partnerId)
              .single();

            if (profileError && profileError.code !== 'PGRST116') {
              console.error("Error fetching profile for chat partner:", profileError);
            } else if (profileData) {
              partnerName = profileData.full_name || profileData.username || "Utente Sconosciuto";
            }
          } else {
            partnerName = "Supporto ConnectHub";
          }

          conversationMap.set(partnerId, {
            partnerId: partnerId,
            partnerName: partnerName,
            lastMessage: msg.text,
            lastMessageTime: new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            unreadCount: 0, // Will be updated below
          });
        }

        // Update last message and time if this message is newer
        const existingConv = conversationMap.get(partnerId)!;
        if (new Date(msg.timestamp) > new Date(new Date().setHours(0,0,0,0))) { // If message is from today
          existingConv.lastMessageTime = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else {
          existingConv.lastMessageTime = new Date(msg.timestamp).toLocaleDateString();
        }
        existingConv.lastMessage = msg.text;


        // Increment unread count if the message is from the partner and not read by the current user
        if (msg.receiver_id === currentUserId && !msg.read) {
          existingConv.unreadCount++;
        }
      }

      // Convert map to array and sort by last message time
      const sortedConversations = Array.from(conversationMap.values()).sort((a, b) => {
        const timeA = a.lastMessageTime.includes(':') ? new Date().setHours(parseInt(a.lastMessageTime.split(':')[0]), parseInt(a.lastMessageTime.split(':')[1]), 0, 0) : new Date(a.lastMessageTime).getTime();
        const timeB = b.lastMessageTime.includes(':') ? new Date().setHours(parseInt(b.lastMessageTime.split(':')[0]), parseInt(b.lastMessageTime.split(':')[1]), 0, 0) : new Date(b.lastMessageTime).getTime();
        return timeB - timeA;
      });

      setConversations(sortedConversations);
    } catch (error: any) {
      console.error("Error fetching conversations:", error.message);
      showError("Errore nel caricamento delle conversazioni.");
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    if (currentUserId) {
      fetchConversations();

      // Set up real-time subscription for new messages to update conversation list
      const channel = supabase
        .channel(`messages_list_for_${currentUserId}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'messages', filter: `receiver_id=eq.${currentUserId}` },
          (payload) => {
            // When a new message is received by the current user, refetch conversations
            fetchConversations();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [currentUserId, fetchConversations]);

  const handleOpenChat = (partnerId: string, partnerName: string) => {
    setSelectedChatPartnerId(partnerId);
    setSelectedChatPartnerName(partnerName);
    setIsChatOpen(true);
    // Mark messages as read when opening chat
    markMessagesAsRead(partnerId);
  };

  const markMessagesAsRead = async (partnerId: string) => {
    if (!currentUserId) return;
    const { error } = await supabase
      .from('messages')
      .update({ read: true })
      .eq('sender_id', partnerId)
      .eq('receiver_id', currentUserId)
      .eq('read', false); // Only update unread messages

    if (error) {
      console.error("Error marking messages as read:", error);
    } else {
      // Optimistically update the unread count in the UI
      setConversations(prev => prev.map(conv =>
        conv.partnerId === partnerId ? { ...conv, unreadCount: 0 } : conv
      ));
    }
  };

  const handleDeleteConversation = async (partnerId: string) => {
    if (!currentUserId) {
      showError("Devi essere loggato per eliminare una chat.");
      return;
    }

    if (!window.confirm("Sei sicuro di voler eliminare questa conversazione? Questa azione è irreversibile.")) {
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${currentUserId})`);

      if (error) {
        console.error("Error deleting conversation:", error);
        showError("Errore durante l'eliminazione della conversazione.");
      } else {
        setConversations(prev => prev.filter(conv => conv.partnerId !== partnerId));
        showSuccess("Conversazione eliminata con successo!");
      }
    } catch (error: any) {
      console.error("Error deleting conversation:", error.message);
      showError("Errore durante l'eliminazione della conversazione.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center text-primary-foreground mt-20">Caricamento messaggi...</div>;
  }

  return (
    <div className="space-y-8 p-4">
      <h2 className="text-3xl font-bold text-center text-primary-foreground">I Tuoi Messaggi</h2>
      <p className="text-center text-primary-foreground/80">
        Gestisci tutte le tue conversazioni con partner e supporto.
      </p>

      <Card className="max-w-3xl mx-auto bg-white/20 backdrop-blur-md border border-white/30 shadow-md text-primary-foreground">
        <CardHeader>
          <CardTitle className="text-primary-foreground">Conversazioni</CardTitle>
          <CardDescription className="text-primary-foreground/80">
            Clicca su una conversazione per aprirla.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-4">
              {conversations.length > 0 ? (
                conversations.map((conv) => (
                  <div
                    key={conv.partnerId}
                    className="flex items-center justify-between p-4 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-200 cursor-pointer border border-white/20"
                    onClick={() => handleOpenChat(conv.partnerId, conv.partnerName)}
                  >
                    <div className="flex items-center gap-4">
                      <MessageSquareText className="h-6 w-6 text-blue-300" />
                      <div>
                        <p className="font-semibold text-primary-foreground">{conv.partnerName}</p>
                        <p className="text-sm text-primary-foreground/80 truncate max-w-[200px]">{conv.lastMessage}</p>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-2">
                      <p className="text-xs text-primary-foreground/70">{conv.lastMessageTime}</p>
                      {conv.unreadCount > 0 && (
                        <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                          {conv.unreadCount}
                        </span>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent opening chat when deleting
                          handleDeleteConversation(conv.partnerId);
                        }}
                        className="text-red-400 hover:text-red-200"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-primary-foreground/80">Nessuna conversazione attiva.</p>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <ChatDialog
        isOpen={isChatOpen}
        onClose={() => {
          setIsChatOpen(false);
          fetchConversations(); // Re-fetch conversations to update unread counts after closing chat
        }}
        chatPartner={selectedChatPartnerName || "Utente Sconosciuto"}
        chatPartnerId={selectedChatPartnerId || ""}
      />
    </div>
  );
};

export default MessagesPage;