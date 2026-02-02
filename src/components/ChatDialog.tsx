"use client";

import React, { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/lib/supabaseClient";
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

// Use a static valid UUID for the simulated support ID
const SIMULATED_SUPPORT_ID = "00000000-0000-0000-0000-000000000001";

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
        console.error("Error fetching messages:", error);
        showError("Errore nel caricamento dei messaggi.");
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
  }, [isOpen, currentUserId, chatPartnerId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (newMessage.trim() === "" || !currentUserId || !chatPartnerId) return;

    const tempId = `temp-${Date.now()}`; // Temporary ID for optimistic update
    const optimisticMsg: Message = {
      id: tempId,
      sender_id: currentUserId,
      receiver_id: chatPartnerId,
      text: newMessage,
      timestamp: new Date().toISOString(),
      read: false,
    };

    setMessages((prev) => [...prev, optimisticMsg]); // Optimistic update for user's message
    setNewMessage("");

    // Prepare message for Supabase, WITHOUT the temporary ID
    const messageToInsert = {
      sender_id: currentUserId,
      receiver_id: chatPartnerId,
      text: optimisticMsg.text,
      timestamp: optimisticMsg.timestamp,
      read: optimisticMsg.read,
    };

    const { data, error } = await supabase.from('messages').insert([messageToInsert]).select();
    if (error) {
      console.error("Error sending message:", error);
      showError("Errore durante l'invio del messaggio.");
      // Revert optimistic update if error
      setMessages((prev) => prev.filter(msg => msg.id !== tempId));
    } else if (data && data.length > 0) {
      // Replace optimistic message with actual message from DB
      setMessages((prev) => prev.map(msg => msg.id === tempId ? data[0] as Message : msg));
    }

    // Simulate a response from the chat partner if it's the support chat
    if (chatPartnerId === SIMULATED_SUPPORT_ID) {
      // Add a "thinking" message optimistically
      const thinkingBotId = `temp-bot-thinking-${Date.now()}`;
      const optimisticThinkingMsg: Message = {
        id: thinkingBotId,
        sender_id: chatPartnerId,
        receiver_id: currentUserId,
        text: "Sto elaborando la tua richiesta...", // Thinking message
        timestamp: new Date().toISOString(),
        read: false,
      };
      setMessages((prev) => [...prev, optimisticThinkingMsg]);

      setTimeout(async () => {
        let botText = "Ho ricevuto il tuo messaggio! Un operatore ti risponderà a breve.";
        const lowerCaseMessage = newMessage.toLowerCase();

        if (lowerCaseMessage.includes("creator hub") || lowerCaseMessage.includes("campagna") || lowerCaseMessage.includes("brief") || lowerCaseMessage.includes("creare campagna") || lowerCaseMessage.includes("pubblicare brief") || lowerCaseMessage.includes("influencer")) {
          botText = "Capisco che sei interessato al Creator Hub. Questa sezione è il cuore per la creazione di campagne video. Qui puoi pubblicare nuovi brief, gestire le proposte ricevute dagli influencer e monitorare lo stato dei contratti attivi. Se sei un influencer, puoi trovare nuove opportunità di collaborazione.";
        } else if (lowerCaseMessage.includes("investment floor") || lowerCaseMessage.includes("investimento") || lowerCaseMessage.includes("startup") || lowerCaseMessage.includes("finanziare") || lowerCaseMessage.includes("cercare fondi") || lowerCaseMessage.includes("loi") || lowerCaseMessage.includes("lettera di intenti")) {
          botText = "L'Investment Floor è il luogo per le opportunità di investimento. Se sei un'azienda, puoi caricare il pitch della tua startup per attrarre investitori. Se sei un investitore, puoi esplorare i pitch disponibili, inviare Lettere di Intenti (LOI) e finanziare le startup che ritieni più promettenti.";
        } else if (lowerCaseMessage.includes("profilo") || lowerCaseMessage.includes("wallet") || lowerCaseMessage.includes("documenti") || lowerCaseMessage.includes("ruolo") || lowerCaseMessage.includes("transazioni") || lowerCaseMessage.includes("notifiche")) {
          botText = "La sezione 'Profilo e Wallet' ti permette di gestire tutte le tue informazioni personali. Qui puoi visualizzare e aggiornare il tuo ruolo, caricare documenti, controllare il saldo del tuo wallet, vedere le transazioni recenti e gestire le tue notifiche.";
        } else if (lowerCaseMessage.includes("social impact") || lowerCaseMessage.includes("progetto sociale") || lowerCaseMessage.includes("sponsorizzazione") || lowerCaseMessage.includes("sostenere") || lowerCaseMessage.includes("comunità") || lowerCaseMessage.includes("raccolta fondi")) {
          botText = "La sezione Social Impact è dedicata ai progetti che fanno la differenza. Se sei una squadra o un'organizzazione, puoi caricare le tue richieste di sponsorizzazione per trovare supporto. Se sei un'azienda o un investitore, puoi scoprire e finanziare progetti attivi nella tua comunità.";
        } else if (lowerCaseMessage.includes("messaggi") || lowerCaseMessage.includes("chat") || lowerCaseMessage.includes("comunicare")) {
          botText = "La sezione 'Messaggi' è il tuo centro di comunicazione. Qui puoi gestire tutte le tue conversazioni con altri utenti e con il team di supporto di ConnectHub. Puoi avviare nuove chat o continuare quelle esistenti per qualsiasi necessità.";
        } else if (lowerCaseMessage.includes("problema") || lowerCaseMessage.includes("aiuto") || lowerCaseMessage.includes("supporto") || lowerCaseMessage.includes("non funziona") || lowerCaseMessage.includes("errore")) {
          botText = "Capisco che stai riscontrando un problema e sono qui per aiutarti. Per una risposta più efficace, potresti specificare meglio l'area dell'app o la funzionalità che ti sta dando problemi? Ad esempio: 'problema con i pagamenti nel wallet' o 'non riesco a caricare un brief'. Se la situazione persiste, inoltrerò la tua richiesta a un operatore umano.";
        } else if (lowerCaseMessage.includes("ciao") || lowerCaseMessage.includes("salve") || lowerCaseMessage.includes("buongiorno") || lowerCaseMessage.includes("buonasera")) {
          botText = "Ciao! Sono il SUPPORTO HUB di ConnectHub. Come posso esserti utile oggi? Puoi chiedermi informazioni su 'Creator Hub', 'Social Impact', 'Investment Floor', 'Profilo e Wallet' o 'Messaggi'.";
        }
        else {
          botText = "Sono il SUPPORTO HUB di ConnectHub! Non ho capito bene la tua richiesta. Puoi provare a riformulare la domanda o chiedermi informazioni su 'Creator Hub', 'Social Impact', 'Investment Floor', 'Profilo e Wallet' o 'Messaggi'.";
        }

        // Replace the "thinking" message with the actual response
        setMessages((prev) => prev.map(msg => msg.id === thinkingBotId ? { ...msg, text: botText, id: `bot-response-${Date.now()}` } : msg));

        const botResponseToInsert = {
          sender_id: chatPartnerId,
          receiver_id: currentUserId,
          text: botText,
          timestamp: new Date().toISOString(),
          read: false,
        };

        const { error: botError } = await supabase.from('messages').insert([botResponseToInsert]);
        if (botError) {
          console.error("Error sending bot response:", botError);
        }
      }, 1500); // Increased delay slightly for more natural "thinking"
    }
  };

  if (loading && isOpen) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent key={chatPartnerId} className="sm:max-w-[425px] flex flex-col h-[80vh] bg-white/80 backdrop-blur-md border border-white/30">
          <div className="flex-grow flex items-center justify-center text-muted-foreground">Caricamento messaggi...</div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent key={chatPartnerId} className="sm:max-w-[425px] flex flex-col h-[80vh] bg-white/80 backdrop-blur-md border border-white/30">
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
                      : "bg-blue-100 text-blue-900 dark:bg-blue-800 dark:text-blue-100"
                  }`}
                >
                  <p className="text-xs font-semibold mb-1">
                    {msg.sender_id === currentUserId
                      ? "Tu"
                      : msg.sender_id === SIMULATED_SUPPORT_ID
                        ? "SUPPORTO HUB"
                        : chatPartner}
                  </p>
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