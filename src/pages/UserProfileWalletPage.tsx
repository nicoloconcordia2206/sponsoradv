"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { showSuccess, showError } from "@/utils/toast";
import ChatDialog from "@/components/ChatDialog";
import { supabase } from "@/lib/supabaseClient";
import { MessageSquare } from "lucide-react";
import { SIMULATED_SUPPORT_ID } from "@/lib/constants"; // Import from constants

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  date: string;
  user_id: string; // Link to the user
}

interface Notification {
  id: string;
  message: string;
  timestamp: string;
  read: boolean;
  user_id: string; // Link to the user
}

interface Wallet {
  total_earned: number;
  pending_balance: number;
  available_balance: number;
}

interface Profile {
  full_name: string | null;
  username: string | null;
  company_name: string | null;
  address: string | null;
  fiscal_code: string | null;
}

const UserProfileWalletPage = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [wallet, setWallet] = useState<Wallet>({ total_earned: 0, pending_balance: 0, available_balance: 0 });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [chatPartnerId, setChatPartnerId] = useState<string | null>(null);
  const [chatPartnerName, setChatPartnerName] = useState<string | null>(null);

  // Fiscal data states
  const [companyName, setCompanyName] = useState("");
  const [address, setAddress] = useState("");
  const [fiscalCode, setFiscalCode] = useState("");
  const [profileFullName, setProfileFullName] = useState<string | null>(null);


  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
      setUserEmail(user?.email || null);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (!currentUserId) return;

    const fetchUserData = async () => {
      setLoading(true);

      // Fetch wallet data
      const { data: walletData, error: walletError } = await supabase
        .from('wallets')
        .select('*')
        .eq('id', currentUserId)
        .single();

      if (walletError && walletError.code !== 'PGRST116') { // PGRST116 means no rows found, which is fine for a new user
        console.error("Error fetching wallet:", walletError);
        showError("Errore nel caricamento del wallet.");
      } else if (walletData) {
        setWallet(walletData as Wallet);
      } else {
        // If no wallet exists, create one with default values
        const { data: newWalletData, error: newWalletError } = await supabase
          .from('wallets')
          .insert([{ id: currentUserId, total_earned: 0, pending_balance: 0, available_balance: 0 }])
          .select()
          .single();
        if (newWalletError) {
          console.error("Error creating new wallet:", newWalletError);
          showError("Errore nella creazione del wallet.");
        } else if (newWalletData) {
          setWallet(newWalletData as Wallet);
        }
      }

      // Fetch transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', currentUserId)
        .order('date', { ascending: false });

      if (transactionsError) {
        console.error("Error fetching transactions:", transactionsError);
        showError("Errore nel caricamento delle transazioni.");
      } else {
        setTransactions(transactionsData as Transaction[]);
      }

      // Fetch notifications
      const { data: notificationsData, error: notificationsError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', currentUserId)
        .order('timestamp', { ascending: false });

      if (notificationsError) {
        console.error("Error fetching notifications:", notificationsError);
        showError("Errore nel caricamento delle notifiche.");
      } else {
        setNotifications(notificationsData as Notification[]);
      }

      // Fetch profile data for fiscal info
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, company_name, address, fiscal_code')
        .eq('id', currentUserId)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error("Error fetching profile for fiscal data:", profileError);
        showError("Errore nel caricamento dei dati fiscali.");
      } else if (profileData) {
        setProfileFullName(profileData.full_name);
        setCompanyName(profileData.company_name || "");
        setAddress(profileData.address || "");
        setFiscalCode(profileData.fiscal_code || "");
      }

      setLoading(false);
    };

    fetchUserData();
  }, [currentUserId]);

  const handleSignContract = async (contractId: string) => {
    showSuccess(`Contratto ${contractId} firmato digitalmente!`);
    if (!currentUserId) return;

    const newNotification: Omit<Notification, 'id'> = {
      message: `Contratto ${contractId} firmato con successo.`,
      timestamp: new Date().toLocaleString(),
      read: false,
      user_id: currentUserId,
    };
    const { data, error } = await supabase.from('notifications').insert([newNotification]).select();
    if (error) {
      console.error("Error adding notification:", error);
      showError("Errore durante l'aggiunta della notifica.");
    } else if (data && data.length > 0) {
      setNotifications(prev => [data[0] as Notification, ...prev]);
    }
  };

  const handleMakePayment = async (amount: number) => {
    if (wallet.available_balance < amount) {
      showError("Saldo insufficiente per effettuare il pagamento.");
      return;
    }
    if (!currentUserId) return;
    
    const newTransaction: Omit<Transaction, 'id'> = {
      description: `Pagamento simulato di €${amount}`,
      amount: amount,
      type: 'debit',
      date: new Date().toISOString().slice(0, 10),
      user_id: currentUserId,
    };

    const { data: transactionData, error: transactionError } = await supabase.from('transactions').insert([newTransaction]).select();
    if (transactionError) {
      console.error("Error making payment:", transactionError);
      showError("Errore durante l'elaborazione del pagamento.");
    } else if (transactionData && transactionData.length > 0) {
      setTransactions(prev => [transactionData[0] as Transaction, ...prev]);
      setWallet(prev => ({ ...prev, available_balance: prev.available_balance - amount })); // Update local balance
      showSuccess(`Pagamento di €${amount} elaborato!`);

      const newNotification: Omit<Notification, 'id'> = {
        message: `Pagamento di €${amount} effettuato.`,
        timestamp: new Date().toLocaleString(),
        read: false,
        user_id: currentUserId,
      };
      const { data: notificationData, error: notificationError } = await supabase.from('notifications').insert([newNotification]).select();
      if (notificationError) {
        console.error("Error adding payment notification:", notificationError);
        showError("Errore durante l'aggiunta della notifica di pagamento.");
      } else if (notificationData && notificationData.length > 0) {
        setNotifications(prev => [notificationData[0] as Notification, ...prev]);
      }
    }
  };

  const handleMarkNotificationAsRead = async (id: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id);

    if (error) {
      console.error("Error marking notification as read:", error);
      showError("Errore nell'aggiornamento della notifica.");
    } else {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    }
  };

  const handleRequestWithdrawal = async () => {
    if (!currentUserId) {
      showError("Devi essere loggato per richiedere un prelievo.");
      return;
    }
    if (wallet.available_balance <= 0) {
      showError("Non hai fondi disponibili per il prelievo.");
      return;
    }

    // Simulate sending a notification to an admin or a PayPal request
    showSuccess(`Richiesta di prelievo di €${wallet.available_balance.toLocaleString()} inviata!`);

    const newNotification: Omit<Notification, 'id'> = {
      message: `Richiesta di prelievo di €${wallet.available_balance.toLocaleString()} inviata.`,
      timestamp: new Date().toLocaleString(),
      read: false,
      user_id: currentUserId,
    };
    const { data, error } = await supabase.from('notifications').insert([newNotification]).select();
    if (error) {
      console.error("Error adding withdrawal notification:", error);
      showError("Errore durante l'aggiunta della notifica di prelievo.");
    } else if (data && data.length > 0) {
      setNotifications(prev => [data[0] as Notification, ...prev]);
    }

    // In a real scenario, this would trigger a backend process to handle the actual withdrawal
    // For now, we'll just clear the available balance locally and in DB
    const { error: walletUpdateError } = await supabase
      .from('wallets')
      .update({ available_balance: 0 })
      .eq('id', currentUserId);

    if (walletUpdateError) {
      console.error("Error updating wallet after withdrawal request:", walletUpdateError);
      showError("Errore nell'aggiornamento del wallet dopo la richiesta di prelievo.");
    } else {
      setWallet(prev => ({ ...prev, available_balance: 0 }));
    }
  };

  const handleSaveFiscalData = async () => {
    if (!currentUserId) {
      showError("Devi essere loggato per salvare i dati fiscali.");
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        company_name: companyName,
        address: address,
        fiscal_code: fiscalCode,
      })
      .eq('id', currentUserId);

    if (error) {
      console.error("Error saving fiscal data:", error);
      showError("Errore durante il salvataggio dei dati fiscali.");
    } else {
      showSuccess("Dati fiscali salvati con successo!");
    }
  };

  const openChatWithSupport = () => {
    setChatPartnerId(SIMULATED_SUPPORT_ID); // Use a fixed ID for support
    setChatPartnerName("Supporto ConnectHub");
    setIsChatOpen(true);
  };

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return <div className="text-center text-primary-foreground mt-20">Caricamento dati utente...</div>;
  }

  return (
    <div className="space-y-8 p-4">
      <h2 className="text-3xl font-bold text-center text-primary-foreground">Il Tuo Profilo e Wallet</h2>
      <p className="text-center text-primary-foreground/80">
        Gestisci le tue informazioni personali, documenti, transazioni e comunicazioni.
      </p>

      {/* Sezione Profilo Utente */}
      <Card className="max-w-2xl mx-auto bg-white/20 backdrop-blur-md border border-white/30 shadow-md text-primary-foreground">
        <CardHeader>
          <CardTitle className="text-primary-foreground">Il Mio Profilo</CardTitle>
          <CardDescription className="text-primary-foreground/80">Gestisci le tue informazioni personali e documenti.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="user-name" className="text-primary-foreground">Nome Completo</Label>
            <Input id="user-name" value={profileFullName || "N/A"} readOnly className="bg-white/30 backdrop-blur-sm border-white/40 text-primary-foreground" />
          </div>
          <div>
            <Label htmlFor="user-email" className="text-primary-foreground">Email</Label>
            <Input id="user-email" value={userEmail || "N/A"} readOnly className="bg-white/30 backdrop-blur-sm border-white/40 text-primary-foreground" />
          </div>
          <Separator className="bg-white/30" />
          <h3 className="text-lg font-semibold text-primary-foreground">Documenti</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between bg-white/10 p-2 rounded-md border border-white/20">
              <span className="text-primary-foreground/90">Documento d'Identità.pdf</span>
              <Button variant="outline" className="bg-white/30 backdrop-blur-sm border-white/40 text-primary-foreground hover:bg-white/50 transition-all duration-200">Visualizza</Button>
            </div>
            <div className="flex items-center justify-between bg-white/10 p-2 rounded-md border border-white/20">
              <span className="text-primary-foreground/90">Certificato KYC.pdf</span>
              <Button variant="outline" className="bg-white/30 backdrop-blur-sm border-white/40 text-primary-foreground hover:bg-white/50 transition-all duration-200">Visualizza</Button>
            </div>
            <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200">Carica Nuovo Documento</Button>
          </div>
        </CardContent>
      </Card>

      {/* Sezione Dati di Fatturazione */}
      <Card className="max-w-2xl mx-auto bg-white/20 backdrop-blur-md border border-white/30 shadow-md text-primary-foreground">
        <CardHeader>
          <CardTitle className="text-primary-foreground">Dati di Fatturazione</CardTitle>
          <CardDescription className="text-primary-foreground/80">Inserisci o aggiorna i tuoi dati per la fatturazione.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="company-name" className="text-primary-foreground">Nome / Ragione Sociale</Label>
            <Input
              id="company-name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="La tua azienda o nome completo"
              className="bg-white/30 backdrop-blur-sm border-white/40 text-primary-foreground placeholder:text-primary-foreground/70"
            />
          </div>
          <div>
            <Label htmlFor="address" className="text-primary-foreground">Indirizzo</Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Via, numero civico, CAP, città"
              className="bg-white/30 backdrop-blur-sm border-white/40 text-primary-foreground placeholder:text-primary-foreground/70"
            />
          </div>
          <div>
            <Label htmlFor="fiscal-code" className="text-primary-foreground">Codice Fiscale / P.IVA</Label>
            <Input
              id="fiscal-code"
              value={fiscalCode}
              onChange={(e) => setFiscalCode(e.target.value)}
              placeholder="Il tuo codice fiscale o partita IVA"
              className="bg-white/30 backdrop-blur-sm border-white/40 text-primary-foreground placeholder:text-primary-foreground/70"
            />
          </div>
          <Button onClick={handleSaveFiscalData} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200">Salva Dati Fiscali</Button>
        </CardContent>
      </Card>

      {/* Sezione Wallet e Pagamenti */}
      <Card className="max-w-2xl mx-auto bg-white/20 backdrop-blur-md border border-white/30 shadow-md text-primary-foreground">
        <CardHeader>
          <CardTitle className="text-primary-foreground">Il Mio Wallet</CardTitle>
          <CardDescription className="text-primary-foreground/80">Gestisci i tuoi fondi e transazioni in modo sicuro.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-lg font-semibold">
            <span>Totale Guadagnato:</span>
            <span>€ {wallet.total_earned.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className="flex items-center justify-between text-lg font-semibold">
            <span>Saldo in Sospeso:</span>
            <span>€ {wallet.pending_balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className="flex items-center justify-between text-lg font-semibold">
            <span>Saldo Disponibile:</span>
            <span>€ {wallet.available_balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <Separator className="bg-white/30" />
          <h3 className="text-lg font-semibold text-primary-foreground">Transazioni Recenti</h3>
          <div className="space-y-2">
            {transactions.length > 0 ? (
              transactions.map(tx => (
                <div key={tx.id} className="flex items-center justify-between text-sm bg-white/10 p-2 rounded-md border border-white/20">
                  <span className="text-primary-foreground/90">{tx.description} ({tx.date})</span>
                  <span className={tx.type === 'credit' ? 'text-green-400' : 'text-red-400'}>
                    {tx.type === 'credit' ? '+' : '-'} €{tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-primary-foreground/80">Nessuna transazione recente.</p>
            )}
          </div>
          <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200" onClick={handleRequestWithdrawal}>Richiedi Prelievo</Button>
          <p className="text-xs text-primary-foreground/70 mt-2">
            La richiesta di prelievo invierà una notifica per l'elaborazione manuale o l'integrazione con un servizio di pagamento esterno.
          </p>
        </CardContent>
      </Card>

      {/* Sezione Contratti */}
      <Card className="max-w-2xl mx-auto bg-white/20 backdrop-blur-md border border-white/30 shadow-md text-primary-foreground">
        <CardHeader>
          <CardTitle className="text-primary-foreground">I Miei Contratti</CardTitle>
          <CardDescription className="text-primary-foreground/80">Visualizza e firma i tuoi contratti in modo sicuro e digitale.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between bg-white/10 p-2 rounded-md border border-white/20">
              <span className="text-primary-foreground/90">Contratto Influencer #001</span>
              <div className="flex gap-2">
                <Button variant="outline" className="bg-white/30 backdrop-blur-sm border-white/40 text-primary-foreground hover:bg-white/50 transition-all duration-200">Visualizza</Button>
                <Button onClick={() => handleSignContract("#001")} className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200">Firma (Simulato)</Button>
              </div>
            </div>
            <div className="flex items-center justify-between bg-white/10 p-2 rounded-md border border-white/20">
              <span className="text-primary-foreground/90">Contratto Sponsor #002</span>
              <div className="flex gap-2">
                <Button variant="outline" className="bg-white/30 backdrop-blur-sm border-white/40 text-primary-foreground hover:bg-white/50 transition-all duration-200">Visualizza</Button>
                <Button onClick={() => handleSignContract("#002")} className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200">Firma (Simulato)</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sezione Notifiche */}
      <Card className="max-w-2xl mx-auto bg-white/20 backdrop-blur-md border border-white/30 shadow-md text-primary-foreground">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-primary-foreground">Notifiche {unreadNotificationsCount > 0 && <span className="ml-2 px-2 py-1 text-xs font-bold bg-red-500 text-white rounded-full">{unreadNotificationsCount}</span>}</CardTitle>
          <CardDescription className="text-primary-foreground/80">Tieni traccia degli aggiornamenti importanti e delle attività recenti.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {notifications.length > 0 ? (
            notifications.map(n => (
              <div key={n.id} className={`flex items-start justify-between p-2 rounded-md border border-white/20 ${n.read ? 'bg-white/10 text-primary-foreground/80' : 'bg-blue-500/20 text-blue-200 font-medium'}`}>
                <div>
                  <p className="text-sm">{n.message}</p>
                  <p className="text-xs text-primary-foreground/70">{n.timestamp}</p>
                </div>
                {!n.read && (
                  <Button variant="ghost" size="sm" onClick={() => handleMarkNotificationAsRead(n.id)} className="text-blue-300 hover:text-blue-100 transition-all duration-200">
                    Segna come letto
                  </Button>
                )}
              </div>
            ))
          ) : (
            <p className="text-center text-primary-foreground/80">Nessuna notifica.</p>
          )}
        </CardContent>
      </Card>

      {/* Sezione Chat Integrata */}
      <Card className="max-w-2xl mx-auto bg-white/20 backdrop-blur-md border border-white/30 shadow-md text-primary-foreground">
        <CardHeader>
          <CardTitle className="text-primary-foreground">Supporto Chat</CardTitle>
          <CardDescription className="text-primary-foreground/80">Accedi alle tue conversazioni con il supporto di ConnectHub.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200" onClick={openChatWithSupport}>
            <MessageSquare className="h-4 w-4 mr-2" /> Apri Chat con Supporto
          </Button>
          <p className="text-sm text-primary-foreground/70 mt-2">
            (La funzionalità di chat con scambio di file protetti richiede un'implementazione backend avanzata.)
          </p>
        </CardContent>
      </Card>

      <ChatDialog
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        chatPartner={chatPartnerName || "Supporto ConnectHub"}
        chatPartnerId={chatPartnerId || ""}
      />
    </div>
  );
};

export default UserProfileWalletPage;