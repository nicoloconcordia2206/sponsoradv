"use client";

import React, { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
}

interface ChatDialogProps {
  isOpen: boolean;
  onClose: () => void;
  chatPartner: string;
}

const ChatDialog: React.FC<ChatDialogProps> = ({ isOpen, onClose, chatPartner }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim() === "") return;

    const newMsg: Message = {
      id: String(messages.length + 1),
      sender: "Tu", // Simulate current user
      text: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, newMsg]);
    setNewMessage("");

    // Simulate a response from the chat partner
    setTimeout(() => {
      const botResponse: Message = {
        id: String(messages.length + 2),
        sender: chatPartner,
        text: "Ho ricevuto il tuo messaggio!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botResponse]);
    }, 1000);
  };

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
                className={`flex ${msg.sender === "Tu" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] p-2 rounded-lg ${
                    msg.sender === "Tu"
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