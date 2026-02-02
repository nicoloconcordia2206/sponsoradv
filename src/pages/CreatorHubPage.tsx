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
import { PlusCircle, MessageSquare, Trash2, CheckCircle2, Video, Code, FileText } from "lucide-react"; // Import new icons
import { supabase } from "@/lib/supabaseClient"; // Import Supabase client
import ChatDialog from "@/components/ChatDialog"; // Import ChatDialog
import { CONTRACT_TEMPLATE } from "@/lib/constants"; // Import contract template

interface JobBrief {
  id: string;
  title: string;
  description: string;
  budget: number;
  company: string;
  deadline: string;
  user_id: string;
}

interface Proposal {
  id: string;
  job_brief_id: string; // Link to the job brief
  jobTitle: string;
  socialLink: string;
  status: 'Inviata' | 'Accettata' | 'In attesa di video' | 'In revisione' | 'Revisione richiesta' | 'Completata' | 'Rifiutata'; // Updated status values to Italian
  user_id: string; // Link to the user who sent it
  contract_terms: string | null; // New
  video_url: string | null; // New
  spark_code: string | null; // New
  feedback_notes: string | null; // New
  payment_status: 'unpaid' | 'escrow_funded' | 'released'; // New
}

const CreatorHubPage = () => {
  const { role, loading: roleLoading } = useRole();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userProfileName, setUserProfileName] = useState<string | null>(null);

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

  // Influencer flow states
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [selectedProposalForContract, setSelectedProposalForContract] = useState<Proposal | null>(null);
  const [videoLink, setVideoLink] = useState("");
  const [sparkCode, setSparkCode] = useState("");
  const [isUploadVideoModalOpen, setIsUploadVideoModalOpen] = useState(false);
  const [selectedProposalForUpload, setSelectedProposalForUpload] = useState<Proposal | null>(null);

  // Azienda flow states
  const [isReviewVideoModalOpen, setIsReviewVideoModalOpen] = useState(false);
  const [selectedProposalForReview, setSelectedProposalForReview] = useState<Proposal | null>(null);
  const [feedbackNotes, setFeedbackNotes] = useState("");
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);


  useEffect(() => {
    const fetchUserAndProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
      if (user) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('full_name, username')
          .eq('id', user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error("Error fetching user profile name:", profileError);
        } else if (profileData) {
          setUserProfileName(profileData.full_name || profileData.username || null);
        } else {
          setUserProfileName(null);
        }
      }
    };
    fetchUserAndProfile();
  }, []);

  useEffect(() => {
    if (!currentUserId || roleLoading) return;

    const fetchJobBriefs = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('campaigns').select('*');
      if (error) {
        console.error("Error fetching job briefs:", error);
        showError("Errore nel caricamento dei brief video.");
      } else {
        setJobBriefs(data as JobBrief[]);
      }
      setLoading(false);
    };

    const fetchProposals = async () => {
      const { data, error } = await supabase.from('proposals').select('*');
      if (error) {
        console.error("Error fetching proposals:", error);
        showError("Errore nel caricamento delle proposte.");
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
      company: userProfileName || "Nome Azienda Sconosciuto",
      user_id: currentUserId,
    };

    const { data, error } = await supabase.from('campaigns').insert([newBrief]).select();
    if (error) {
      console.error("ERRORE SUPABASE (handlePublishBrief):", error);
      if (error.code === '403') {
        showError("Errore: Problema di Policy RLS. Non hai i permessi per pubblicare.");
      } else if (error.code === 'PGRST204') {
        showError(`Errore: Colonna mancante nel database. Stai cercando di scrivere: title, description, budget, deadline, company, user_id.`);
      } else {
        showError("Errore durante la pubblicazione del brief.");
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

    if (!window.confirm("Sei sicuro di voler eliminare questo brief video? Tutte le proposte associate verranno eliminate.")) {
      return;
    }

    const { error } = await supabase
      .from('campaigns')
      .delete()
      .eq('id', briefId)
      .eq('user_id', currentUserId);

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
    const newProposal: Omit<Proposal, 'id' | 'contract_terms' | 'video_url' | 'spark_code' | 'feedback_notes' | 'payment_status'> = {
      job_brief_id: currentJobForProposal.id,
      jobTitle: currentJobForProposal.title,
      socialLink: socialProfileLink,
      status: 'Inviata', // Changed from 'pending' to 'Inviata'
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
        showError("Errore durante l'invio della proposta.");
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

  // Azienda: Accetta Proposta
  const handleAcceptProposal = async (proposal: Proposal) => {
    if (!currentUserId) {
      showError("Devi essere loggato per accettare una proposta.");
      return;
    }

    const { error } = await supabase
      .from('proposals')
      .update({ status: 'Accettata', contract_terms: CONTRACT_TEMPLATE }) // Changed from 'accepted' to 'Accettata'
      .eq('id', proposal.id);

    if (error) {
      console.error("ERRORE SUPABASE (handleAcceptProposal):", error);
      if (error.code === '403') {
        showError("Errore: Problema di Policy RLS. Non hai i permessi per accettare proposte.");
      } else {
        showError("Errore durante l'accettazione della proposta.");
      }
      return;
    } else {
      setProposals(prev => prev.map(p => p.id === proposal.id ? { ...p, status: 'Accettata', contract_terms: CONTRACT_TEMPLATE } : p));
      showSuccess(`Proposta accettata! L'influencer può ora visualizzare il contratto.`);
    }
  };

  // Influencer: Accetta Termini Contratto
  const handleAcceptContractTerms = async (proposalId: string) => {
    if (!currentUserId) {
      showError("Devi essere loggato per accettare i termini.");
      return;
    }

    const { error } = await supabase
      .from('proposals')
      .update({ status: 'In attesa di video' }) // Changed from 'waiting_video' to 'In attesa di video'
      .eq('id', proposalId)
      .eq('user_id', currentUserId); // Ensure only the influencer can accept

    if (error) {
      console.error("ERRORE SUPABASE (handleAcceptContractTerms):", error);
      if (error.code === '403') {
        showError("Errore: Problema di Policy RLS. Non hai i permessi per accettare i termini.");
      } else {
        showError("Errore durante l'accettazione dei termini del contratto.");
      }
    } else {
      setProposals(prev => prev.map(p => p.id === proposalId ? { ...p, status: 'In attesa di video' } : p));
      showSuccess("Termini del contratto accettati! Ora puoi caricare il video.");
      setIsContractModalOpen(false);
      setSelectedProposalForContract(null);
    }
  };

  // Influencer: Carica Video per Revisione
  const handleUploadVideoForReview = async () => {
    if (!selectedProposalForUpload || !videoLink || !sparkCode || !currentUserId) {
      showError("Per favore, inserisci il link del video e il codice Spark Ads.");
      return;
    }

    const { error } = await supabase
      .from('proposals')
      .update({
        status: 'In revisione', // Changed from 'in_review' to 'In revisione'
        video_url: videoLink,
        spark_code: sparkCode,
      })
      .eq('id', selectedProposalForUpload.id)
      .eq('user_id', currentUserId);

    if (error) {
      console.error("ERRORE SUPABASE (handleUploadVideoForReview):", error);
      if (error.code === '403') {
        showError("Errore: Problema di Policy RLS. Non hai i permessi per caricare il video.");
      } else {
        showError("Errore durante il caricamento del video per la revisione.");
      }
    } else {
      setProposals(prev => prev.map(p => p.id === selectedProposalForUpload.id ? { ...p, status: 'In revisione', video_url: videoLink, spark_code: sparkCode } : p));
      showSuccess("Video inviato per la revisione con successo!");
      setVideoLink("");
      setSparkCode("");
      setIsUploadVideoModalOpen(false);
      setSelectedProposalForUpload(null);
    }
  };

  // Azienda: Paga Deposito (simulato)
  const handlePayEscrow = async (proposal: Proposal) => {
    if (!currentUserId) {
      showError("Devi essere loggato per pagare il deposito.");
      return;
    }

    // Fetch the campaign budget
    const { data: campaignData, error: campaignError } = await supabase
      .from('campaigns')
      .select('budget')
      .eq('id', proposal.job_brief_id)
      .single();

    if (campaignError || !campaignData) {
      console.error("Error fetching campaign budget for escrow:", campaignError);
      showError("Errore nel recupero del budget della campagna per il deposito.");
      return;
    }

    const budget = campaignData.budget;

    // Update proposal status
    const { error: proposalError } = await supabase
      .from('proposals')
      .update({ payment_status: 'escrow_funded' })
      .eq('id', proposal.id);

    if (proposalError) {
      console.error("ERRORE SUPABASE (handlePayEscrow - proposal update):", proposalError);
      if (proposalError.code === '403') {
        showError("Errore: Problema di Policy RLS. Non hai i permessi per pagare il deposito.");
      } else {
        showError("Errore durante il pagamento del deposito.");
      }
      return;
    }

    // Update influencer's pending_balance
    const { error: walletError } = await supabase
      .from('wallets')
      .upsert({ id: proposal.user_id, pending_balance: budget }, { onConflict: 'id' });

    if (walletError) {
      console.error("ERRORE SUPABASE (handlePayEscrow - wallet update):", walletError);
      showError("Errore durante l'aggiornamento del saldo in sospeso dell'influencer.");
      return;
    }

    setProposals(prev => prev.map(p => p.id === proposal.id ? { ...p, payment_status: 'escrow_funded' } : p));
    showSuccess("Deposito pagato con successo! I fondi sono in escrow.");
  };

  // Azienda: Approva e Pubblica Video
  const handleApproveAndPublish = async () => {
    if (!selectedProposalForReview || !currentUserId) {
      showError("Devi essere loggato per approvare il video.");
      return;
    }

    // Fetch the campaign budget
    const { data: campaignData, error: campaignError } = await supabase
      .from('campaigns')
      .select('budget')
      .eq('id', selectedProposalForReview.job_brief_id)
      .single();

    if (campaignError || !campaignData) {
      console.error("Error fetching campaign budget for approval:", campaignError);
      showError("Errore nel recupero del budget della campagna per l'approvazione.");
      return;
    }

    const budget = campaignData.budget;

    // Update proposal status
    const { error: proposalError } = await supabase
      .from('proposals')
      .update({
        status: 'Completata', // Changed from 'completed' to 'Completata'
        payment_status: 'released',
      })
      .eq('id', selectedProposalForReview.id);

    if (proposalError) {
      console.error("ERRORE SUPABASE (handleApproveAndPublish - proposal update):", proposalError);
      if (proposalError.code === '403') {
        showError("Errore: Problema di Policy RLS. Non hai i permessi per approvare il video.");
      } else {
        showError("Errore durante l'approvazione e pubblicazione del video.");
      }
      return;
    }

    // Update influencer's wallet: move from pending to available, add to total earned
    const { data: currentWallet, error: fetchWalletError } = await supabase
      .from('wallets')
      .select('total_earned, pending_balance, available_balance')
      .eq('id', selectedProposalForReview.user_id)
      .single();

    if (fetchWalletError || !currentWallet) {
      console.error("Error fetching influencer wallet for approval:", fetchWalletError);
      showError("Errore nel recupero del wallet dell'influencer.");
      return;
    }

    const newPendingBalance = currentWallet.pending_balance - budget;
    const newAvailableBalance = currentWallet.available_balance + budget;
    const newTotalEarned = currentWallet.total_earned + budget;

    const { error: walletUpdateError } = await supabase
      .from('wallets')
      .update({
        pending_balance: newPendingBalance,
        available_balance: newAvailableBalance,
        total_earned: newTotalEarned,
      })
      .eq('id', selectedProposalForReview.user_id);

    if (walletUpdateError) {
      console.error("ERRORE SUPABASE (handleApproveAndPublish - wallet update):", walletUpdateError);
      showError("Errore durante l'aggiornamento del wallet dell'influencer.");
      return;
    }

    // Simulate receipt generation
    const receipt = `
      RICEVUTA DI COLLABORAZIONE
      ------------------------------------
      ID Transazione: ${selectedProposalForReview.id}
      Nome Azienda: ${userProfileName || "Azienda Sconosciuta"}
      Nome Influencer: ${selectedProposalForReview.socialLink} (ID: ${selectedProposalForReview.user_id})
      Importo: €${budget.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      Data: ${new Date().toLocaleDateString()}
      Dicitura: Compenso per creazione contenuto digitale
      ------------------------------------
      Grazie per la collaborazione!
    `;
    console.log("Ricevuta Generata:\n", receipt); // Log receipt to console for now

    setProposals(prev => prev.map(p => p.id === selectedProposalForReview.id ? { ...p, status: 'Completata', payment_status: 'released' } : p));
    showSuccess("Video approvato e pubblicato! Fondi rilasciati e ricevuta generata.");
    setIsReviewVideoModalOpen(false);
    setSelectedProposalForReview(null);
  };

  // Azienda: Richiedi Modifica Video
  const handleRequestRevision = async () => {
    if (!selectedProposalForReview || !feedbackNotes.trim() || !currentUserId) {
      showError("Per favore, inserisci le note di feedback per la modifica.");
      return;
    }

    const { error } = await supabase
      .from('proposals')
      .update({
        status: 'Revisione richiesta', // Changed from 'revision_requested' to 'Revisione richiesta'
        feedback_notes: feedbackNotes.trim(),
      })
      .eq('id', selectedProposalForReview.id);

    if (error) {
      console.error("ERRORE SUPABASE (handleRequestRevision):", error);
      if (error.code === '403') {
        showError("Errore: Problema di Policy RLS. Non hai i permessi per richiedere modifiche.");
      } else {
        showError("Errore durante la richiesta di modifica.");
      }
    } else {
      setProposals(prev => prev.map(p => p.id === selectedProposalForReview.id ? { ...p, status: 'Revisione richiesta', feedback_notes: feedbackNotes.trim() } : p));
      showSuccess("Richiesta di modifica inviata all'influencer.");
      setIsFeedbackModalOpen(false);
      setIsReviewVideoModalOpen(false);
      setSelectedProposalForReview(null);
      setFeedbackNotes("");
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
  const myProposalsForMyBriefs = proposals.filter(p => myActiveBriefs.some(brief => brief.id === p.job_brief_id));

  const mySentProposals = proposals.filter(p => p.user_id === currentUserId);

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
                  </DialogDescription>
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
                        {myProposalsForMyBriefs.filter(p => p.job_brief_id === job.id).length > 0 ? (
                          <div className="space-y-2 mt-2">
                            {myProposalsForMyBriefs.filter(p => p.job_brief_id === job.id).map(p => (
                              <div key={p.id} className="flex items-center justify-between text-sm bg-white/10 p-2 rounded-md border border-white/20">
                                <span>Influencer: <a href={p.socialLink} target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:underline">{p.socialLink}</a></span>
                                <div className="flex items-center gap-2">
                                  <span className={`px-3 py-1 rounded-full text-xs ${
                                    p.status === 'Inviata' ? 'bg-blue-100 text-blue-800' :
                                    p.status === 'Accettata' ? 'bg-purple-100 text-purple-800' :
                                    p.status === 'In attesa di video' ? 'bg-yellow-100 text-yellow-800' :
                                    p.status === 'In revisione' ? 'bg-orange-100 text-orange-800' :
                                    p.status === 'Revisione richiesta' ? 'bg-red-100 text-red-800' :
                                    p.status === 'Completata' ? 'bg-green-100 text-green-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {p.status === 'Inviata' && 'Inviata'}
                                    {p.status === 'Accettata' && 'Accettata (Contratto da firmare)'}
                                    {p.status === 'In attesa di video' && 'In attesa di video'}
                                    {p.status === 'In revisione' && 'Video da revisionare'}
                                    {p.status === 'Revisione richiesta' && 'Revisione richiesta'}
                                    {p.status === 'Completata' && 'Completata'}
                                    {p.status === 'Rifiutata' && 'Rifiutata'}
                                  </span>
                                  {p.status === 'Inviata' && (
                                    <Button size="sm" onClick={() => handleAcceptProposal(p)} className="bg-green-600 text-white hover:bg-green-700 transition-all duration-200">Accetta</Button>
                                  )}
                                  {p.status === 'Accettata' && p.payment_status === 'unpaid' && (
                                    <Button size="sm" onClick={() => handlePayEscrow(p)} className="bg-purple-600 text-white hover:bg-purple-700 transition-all duration-200">Paga Deposito</Button>
                                  )}
                                  {p.status === 'In revisione' && (
                                    <Button size="sm" onClick={() => { setSelectedProposalForReview(p); setIsReviewVideoModalOpen(true); }} className="bg-orange-600 text-white hover:bg-orange-700 transition-all duration-200">
                                      <Video className="h-4 w-4 mr-1" /> Revisiona Video
                                    </Button>
                                  )}
                                  <Button size="sm" variant="outline" onClick={() => openChatWithUser(p.user_id)} className="bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200">
                                    <MessageSquare className="h-4 w-4" />
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
                {mySentProposals.length > 0 ? (
                  mySentProposals.map(p => (
                    <Card key={p.id} className="bg-white/20 backdrop-blur-sm border-white/30 text-primary-foreground">
                      <CardContent className="flex items-center justify-between p-4">
                        <div>
                          <p className="font-medium text-primary-foreground">{p.jobTitle}</p>
                          <p className="text-sm text-primary-foreground/80">Link: <a href={p.socialLink} target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:underline">{p.socialLink}</a></p>
                          {p.feedback_notes && p.status === 'Revisione richiesta' && (
                            <div className="p-2 mt-2 rounded-md bg-red-500/20 text-red-300 border border-red-400">
                              <p className="font-semibold">Feedback Richiesto:</p>
                              <p className="text-sm">{p.feedback_notes}</p>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-sm ${
                            p.status === 'Inviata' ? 'bg-blue-100 text-blue-800' :
                            p.status === 'Accettata' ? 'bg-purple-100 text-purple-800' :
                            p.status === 'In attesa di video' ? 'bg-yellow-100 text-yellow-800' :
                            p.status === 'In revisione' ? 'bg-orange-100 text-orange-800' :
                            p.status === 'Revisione richiesta' ? 'bg-red-100 text-red-800' :
                            p.status === 'Completata' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {p.status === 'Inviata' && 'Inviata'}
                            {p.status === 'Accettata' && 'Accettata (Contratto da firmare)'}
                            {p.status === 'In attesa di video' && 'In attesa di video'}
                            {p.status === 'In revisione' && 'Video in revisione'}
                            {p.status === 'Revisione richiesta' && 'Revisione richiesta'}
                            {p.status === 'Completata' && 'Completata'}
                            {p.status === 'Rifiutata' && 'Rifiutata'}
                          </span>
                          {p.status === 'Accettata' && (
                            <Button size="sm" onClick={() => { setSelectedProposalForContract(p); setIsContractModalOpen(true); }} className="bg-purple-600 text-white hover:bg-purple-700 transition-all duration-200">
                              <FileText className="h-4 w-4 mr-1" /> Firma Contratto
                            </Button>
                          )}
                          {(p.status === 'In attesa di video' || p.status === 'Revisione richiesta') && (
                            <Button size="sm" onClick={() => { setSelectedProposalForUpload(p); setVideoLink(p.video_url || ""); setSparkCode(p.spark_code || ""); setIsUploadVideoModalOpen(true); }} className="bg-yellow-600 text-white hover:bg-yellow-700 transition-all duration-200">
                              <Video className="h-4 w-4 mr-1" /> Carica Video
                            </Button>
                          )}
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

      {/* Influencer: Contract Acceptance Modal */}
      <Dialog open={isContractModalOpen} onOpenChange={setIsContractModalOpen}>
        <DialogContent className="bg-white/80 backdrop-blur-md border border-white/30 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-primary">Accetta Termini del Contratto</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Leggi attentamente i termini del contratto per la collaborazione "{selectedProposalForContract?.jobTitle}".
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 border rounded-md bg-white/10 text-primary-foreground max-h-[400px] overflow-y-auto">
            <p className="text-sm whitespace-pre-wrap">{selectedProposalForContract?.contract_terms}</p>
          </div>
          <DialogFooter>
            <Button onClick={() => handleAcceptContractTerms(selectedProposalForContract!.id)} className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200">
              Accetto i Termini
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Influencer: Upload Video Modal */}
      <Dialog open={isUploadVideoModalOpen} onOpenChange={setIsUploadVideoModalOpen}>
        <DialogContent className="bg-white/80 backdrop-blur-md border border-white/30">
          <DialogHeader>
            <DialogTitle className="text-primary">Carica Video per "{selectedProposalForUpload?.jobTitle}"</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Inserisci il link al tuo video e il codice Spark Ads per la revisione.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="video-link" className="text-right text-foreground">
                Link Video
              </Label>
              <Input
                id="video-link"
                placeholder="https://youtube.com/tuo-video"
                className="col-span-3 bg-white/50 backdrop-blur-sm border-white/30 text-foreground placeholder:text-foreground/70"
                value={videoLink}
                onChange={(e) => setVideoLink(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="spark-code" className="text-right text-foreground">
                Codice Spark Ads
              </Label>
              <Input
                id="spark-code"
                placeholder="Inserisci il codice Spark Ads"
                className="col-span-3 bg-white/50 backdrop-blur-sm border-white/30 text-foreground placeholder:text-foreground/70"
                value={sparkCode}
                onChange={(e) => setSparkCode(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleUploadVideoForReview} className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200">
              Invia per Revisione
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Azienda: Video Review Modal */}
      <Dialog open={isReviewVideoModalOpen} onOpenChange={setIsReviewVideoModalOpen}>
        <DialogContent className="bg-white/80 backdrop-blur-md border border-white/30 max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-primary">Revisiona Video per "{selectedProposalForReview?.jobTitle}"</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Guarda il video e decidi se approvarlo o richiedere modifiche.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedProposalForReview?.video_url ? (
              <div className="aspect-video w-full bg-black rounded-md overflow-hidden">
                {/* Simple iframe for video preview. In a real app, consider more robust video players. */}
                <iframe
                  src={selectedProposalForReview.video_url.replace("watch?v=", "embed/")}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                ></iframe>
              </div>
            ) : (
              <p className="text-center text-muted-foreground">Nessun video caricato o link non valido.</p>
            )}
            {selectedProposalForReview?.spark_code && (
              <p className="text-sm text-primary-foreground/80">
                Codice Spark Ads: <span className="font-mono bg-white/10 p-1 rounded">{selectedProposalForReview.spark_code}</span>
              </p>
            )}
            {selectedProposalForReview?.feedback_notes && (
              <div className="p-3 rounded-md bg-red-100 text-red-800 border border-red-300">
                <p className="font-semibold">Note di Revisione Precedenti:</p>
                <p className="text-sm">{selectedProposalForReview.feedback_notes}</p>
              </div>
            )}
          </div>
          <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2">
            <Button onClick={handleApproveAndPublish} className="bg-green-600 text-white hover:bg-green-700 transition-all duration-200">
              <CheckCircle2 className="h-4 w-4 mr-2" /> Approva e Pubblica
            </Button>
            <Button onClick={() => { setIsReviewVideoModalOpen(false); setIsFeedbackModalOpen(true); }} variant="outline" className="bg-red-600 text-white hover:bg-red-700 transition-all duration-200">
              Richiedi Modifica
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Azienda: Feedback for Revision Modal */}
      <Dialog open={isFeedbackModalOpen} onOpenChange={setIsFeedbackModalOpen}>
        <DialogContent className="bg-white/80 backdrop-blur-md border border-white/30">
          <DialogHeader>
            <DialogTitle className="text-primary">Richiedi Modifica per "{selectedProposalForReview?.jobTitle}"</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Scrivi le note di feedback per l'influencer.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Label htmlFor="feedback-notes" className="text-foreground">
              Note di Feedback
            </Label>
            <Textarea
              id="feedback-notes"
              placeholder="Specifica cosa deve essere modificato nel video..."
              className="bg-white/50 backdrop-blur-sm border-white/30 text-foreground placeholder:text-foreground/70"
              value={feedbackNotes}
              onChange={(e) => setFeedbackNotes(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button onClick={handleRequestRevision} className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200">
              Invia Richiesta di Modifica
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreatorHubPage;