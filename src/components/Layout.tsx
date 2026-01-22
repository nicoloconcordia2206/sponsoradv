"use client";

import React from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { MadeWithDyad } from "./made-with-dyad";

const navItems = [
  { name: "Creator Hub", to: "/creator-hub" },
  { name: "Social Impact", to: "/social-impact" },
  { name: "Investment Floor", to: "/investment-floor" },
  { name: "User Profile & Wallet", to: "/profile-wallet" },
];

const Layout = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 hidden md:flex">
            <Link to="/" className="mr-6 flex items-center space-x-2">
              <span className="font-bold text-lg">ConnectHub</span>
            </Link>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              {navItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.to}
                  className={({ isActive }) =>
                    `transition-colors hover:text-primary ${
                      isActive ? "text-primary" : "text-muted-foreground"
                    }`
                  }
                >
                  {item.name}
                </NavLink>
              ))}
            </nav>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pr-0">
              <Link to="/" className="flex items-center space-x-2">
                <span className="font-bold text-lg">ConnectHub</span>
              </Link>
              <nav className="grid gap-2 py-6 text-lg font-medium">
                {navItems.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.to}
                    className={({ isActive }) =>
                      `flex w-full items-center py-2 text-lg font-semibold ${
                        isActive ? "text-primary" : "text-muted-foreground"
                      }`
                    }
                  >
                    {item.name}
                  </NavLink>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
          <div className="flex flex-1 items-center justify-end space-x-2">
            {/* User related actions can go here */}
          </div>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <MadeWithDyad />
    </div>
  );
};

export default Layout;