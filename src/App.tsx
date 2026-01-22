import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import MainLayout from "./components/layout/MainLayout";
import CreatorHubPage from "./pages/CreatorHubPage";
import SocialImpactPage from "./pages/SocialImpactPage";
import InvestmentFloorPage from "./pages/InvestmentFloorPage";
import UserProfileWalletPage from "./pages/UserProfileWalletPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route element={<MainLayout />}>
            <Route path="/creator-hub" element={<CreatorHubPage />} />
            <Route path="/social-impact" element={<SocialImpactPage />} />
            <Route path="/investment-floor" element={<InvestmentFloorPage />} />
            <Route path="/profile-wallet" element={<UserProfileWalletPage />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;