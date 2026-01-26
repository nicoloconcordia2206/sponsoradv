"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquareText, Send } from "lucide-react";
import ChatDialog from "@/components/ChatDialog";
import { supabase } from "@/lib/supabaseClient";
import { showError } from "@/utils/toast";

interface Conversation {
  id: string;
  partnerId: string;
  partnerName: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
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

  useEffect(() => {
    if (!currentUserId) return;

    const fetchConversations = async () => {
      setLoading(true);
      try {
        // This is a simplified approach. In a real app, you'd query messages
        // and group them by sender/receiver to form conversations.
        // For now, we'll simulate some conversations.
        const simulatedConversations: Conversation[] = [
          {
            id: "conv1",
            partnerId: "simulated_support_id_789",
            partnerName: "Supporto ConnectHub",
            lastMessage: "Ciao! Come possiamo aiutarti oggi?",
            lastMessageTime: "10:30",
            unreadCount: 1,
          },
          {
            id: "conv2",
            partnerId: "influencer_id_123",
            partnerName: "Influencer Alpha",
            lastMessage: "Ho inviato la proposta per la campagna.",
            lastMessageTime: "Ieri",
            unreadCount: 0,
          },
          {
            id: "conv3",
            partnerId: "azienda_id_456",
            partnerName: "Azienda Beta",
            lastMessage: "Grazie per il tuo interesse nel nostro pitch!",
            lastMessageTime: "2 giorni fa",
            unreadCount: 0,
          },
          {
            id: "conv4",
            partnerId: "squadra_id_789",
            partnerName: "Squadra Calcio Locale",
            lastMessage: "Abbiamo ricevuto il tuo finanziamento, grazie!",
            lastMessageTime: "3 giorni fa",
            unreadCount: 2,
          },
        ];
        setConversations(simulatedConversations);
      } catch (error: any) {
        console.error("Error fetching conversations:", error.message);
        showError("Errore nel caricamento delle conversazioni.");
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [currentUserId]);

  const handleOpenChat = (partnerId: string, partnerName: string) => {
    setSelectedChatPartnerId(partnerId);
    setSelectedChatPartnerName(partnerName);
    setIsChatOpen(true);
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
                    key={conv.id}
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
                    <div className="text-right">
                      <p className="text-xs text-primary-foreground/70">{conv.lastMessageTime}</p>
                      {conv.unreadCount > 0 && (
                        <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full mt-1">
                          {conv.unreadCount}
                        </span>
                      )}
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
        onClose={() => setIsChatOpen(false)}
        chatPartner={selectedChatPartnerName || "Utente Sconosciuto"}
        chatPartnerId={selectedChatPartnerId || ""}
      />
    </div>
  );
};

export default MessagesPage;