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
      console.error("Error logging out:", error);
      showError("Errore durante il logout.");
    } else {
      showSuccess("Logout effettuato con successo!");
      navigate("/login"); // Reindirizza alla pagina di login dopo il logout
    }
  };

  if (roleLoading) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Caricamento layout...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white/30 backdrop-blur-lg border-b border-white/20 px-4 py-3 flex items-center justify-between shadow-md fixed w-full z-10">
        <Link to="/" className="text-2xl font-bold text-primary">
          ConnectHub
        </Link>
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link to="/creator-hub">
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Creator
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link to="/social-impact">
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Social Impact
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link to="/investment-floor">
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Investimenti
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link to="/profile-wallet">
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Profilo
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        <div className="flex items-center gap-4">
          {userEmail && (
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {userEmail}
            </span>
          )}
          {role && (
            <span className="text-sm font-medium text-primary-foreground bg-primary/80 px-3 py-1 rounded-full">
              Ruolo: {role}
            </span>
          )}
          <Button variant="outline" onClick={handleLogout} className="bg-white/50 backdrop-blur-sm border-white/30 text-primary hover:bg-white/70">
            Logout
          </Button>
        </div>
      </header>
      <main className="flex-grow container mx-auto p-4 pt-20"> {/* Added pt-20 to account for fixed header */}
        <Outlet /> {/* This is where child routes will be rendered */}
      </main>
      <MadeWithDyad />
    </div>
  );
};

export default MainLayout;