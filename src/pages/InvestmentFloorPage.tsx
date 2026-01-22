"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { showSuccess, showError } from "@/utils/toast";
import { useRole } from "@/lib/role-store";
import { PlusCircle } from "lucide-react";

interface StartupPitch {
  id: string;
  name: string;
  sector: string;
  description: string; // Added for 'Idea'
  roi: string; // Simulated ROI
  capital: number; // Changed to number for easier handling
  equity: number; // Changed to number for easier handling
  status: 'Disponibile' | 'In Trattativa' | 'Finanziata';
  companyId: string; // To link to the company that uploaded it
}

const InvestmentFloorPage = () => {
  const { role } = useRole();
  const [startupPitches, setStartupPitches] = useState<StartupPitch[]>([
    { id: "1", name: "EcoTech Solutions", sector: "Green Energy", description: "Piattaforma innovativa per il monitoraggio e l'ottimizzazione del consumo energetico.", roi: "20%", capital: 1000000, equity: 10, status: 'Disponibile', companyId: "Tech Innovations Inc." },
    { id: "2", name: "HealthAI Diagnostics", sector: "Healthcare AI", description: "Soluzioni AI per la diagnosi precoce di malattie complesse.", roi: "30%", capital: 2000000, equity: 15, status: 'Disponibile', companyId: "HealthAI Corp." },
    { id: "3", name: "FutureFood Labs", sector: "Food Tech", description: "Sviluppo di alimenti sostenibili a base vegetale per il mercato globale.", roi: "25%", capital: 750000, equity: 8, status: 'Disponibile', companyId: "Food Innovations Ltd." },
  ]);

  const [newPitchName, setNewPitchName] = useState("");
  const [newPitchSector, setNewPitchSector] = useState("");
  const [newPitchDescription, setNewPitchDescription] = useState("");
  const [newPitchCapital, setNewPitchCapital] = useState<number | string>("");
  const [newPitchEquity, setNewPitchEquity] = useState<number | string>("");
  const [isPitchDialogOpen, setIsPitchDialogOpen] = useState(false);

  const handleUploadPitch = () => {
    if (!newPitchName || !newPitchSector || !newPitchDescription || !newPitchCapital || !newPitchEquity) {
      showError("Per favore, compila tutti i campi per il pitch.");
      return;
    }
    const newPitch: StartupPitch = {
      id: String(startupPitches.length + 1),
      name: newPitchName,
      sector: newPitchSector,
      description: newPitchDescription,
      roi: "N/A", // ROI is calculated/simulated by investors
      capital: Number(newPitchCapital),
      equity: Number(newPitchEquity),
      status: 'Disponibile',
      companyId: "La Mia Azienda", // Simulated current user's company
    };
    setStartupPitches((prev) => [...prev, newPitch]);
    showSuccess("Pitch di startup caricato con successo!");
    setNewPitchName("");
    setNewPitchSector("");
    setNewPitchDescription("");
    setNewPitchCapital("");
    setNewPitchEquity("");
    setIsPitchDialogOpen(false);
  };

  const handleSendLOI = (pitchId: string, startupName: string) => {
    setStartupPitches(prev =>
      prev.map(pitch =>
        pitch.id === pitchId ? { ...pitch, status: 'In Trattativa' } : pitch
      )
    );
    showSuccess(`Lettera di Intenti (LOI) inviata per ${startupName}! Lo stato è ora 'In Trattativa'.`);
    // In a real app, this would trigger a notification for the company that owns the pitch.
  };

  return (
    <div className="space-y-8 p-4">
      <h2 className="text-3xl font-bold text-center text-primary">Investment Floor</h2>
      <p className="text-center text-muted-foreground">
        Pitching di business e ricerca investitori.
      </p>

      {/* User Persona Azienda: Carica Pitch Deck, Business Plan */}
      {role === "Azienda" && (
        <Card className="max-w-2xl mx-auto bg-white/40 backdrop-blur-sm border border-white/30 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Carica la tua Startup</CardTitle>
              <CardDescription>Presenta la tua idea a potenziali investitori.</CardDescription>
            </div>
            <Dialog open={isPitchDialogOpen} onOpenChange={setIsPitchDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <PlusCircle className="h-4 w-4" /> Carica Pitch
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Carica un Nuovo Pitch di Startup</DialogTitle>
                  <DialogDescription>
                    Compila i dettagli per presentare la tua startup.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="pitch-name" className="text-right">
                      Nome Startup
                    </Label>
                    <Input id="pitch-name" placeholder="Nome della tua azienda" className="col-span-3" value={newPitchName} onChange={(e) => setNewPitchName(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="pitch-sector" className="text-right">
                      Settore
                    </Label>
                    <Input id="pitch-sector" placeholder="Es. Tech, Green Energy" className="col-span-3" value={newPitchSector} onChange={(e) => setNewPitchSector(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="pitch-description" className="text-right">
                      Idea (Descrizione)
                    </Label>
                    <Textarea id="pitch-description" placeholder="Descrivi la tua idea di business" className="col-span-3" value={newPitchDescription} onChange={(e) => setNewPitchDescription(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="capital-required" className="text-right">
                      Capitale richiesto (€)
                    </Label>
                    <Input id="capital-required" type="number" placeholder="Es. 500000" className="col-span-3" value={newPitchCapital} onChange={(e) => setNewPitchCapital(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="equity-offered" className="text-right">
                      % di Quote Societarie offerte
                    </Label>
                    <Input id="equity-offered" type="number" placeholder="Es. 15" max={100} min={0} className="col-span-3" value={newPitchEquity} onChange={(e) => setNewPitchEquity(e.target.value)} />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleUploadPitch}>Carica Pitch</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="space-y-4">
            <h3 className="text-lg font-semibold">I Tuoi Pitch Pubblicati</h3>
            {startupPitches.filter(pitch => pitch.companyId === "La Mia Azienda").length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {startupPitches.filter(pitch => pitch.companyId === "La Mia Azienda").map((pitch) => (
                  <Card key={pitch.id} className="bg-white/50 border-white/40">
                    <CardHeader>
                      <CardTitle>{pitch.name}</CardTitle>
                      <CardDescription>{pitch.sector}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-sm text-muted-foreground">{pitch.description}</p>
                      <p className="font-medium">Capitale Richiesto: €{pitch.capital.toLocaleString()}</p>
                      <p className="text-sm">Quote Offerte: {pitch.equity}%</p>
                      <span className={`px-3 py-1 rounded-full text-sm mt-2 inline-block ${pitch.status === 'In Trattativa' ? 'bg-yellow-100 text-yellow-800' : pitch.status === 'Finanziata' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                        Stato: {pitch.status}
                      </span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground">Nessun pitch caricato. Clicca '+' per caricarne uno!</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* User Persona Investitore: Filtra e invia LOI */}
      {role === "Investitore" && (
        <>
          <h3 className="text-2xl font-semibold text-center mt-12 text-primary">Startup in Cerca di Investimenti</h3>
          <div className="max-w-2xl mx-auto mb-6 flex gap-4">
            <Input placeholder="Filtra per ROI atteso" className="bg-white/50 backdrop-blur-sm border-white/30" />
            <Input placeholder="Filtra per Settore" className="bg-white/50 backdrop-blur-sm border-white/30" />
            <Button>Cerca</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {startupPitches.map((pitch) => (
              <Card key={pitch.id} className="bg-white/40 backdrop-blur-sm border border-white/30 shadow-md">
                <CardHeader>
                  <CardTitle>{pitch.name}</CardTitle>
                  <CardDescription>{pitch.sector}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-muted-foreground">{pitch.description}</p>
                  <p className="text-sm text-muted-foreground">ROI Atteso: {pitch.roi}</p>
                  <p className="font-medium">Capitale Richiesto: €{pitch.capital.toLocaleString()}</p>
                  <p className="text-sm">Quote Offerte: {pitch.equity}%</p>
                  <span className={`px-3 py-1 rounded-full text-sm mt-2 inline-block ${pitch.status === 'In Trattativa' ? 'bg-yellow-100 text-yellow-800' : pitch.status === 'Finanziata' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                    Stato: {pitch.status}
                  </span>
                  <Button
                    className="w-full mt-4"
                    onClick={() => handleSendLOI(pitch.id, pitch.name)}
                    disabled={pitch.status !== 'Disponibile'}
                  >
                    {pitch.status === 'In Trattativa' ? 'In Trattativa' : 'Invia LOI'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default InvestmentFloorPage;