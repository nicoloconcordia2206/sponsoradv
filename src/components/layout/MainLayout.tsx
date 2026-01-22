"use client";

import React, { useEffect, useState } from "react";
import { Link, useNavigate, Outlet } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Button } from "@/components/ui/button";
import { useRole } from "@/lib/role-store";
import { supabase } from "@/lib/supabaseClient";
import { showError, showSuccess } from "@/utils/toast";
import { Home, Users, TrendingUp, Wallet, LogOut } from "lucide-react"; // Import Lucide icons

const MainLayout: React.FC = () => {
  const { role, loading: roleLoading } = useRole();
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserEmail = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email);
      }
    };
    fetchUserEmail();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error logging out:", error); // Log detailed error for debugging
      showError("Errore durante il logout. Riprova."); // Generic error message
    } else {
      showSuccess("Logout effettuato con successo!");
      navigate("/login"); // Reindirizza alla pagina di login dopo il logout
    }
  };

  if (roleLoading) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Caricamento layout...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="bg-primary text-primary-foreground px-6 py-4 flex items-center justify-between shadow-lg fixed w-full z-10">
        <Link to="/" className="text-3xl font-extrabold tracking-tight">
          ConnectHub
        </Link>
        <NavigationMenu>
          <NavigationMenuList className="space-x-2">
            <NavigationMenuItem>
              <Link to="/creator-hub">
                <NavigationMenuLink className={`${navigationMenuTriggerStyle()} bg-primary-foreground text-primary hover:bg-primary-foreground/90 rounded-lg px-4 py-2 flex items-center gap-2`}>
                  <Users className="h-4 w-4" /> Creator
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link to="/social-impact">
                <NavigationMenuLink className={`${navigationMenuTriggerStyle()} bg-primary-foreground text-primary hover:bg-primary-foreground/90 rounded-lg px-4 py-2 flex items-center gap-2`}>
                  <Home className="h-4 w-4" /> Social Impact
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link to="/investment-floor">
                <NavigationMenuLink className={`${navigationMenuTriggerStyle()} bg-primary-foreground text-primary hover:bg-primary-foreground/90 rounded-lg px-4 py-2 flex items-center gap-2`}>
                  <TrendingUp className="h-4 w-4" /> Investimenti
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link to="/profile-wallet">
                <NavigationMenuLink className={`${navigationMenuTriggerStyle()} bg-primary-foreground text-primary hover:bg-primary-foreground/90 rounded-lg px-4 py-2 flex items-center gap-2`}>
                  <Wallet className="h-4 w-4" /> Profilo
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        <div className="flex items-center gap-4">
          {userEmail && (
            <span className="text-sm font-medium text-primary-foreground/80">
              {userEmail}
            </span>
          )}
          {role && (
            <span className="text-sm font-medium bg-primary-foreground/20 text-primary-foreground px-3 py-1 rounded-full">
              Ruolo: {role}
            </span>
          )}
          <Button variant="secondary" onClick={handleLogout} className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 rounded-lg flex items-center gap-2">
            <LogOut className="h-4 w-4" /> Logout
          </Button>
        </div>
      </header>
      <main className="flex-grow container mx-auto p-4 pt-24"> {/* Increased pt to account for taller header */}
        <Outlet /> {/* This is where child routes will be rendered */}
      </main>
      <MadeWithDyad />
    </div>
  );
};

export default MainLayout;