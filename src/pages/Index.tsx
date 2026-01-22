"use client";

import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRole } from "@/lib/role-store";

const Index = () => {
  const navigate = useNavigate();
  const { selectRole } = useRole();

  const handleRoleSelect = (role: string) => {
    selectRole(role as any); // Cast to any for now, will refine types later if needed
    navigate("/creator-hub"); // Redirect to a default dashboard page after role selection
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 text-foreground p-4">
      <div className="text-center p-8 max-w-4xl bg-white/30 backdrop-blur-lg border border-white/20 rounded-xl shadow-lg">
        <h1 className="text-5xl font-extrabold mb-6 text-primary drop-shadow-md">
          Benvenuto in ConnectHub
        </h1>
        <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
          Seleziona il tuo ruolo per iniziare la tua esperienza sulla piattaforma.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-white/40 backdrop-blur-sm border border-white/30 shadow-md hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-2xl text-primary">Azienda</CardTitle>
              <CardDescription>Pubblica brief video e trova influencer.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => handleRoleSelect("Azienda")} className="w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90">
                Sono un'Azienda
              </Button>
            </CardContent>
          </Card>
          <Card className="bg-white/40 backdrop-blur-sm border border-white/30 shadow-md hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-2xl text-primary">Influencer</CardTitle>
              <CardDescription>Sfoglia job post e invia proposte.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => handleRoleSelect("Influencer")} className="w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90">
                Sono un Influencer
              </Button>
            </CardContent>
          </Card>
          <Card className="bg-white/40 backdrop-blur-sm border border-white/30 shadow-md hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-2xl text-primary">Squadra/Negozio</CardTitle>
              <CardDescription>Cerca sponsorizzazioni per le tue iniziative locali.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => handleRoleSelect("Squadra/Negozio")} className="w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90">
                Sono una Squadra/Negozio
              </Button>
            </CardContent>
          </Card>
          <Card className="bg-white/40 backdrop-blur-sm border border-white/30 shadow-md hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-2xl text-primary">Investitore</CardTitle>
              <CardDescription>Scopri startup e invia lettere di intenti.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => handleRoleSelect("Investitore")} className="w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90">
                Sono un Investitore
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;