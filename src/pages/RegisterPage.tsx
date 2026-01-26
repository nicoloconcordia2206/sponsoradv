"use client";

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { showSuccess, showError } from "@/utils/toast";
import { supabase } from "@/lib/supabaseClient";
import { UserRole } from "@/lib/role-store"; // Import UserRole type

const RegisterPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) {
      showError("Per favore, seleziona un ruolo.");
      return;
    }
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.error("Registration error:", error.message); // Log detailed error for debugging
      showError(`Errore di registrazione: ${error.message}`); // Show exact technical error
      setLoading(false);
      return;
    }

    if (data.user) {
      // The handle_new_user trigger on Supabase will create the profile with a default role.
      // We now need to update that profile with the role selected by the user.
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ role: role }) // Only update the role
        .eq('id', data.user.id); // Target the specific user's profile

      if (profileError) {
        console.error("Error updating profile role:", profileError); // Log detailed error for debugging
        showError(`Errore durante l'aggiornamento del ruolo del profilo: ${profileError.message}`); // Show exact technical error
        setLoading(false);
        return;
      }

      showSuccess("Registrazione completata! Ora puoi accedere."); // No email verification needed
      navigate("/login"); // Reindirizza alla pagina di login dopo la registrazione
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-700 to-indigo-900 p-4">
      <Card className="w-full max-w-md bg-white/20 backdrop-blur-md border border-white/30 shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-primary-foreground">Registrati a ConnectHub</CardTitle>
          <CardDescription className="text-primary-foreground/80">
            Crea il tuo account e seleziona il tuo ruolo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-6">
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
                minLength={6} // Enforce minimum password length
                className="bg-white/30 backdrop-blur-sm border-white/40 text-primary-foreground placeholder:text-primary-foreground/70"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role" className="text-primary-foreground">Seleziona il tuo Ruolo</Label>
              <Select onValueChange={(value: UserRole) => setRole(value)} value={role || ""}>
                <SelectTrigger className="w-full bg-white/30 backdrop-blur-sm border-white/40 text-primary-foreground">
                  <SelectValue placeholder="Scegli il tuo ruolo" />
                </SelectTrigger>
                <SelectContent className="bg-white/80 backdrop-blur-md border-white/30">
                  <SelectItem value="Azienda">Azienda</SelectItem>
                  <SelectItem value="Influencer">Influencer</SelectItem>
                  <SelectItem value="Squadra">Squadra</SelectItem>
                  <SelectItem value="Investitore">Investitore</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={loading}>
              {loading ? "Registrazione in corso..." : "Registrati"}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-primary-foreground/80">
            Hai già un account?{" "}
            <Link to="/login" className="text-blue-300 hover:underline">
              Accedi
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterPage;