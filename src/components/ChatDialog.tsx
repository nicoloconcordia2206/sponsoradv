"use client";

import React, { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/lib/supabaseClient"; // Import Supabase client
import { showError } from "@/utils/toast";

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  text: string;
  timestamp: string;
  read: boolean;
}

interface ChatDialogProps {
  isOpen: boolean;
  onClose: () => void;
  chatPartner: string; // Display name
  chatPartnerId: string; // Actual user ID of the chat partner
}

const ChatDialog: React.FC<ChatDialogProps> = ({ isOpen, onClose, chatPartner, chatPartnerId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } = { user: null } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    fetchUser();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!isOpen || !currentUserId || !chatPartnerId) return;

    const fetchMessages = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${chatPartnerId}),and(sender_id.eq.${chatPartnerId},receiver_id.eq.${currentUserId})`) // Fetch messages relevant to this specific chat
        .order('timestamp', { ascending: true });

      if (error) {
        console.error("Error fetching messages:", error); // Log detailed error for debugging
        showError("Errore nel caricamento dei messaggi."); // Generic error message
      } else {
        setMessages(data as Message[]);
      }
      setLoading(false);
    };

    fetchMessages();

    // Set up real-time subscription for new messages
    const channel = supabase
      .channel(`chat_room_${currentUserId}_${chatPartnerId}`) // Unique channel for this chat pair
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const newMsg = payload.new as Message;
          // Only add if it's relevant to this chat (either sent by current user or to current user from this partner)
          // Use functional update to avoid 'messages' in dependency array
          if ((newMsg.sender_id === currentUserId && newMsg.receiver_id === chatPartnerId) ||
              (newMsg.sender_id === chatPartnerId && newMsg.receiver_id === currentUserId)) {
            setMessages((prevMessages) => {
              // Prevent duplicates if optimistic update already added it
              if (!prevMessages.some(msg => msg.id === newMsg.id)) {
                return [...prevMessages, newMsg];
              }
              return prevMessages;
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isOpen, currentUserId, chatPartnerId]); // Removed 'messages' from dependency array

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (newMessage.trim() === "" || !currentUserId || !chatPartnerId) return;

    const newMsg: Omit<Message, 'id'> = {
      sender_id: currentUserId,
      receiver_id: chatPartnerId,
      text: newMessage,
      timestamp: new Date().toISOString(), // Use ISO string for better sorting/storage
      read: false,
    };

    const { data, error } = await supabase.from('messages').insert([newMsg]).select();
    if (error) {
      console.error("Error sending message:", error); // Log detailed error for debugging
      showError("Errore durante l'invio del messaggio."); // Generic error message
    } else if (data && data.length > 0) {
      setMessages((prev) => [...prev, data[0] as Message]); // Aggiungi il messaggio inviato immediatamente
      setNewMessage("");
    }

    // Simulate a response from the chat partner if it's the support chat
    if (chatPartnerId === "simulated_support_id_789") {
      setTimeout(async () => {
        let botText = "Ho ricevuto il tuo messaggio! Un operatore ti risponderà a breve.";
        const lowerCaseMessage = newMessage.toLowerCase();

        if (lowerCaseMessage.includes("campagna") || lowerCaseMessage.includes("brief") || lowerCaseMessage.includes("creare")) {
          botText = "Per creare o gestire le tue campagne video, visita la sezione 'Creator Hub'. Lì puoi pubblicare nuovi brief e gestire le proposte!";
        } else if (lowerCaseMessage.includes("investimento") || lowerCaseMessage.includes("startup") || lowerCaseMessage.includes("finanziare")) {
          botText = "Se sei interessato a investire o a caricare il pitch della tua startup, la sezione 'Investment Floor' è il posto giusto per te!";
        } else if (lowerCaseMessage.includes("ruolo") || lowerCaseMessage.includes("profilo")) {
          botText = "Puoi visualizzare e gestire il tuo ruolo e le informazioni del profilo nella sezione 'Profilo e Wallet'.";
        } else if (lowerCaseMessage.includes("problema") || lowerCaseMessage.includes("aiuto") || lowerCaseMessage.includes("supporto")) {
          botText = "Capisco che hai un problema. Ho inoltrato la tua richiesta al nostro team di supporto. Ti contatteranno il prima possibile.";
        } else if (lowerCaseMessage.includes("social impact") || lowerCaseMessage.includes("progetto sociale")) {
          botText = "Per scoprire o pubblicare progetti di sostegno e iniziative sociali, visita la sezione 'Social Impact'.";
        }

        const botResponse: Omit<Message, 'id'> = {
          sender_id: chatPartnerId, // Bot is the sender
          receiver_id: currentUserId, // Current user is the receiver
          text: botText,
          timestamp: new Date().toISOString(),
          read: false,
        };
        const { error: botError } = await supabase.from('messages').insert([botResponse]);
        if (botError) {
          console.error("Error sending bot response:", botError); // Log detailed error for debugging
        }
      }, 1000);
    }
  };

  if (loading && isOpen) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px] flex flex-col h-[80vh] bg-white/80 backdrop-blur-md border border-white/30">
          <div className="flex-grow flex items-center justify-center text-muted-foreground">Caricamento messaggi...</div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] flex flex-col h-[80vh] bg-white/80 backdrop-blur-md border border-white/30">
        <DialogHeader>
          <DialogTitle className="text-gray-900">Chat con {chatPartner}</DialogTitle>
          <DialogDescription className="text-gray-600">
            Invia messaggi al tuo partner di collaborazione.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-grow p-4 border rounded-md bg-white/10 dark:bg-gray-800 mb-4 border-white/20">
          <div className="flex flex-col space-y-2">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender_id === currentUserId ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] p-2 rounded-lg ${
                    msg.sender_id === currentUserId
                      ? "bg-blue-600 text-white"
                      : "bg-blue-100 text-blue-900 dark:bg-blue-800 dark:text-blue-100" // Improved contrast
                  }`}
                >
                  <p className="text-xs font-semibold mb-1">{msg.sender_id === currentUserId ? "Tu" : chatPartner}</p>
                  <p className="text-sm">{msg.text}</p>
                  <p className="text-xs text-right mt-1 opacity-75">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        <div className="flex gap-2">
          <Input
            placeholder="Scrivi un messaggio..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleSendMessage();
              }
            }}
            className="flex-grow bg-white/30 backdrop-blur-sm border-white/40 text-gray-900 placeholder:text-gray-500"
          />
          <Button onClick={handleSendMessage} disabled={newMessage.trim() === ""} className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChatDialog;