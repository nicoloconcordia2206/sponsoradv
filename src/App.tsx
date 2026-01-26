import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import MainLayout from "./components/layout/MainLayout";
import CreatorHubPage from "./pages/CreatorHubPage";
import SocialImpactPage from "./pages/SocialImpactPage";
import InvestmentFloorPage from "./pages/InvestmentFloorPage";
import UserProfileWalletPage from "./pages/UserProfileWalletPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage"; // New import
import MessagesPage from "./pages/MessagesPage"; // New import
import { useRole } from "./lib/role-store";
import React, { useEffect, useState } from "react";
import { supabase } from "./lib/supabaseClient";

const queryClient = new QueryClient();

// A wrapper component to protect routes that require a role
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { role, loading: roleLoading } = useRole();
  const [session, setSession] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setAuthLoading(false);
    };
    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setAuthLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (authLoading || roleLoading) {
    return <div className="text-center text-muted-foreground mt-20">Caricamento...</div>;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (!role) {
    // If authenticated but no role assigned yet (e.g., just registered)
    return <Navigate to="/register" replace />; // Or a dedicated role selection page
  }

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<Index />} /> {/* Index page will handle redirection */}
          <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<DashboardPage />} /> {/* New Dashboard Route */}
            <Route path="/creator-hub" element={<CreatorHubPage />} />
            <Route path="/social-impact" element={<SocialImpactPage />} />
            <Route path="/investment-floor" element={<InvestmentFloorPage />} />
            <Route path="/profile-wallet" element={<UserProfileWalletPage />} />
            <Route path="/messages" element={<MessagesPage />} /> {/* New Messages Route */}
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;