"use client";

import React from "react";

const InvestmentFloorPage = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Investment Floor</h1>
      <p className="text-lg text-muted-foreground">
        Piattaforma per il pitching di business e la ricerca di investitori.
      </p>
      {/* Placeholder for Investment Floor content */}
      <div className="mt-8 p-6 border rounded-lg bg-card">
        <h2 className="text-2xl font-semibold mb-4">Prossime Funzionalità:</h2>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li>Form per Startup (Pitch Deck, Business Plan, Capitale richiesto, % Quote)</li>
          <li>Filtri per Investitori (ROI atteso, Settore)</li>
          <li>Bottone "Invia LOI" per generazione Lettera di Intenti</li>
          <li>Verifica dell'identità (KYC) per gli investitori (UI placeholder)</li>
        </ul>
      </div>
    </div>
  );
};

export default InvestmentFloorPage;