"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { showSuccess, showError } from "@/utils/toast";

const CreatorHubPage = () => {
  const handlePropose = (jobTitle: string) => {
    // Simulate proposal submission
    showSuccess(`Proposta inviata per il lavoro: "${jobTitle}"`);
    // In a real app, this would trigger an API call to submit the proposal and media kit.
  };

  const handleAcceptProposal = (influencerName: string) => {
    // Simulate contract generation and escrow activation
    showSuccess(`Proposta di ${influencerName} accettata! Contratto generato e sistema Escrow attivato.`);
    // In a real app, this would trigger backend logic for contract generation and payment setup.
  };

  return (
    <div className="space-y-8 p-4">
      <h2 className="text-3xl font-bold text-center text-primary">Creator Hub</h2>
      <p className="text-center text-muted-foreground">
        Marketplace per video influencer e aziende.
      </p>

      {/* User Persona Azienda: Pubblica un "Job Post" */}
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Pubblica un Job Post</CardTitle>
          <CardDescription>Cerca il tuo prossimo influencer per una campagna video.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="job-title">Titolo</Label>
            <Input id="job-title" placeholder="Nome della campagna video" />
          </div>
          <div>
            <Label htmlFor="job-description">Descrizione Video</Label>
            <Textarea id="job-description" placeholder="Dettagli sul contenuto, target, ecc." />
          </div>
          <div>
            <Label htmlFor="job-budget">Budget (€)</Label>
            <Input id="job-budget" type="number" placeholder="Es. 1000" />
          </div>
          <div>
            <Label htmlFor="job-deadline">Scadenza</Label>
            <Input id="job-deadline" type="date" />
          </div>
          <Button onClick={() => showSuccess("Job Post pubblicato!")}>Pubblica Post</Button>
        </CardContent>
      </Card>

      {/* User Persona Influencer: Sfoglia i post e si propone */}
      <h3 className="text-2xl font-semibold text-center mt-12 text-primary">Job Post Disponibili</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { id: "1", title: "Campagna Lancio Nuovo Prodotto", description: "Cercasi influencer per recensione prodotto tech.", budget: "€1500", deadline: "2024-12-31", company: "Tech Innovations Inc." },
          { id: "2", title: "Promozione Evento Estivo", description: "Influencer per copertura evento musicale all'aperto.", budget: "€1000", deadline: "2024-08-15", company: "Summer Fest Organizers" },
          { id: "3", title: "Tutorial di Bellezza", description: "Influencer beauty per tutorial su nuovi cosmetici.", budget: "€2000", deadline: "2024-10-01", company: "Glamour Cosmetics" },
        ].map((job) => (
          <Card key={job.id}>
            <CardHeader>
              <CardTitle>{job.title}</CardTitle>
              <CardDescription>{job.company}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">{job.description}</p>
              <p className="font-medium">Budget: {job.budget}</p>
              <p className="text-sm">Scadenza: {job.deadline}</p>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full mt-4">Proponiti</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Proponiti per "{job.title}"</DialogTitle>
                    <DialogDescription>
                      Allega il tuo Media Kit (PDF/Link) per presentare la tua candidatura.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="media-kit-file" className="text-right">
                        Media Kit (PDF)
                      </Label>
                      <Input id="media-kit-file" type="file" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="media-kit-link" className="text-right">
                        Media Kit (Link)
                      </Label>
                      <Input id="media-kit-link" placeholder="https://your-media-kit.com" className="col-span-3" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={() => handlePropose(job.title)}>Invia Proposta</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              {/* Simulate an "Accept" button for the company persona */}
              <Button variant="secondary" className="w-full mt-2" onClick={() => handleAcceptProposal("Influencer X")}>
                Accetta Proposta (Simulato)
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CreatorHubPage;