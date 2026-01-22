"use client";

import React from "react";

const SocialImpactPage = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Social Impact</h1>
      <p className="text-lg text-muted-foreground">
        Sezione dedicata alle sponsorizzazioni per sport e attività locali.
      </p>
      {/* Placeholder for Social Impact content */}
      <div className="mt-8 p-6 border rounded-lg bg-card">
        <h2 className="text-2xl font-semibold mb-4">Prossime Funzionalità:</h2>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li>Form per "Progetto di Sostegno" (per squadre/negozi)</li>
          <li>Filtri geografici (Città/CAP) per gli sponsor</li>
          <li>Bottone "Finanzia" con opzioni "Totale" o "Parziale"</li>
          <li>Generazione ricevuta per detrazione fiscale</li>
        </ul>
      </div>
    </div>
  );
};

export default SocialImpactPage;