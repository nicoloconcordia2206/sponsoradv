"use client";

import { MadeWithDyad } from "@/components/made-with-dyad";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="min-h-[calc(100vh-10rem)] flex flex-col items-center justify-center bg-background text-foreground">
      <div className="text-center p-8 max-w-2xl">
        <h1 className="text-5xl font-extrabold mb-6 tracking-tight">Benvenuto in ConnectHub</h1>
        <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
          La piattaforma multi-settore per il matchmaking professionale e finanziario. Connetti, collabora e cresci.
        </p>
        <div className="flex justify-center space-x-4">
          <Link to="/creator-hub">
            <Button size="lg" className="text-lg px-8 py-4">Esplora Creator Hub</Button>
          </Link>
          <Link to="/profile-wallet">
            <Button size="lg" variant="outline" className="text-lg px-8 py-4">Il tuo Profilo</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;