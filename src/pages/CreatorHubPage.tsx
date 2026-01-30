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
import { PlusCircle, MessageSquare, Trash2, CheckCircle2 } from "lucide-react"; // Import CheckCircle2 icon
import { supabase } from "@/lib/supabaseClient"; // Import Supabase client
import ChatDialog from "@/components/ChatDialog"; // Import ChatDialog

interface JobBrief {
  id: string;
  title: string;
  description: string;
  budget: number;
  company: string; // This needs to be fetched from profiles.full_name or username
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
  const [userProfileName, setUserProfileName] = useState<string | null>(null); // New state for user's profile name

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
      company: userProfileName || "Nome Azienda Sconosciuto", // Use fetched name or a fallback
      user_id: currentUserId,
    };

    const { data, error } = await supabase.from('campaigns').insert([newBrief]).select(); // Changed to 'campaigns'
    if (error) {
      console.error("ERRORE SUPABASE (handlePublishBrief):", error);
      if (error.code === '403') {
        showError("Errore: Problema di Policy RLS. Non hai i permessi per pubblicare.");
      } else if (error.code === 'PGRST204') {
        showError(`Errore: Colonna mancante nel database. Stai cercando di scrivere: title, description, budget, deadline, company, user_id.`);
      } else {
        showError("Errore durante la pubblicazione del brief."); // Generic error message
      }
      return;
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

  const handleDeleteBrief = async (briefId: string) => {
    if (!currentUserId) {
      showError("Devi essere loggato per eliminare un brief.");
      return;
    }

    // Optional: Add a confirmation dialog here before deleting
    if (!window.confirm("Sei sicuro di voler eliminare questo brief video? Tutte le proposte associate verranno eliminate.")) {
      return;
    }

    const { error } = await supabase
      .from('campaigns')
      .delete()
      .eq('id', briefId)
      .eq('user_id', currentUserId); // Ensure only the owner can delete

    if (error) {
      console.error("ERRORE SUPABASE (handleDeleteBrief):", error);
      if (error.code === '403') {
        showError("Errore: Problema di Policy RLS. Non hai i permessi per eliminare questo brief.");
      } else {
        showError("Errore durante l'eliminazione del brief.");
      }
    } else {
      setJobBriefs((prev) => prev.filter((brief) => brief.id !== briefId));
      showSuccess("Brief video eliminato con successo!");
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
      console.error("ERRORE SUPABASE (handleSendProposal):", error);
      if (error.code === '403') {
        showError("Errore: Problema di Policy RLS. Non hai i permessi per inviare proposte.");
      } else if (error.code === 'PGRST204') {
        showError(`Errore: Colonna mancante nel database. Stai cercando di scrivere: job_brief_id, jobTitle, socialLink, status, user_id.`);
      } else {
        showError("Errore durante l'invio della proposta."); // Generic error message
      }
      return;
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
      console.error("ERRORE SUPABASE (handleAcceptProposal):", error);
      if (error.code === '403') {
        showError("Errore: Problema di Policy RLS. Non hai i permessi per accettare proposte.");
      } else {
        showError("Errore durante l'accettazione della proposta."); // Generic error message
      }
      return;
    } else {
      setProposals(prev => prev.map(p => p.id === proposalId ? { ...p, status: 'Accettata' } : p));
      showSuccess(`Proposta accettata! Contratto generato e sistema Escrow attivato.`);
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

  const myActiveBriefs = jobBriefs.filter(job => job.user_id === currentUserId);
  const myAcceptedProposalsAsCompany = proposals.filter(p => 
    p.status === 'Accettata' && myActiveBriefs.some(brief => brief.id === p.job_brief_id)
  );
  const mySentProposals = proposals.filter(p => p.user_id === currentUserId);
  const myAcceptedProposalsAsInfluencer = mySentProposals.filter(p => p.status === 'Accettata');
  const myPendingOrRejectedProposalsAsInfluencer = mySentProposals.filter(p => p.status !== 'Accettata');


  return (
    <div className="space-y-8 p-4">
      <h2 className="text-3xl font-bold text-center text-primary-foreground">Creator Hub</h2>
      <p className="text-center text-primary-foreground/80">
        Il marketplace dinamico dove influencer e aziende si incontrano per creare campagne video di successo.
      </p>

      {(role === "Azienda" || role === "Squadra") && (
        <>
          <Card className="max-w-2xl mx-auto bg-white/20 backdrop-blur-md border border-white/30 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-primary-foreground">I Tuoi Brief Video</CardTitle>
                <CardDescription className="text-primary-foreground/80">Gestisci le tue campagne e le proposte ricevute.</CardDescription>
              </div>
              <Dialog open={isBriefDialogOpen} onOpenChange={setIsBriefDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2 bg-primary-foreground text-primary hover:bg-primary-foreground/90 transition-all duration-200">
                    <PlusCircle className="h-4 w-4" /> Crea Brief Video
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white/80 backdrop-blur-md border border-white/30">
                  <DialogHeader>
                    <DialogTitle className="text-primary">Crea un Nuovo Brief Video</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                      Compila i dettagli per la tua prossima campagna video.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="brief-title" className="text-right text-foreground">
                        Titolo
                      </Label>
                      <Input
                        id="brief-title"
                        placeholder="Nome della campagna video"
                        className="col-span-3 bg-white/50 backdrop-blur-sm border-white/30 text-foreground placeholder:text-foreground/70"
                        value={newBriefTitle}
                        onChange={(e) => setNewBriefTitle(e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="brief-description" className="text-right text-foreground">
                        Descrizione
                      </Label>
                      <Textarea
                        id="brief-description"
                        placeholder="Dettagli sul contenuto, target, ecc."
                        className="col-span-3 bg-white/50 backdrop-blur-sm border-white/30 text-foreground placeholder:text-foreground/70"
                        value={newBriefDescription}
                        onChange={(e) => setNewBriefDescription(e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="brief-budget" className="text-right text-foreground">
                        Budget (€)
                      </Label>
                      <Input
                        id="brief-budget"
                        type="number"
                        placeholder="Es. 1000"
                        className="col-span-3 bg-white/50 backdrop-blur-sm border-white/30 text-foreground placeholder:text-foreground/70"
                        value={newBriefBudget}
                        onChange={(e) => setNewBriefBudget(e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="brief-deadline" className="text-right text-foreground">
                        Scadenza
                      </Label>
                      <Input
                        id="brief-deadline"
                        type="date"
                        className="col-span-3 bg-white/50 backdrop-blur-sm border-white/30 text-foreground placeholder:text-foreground/70"
                        value={newBriefDeadline}
                        onChange={(e) => setNewBriefDeadline(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handlePublishBrief} className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200">Pubblica Brief</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="space-y-4">
              {myActiveBriefs.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {myActiveBriefs.map((job) => (
                    <Card key={job.id} className="bg-white/20 backdrop-blur-sm border-white/30 text-primary-foreground">
                      <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                          <CardTitle className="text-primary-foreground">{job.title}</CardTitle>
                          <CardDescription className="text-primary-foreground/80">Budget: €{job.budget} | Scadenza: {job.deadline}</CardDescription>
                        </div>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteBrief(job.id)} className="bg-red-600 text-white hover:bg-red-700 transition-all duration-200">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-primary-foreground/80">{job.description}</p>
                        <h4 className="font-semibold mt-4 text-primary-foreground">Proposte Ricevute:</h4>
                        {proposals.filter(p => p.job_brief_id === job.id && p.status === 'Inviata').length > 0 ? (
                          <div className="space-y-2 mt-2">
                            {proposals.filter(p => p.job_brief_id === job.id && p.status === 'Inviata').map(p => (
                              <div key={p.id} className="flex items-center justify-between text-sm bg-white/10 p-2 rounded-md border border-white/20">
                                <span>Influencer: <a href={p.socialLink} target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:underline">{p.socialLink}</a></span>
                                <span>Status: {p.status}</span>
                                <div className="flex gap-2">
                                  <Button size="sm" onClick={() => handleAcceptProposal(p.id)} className="bg-green-600 text-white hover:bg-green-700 transition-all duration-200">Accetta</Button>
                                  <Button size="sm" variant="outline" onClick={() => openChatWithUser(p.user_id)} className="bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200">
                                    <MessageSquare className="h-4 w-4 mr-2" /> Messaggio
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-primary-foreground/80 mt-2">Nessuna proposta ricevuta per questo brief.</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-center text-primary-foreground/80">Nessun brief video pubblicato. Clicca 'Crea Brief Video' per iniziare una nuova campagna!</p>
              )}
            </CardContent>
          </Card>

          {myAcceptedProposalsAsCompany.length > 0 && (
            <Card className="max-w-2xl mx-auto bg-white/20 backdrop-blur-md border border-white/30 shadow-md mt-8">
              <CardHeader>
                <CardTitle className="text-primary-foreground">Contratti Attivi (Proposte Accettate)</CardTitle>
                <CardDescription className="text-primary-foreground/80">Queste proposte sono state accettate e sono in fase di esecuzione.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {myAcceptedProposalsAsCompany.map(p => (
                  <div key={p.id} className="flex items-center justify-between text-sm bg-white/10 p-3 rounded-md border border-white/20">
                    <div>
                      <p className="font-medium text-primary-foreground">{p.jobTitle}</p>
                      <p className="text-xs text-primary-foreground/80">Influencer: <a href={p.socialLink} target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:underline">{p.socialLink}</a></p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-800 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Accettata
                      </span>
                      <Button size="sm" variant="outline" onClick={() => openChatWithUser(p.user_id)} className="bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200">
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

      {(role === "Azienda" || role === "Squadra" || role === "Influencer") && (
        <>
          <h3 className="text-2xl font-semibold text-center mt-12 text-primary-foreground">Job Post Disponibili</h3>
          <p className="text-center text-primary-foreground/80 mb-6">Esplora le opportunità di collaborazione e invia le tue proposte.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobBriefs.map((job) => (
              <Card key={job.id} className="bg-white/20 backdrop-blur-md border border-white/30 shadow-md text-primary-foreground">
                <CardHeader>
                  <CardTitle className="text-primary-foreground">{job.title}</CardTitle>
                  <CardDescription className="text-primary-foreground/80">{job.company}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-primary-foreground/80">{job.description}</p>
                  <p className="font-medium">Budget: €{job.budget}</p>
                  <p className="text-sm">Scadenza: {job.deadline}</p>
                  {role === "Influencer" && (
                    <Dialog open={isProposalDialogOpen && currentJobForProposal?.id === job.id} onOpenChange={setIsProposalDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200" onClick={() => setCurrentJobForProposal(job)}>Proponiti</Button>
                      </DialogTrigger>
                      <DialogContent className="bg-white/80 backdrop-blur-md border border-white/30">
                        <DialogHeader>
                          <DialogTitle className="text-primary">Proponiti per "{job.title}"</DialogTitle>
                          <DialogDescription className="text-muted-foreground">
                            Inserisci il link al tuo profilo social per presentare la tua candidatura.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="social-link" className="text-right text-foreground">
                              Link Social
                            </Label>
                            <Input
                              id="social-link"
                              placeholder="https://instagram.com/tuo-profilo"
                              className="col-span-3 bg-white/50 backdrop-blur-sm border-white/30 text-foreground placeholder:text-foreground/70"
                              value={socialProfileLink}
                              onChange={(e) => setSocialProfileLink(e.target.value)}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button onClick={handleSendProposal} className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200">Invia Proposta</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                  {(role === "Azienda" || role === "Squadra") && (
                    <Button className="w-full mt-4 bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200" onClick={() => openChatWithUser(job.user_id)}>
                      <MessageSquare className="h-4 w-4 mr-2" /> Contatta Azienda
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {role === "Influencer" && (
            <>
              <h3 className="text-2xl font-semibold text-center mt-12 text-primary-foreground">Le Tue Proposte Inviate</h3>
              <p className="text-center text-primary-foreground/80 mb-6">Tieni traccia dello stato delle tue candidature.</p>
              <div className="max-w-2xl mx-auto space-y-4">
                {myPendingOrRejectedProposalsAsInfluencer.length > 0 ? (
                  myPendingOrRejectedProposalsAsInfluencer.map(p => (
                    <Card key={p.id} className="bg-white/20 backdrop-blur-sm border-white/30 text-primary-foreground">
                      <CardContent className="flex items-center justify-between p-4">
                        <div>
                          <p className="font-medium text-primary-foreground">{p.jobTitle}</p>
                          <p className="text-sm text-primary-foreground/80">Link: <a href={p.socialLink} target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:underline">{p.socialLink}</a></p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-sm ${p.status === 'Accettata' ? 'bg-green-100 text-green-800' : p.status === 'Rifiutata' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                            {p.status}
                          </span>
                          <Button size="sm" variant="outline" onClick={() => {
                            const jobBrief = jobBriefs.find(job => job.id === p.job_brief_id);
                            if (jobBrief) openChatWithUser(jobBrief.user_id);
                          }} className="bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200">
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-center text-primary-foreground/80">Nessuna proposta inviata. Inizia a proporti per i job post disponibili!</p>
                )}
              </div>

              {myAcceptedProposalsAsInfluencer.length > 0 && (
                <Card className="max-w-2xl mx-auto bg-white/20 backdrop-blur-md border border-white/30 shadow-md mt-8">
                  <CardHeader>
                    <CardTitle className="text-primary-foreground">Contratti Attivi (Proposte Accettate)</CardTitle>
                    <CardDescription className="text-primary-foreground/80">Queste proposte sono state accettate e sono in fase di esecuzione.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {myAcceptedProposalsAsInfluencer.map(p => (
                      <div key={p.id} className="flex items-center justify-between text-sm bg-white/10 p-3 rounded-md border border-white/20">
                        <div>
                          <p className="font-medium text-primary-foreground">{p.jobTitle}</p>
                          <p className="text-xs text-primary-foreground/80">Link: <a href={p.socialLink} target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:underline">{p.socialLink}</a></p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-800 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Accettata
                          </span>
                          <Button size="sm" variant="outline" onClick={() => {
                            const jobBrief = jobBriefs.find(job => job.id === p.job_brief_id);
                            if (jobBrief) openChatWithUser(jobBrief.user_id);
                          }} className="bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200">
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

export default CreatorHubPage;