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
import { Home, Users, TrendingUp, Wallet, LogOut, MessageSquareText, LayoutDashboard } from "lucide-react"; // Import Lucide icons

const MainLayout: React.FC = () => {
  const { role, loading: roleLoading } = useRole();
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userFullName, setUserFullName] = useState<string | null>(null); // New state for user's full name

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email);
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('full_name, username')
          .eq('id', user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error("Error fetching user profile name:", profileError);
        } else if (profileData) {
          setUserFullName(profileData.full_name || profileData.username || null);
        } else {
          setUserFullName(null);
        }
      }
    };
    fetchUserAndProfile();
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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-700 to-indigo-900 text-primary-foreground">
      <header className="bg-primary/80 backdrop-blur-md text-primary-foreground px-6 py-4 flex items-center justify-between shadow-lg fixed w-full z-10 border-b border-white/30">
        <Link to="/" className="text-3xl font-extrabold tracking-tight">
          ConnectHub
        </Link>
        <NavigationMenu>
          <NavigationMenuList className="space-x-2">
            <NavigationMenuItem>
              <Link to="/dashboard">
                <NavigationMenuLink className={`${navigationMenuTriggerStyle()} bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/30 rounded-lg px-4 py-2 flex items-center gap-2 transition-all duration-200`}>
                  <LayoutDashboard className="h-4 w-4" /> Dashboard
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link to="/creator-hub">
                <NavigationMenuLink className={`${navigationMenuTriggerStyle()} bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/30 rounded-lg px-4 py-2 flex items-center gap-2 transition-all duration-200`}>
                  <Users className="h-4 w-4" /> Creator
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link to="/social-impact">
                <NavigationMenuLink className={`${navigationMenuTriggerStyle()} bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/30 rounded-lg px-4 py-2 flex items-center gap-2 transition-all duration-200`}>
                  <Home className="h-4 w-4" /> Social Impact
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link to="/investment-floor">
                <NavigationMenuLink className={`${navigationMenuTriggerStyle()} bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/30 rounded-lg px-4 py-2 flex items-center gap-2 transition-all duration-200`}>
                  <TrendingUp className="h-4 w-4" /> Investimenti
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link to="/profile-wallet">
                <NavigationMenuLink className={`${navigationMenuTriggerStyle()} bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/30 rounded-lg px-4 py-2 flex items-center gap-2 transition-all duration-200`}>
                  <Wallet className="h-4 w-4" /> Profilo
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link to="/messages">
                <NavigationMenuLink className={`${navigationMenuTriggerStyle()} bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/30 rounded-lg px-4 py-2 flex items-center gap-2 transition-all duration-200`}>
                  <MessageSquareText className="h-4 w-4" /> Messaggi
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        <div className="flex items-center gap-4">
          {userFullName && (
            <span className="text-sm font-medium text-primary-foreground/80">
              Ciao, {userFullName}!
            </span>
          )}
          {role && (
            <span className="text-sm font-medium bg-primary-foreground/20 text-primary-foreground px-3 py-1 rounded-full">
              Ruolo: {role}
            </span>
          )}
          <Button variant="secondary" onClick={handleLogout} className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 rounded-lg flex items-center gap-2 transition-all duration-200">
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