"use client";

import React, { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/lib/supabaseClient"; // Import Supabase client

interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
  user_id: string; // Link to the user who sent it
  chat_partner_id: string; // Link to the chat partner
}

interface ChatDialogProps {
  isOpen: boolean;
  onClose: () => void;
  chatPartner: string;
}

const ChatDialog: React.FC<ChatDialogProps> = ({ isOpen, onClose, chatPartner }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Simulate user IDs for chat. In a real app, these would come from Supabase auth.
  const currentUserId = "simulated_user_id_123";
  const chatPartnerId = "simulated_chat_partner_id_456"; // e.g., "Supporto ConnectHub"

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!isOpen) return;

    const fetchMessages = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`user_id.eq.${currentUserId},chat_partner_id.eq.${currentUserId}`) // Fetch messages where current user is sender or receiver
        .order('timestamp', { ascending: true });

      if (error) {
        console.error("Error fetching messages:", error);
      } else {
        setMessages(data as Message[]);
      }
      setLoading(false);
    };

    fetchMessages();

    // Set up real-time subscription for new messages
    const channel = supabase
      .channel('chat_room')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const newMsg = payload.new as Message;
          // Only add if it's relevant to this chat (either sent by current user or to current user from this partner)
          if ((newMsg.user_id === currentUserId && newMsg.chat_partner_id === chatPartnerId) ||
              (newMsg.user_id === chatPartnerId && newMsg.chat_partner_id === currentUserId)) {
            setMessages((prev) => [...prev, newMsg]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isOpen, currentUserId, chatPartnerId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (newMessage.trim() === "") return;

    const newMsg: Omit<Message, 'id'> = {
      sender: "Tu", // Display name for current user
      text: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      user_id: currentUserId,
      chat_partner_id: chatPartnerId,
    };

    const { data, error } = await supabase.from('messages').insert([newMsg]).select();
    if (error) {
      console.error("Error sending message:", error);
      showError("Errore durante l'invio del messaggio.");
    } else if (data && data.length > 0) {
      setNewMessage("");
      // The real-time subscription will add the message to the state, no need to manually add here.
    }

    // Simulate a response from the chat partner (this would be handled by a backend/AI in a real app)
    setTimeout(async () => {
      const botResponse: Omit<Message, 'id'> = {
        sender: chatPartner,
        text: "Ho ricevuto il tuo messaggio!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        user_id: chatPartnerId, // Bot is the sender
        chat_partner_id: currentUserId, // Current user is the receiver
      };
      const { error: botError } = await supabase.from('messages').insert([botResponse]);
      if (botError) {
        console.error("Error sending bot response:", botError);
      }
    }, 1000);
  };

  if (loading && isOpen) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px] flex flex-col h-[80vh]">
          <div className="flex-grow flex items-center justify-center text-muted-foreground">Caricamento messaggi...</div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] flex flex-col h-[80vh]">
        <DialogHeader>
          <DialogTitle>Chat con {chatPartner}</DialogTitle>
          <DialogDescription>
            Invia messaggi al tuo partner di collaborazione.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-grow p-4 border rounded-md bg-gray-50 dark:bg-gray-800 mb-4">
          <div className="flex flex-col space-y-2">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.user_id === currentUserId ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] p-2 rounded-lg ${
                    msg.user_id === currentUserId
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                  }`}
                >
                  <p className="text-xs font-semibold mb-1">{msg.sender}</p>
                  <p className="text-sm">{msg.text}</p>
                  <p className="text-xs text-right mt-1 opacity-75">{msg.timestamp}</p>
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
            className="flex-grow"
          />
          <Button onClick={handleSendMessage} disabled={newMessage.trim() === ""}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChatDialog;