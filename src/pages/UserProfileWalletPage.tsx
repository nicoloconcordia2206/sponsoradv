"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { showSuccess, showError } from "@/utils/toast";
import ChatDialog from "@/components/ChatDialog"; // Import the new ChatDialog

const UserProfileWalletPage = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleSignContract = (contractId: string) => {
    // Simulate digital signature
    showSuccess(`Contratto ${contractId} firmato digitalmente!`);
    // In a real app, this would integrate with a digital signature API.
  };

  const handleMakePayment = (amount: number) => {
    // Simulate payment
    showSuccess(`Pagamento di €${amount} elaborato!`);
    // In a real app, this would integrate with Stripe/PayPal Connect.
  };

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
            <span>€ 1,250.00</span>
          </div>
          <Separator />
          <h3 className="text-lg font-semibold">Transazioni Recenti</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Pagamento per Campagna X</span>
              <span>- €500.00</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Ricevuto da Sponsor Y</span>
              <span>+ €250.00</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Commissione ConnectHub</span>
              <span>- €50.00</span>
            </div>
          </div>
          <Button className="w-full" onClick={() => handleMakePayment(100)}>Effettua un Pagamento (Simulato)</Button>
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
        chatPartner="Supporto ConnectHub" // You can make this dynamic later
      />
    </div>
  );
};

export default UserProfileWalletPage;