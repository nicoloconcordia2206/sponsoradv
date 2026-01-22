"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { showSuccess, showError } from "@/utils/toast";

const InvestmentFloorPage = () => {
  const handleSendLOI = (startupName: string) => {
    // Simulate LOI generation
    showSuccess(`Lettera di Intenti (LOI) generata per ${startupName}!`);
    // In a real app, this would trigger backend logic to generate and pre-fill the LOI.
  };

  return (
    <div className="space-y-8 p-4">
      <h2 className="text-3xl font-bold text-center text-primary">Investment Floor</h2>
      <p className="text-center text-muted-foreground">
        Pitching di business e ricerca investitori.
      </p>

      {/* User Persona Startup: Carica Pitch Deck, Business Plan */}
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Carica la tua Startup</CardTitle>
          <CardDescription>Presenta la tua idea a potenziali investitori.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="startup-name">Nome Startup</Label>
            <Input id="startup-name" placeholder="Nome della tua azienda" />
          </div>
          <div>
            <Label htmlFor="pitch-deck">Pitch Deck (PDF)</Label>
            <Input id="pitch-deck" type="file" />
          </div>
          <div>
            <Label htmlFor="business-plan">Business Plan (PDF)</Label>
            <Input id="business-plan" type="file" />
          </div>
          <div>
            <Label htmlFor="capital-required">Capitale richiesto (€)</Label>
            <Input id="capital-required" type="number" placeholder="Es. 500000" />
          </div>
          <div>
            <Label htmlFor="equity-offered">% di Quote Societarie offerte</Label>
            <Input id="equity-offered" type="number" placeholder="Es. 15" max={100} min={0} />
          </div>
          <Button onClick={() => showSuccess("Startup caricata con successo!")}>Carica Startup</Button>
        </CardContent>
      </Card>

      {/* User Persona Investitore: Filtra e invia LOI */}
      <h3 className="text-2xl font-semibold text-center mt-12 text-primary">Startup in Cerca di Investimenti</h3>
      <div className="max-w-2xl mx-auto mb-6 flex gap-4">
        <Input placeholder="Filtra per ROI atteso" />
        <Input placeholder="Filtra per Settore" />
        <Button>Cerca</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { id: "1", name: "EcoTech Solutions", sector: "Green Energy", roi: "20%", capital: "€1M", equity: "10%" },
          { id: "2", name: "HealthAI Diagnostics", sector: "Healthcare AI", roi: "30%", capital: "€2M", equity: "15%" },
          { id: "3", name: "FutureFood Labs", sector: "Food Tech", roi: "25%", capital: "€750K", equity: "8%" },
        ].map((startup) => (
          <Card key={startup.id}>
            <CardHeader>
              <CardTitle>{startup.name}</CardTitle>
              <CardDescription>{startup.sector}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">ROI Atteso: {startup.roi}</p>
              <p className="font-medium">Capitale Richiesto: {startup.capital}</p>
              <p className="text-sm">Quote Offerte: {startup.equity}</p>
              <Button className="w-full mt-4" onClick={() => handleSendLOI(startup.name)}>Invia LOI</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default InvestmentFloorPage;