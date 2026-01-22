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
import { PlusCircle } from "lucide-react";
import { supabase } from "@/lib/supabaseClient"; // Import Supabase client

interface SponsorshipRequest {
  id: string;
  title: string;
  description: string;
  amountNeeded: number;
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
  const simulatedOrganizationName = "La Mia Organizzazione"; // For role 'Squadra/Negozio'

  const [sponsorshipRequests, setSponsorshipRequests] = useState<SponsorshipRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const [newProjectTitle, setNewProjectTitle] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [newProjectAmount, setNewProjectAmount] = useState<number | string>("");
  const [newProjectPurpose, setNewProjectPurpose] = useState("");
  const [newProjectCity, setNewProjectCity] = useState("");
  const [newProjectZip, setNewProjectZip] = useState("");
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    fetchUser();
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
        setSponsorshipRequests(data as SponsorshipRequest[]);
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
    const newProject: Omit<SponsorshipRequest, 'id'> = {
      title: newProjectTitle,
      description: newProjectDescription,
      amountNeeded: Number(newProjectAmount),
      purpose: newProjectPurpose,
      city: newProjectCity,
      zip: newProjectZip,
      organization: simulatedOrganizationName, // Simulated organization name
      status: 'Attiva',
      user_id: currentUserId,
    };

    const { data, error } = await supabase.from('sponsorship_requests').insert([newProject]).select();
    if (error) {
      console.error("Error publishing project:", error); // Log detailed error for debugging
      showError("Errore durante il caricamento del progetto."); // Generic error message
    } else if (data && data.length > 0) {
      setSponsorshipRequests((prev) => [...prev, data[0] as SponsorshipRequest]);
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

  const handleFundProject = async (projectId: string, fundingType: string) => {
    const { error } = await supabase
      .from('sponsorship_requests')
      .update({ status: 'Finanziata' })
      .eq('id', projectId);

    if (error) {
      console.error("Error funding project:", error); // Log detailed error for debugging
      showError("Errore durante il finanziamento del progetto."); // Generic error message
    } else {
      setSponsorshipRequests(prev => prev.map(p => p.id === projectId ? { ...p, status: 'Finanziata' } : p));
      showSuccess(`Progetto finanziato con ${fundingType}! Ricevuta per detrazione fiscale generata.`);
    }
  };

  if (loading || roleLoading) {
    return <div className="text-center text-muted-foreground mt-20">Caricamento dati...</div>;
  }

  return (
    <div className="space-y-8 p-4">
      <h2 className="text-3xl font-bold text-center text-primary">Social Impact</h2>
      <p className="text-center text-muted-foreground">
        Sponsorizzazioni per sport e attività locali.
      </p>

      {role === "Squadra/Negozio" && (
        <Card className="max-w-2xl mx-auto bg-white/40 backdrop-blur-sm border border-white/30 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>I Tuoi Progetti di Sostegno</CardTitle>
              <CardDescription>Gestisci le tue richieste di sponsorizzazione.</CardDescription>
            </div>
            <Dialog open={isProjectDialogOpen} onOpenChange={setIsProjectDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <PlusCircle className="h-4 w-4" /> Carica Progetto
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Carica un Nuovo Progetto di Sostegno</DialogTitle>
                  <DialogDescription>
                    Descrivi la tua iniziativa per trovare sponsor.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="project-title" className="text-right">
                      Titolo Progetto
                    </Label>
                    <Input
                      id="project-title"
                      placeholder="Es. Rifacimento facciata negozio"
                      className="col-span-3"
                      value={newProjectTitle}
                      onChange={(e) => setNewProjectTitle(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="project-description" className="text-right">
                      Descrizione
                    </Label>
                    <Textarea
                      id="project-description"
                      placeholder="Dettagli sul progetto e l'impatto atteso."
                      className="col-span-3"
                      value={newProjectDescription}
                      onChange={(e) => setNewProjectDescription(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="project-amount" className="text-right">
                      Cifra Necessaria (€)
                    </Label>
                    <Input
                      id="project-amount"
                      type="number"
                      placeholder="Es. 5000"
                      className="col-span-3"
                      value={newProjectAmount}
                      onChange={(e) => setNewProjectAmount(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="project-purpose" className="text-right">
                      Scopo
                    </Label>
                    <Input
                      id="project-purpose"
                      placeholder="Es. Acquisto nuove divise"
                      className="col-span-3"
                      value={newProjectPurpose}
                      onChange={(e) => setNewProjectPurpose(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="project-city" className="text-right">
                      Città
                    </Label>
                    <Input
                      id="project-city"
                      placeholder="Es. Milano"
                      className="col-span-3"
                      value={newProjectCity}
                      onChange={(e) => setNewProjectCity(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="project-zip" className="text-right">
                      CAP
                    </Label>
                    <Input
                      id="project-zip"
                      placeholder="Es. 20100"
                      className="col-span-3"
                      value={newProjectZip}
                      onChange={(e) => setNewProjectZip(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handlePublishProject}>Carica Progetto</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="space-y-4">
            {sponsorshipRequests.filter(req => req.user_id === currentUserId).length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {sponsorshipRequests.filter(req => req.user_id === currentUserId).map((project) => (
                  <Card key={project.id} className="bg-white/50 border-white/40">
                    <CardHeader>
                      <CardTitle>{project.title}</CardTitle>
                      <CardDescription>{project.city}, {project.zip}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{project.description}</p>
                      <p className="font-medium">Cifra Necessaria: €{project.amountNeeded}</p>
                      <p className="text-sm">Scopo: {project.purpose}</p>
                      <span className={`px-3 py-1 rounded-full text-sm mt-2 inline-block ${project.status === 'Finanziata' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                        {project.status}
                      </span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground">Nessun progetto di sostegno pubblicato. Clicca '+' per caricarne uno!</p>
            )}
          </CardContent>
        </Card>
      )}

      {role === "Investitore" && (
        <>
          <h3 className="text-2xl font-semibold text-center mt-12 text-primary">Progetti di Sostegno Disponibili</h3>
          <div className="max-w-2xl mx-auto mb-6 flex gap-4">
            <Input placeholder="Filtra per Città" className="bg-white/50 backdrop-blur-sm border-white/30" />
            <Input placeholder="Filtra per CAP" className="bg-white/50 backdrop-blur-sm border-white/30" />
            <Button>Cerca</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sponsorshipRequests.map((project) => (
              <Card key={project.id} className="bg-white/40 backdrop-blur-sm border border-white/30 shadow-md">
                <CardHeader>
                  <CardTitle>{project.title}</CardTitle>
                  <CardDescription>{project.city}, {project.zip}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-muted-foreground">{project.description}</p>
                  <p className="font-medium">Cifra Necessaria: €{project.amountNeeded}</p>
                  <p className="text-sm">Scopo: {project.purpose}</p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full mt-4" disabled={project.status === 'Finanziata'}>
                        {project.status === 'Finanziata' ? 'Finanziato' : 'Finanzia'}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Finanzia "{project.title}"</DialogTitle>
                        <DialogDescription>
                          Scegli come desideri supportare questo progetto.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <Label>Opzioni di Finanziamento</Label>
                        <Select onValueChange={(value) => handleFundProject(project.id, value)}>
                          <SelectTrigger className="bg-white/50 backdrop-blur-sm border-white/30">
                            <SelectValue placeholder="Seleziona tipo di finanziamento" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Finanziamento Totale">Finanziamento Totale</SelectItem>
                            <SelectItem value="Quota Parziale">Quota Parziale</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <DialogFooter>
                        <Button onClick={() => showSuccess("Azione di finanziamento simulata.")}>Conferma Finanziamento</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default SocialImpactPage;