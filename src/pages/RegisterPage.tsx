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
      // Insert the user's role into the profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{ id: data.user.id, role: role }]);

      if (profileError) {
        console.error("Error inserting profile:", profileError); // Log detailed error for debugging
        showError(`Errore durante l'inserimento del profilo: ${profileError.message}`); // Show exact technical error
        // In a real application, you might want to handle the case where profile creation fails
        // but the user is still created in auth.users (e.g., by deleting the auth user or prompting for retry).
        setLoading(false);
        return;
      }

      showSuccess("Registrazione completata! Ora puoi accedere."); // No email verification needed
      navigate("/login"); // Reindirizza alla pagina di login dopo la registrazione
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md bg-white/40 backdrop-blur-sm border border-white/30 shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-primary">Registrati a ConnectHub</CardTitle>
          <CardDescription className="text-muted-foreground">
            Crea il tuo account e seleziona il tuo ruolo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="mario.rossi@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white/50 backdrop-blur-sm border-white/30"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6} // Enforce minimum password length
                className="bg-white/50 backdrop-blur-sm border-white/30"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Seleziona il tuo Ruolo</Label>
              <Select onValueChange={(value: UserRole) => setRole(value)} value={role || ""}>
                <SelectTrigger className="w-full bg-white/50 backdrop-blur-sm border-white/30">
                  <SelectValue placeholder="Scegli il tuo ruolo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Azienda">Azienda</SelectItem>
                  <SelectItem value="Influencer">Influencer</SelectItem>
                  <SelectItem value="Squadra/Negozio">Squadra/Negozio</SelectItem>
                  <SelectItem value="Investitore">Investitore</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={loading}>
              {loading ? "Registrazione in corso..." : "Registrati"}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Hai già un account?{" "}
            <Link to="/login" className="text-blue-600 hover:underline">
              Accedi
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterPage;