"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress"; // Import Progress component
import { showSuccess, showError } from "@/utils/toast";
import { useRole } from "@/lib/role-store";
import { PlusCircle, MessageSquare, Trash2 } from "lucide-react"; // Import MessageSquare and Trash2 icons
import { supabase } from "@/lib/supabaseClient"; // Import Supabase client
import ChatDialog from "@/components/ChatDialog"; // Import ChatDialog

interface SponsorshipRequest {
  id: string;
  title: string;
  description: string;
  amount: number; // Using 'amount' as per database schema
  amount_funded?: number; // New field for funded amount
  purpose: string;
  city: string;
  zip: string;
  organization: string;
  status: 'Attiva' | 'Finanziata';
  user_id: string; // Link to the user who created it
}

const SocialImpactPage = () => {
  const { role, loading: roleLoading } = useRole();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userProfileName, setUserProfileName] = useState<string | null>(null); // New state for user's profile name

  const [sponsorshipRequests, setSponsorshipRequests] = useState<SponsorshipRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const [newProjectTitle, setNewProjectTitle] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [newProjectAmount, setNewProjectAmount] = useState<number | string>("");
  const [newProjectPurpose, setNewProjectPurpose] = useState("");
  const [newProjectCity, setNewProjectCity] = useState("");
  const [newProjectZip, setNewProjectZip] = useState("");
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);

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

    const fetchSponsorshipRequests = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('sponsorship_requests').select('*');
      if (error) {
        console.error("Error fetching sponsorship requests:", error); // Log detailed error for debugging
        showError("Errore nel caricamento dei progetti di sostegno."); // Generic error message
      } else {
        // Simulate amount_funded for demonstration purposes
        const requestsWithFunded = data.map(req => ({
          ...req,
          amount_funded: req.status === 'Finanziata' ? req.amount : Math.floor(Math.random() * req.amount * 0.8) // Funded up to 80% if not fully funded
        }));
        setSponsorshipRequests(requestsWithFunded as SponsorshipRequest[]);
      }
      setLoading(false);
    };

    fetchSponsorshipRequests();
  }, [currentUserId, roleLoading]);

  const handlePublishProject = async () => {
    if (!newProjectTitle || !newProjectDescription || !newProjectAmount || !newProjectPurpose || !newProjectCity || !newProjectZip || !currentUserId) {
      showError("Per favore, compila tutti i campi per il progetto e assicurati di essere loggato.");
      return;
    }
    const newProject: Omit<SponsorshipRequest, 'id' | 'amount_funded'> = { // Exclude amount_funded from insert
      title: newProjectTitle,
      description: newProjectDescription,
      amount: Number(newProjectAmount), // Using 'amount'
      purpose: newProjectPurpose,
      city: newProjectCity,
      zip: newProjectZip,
      organization: userProfileName || "Nome Organizzazione Sconosciuta", // Use fetched name or a fallback
      status: 'Attiva',
      user_id: currentUserId,
    };

    const { data, error } = await supabase.from('sponsorship_requests').insert([newProject]).select();
    if (error) {
      console.error("ERRORE SUPABASE (handlePublishProject):", error);
      if (error.code === '403') {
        showError("Errore: Problema di Policy RLS. Non hai i permessi per pubblicare.");
      } else if (error.code === 'PGRST204') {
        showError(`Errore: Colonna mancante nel database. Stai cercando di scrivere: title, description, amount, purpose, city, zip, organization, user_id.`);
      } else {
        showError("Errore durante il caricamento del progetto."); // Generic error message
      }
      return;
    } else if (data && data.length > 0) {
      // Add simulated amount_funded for the newly created project
      const newProjectWithFunded = { ...data[0], amount_funded: 0 };
      setSponsorshipRequests((prev) => [...prev, newProjectWithFunded as SponsorshipRequest]);
      showSuccess("Progetto di Sostegno caricato con successo!");
      setNewProjectTitle("");
      setNewProjectDescription("");
      setNewProjectAmount("");
      setNewProjectPurpose("");
      setNewProjectCity("");
      setNewProjectZip("");
      setIsProjectDialogOpen(false);
    }
  };

  const handleDeleteSponsorshipRequest = async (projectId: string) => {
    if (!currentUserId) {
      showError("Devi essere loggato per eliminare un progetto.");
      return;
    }

    if (!window.confirm("Sei sicuro di voler eliminare questo progetto di sostegno?")) {
      return;
    }

    const { error } = await supabase
      .from('sponsorship_requests')
      .delete()
      .eq('id', projectId)
      .eq('user_id', currentUserId); // Ensure only the owner can delete

    if (error) {
      console.error("ERRORE SUPABASE (handleDeleteSponsorshipRequest):", error);
      if (error.code === '403') {
        showError("Errore: Problema di Policy RLS. Non hai i permessi per eliminare questo progetto.");
      } else {
        showError("Errore durante l'eliminazione del progetto.");
      }
    } else {
      setSponsorshipRequests((prev) => prev.filter((project) => project.id !== projectId));
      showSuccess("Progetto di sostegno eliminato con successo!");
    }
  };

  const handleFundProject = async (projectId: string, fundingType: string) => {
    const { error } = await supabase
      .from('sponsorship_requests')
      .update({ status: 'Finanziata' })
      .eq('id', projectId);

    if (error) {
      console.error("ERRORE SUPABASE (handleFundProject):", error);
      if (error.code === '403') {
        showError("Errore: Problema di Policy RLS. Non hai i permessi per finanziare progetti.");
      } else {
        showError("Errore durante il finanziamento del progetto."); // Generic error message
      }
      return;
    } else {
      setSponsorshipRequests(prev => prev.map(p => p.id === projectId ? { ...p, status: 'Finanziata', amount_funded: p.amount } : p));
      showSuccess(`Progetto finanziato con ${fundingType}! Ricevuta per detrazione fiscale generata.`);
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

  const renderSponsorshipRequests = (requests: SponsorshipRequest[], showFundButton: boolean) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {requests.map((project) => {
        const progressValue = project.amount_funded && project.amount ? (project.amount_funded / project.amount) * 100 : 0;
        return (
          <Card key={project.id} className="bg-white/20 backdrop-blur-md border border-white/30 shadow-md text-primary-foreground">
            <CardHeader>
              <CardTitle className="text-primary-foreground">{project.title}</CardTitle>
              <CardDescription className="text-primary-foreground/80">{project.city}, {project.zip}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-primary-foreground/80">{project.description}</p>
              <p className="font-medium">Cifra Necessaria: €{project.amount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              <p className="text-sm">Scopo: {project.purpose}</p>
              <div className="mt-2">
                <Progress value={progressValue} className="w-full h-2 bg-white/30" indicatorClassName="bg-green-500" />
                <p className="text-xs text-primary-foreground/70 mt-1">
                  {project.amount_funded?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / {project.amount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} € raccolti ({progressValue.toFixed(0)}%)
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm mt-2 inline-block ${project.status === 'Finanziata' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                {project.status}
              </span>
              <div className="flex gap-2 mt-4">
                {showFundButton && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="flex-grow bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200" disabled={project.status === 'Finanziata'}>
                        {project.status === 'Finanziata' ? 'Finanziato' : 'Finanzia'}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-white/80 backdrop-blur-md border border-white/30">
                      <DialogHeader>
                        <DialogTitle className="text-primary">Finanzia "{project.title}"</DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                          Scegli come desideri supportare questo progetto.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <Label className="text-foreground">Opzioni di Finanziamento</Label>
                        <Select onValueChange={(value) => handleFundProject(project.id, value)}>
                          <SelectTrigger className="bg-white/50 backdrop-blur-sm border-white/30 text-foreground">
                            <SelectValue placeholder="Seleziona tipo di finanziamento" />
                          </SelectTrigger>
                          <SelectContent className="bg-white/80 backdrop-blur-md border-white/30">
                            <SelectItem value="Finanziamento Totale">Finanziamento Totale</SelectItem>
                            <SelectItem value="Quota Parziale">Quota Parziale</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <DialogFooter>
                        <Button onClick={() => showSuccess("Azione di finanziamento simulata.")} className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200">Conferma Finanziamento</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
                <Button variant="outline" onClick={() => openChatWithUser(project.user_id)} className="flex-grow bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200">
                  <MessageSquare className="h-4 w-4 mr-2" /> Contatta Organizzazione
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-8 p-4">
      <h2 className="text-3xl font-bold text-center text-primary-foreground">Social Impact</h2>
      <p className="text-center text-primary-foreground/80">
        Sostieni e scopri progetti sportivi e attività locali che fanno la differenza nella tua comunità.
      </p>

      {role === "Squadra" && (
        <Card className="max-w-2xl mx-auto bg-white/20 backdrop-blur-md border border-white/30 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-primary-foreground">I Tuoi Progetti di Sostegno</CardTitle>
              <CardDescription className="text-primary-foreground/80">Gestisci le tue richieste di sponsorizzazione e monitora i progressi.</CardDescription>
            </div>
            <Dialog open={isProjectDialogOpen} onOpenChange={setIsProjectDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2 bg-primary-foreground text-primary hover:bg-primary-foreground/90 transition-all duration-200">
                  <PlusCircle className="h-4 w-4" /> Carica Progetto
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white/80 backdrop-blur-md border border-white/30">
                <DialogHeader>
                  <DialogTitle className="text-primary">Carica un Nuovo Progetto di Sostegno</DialogTitle>
                  <DialogDescription className="text-muted-foreground">
                    Descrivi la tua iniziativa per trovare sponsor.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="project-title" className="text-right text-foreground">
                      Titolo Progetto
                    </Label>
                    <Input
                      id="project-title"
                      placeholder="Es. Acquisto nuove divise per la squadra giovanile"
                      className="col-span-3 bg-white/50 backdrop-blur-sm border-white/30 text-foreground placeholder:text-foreground/70"
                      value={newProjectTitle}
                      onChange={(e) => setNewProjectTitle(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="project-description" className="text-right text-foreground">
                      Descrizione
                    </Label>
                    <Textarea
                      id="project-description"
                      placeholder="Dettagli sul progetto e l'impatto atteso sulla comunità."
                      className="col-span-3 bg-white/50 backdrop-blur-sm border-white/30 text-foreground placeholder:text-foreground/70"
                      value={newProjectDescription}
                      onChange={(e) => setNewProjectDescription(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="project-amount" className="text-right text-foreground">
                      Cifra Necessaria (€)
                    </Label>
                    <Input
                      id="project-amount"
                      type="number"
                      placeholder="Es. 5000"
                      className="col-span-3 bg-white/50 backdrop-blur-sm border-white/30 text-foreground placeholder:text-foreground/70"
                      value={newProjectAmount}
                      onChange={(e) => setNewProjectAmount(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="project-purpose" className="text-right text-foreground">
                      Scopo
                    </Label>
                    <Input
                      id="project-purpose"
                      placeholder="Es. Acquisto nuove divise"
                      className="col-span-3 bg-white/50 backdrop-blur-sm border-white/30 text-foreground placeholder:text-foreground/70"
                      value={newProjectPurpose}
                      onChange={(e) => setNewProjectPurpose(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="project-city" className="text-right text-foreground">
                      Città
                    </Label>
                    <Input
                      id="project-city"
                      placeholder="Es. Milano"
                      className="col-span-3 bg-white/50 backdrop-blur-sm border-white/30 text-foreground placeholder:text-foreground/70"
                      value={newProjectCity}
                      onChange={(e) => setNewProjectCity(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="project-zip" className="text-right text-foreground">
                      CAP
                    </Label>
                    <Input
                      id="project-zip"
                      placeholder="Es. 20100"
                      className="col-span-3 bg-white/50 backdrop-blur-sm border-white/30 text-foreground placeholder:text-foreground/70"
                      value={newProjectZip}
                      onChange={(e) => setNewProjectZip(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handlePublishProject} className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200">Carica Progetto</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="space-y-4">
            {sponsorshipRequests.filter(req => req.user_id === currentUserId).length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {sponsorshipRequests.filter(req => req.user_id === currentUserId).map((project) => {
                  const progressValue = project.amount_funded && project.amount ? (project.amount_funded / project.amount) * 100 : 0;
                  return (
                    <Card key={project.id} className="bg-white/20 backdrop-blur-sm border-white/30 text-primary-foreground">
                      <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                          <CardTitle className="text-primary-foreground">{project.title}</CardTitle>
                          <CardDescription className="text-primary-foreground/80">{project.city}, {project.zip}</CardDescription>
                        </div>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteSponsorshipRequest(project.id)} className="bg-red-600 text-white hover:bg-red-700 transition-all duration-200">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-primary-foreground/80">{project.description}</p>
                        <p className="font-medium">Cifra Necessaria: €{project.amount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        <p className="text-sm">Scopo: {project.purpose}</p>
                        <div className="mt-2">
                          <Progress value={progressValue} className="w-full h-2 bg-white/30" indicatorClassName="bg-green-500" />
                          <p className="text-xs text-primary-foreground/70 mt-1">
                            {project.amount_funded?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / {project.amount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} € raccolti ({progressValue.toFixed(0)}%)
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm mt-2 inline-block ${project.status === 'Finanziata' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                          {project.status}
                        </span>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <p className="text-center text-primary-foreground/80">Nessun progetto di sostegno pubblicato. Clicca 'Carica Progetto' per iniziare!</p>
            )}
          </CardContent>
        </Card>
      )}

      {(role === "Investitore" || role === "Azienda" || role === "Influencer") && (
        <>
          <h3 className="text-2xl font-semibold text-center mt-12 text-primary-foreground">Progetti di Sostegno Disponibili</h3>
          <p className="text-center text-primary-foreground/80 mb-6">Esplora le iniziative locali e contribuisci al loro successo.</p>
          <div className="max-w-2xl mx-auto mb-6 flex gap-4">
            <Input placeholder="Filtra per Città" className="bg-white/30 backdrop-blur-sm border-white/40 text-primary-foreground placeholder:text-primary-foreground/70" />
            <Input placeholder="Filtra per CAP" className="bg-white/30 backdrop-blur-sm border-white/40 text-primary-foreground placeholder:text-primary-foreground/70" />
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200">Cerca</Button>
          </div>
          {renderSponsorshipRequests(sponsorshipRequests, role === "Investitore")}
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

export default SocialImpactPage;