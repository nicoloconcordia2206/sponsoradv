"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { showSuccess, showError } from "@/utils/toast";
import { useRole } from "@/lib/role-store";
import { PlusCircle } from "lucide-react";
import { supabase } from "@/lib/supabaseClient"; // Import Supabase client

interface JobBrief {
  id: string;
  title: string;
  description: string;
  budget: number;
  company: string;
  deadline: string;
  user_id: string; // Link to the user who created it
}

interface Proposal {
  id: string;
  job_brief_id: string; // Link to the job brief
  jobTitle: string;
  socialLink: string;
  status: 'Inviata' | 'Accettata' | 'Rifiutata';
  user_id: string; // Link to the user who sent it
}

const CreatorHubPage = () => {
  const { role, loading: roleLoading } = useRole();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const simulatedCompanyName = "La Mia Azienda"; // For role 'Azienda'

  const [jobBriefs, setJobBriefs] = useState<JobBrief[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);

  const [newBriefTitle, setNewBriefTitle] = useState("");
  const [newBriefDescription, setNewBriefDescription] = useState("");
  const [newBriefBudget, setNewBriefBudget] = useState<number | string>("");
  const [newBriefDeadline, setNewBriefDeadline] = useState("");
  const [isBriefDialogOpen, setIsBriefDialogOpen] = useState(false);

  const [currentJobForProposal, setCurrentJobForProposal] = useState<JobBrief | null>(null);
  const [socialProfileLink, setSocialProfileLink] = useState("");
  const [isProposalDialogOpen, setIsProposalDialogOpen] = useState(false);

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

    const fetchJobBriefs = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('campaigns').select('*'); // Changed to 'campaigns'
      if (error) {
        console.error("Error fetching job briefs:", error); // Log detailed error for debugging
        showError("Errore nel caricamento dei brief video."); // Generic error message
      } else {
        setJobBriefs(data as JobBrief[]);
      }
      setLoading(false);
    };

    const fetchProposals = async () => {
      const { data, error } = await supabase.from('proposals').select('*');
      if (error) {
        console.error("Error fetching proposals:", error); // Log detailed error for debugging
        showError("Errore nel caricamento delle proposte."); // Generic error message
      } else {
        setProposals(data as Proposal[]);
      }
    };

    fetchJobBriefs();
    fetchProposals();
  }, [currentUserId, roleLoading]);

  const handlePublishBrief = async () => {
    if (!newBriefTitle || !newBriefDescription || !newBriefBudget || !newBriefDeadline || !currentUserId) {
      showError("Per favore, compila tutti i campi per il brief e assicurati di essere loggato.");
      return;
    }
    const newBrief: Omit<JobBrief, 'id'> = {
      title: newBriefTitle,
      description: newBriefDescription,
      budget: Number(newBriefBudget),
      deadline: newBriefDeadline,
      company: simulatedCompanyName, // Simulated company name
      user_id: currentUserId,
    };

    const { data, error } = await supabase.from('campaigns').insert([newBrief]).select(); // Changed to 'campaigns'
    if (error) {
      console.error("Error publishing brief:", error); // Log detailed error for debugging
      showError("Errore durante la pubblicazione del brief."); // Generic error message
    } else if (data && data.length > 0) {
      setJobBriefs((prev) => [...prev, data[0] as JobBrief]);
      showSuccess("Job Post pubblicato con successo!");
      setNewBriefTitle("");
      setNewBriefDescription("");
      setNewBriefBudget("");
      setNewBriefDeadline("");
      setIsBriefDialogOpen(false);
    }
  };

  const handleSendProposal = async () => {
    if (!socialProfileLink || !currentJobForProposal || !currentUserId) {
      showError("Per favore, inserisci il link al tuo profilo social e assicurati di essere loggato.");
      return;
    }
    const newProposal: Omit<Proposal, 'id'> = {
      job_brief_id: currentJobForProposal.id,
      jobTitle: currentJobForProposal.title,
      socialLink: socialProfileLink,
      status: 'Inviata',
      user_id: currentUserId,
    };

    const { data, error } = await supabase.from('proposals').insert([newProposal]).select();
    if (error) {
      console.error("Error sending proposal:", error); // Log detailed error for debugging
      showError("Errore durante l'invio della proposta."); // Generic error message
    } else if (data && data.length > 0) {
      setProposals((prev) => [...prev, data[0] as Proposal]);
      showSuccess(`Proposta inviata per il lavoro: "${currentJobForProposal.title}"`);
      setSocialProfileLink("");
      setCurrentJobForProposal(null);
      setIsProposalDialogOpen(false);
    }
  };

  const handleAcceptProposal = async (proposalId: string) => {
    const { error } = await supabase
      .from('proposals')
      .update({ status: 'Accettata' })
      .eq('id', proposalId);

    if (error) {
      console.error("Error accepting proposal:", error); // Log detailed error for debugging
      showError("Errore durante l'accettazione della proposta."); // Generic error message
    } else {
      setProposals(prev => prev.map(p => p.id === proposalId ? { ...p, status: 'Accettata' } : p));
      showSuccess(`Proposta accettata! Contratto generato e sistema Escrow attivato.`);
    }
  };

  if (loading || roleLoading) {
    return <div className="text-center text-muted-foreground mt-20">Caricamento dati...</div>;
  }

  return (
    <div className="space-y-8 p-4">
      <h2 className="text-3xl font-bold text-center text-primary">Creator Hub</h2>
      <p className="text-center text-muted-foreground">
        Marketplace per video influencer e aziende.
      </p>

      {(role === "Azienda" || role === "Squadra") && (
        <Card className="max-w-2xl mx-auto bg-white/40 backdrop-blur-sm border border-white/30 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>I Tuoi Brief Video</CardTitle>
              <CardDescription>Gestisci le tue campagne e le proposte ricevute.</CardDescription>
            </div>
            <Dialog open={isBriefDialogOpen} onOpenChange={setIsBriefDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <PlusCircle className="h-4 w-4" /> Crea Brief Video
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Crea un Nuovo Brief Video</DialogTitle>
                  <DialogDescription>
                    Compila i dettagli per la tua prossima campagna video.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="brief-title" className="text-right">
                      Titolo
                    </Label>
                    <Input
                      id="brief-title"
                      placeholder="Nome della campagna video"
                      className="col-span-3"
                      value={newBriefTitle}
                      onChange={(e) => setNewBriefTitle(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="brief-description" className="text-right">
                      Descrizione
                    </Label>
                    <Textarea
                      id="brief-description"
                      placeholder="Dettagli sul contenuto, target, ecc."
                      className="col-span-3"
                      value={newBriefDescription}
                      onChange={(e) => setNewBriefDescription(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="brief-budget" className="text-right">
                      Budget (€)
                    </Label>
                    <Input
                      id="brief-budget"
                      type="number"
                      placeholder="Es. 1000"
                      className="col-span-3"
                      value={newBriefBudget}
                      onChange={(e) => setNewBriefBudget(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="brief-deadline" className="text-right">
                      Scadenza
                    </Label>
                    <Input
                      id="brief-deadline"
                      type="date"
                      className="col-span-3"
                      value={newBriefDeadline}
                      onChange={(e) => setNewBriefDeadline(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handlePublishBrief}>Pubblica Brief</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="space-y-4">
            {jobBriefs.filter(job => job.user_id === currentUserId).length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {jobBriefs.filter(job => job.user_id === currentUserId).map((job) => (
                  <Card key={job.id} className="bg-white/50 border-white/40">
                    <CardHeader>
                      <CardTitle>{job.title}</CardTitle>
                      <CardDescription>Budget: €{job.budget} | Scadenza: {job.deadline}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{job.description}</p>
                      <h4 className="font-semibold mt-4">Proposte Ricevute:</h4>
                      {proposals.filter(p => p.job_brief_id === job.id).length > 0 ? (
                        <div className="space-y-2 mt-2">
                          {proposals.filter(p => p.job_brief_id === job.id).map(p => (
                            <div key={p.id} className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded-md">
                              <span>Influencer: <a href={p.socialLink} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Link Social</a></span>
                              <span>Status: {p.status}</span>
                              {p.status === 'Inviata' && (
                                <Button size="sm" onClick={() => handleAcceptProposal(p.id)}>Accetta</Button>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground mt-2">Nessuna proposta ricevuta per questo brief.</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground">Nessun brief video pubblicato. Clicca '+' per crearne uno!</p>
            )}
          </CardContent>
        </Card>
      )}

      {role === "Influencer" && (
        <>
          <h3 className="text-2xl font-semibold text-center mt-12 text-primary">Job Post Disponibili</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobBriefs.map((job) => (
              <Card key={job.id} className="bg-white/40 backdrop-blur-sm border border-white/30 shadow-md">
                <CardHeader>
                  <CardTitle>{job.title}</CardTitle>
                  <CardDescription>{job.company}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-muted-foreground">{job.description}</p>
                  <p className="font-medium">Budget: €{job.budget}</p>
                  <p className="text-sm">Scadenza: {job.deadline}</p>
                  <Dialog open={isProposalDialogOpen && currentJobForProposal?.id === job.id} onOpenChange={setIsProposalDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full mt-4" onClick={() => setCurrentJobForProposal(job)}>Proponiti</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Proponiti per "{job.title}"</DialogTitle>
                        <DialogDescription>
                          Inserisci il link al tuo profilo social per presentare la tua candidatura.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="social-link" className="text-right">
                            Link Social
                          </Label>
                          <Input
                            id="social-link"
                            placeholder="https://instagram.com/tuo-profilo"
                            className="col-span-3"
                            value={socialProfileLink}
                            onChange={(e) => setSocialProfileLink(e.target.value)}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={handleSendProposal}>Invia Proposta</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            ))}
          </div>

          <h3 className="text-2xl font-semibold text-center mt-12 text-primary">Le Tue Proposte Inviate</h3>
          <div className="max-w-2xl mx-auto space-y-4">
            {proposals.filter(p => p.user_id === currentUserId).length > 0 ? (
              proposals.filter(p => p.user_id === currentUserId).map(p => (
                <Card key={p.id} className="bg-white/50 border-white/40">
                  <CardContent className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-medium">{p.jobTitle}</p>
                      <p className="text-sm text-muted-foreground">Link: <a href={p.socialLink} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{p.socialLink}</a></p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm ${p.status === 'Accettata' ? 'bg-green-100 text-green-800' : p.status === 'Rifiutata' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                      {p.status}
                    </span>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-center text-muted-foreground">Nessuna proposta inviata.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CreatorHubPage;