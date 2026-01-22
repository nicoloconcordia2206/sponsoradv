"use client";

import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRole } from "@/lib/role-store";
import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

const Index = () => {
  const navigate = useNavigate();
  const { role, loading: roleLoading } = useRole();

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      if (roleLoading) return;

      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        navigate("/login", { replace: true });
      } else if (role) {
        navigate("/creator-hub", { replace: true });
      } else {
        // Authenticated but no role assigned (e.g., just registered)
        navigate("/register", { replace: true }); // Redirect to register to complete role selection
      }
    };

    checkAuthAndRedirect();
  }, [role, roleLoading, navigate]);

  if (roleLoading) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Caricamento...</div>;
  }

  // This component should ideally not render its content if redirection happens immediately.
  // However, as a fallback or during loading, we can show a message.
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 text-foreground p-4">
      <div className="text-center p-8 max-w-4xl bg-white/30 backdrop-blur-lg border border-white/20 rounded-xl shadow-lg">
        <h1 className="text-5xl font-extrabold mb-6 text-primary drop-shadow-md">
          Benvenuto in ConnectHub
        </h1>
        <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
          Reindirizzamento in corso...
        </p>
      </div>
    </div>
  );
};

export default Index;