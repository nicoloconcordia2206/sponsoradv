"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { showSuccess, showError } from "@/utils/toast";
import { useRole } from "@/lib/role-store";
import { PlusCircle, MessageSquare, Trash2, CheckCircle2 } from "lucide-react"; // Import MessageSquare, Trash2, CheckCircle2 icons
import { supabase } from "@/lib/supabaseClient"; // Import Supabase client
import ChatDialog from "@/components/ChatDialog"; // Import ChatDialog

interface StartupPitch {
  id: string;
  name: string;
  sector: string;
  description: string;
  roi: string;
  capital: number;
  equity: number;
  status: 'Disponibile' | 'In Trattativa' | 'Finanziata';
  user_id: string; // Link to the user who uploaded it (Company)
  investor_id: string | null; // New: Link to the investor who sent LOI
}

const InvestmentFloorPage = () => {
  const { role, loading: roleLoading } = useRole();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userProfileName, setUserProfileName] = useState<string | null>(null); // New state for user's profile name

  const [startupPitches, setStartupPitches] = useState<StartupPitch[]>([]);
  const [loading, setLoading] = useState(true);

  const [newPitchName, setNewPitchName] = useState("");
  const [newPitchSector, setNewPitchSector] = useState("");
  const [newPitchDescription, setNewPitchDescription] = useState("");
  const [newPitchCapital, setNewPitchCapital] = useState<number | string>("");
  const [newPitchEquity, setNewPitchEquity] = useState<number | string>("");
  const [isPitchDialogOpen, setIsPitchDialogOpen] = useState(false);

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatPartnerId, setChatPartnerId] = useState<string | null>(null);
  const [chatPartnerName, setChatPartnerName] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
      if (user) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('full_name, username') // Try fetching both
          .eq('id', user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error("Error fetching user profile name:", profileError);
          // No showError here, as a missing name is handled by fallback text.
        } else if (profileData) {
          setUserProfileName(profileData.full_name || profileData.username || null);
        } else {
          setUserProfileName(null);
        }
      }
    };
    fetchUserAndProfile();
  }, []);

  // Fetch data from Supabase on component mount or when currentUserId changes
  useEffect(() => {
    if (!currentUserId || roleLoading) return;

    const fetchStartupPitches = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('investments').select('*'); // Changed to 'investments'
      if (error) {
        console.error("Error fetching startup pitches:", error); // Log detailed error for debugging
        showError("Errore nel caricamento dei pitch di startup."); // Generic error message
      } else {
        setStartupPitches(data as StartupPitch[]);
      }
      setLoading(false);
    };

    fetchStartupPitches();
  }, [currentUserId, roleLoading]);

  const handleUploadPitch = async () => {
    if (!newPitchName || !newPitchSector || !newPitchDescription || !newPitchCapital || !newPitchEquity || !currentUserId) {
      showError("Per favor, compila tutti i campi per il pitch e assicurati di essere loggato.");
      return;
    }
    const newPitch: Omit<StartupPitch, 'id' | 'investor_id'> = { // Exclude investor_id from initial insert
      name: newPitchName,
      sector: newPitchSector,
      description: newPitchDescription,
      roi: "N/A", // ROI is calculated/simulated by investors
      capital: Number(newPitchCapital),
      equity: Number(newPitchEquity),
      status: 'Disponibile',
      user_id: currentUserId, // Simulated current user's company
    };

    const { data, error } = await supabase.from('investments').insert([newPitch]).select(); // Changed to 'investments'
    if (error) {
      console.error("ERRORE SUPABASE (handleUploadPitch):", error);
      if (error.code === '403') {
        showError("Errore: Problema di Policy RLS. Non hai i permessi per caricare pitch.");
      } else if (error.code === 'PGRST204') {
        showError(`Errore: Colonna mancante nel database. Stai cercando di scrivere: name, sector, description, roi, capital, equity, status, user_id.`);
      } else {
        showError("Errore durante il caricamento del pitch."); // Generic error message
      }
      return;
    } else if (data && data.length > 0) {
      setStartupPitches((prev) => [...prev, data[0] as StartupPitch]);
      showSuccess("Pitch di startup caricato con successo!");
      setNewPitchName("");
      setNewPitchSector("");
      setNewPitchDescription("");
      setNewPitchCapital("");
      setNewPitchEquity("");
      setIsPitchDialogOpen(false);
    }
  };

  const handleDeleteStartupPitch = async (pitchId: string) => {
    if (!currentUserId) {
      showError("Devi essere loggato per eliminare un pitch.");
      return;
    }

    if (!window.confirm("Sei sicuro di voler eliminare questo pitch di startup?")) {
      return;
    }

    const { error } = await supabase
      .from('investments')
      .delete()
      .eq('id', pitchId)
      .eq('user_id', currentUserId); // Ensure only the owner can delete

    if (error) {
      console.error("ERRORE SUPABASE (handleDeleteStartupPitch):", error);
      if (error.code === '403') {
        showError("Errore: Problema di Policy RLS. Non hai i permessi per eliminare questo pitch.");
      } else {
        showError("Errore durante l'eliminazione del pitch.");
      }
    } else {
      setStartupPitches((prev) => prev.filter((pitch) => pitch.id !== pitchId));
      showSuccess("Pitch di startup eliminato con successo!");
    }
  };

  const handleSendLOI = async (pitchId: string, startupName: string) => {
    if (!currentUserId) {
      showError("Devi essere loggato per inviare una LOI.");
      return;
    }

    const { error } = await supabase
      .from('investments')
      .update({ status: 'In Trattativa', investor_id: currentUserId }) // Set investor_id here
      .eq('id', pitchId);

    if (error) {
      console.error("ERRORE SUPABASE (handleSendLOI):", error);
      if (error.code === '403') {
        showError("Errore: Problema di Policy RLS. Non hai i permessi per inviare LOI.");
      } else {
        showError("Errore durante l'invio della Lettera di Intenti."); // Generic error message
      }
      return;
    } else {
      setStartupPitches(prev =>
        prev.map(pitch =>
          pitch.id === pitchId ? { ...pitch, status: 'In Trattativa', investor_id: currentUserId } : pitch
        )
      );
      showSuccess(`Lettera di Intenti (LOI) inviata per ${startupName}! Lo stato è ora 'In Trattativa'.`);
      // In a real app, this would trigger a notification for the company that owns the pitch.
    }
  };

  const openChatWithUser = async (userId: string) => {
    const { data: profileData, error } = await supabase
      .from('profiles')
      .select('full_name, username')
      .eq('id', userId)
      .single();

    if (error) {
      console.error("Error fetching chat partner profile:", error);
      showError("Impossibile caricare il profilo del partner di chat.");
      return;
    }
    setChatPartnerId(userId);
    setChatPartnerName(profileData?.full_name || profileData?.username || "Utente Sconosciuto");
    setIsChatOpen(true);
  };

  if (loading || roleLoading) {
    return <div className="text-center text-primary-foreground mt-20">Caricamento dati...</div>;
  }

  const myPublishedPitches = startupPitches.filter(pitch => pitch.user_id === currentUserId);
  const myActiveInvestmentsAsCompany = myPublishedPitches.filter(pitch => pitch.status === 'In Trattativa' || pitch.status === 'Finanziata');
  const mySentLOIsAsInvestor = startupPitches.filter(pitch => pitch.investor_id === currentUserId && (pitch.status === 'In Trattativa' || pitch.status === 'Finanziata'));


  return (
    <div className="space-y-8 p-4">
      <h2 className="text-3xl font-bold text-center text-primary-foreground">Investment Floor</h2>
      <p className="text-center text-primary-foreground/80">
        La tua porta d'accesso a opportunità di investimento innovative e pitch di startup promettenti.
      </p>

      {role === "Azienda" && (
        <>
          <Card className="max-w-2xl mx-auto bg-white/20 backdrop-blur-md border border-white/30 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-primary-foreground">Carica la tua Startup</CardTitle>
                <CardDescription className="text-primary-foreground/80">Presenta la tua idea a potenziali investitori.</CardDescription>
              </div>
              <Dialog open={isPitchDialogOpen} onOpenChange={setIsPitchDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2 bg-primary-foreground text-primary hover:bg-primary-foreground/90 transition-all duration-200">
                    <PlusCircle className="h-4 w-4" /> Carica Pitch
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white/80 backdrop-blur-md border border-white/30">
                  <DialogHeader>
                    <DialogTitle className="text-primary">Carica un Nuovo Pitch di Startup</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                      Compila i dettagli per presentare la tua startup.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="pitch-name" className="text-right text-foreground">
                        Nome Startup
                      </Label>
                      <Input id="pitch-name" placeholder="Nome della tua azienda" className="col-span-3 bg-white/50 backdrop-blur-sm border-white/30 text-foreground placeholder:text-foreground/70" value={newPitchName} onChange={(e) => setNewPitchName(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="pitch-sector" className="text-right text-foreground">
                        Settore
                      </Label>
                      <Input id="pitch-sector" placeholder="Es. Tech, Green Energy" className="col-span-3 bg-white/50 backdrop-blur-sm border-white/30 text-foreground placeholder:text-foreground/70" value={newPitchSector} onChange={(e) => setNewPitchSector(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="pitch-description" className="text-right text-foreground">
                        Idea (Descrizione)
                      </Label>
                      <Textarea id="pitch-description" placeholder="Descrivi la tua idea di business" className="col-span-3 bg-white/50 backdrop-blur-sm border-white/30 text-foreground placeholder:text-foreground/70" value={newPitchDescription} onChange={(e) => setNewPitchDescription(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="capital-required" className="text-right text-foreground">
                        Capitale richiesto (€)
                      </Label>
                      <Input id="capital-required" type="number" placeholder="Es. 500000" className="col-span-3 bg-white/50 backdrop-blur-sm border-white/30 text-foreground placeholder:text-foreground/70" value={newPitchCapital} onChange={(e) => setNewPitchCapital(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="equity-offered" className="text-right text-foreground">
                        % di Quote Societarie offerte
                      </Label>
                      <Input id="equity-offered" type="number" placeholder="Es. 15" max={100} min={0} className="col-span-3 bg-white/50 backdrop-blur-sm border-white/30 text-foreground placeholder:text-foreground/70" value={newPitchEquity} onChange={(e) => setNewPitchEquity(e.target.value)} />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleUploadPitch} className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200">Carica Pitch</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="text-lg font-semibold text-primary-foreground">I Tuoi Pitch Pubblicati</h3>
              {myPublishedPitches.filter(pitch => pitch.status === 'Disponibile').length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {myPublishedPitches.filter(pitch => pitch.status === 'Disponibile').map((pitch) => (
                    <Card key={pitch.id} className="bg-white/20 backdrop-blur-md border-white/30 text-primary-foreground">
                      <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                          <CardTitle className="text-primary-foreground">{pitch.name}</CardTitle>
                          <CardDescription className="text-primary-foreground/80">{pitch.sector}</CardDescription>
                        </div>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteStartupPitch(pitch.id)} className="bg-red-600 text-white hover:bg-red-700 transition-all duration-200">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p className="text-sm text-primary-foreground/80">{pitch.description}</p>
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
                <p className="text-center text-primary-foreground/80">Nessun pitch caricato. Clicca 'Carica Pitch' per presentare la tua startup!</p>
              )}
            </CardContent>
          </Card>

          {myActiveInvestmentsAsCompany.length > 0 && (
            <Card className="max-w-2xl mx-auto bg-white/20 backdrop-blur-md border border-white/30 shadow-md mt-8">
              <CardHeader>
                <CardTitle className="text-primary-foreground">Contratti Attivi (Investimenti in Corso)</CardTitle>
                <CardDescription className="text-primary-foreground/80">Questi pitch sono in fase di trattativa o sono stati finanziati.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {myActiveInvestmentsAsCompany.map(pitch => (
                  <div key={pitch.id} className="flex items-center justify-between text-sm bg-white/10 p-3 rounded-md border border-white/20">
                    <div>
                      <p className="font-medium text-primary-foreground">{pitch.name}</p>
                      <p className="text-xs text-primary-foreground/80">Settore: {pitch.sector}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm ${pitch.status === 'Finanziata' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'} flex items-center gap-1`}>
                        {pitch.status === 'Finanziata' ? <CheckCircle2 className="h-3 w-3" /> : null} {pitch.status}
                      </span>
                      {pitch.investor_id && (
                        <Button size="sm" variant="outline" onClick={() => openChatWithUser(pitch.investor_id!)} className="bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200">
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </>
      )}

      {role === "Investitore" && (
        <>
          <h3 className="text-2xl font-semibold text-center mt-12 text-primary-foreground">Startup in Cerca di Investimenti</h3>
          <p className="text-center text-primary-foreground/80 mb-6">Scopri le prossime grandi idee e le opportunità di investimento.</p>
          <div className="max-w-2xl mx-auto mb-6 flex gap-4">
            <Input placeholder="Filtra per ROI atteso" className="bg-white/30 backdrop-blur-sm border-white/40 text-primary-foreground placeholder:text-primary-foreground/70" />
            <Input placeholder="Filtra per Settore" className="bg-white/30 backdrop-blur-sm border-white/40 text-primary-foreground placeholder:text-primary-foreground/70" />
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200">Cerca</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {startupPitches.filter(pitch => pitch.status === 'Disponibile').map((pitch) => (
              <Card key={pitch.id} className="bg-white/20 backdrop-blur-md border border-white/30 shadow-md text-primary-foreground">
                <CardHeader>
                  <CardTitle className="text-primary-foreground">{pitch.name}</CardTitle>
                  <CardDescription className="text-primary-foreground/80">{pitch.sector}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-primary-foreground/80">{pitch.description}</p>
                  <p className="text-sm text-primary-foreground/80">ROI Atteso: {pitch.roi}</p>
                  <p className="font-medium">Capitale Richiesto: €{pitch.capital.toLocaleString()}</p>
                  <p className="text-sm">Quote Offerte: {pitch.equity}%</p>
                  <span className={`px-3 py-1 rounded-full text-sm mt-2 inline-block ${pitch.status === 'In Trattativa' ? 'bg-yellow-100 text-yellow-800' : pitch.status === 'Finanziata' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                    Stato: {pitch.status}
                  </span>
                  <div className="flex gap-2 mt-4">
                    <Button
                      className="flex-grow bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200"
                      onClick={() => handleSendLOI(pitch.id, pitch.name)}
                      disabled={pitch.status !== 'Disponibile'}
                    >
                      {pitch.status === 'In Trattativa' ? 'In Trattativa' : 'Invia LOI'}
                    </Button>
                    <Button variant="outline" onClick={() => openChatWithUser(pitch.user_id)} className="flex-grow bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200">
                      <MessageSquare className="h-4 w-4 mr-2" /> Contatta Startup
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {mySentLOIsAsInvestor.length > 0 && (
            <Card className="max-w-2xl mx-auto bg-white/20 backdrop-blur-md border border-white/30 shadow-md mt-8">
              <CardHeader>
                <CardTitle className="text-primary-foreground">LOI Inviate / Investimenti in Corso</CardTitle>
                <CardDescription className="text-primary-foreground/80">Questi sono i pitch per cui hai inviato una Lettera di Intenti o che hai finanziato.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {mySentLOIsAsInvestor.map(pitch => (
                  <div key={pitch.id} className="flex items-center justify-between text-sm bg-white/10 p-3 rounded-md border border-white/20">
                    <div>
                      <p className="font-medium text-primary-foreground">{pitch.name}</p>
                      <p className="text-xs text-primary-foreground/80">Settore: {pitch.sector}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm ${pitch.status === 'Finanziata' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'} flex items-center gap-1`}>
                        {pitch.status === 'Finanziata' ? <CheckCircle2 className="h-3 w-3" /> : null} {pitch.status}
                      </span>
                      <Button size="sm" variant="outline" onClick={() => openChatWithUser(pitch.user_id)} className="bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200">
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </>
      )}

      <ChatDialog
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        chatPartner={chatPartnerName || "Utente Sconosciuto"}
        chatPartnerId={chatPartnerId || ""}
      />
    </div>
  );
};

export default InvestmentFloorPage;