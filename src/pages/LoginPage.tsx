"use client";

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { showSuccess, showError } from "@/utils/toast";
import { supabase } from "@/lib/supabaseClient";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Login error:", error.message); // Log detailed error for debugging
      showError("Credenziali non valide o errore di accesso. Riprova."); // Generic error message
    } else {
      showSuccess("Login effettuato con successo!");
      navigate("/"); // Reindirizza alla root per la gestione del ruolo
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-700 to-indigo-900 p-4">
      <Card className="w-full max-w-md bg-white/20 backdrop-blur-md border border-white/30 shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-primary-foreground">Accedi a ConnectHub</CardTitle>
          <CardDescription className="text-primary-foreground/80">
            Inserisci le tue credenziali per continuare.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-primary-foreground">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="mario.rossi@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white/30 backdrop-blur-sm border-white/40 text-primary-foreground placeholder:text-primary-foreground/70"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-primary-foreground">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-white/30 backdrop-blur-sm border-white/40 text-primary-foreground placeholder:text-primary-foreground/70"
              />
            </div>
            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={loading}>
              {loading ? "Accesso in corso..." : "Accedi"}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-primary-foreground/80">
            Non hai un account?{" "}
            <Link to="/register" className="text-blue-300 hover:underline">
              Registrati
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;