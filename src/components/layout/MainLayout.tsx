"use client";

import React from "react";
import { Link, useNavigate } from "react-router-dom";
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

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { role, selectRole } = useRole();
  const navigate = useNavigate();

  const handleChangeRole = () => {
    selectRole(null); // Clear the selected role
    navigate("/"); // Go back to the role selection page
  };

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
          {role && (
            <span className="text-sm font-medium text-primary-foreground bg-primary/80 px-3 py-1 rounded-full">
              Ruolo: {role}
            </span>
          )}
          <Button variant="outline" onClick={handleChangeRole} className="bg-white/50 backdrop-blur-sm border-white/30 text-primary hover:bg-white/70">
            Cambia Ruolo
          </Button>
        </div>
      </header>
      <main className="flex-grow container mx-auto p-4 pt-20"> {/* Added pt-20 to account for fixed header */}
        {children}
      </main>
      <MadeWithDyad />
    </div>
  );
};

export default MainLayout;