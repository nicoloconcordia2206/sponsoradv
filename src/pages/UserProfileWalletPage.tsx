"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { showSuccess, showError } from "@/utils/toast";
import ChatDialog from "@/components/ChatDialog"; // Import the new ChatDialog

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  date: string;
}

interface Notification {
  id: string;
  message: string;
  timestamp: string;
  read: boolean;
}

const UserProfileWalletPage = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [balance, setBalance] = useState(1250.00);
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: "t1", description: "Pagamento per Campagna X", amount: 500.00, type: 'debit', date: "2024-07-20" },
    { id: "t2", description: "Ricevuto da Sponsor Y", amount: 250.00, type: 'credit', date: "2024-07-18" },
    { id: "t3", description: "Commissione ConnectHub", amount: 50.00, type: 'debit', date: "2024-07-15" },
  ]);
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: "n1", message: "Nuovo messaggio da Supporto ConnectHub.", timestamp: "2024-07-22 10:30", read: false },
    { id: "n2", message: "La tua proposta per 'Campagna Lancio' è stata accettata!", timestamp: "2024-07-21 14:00", read: false },
    { id: "n3", message: "Un investitore è interessato alla tua startup 'EcoTech Solutions'.", timestamp: "2024-07-20 09:00", read: true },
  ]);

  const handleSignContract = (contractId: string) => {
    showSuccess(`Contratto ${contractId} firmato digitalmente!`);
    setNotifications(prev => [...prev, {
      id: String(prev.length + 1),
      message: `Contratto ${contractId} firmato con successo.`,
      timestamp: new Date().toLocaleString(),
      read: false,
    }]);
  };

  const handleMakePayment = (amount: number) => {
    if (balance < amount) {
      showError("Saldo insufficiente per effettuare il pagamento.");
      return;
    }
    setBalance(prev => prev - amount);
    const newTransaction: Transaction = {
      id: `t${transactions.length + 1}`,
      description: `Pagamento simulato di €${amount}`,
      amount: amount,
      type: 'debit',
      date: new Date().toISOString().slice(0, 10),
    };
    setTransactions(prev => [newTransaction, ...prev]);
    showSuccess(`Pagamento di €${amount} elaborato!`);
    setNotifications(prev => [...prev, {
      id: String(prev.length + 1),
      message: `Pagamento di €${amount} effettuato.`,
      timestamp: new Date().toLocaleString(),
      read: false,
    }]);
  };

  const handleAddNotification = (message: string) => {
    setNotifications(prev => [...prev, {
      id: String(prev.length + 1),
      message,
      timestamp: new Date().toLocaleString(),
      read: false,
    }]);
  };

  const handleMarkNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-8 p-4">
      <h2 className="text-3xl font-bold text-center text-primary">User Profile & Wallet</h2>
      <p className="text-center text-muted-foreground">
        Gestione documenti, pagamenti e contratti.
      </p>

      {/* Sezione Profilo Utente */}
      <Card className="max-w-2xl mx-auto bg-white/40 backdrop-blur-sm border border-white/30 shadow-md">
        <CardHeader>
          <CardTitle>Il Mio Profilo</CardTitle>
          <CardDescription>Gestisci le tue informazioni personali e documenti.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="user-name">Nome</Label>
            <Input id="user-name" value="Mario Rossi" readOnly className="bg-white/50 backdrop-blur-sm border-white/30" />
          </div>
          <div>
            <Label htmlFor="user-email">Email</Label>
            <Input id="user-email" value="mario.rossi@example.com" readOnly className="bg-white/50 backdrop-blur-sm border-white/30" />
          </div>
          <Separator />
          <h3 className="text-lg font-semibold">Documenti</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span>Documento d'Identità.pdf</span>
              <Button variant="outline" className="bg-white/50 backdrop-blur-sm border-white/30 text-primary hover:bg-white/70">Visualizza</Button>
            </div>
            <div className="flex items-center justify-between">
              <span>Certificato KYC.pdf</span>
              <Button variant="outline" className="bg-white/50 backdrop-blur-sm border-white/30 text-primary hover:bg-white/70">Visualizza</Button>
            </div>
            <Button className="w-full">Carica Nuovo Documento</Button>
          </div>
        </CardContent>
      </Card>

      {/* Sezione Wallet e Pagamenti */}
      <Card className="max-w-2xl mx-auto bg-white/40 backdrop-blur-sm border border-white/30 shadow-md">
        <CardHeader>
          <CardTitle>Il Mio Wallet</CardTitle>
          <CardDescription>Gestisci i tuoi fondi e transazioni.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-lg font-semibold">
            <span>Saldo Disponibile:</span>
            <span>€ {balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <Separator />
          <h3 className="text-lg font-semibold">Transazioni Recenti</h3>
          <div className="space-y-2">
            {transactions.length > 0 ? (
              transactions.map(tx => (
                <div key={tx.id} className="flex items-center justify-between text-sm">
                  <span>{tx.description} ({tx.date})</span>
                  <span className={tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}>
                    {tx.type === 'credit' ? '+' : '-'} €{tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Nessuna transazione recente.</p>
            )}
          </div>
          <Button className="w-full" onClick={() => handleMakePayment(100)}>Effettua un Pagamento (Simulato)</Button>
          <p className="text-xs text-muted-foreground mt-2">
            L'integrazione con Stripe richiederebbe la configurazione di un backend per gestire le chiavi API e i webhook.
          </p>
        </CardContent>
      </Card>

      {/* Sezione Contratti */}
      <Card className="max-w-2xl mx-auto bg-white/40 backdrop-blur-sm border border-white/30 shadow-md">
        <CardHeader>
          <CardTitle>I Miei Contratti</CardTitle>
          <CardDescription>Visualizza e firma i tuoi contratti.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span>Contratto Influencer #001</span>
              <div className="flex gap-2">
                <Button variant="outline" className="bg-white/50 backdrop-blur-sm border-white/30 text-primary hover:bg-white/70">Visualizza</Button>
                <Button onClick={() => handleSignContract("#001")}>Firma (Simulato)</Button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span>Contratto Sponsor #002</span>
              <div className="flex gap-2">
                <Button variant="outline" className="bg-white/50 backdrop-blur-sm border-white/30 text-primary hover:bg-white/70">Visualizza</Button>
                <Button onClick={() => handleSignContract("#002")}>Firma (Simulato)</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sezione Notifiche */}
      <Card className="max-w-2xl mx-auto bg-white/40 backdrop-blur-sm border border-white/30 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Notifiche {unreadNotificationsCount > 0 && <span className="ml-2 px-2 py-1 text-xs font-bold bg-red-500 text-white rounded-full">{unreadNotificationsCount}</span>}</CardTitle>
          <CardDescription>Tieni traccia degli aggiornamenti importanti.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {notifications.length > 0 ? (
            notifications.map(n => (
              <div key={n.id} className={`flex items-start justify-between p-2 rounded-md ${n.read ? 'bg-gray-50 text-gray-600' : 'bg-blue-50 text-blue-800 font-medium'}`}>
                <div>
                  <p className="text-sm">{n.message}</p>
                  <p className="text-xs text-muted-foreground">{n.timestamp}</p>
                </div>
                {!n.read && (
                  <Button variant="ghost" size="sm" onClick={() => handleMarkNotificationAsRead(n.id)} className="text-blue-600 hover:text-blue-800">
                    Segna come letto
                  </Button>
                )}
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground">Nessuna notifica.</p>
          )}
        </CardContent>
      </Card>

      {/* Sezione Chat Integrata */}
      <Card className="max-w-2xl mx-auto bg-white/40 backdrop-blur-sm border border-white/30 shadow-md">
        <CardHeader>
          <CardTitle>Chat Integrata</CardTitle>
          <CardDescription>Accedi alle tue conversazioni.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full" onClick={() => setIsChatOpen(true)}>Apri Chat</Button>
          <p className="text-sm text-muted-foreground mt-2">
            (La funzionalità di chat con scambio di file protetti richiede un'implementazione backend.)
          </p>
        </CardContent>
      </Card>

      <ChatDialog
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        chatPartner="Supporto ConnectHub"
      />
    </div>
  );
};

export default UserProfileWalletPage;