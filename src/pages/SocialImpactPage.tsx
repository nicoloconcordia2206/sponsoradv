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

const SocialImpactPage = () => {
  const handleFundProject = (projectName: string, fundingType: string) => {
    // Simulate funding and receipt generation
    showSuccess(`Progetto "${projectName}" finanziato con ${fundingType}! Ricevuta per detrazione fiscale generata.`);
    // In a real app, this would trigger backend logic for payment processing and receipt generation.
  };

  return (
    <div className="space-y-8 p-4">
      <h2 className="text-3xl font-bold text-center text-primary">Social Impact</h2>
      <p className="text-center text-muted-foreground">
        Sponsorizzazioni per sport e attività locali.
      </p>

      {/* User Persona Richiedente: Carica un "Progetto di Sostegno" */}
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Carica un Progetto di Sostegno</CardTitle>
          <CardDescription>Descrivi la tua iniziativa per trovare sponsor.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="project-title">Titolo Progetto</Label>
            <Input id="project-title" placeholder="Es. Rifacimento facciata negozio" />
          </div>
          <div>
            <Label htmlFor="project-description">Descrizione</Label>
            <Textarea id="project-description" placeholder="Dettagli sul progetto e l'impatto atteso." />
          </div>
          <div>
            <Label htmlFor="project-city">Città</Label>
            <Input id="project-city" placeholder="Es. Milano" />
          </div>
          <div>
            <Label htmlFor="project-zip">CAP</Label>
            <Input id="project-zip" placeholder="Es. 20100" />
          </div>
          <Button onClick={() => showSuccess("Progetto di Sostegno caricato!")}>Carica Progetto</Button>
        </CardContent>
      </Card>

      {/* User Persona Sponsor: Cerca progetti e finanzia */}
      <h3 className="text-2xl font-semibold text-center mt-12 text-primary">Progetti di Sostegno Disponibili</h3>
      <div className="max-w-2xl mx-auto mb-6 flex gap-4">
        <Input placeholder="Filtra per Città" />
        <Input placeholder="Filtra per CAP" />
        <Button>Cerca</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { id: "1", title: "Rifacimento Campo da Calcio", description: "Supporto per la ristrutturazione del campo sportivo locale.", city: "Roma", zip: "00100" },
          { id: "2", title: "Acquisto Attrezzature per Banda Musicale", description: "Aiuta la banda giovanile ad acquistare nuovi strumenti.", city: "Firenze", zip: "50100" },
          { id: "3", title: "Restauro Murale Storico", description: "Finanzia il restauro di un murale iconico nel centro città.", city: "Napoli", zip: "80100" },
        ].map((project) => (
          <Card key={project.id}>
            <CardHeader>
              <CardTitle>{project.title}</CardTitle>
              <CardDescription>{project.city}, {project.zip}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">{project.description}</p>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full mt-4">Finanzia</Button>
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
                    <Select onValueChange={(value) => handleFundProject(project.title, value)}>
                      <SelectTrigger>
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
    </div>
  );
};

export default SocialImpactPage;