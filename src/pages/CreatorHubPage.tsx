"use client";

import React from "react";

const CreatorHubPage = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Creator Hub</h1>
      <p className="text-lg text-muted-foreground">
        Marketplace per video influencer. Qui le aziende possono pubblicare offerte di lavoro e gli influencer possono proporsi.
      </p>
      {/* Placeholder for Creator Hub content */}
      <div className="mt-8 p-6 border rounded-lg bg-card">
        <h2 className="text-2xl font-semibold mb-4">Prossime Funzionalità:</h2>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li>Form per "Job Post" (Titolo, Descrizione Video, Budget, Scadenza)</li>
          <li>Elenco di "Job Post" per influencer</li>
          <li>Bottone "Proponiti" con allegato Media Kit</li>
          <li>Logica "Accetta Proposta" per generazione contratto e attivazione Escrow</li>
        </ul>
      </div>
    </div>
  );
};

export default CreatorHubPage;