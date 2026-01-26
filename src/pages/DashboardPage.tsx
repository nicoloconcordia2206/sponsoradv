"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"; // Added CardDescription
import { useRole } from "@/lib/role-store";
import { supabase } from "@/lib/supabaseClient";
import { showError } from "@/utils/toast";
import { Users, Briefcase, Handshake, TrendingUp, MessageSquareText } from "lucide-react"; // Icons for stats

const DashboardPage = () => {
  const { role, loading: roleLoading } = useRole();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [stats, setStats] = useState({
    campaigns: 0,
    proposals: 0,
    sponsorshipRequests: 0,
    fundedProjects: 0,
    investments: 0,
    messages: 0, // Placeholder for messages
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      if (!currentUserId || !role) return;
      setLoadingStats(true);

      try {
        let newStats = { ...stats };

        if (role === 'Azienda') {
          const { count: campaignsCount, error: campaignsError } = await supabase
            .from('campaigns')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', currentUserId);
          if (campaignsError) throw campaignsError;
          newStats.campaigns = campaignsCount || 0;

          // Fetch campaign IDs first
          const { data: campaignIdsData, error: campaignIdsError } = await supabase
            .from('campaigns')
            .select('id')
            .eq('user_id', currentUserId);
          if (campaignIdsError) throw campaignIdsError;
          const campaignIds = campaignIdsData ? campaignIdsData.map(c => c.id) : [];

          // Then count proposals for those campaign IDs
          const { count: proposalsCount, error: proposalsError } = await supabase
            .from('proposals')
            .select('*', { count: 'exact', head: true })
            .in('job_brief_id', campaignIds);
          if (proposalsError) throw proposalsError;
          newStats.proposals = proposalsCount || 0;

          const { count: investmentsCount, error: investmentsError } = await supabase
            .from('investments')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', currentUserId);
          if (investmentsError) throw investmentsError;
          newStats.investments = investmentsCount || 0;

        } else if (role === 'Squadra') {
          const { count: sponsorshipRequestsCount, error: srError } = await supabase
            .from('sponsorship_requests')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', currentUserId);
          if (srError) throw srError;
          newStats.sponsorshipRequests = sponsorshipRequestsCount || 0;

          const { count: fundedProjectsCount, error: fpError } = await supabase
            .from('sponsorship_requests')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', currentUserId)
            .eq('status', 'Finanziata');
          if (fpError) throw fpError;
          newStats.fundedProjects = fundedProjectsCount || 0;

        } else if (role === 'Influencer') {
          const { count: proposalsCount, error: proposalsError } = await supabase
            .from('proposals')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', currentUserId);
          if (proposalsError) throw proposalsError;
          newStats.proposals = proposalsCount || 0;

          const { count: campaignsCount, error: campaignsError } = await supabase
            .from('campaigns')
            .select('*', { count: 'exact', head: true });
          if (campaignsError) throw campaignsError;
          newStats.campaigns = campaignsCount || 0;

        } else if (role === 'Investitore') {
          const { count: investmentsCount, error: investmentsError } = await supabase
            .from('investments')
            .select('*', { count: 'exact', head: true });
          if (investmentsError) throw investmentsError;
          newStats.investments = investmentsCount || 0;

          const { count: sponsorshipRequestsCount, error: srError } = await supabase
            .from('sponsorship_requests')
            .select('*', { count: 'exact', head: true });
          if (srError) throw srError;
          newStats.sponsorshipRequests = sponsorshipRequestsCount || 0;
        }

        // Simulate messages for now
        newStats.messages = Math.floor(Math.random() * 10); // Random number of messages

        setStats(newStats);
      } catch (error: any) {
        console.error("Error fetching dashboard stats:", error.message);
        showError("Errore nel caricamento delle statistiche della dashboard.");
      } finally {
        setLoadingStats(false);
      }
    };

    if (currentUserId && role) {
      fetchStats();
    }
  }, [currentUserId, role]); // Depend on currentUserId and role

  if (loadingStats || roleLoading) {
    return <div className="text-center text-primary-foreground mt-20">Caricamento dashboard...</div>;
  }

  return (
    <div className="space-y-8 p-4">
      <h2 className="text-3xl font-bold text-center text-primary-foreground">La Tua Dashboard</h2>
      <p className="text-center text-primary-foreground/80">
        Benvenuto, {role}! Ecco un riepilogo delle tue attività su ConnectHub.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {role === 'Azienda' && (
          <>
            <Card className="bg-white/20 backdrop-blur-md border border-white/30 shadow-md text-primary-foreground">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Brief Video Pubblicati</CardTitle>
                <Briefcase className="h-4 w-4 text-primary-foreground/70" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.campaigns}</div>
                <p className="text-xs text-primary-foreground/80">Campagne attive</p>
              </CardContent>
            </Card>
            <Card className="bg-white/20 backdrop-blur-md border border-white/30 shadow-md text-primary-foreground">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Proposte Ricevute</CardTitle>
                <Handshake className="h-4 w-4 text-primary-foreground/70" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.proposals}</div>
                <p className="text-xs text-primary-foreground/80">In attesa di revisione</p>
              </CardContent>
            </Card>
            <Card className="bg-white/20 backdrop-blur-md border border-white/30 shadow-md text-primary-foreground">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pitch di Startup Caricati</CardTitle>
                <TrendingUp className="h-4 w-4 text-primary-foreground/70" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.investments}</div>
                <p className="text-xs text-primary-foreground/80">In cerca di investitori</p>
              </CardContent>
            </Card>
          </>
        )}

        {role === 'Squadra' && (
          <>
            <Card className="bg-white/20 backdrop-blur-md border border-white/30 shadow-md text-primary-foreground">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Progetti di Sostegno</CardTitle>
                <Briefcase className="h-4 w-4 text-primary-foreground/70" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.sponsorshipRequests}</div>
                <p className="text-xs text-primary-foreground/80">Richieste attive</p>
              </CardContent>
            </Card>
            <Card className="bg-white/20 backdrop-blur-md border border-white/30 shadow-md text-primary-foreground">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Progetti Finanziati</CardTitle>
                <Handshake className="h-4 w-4 text-primary-foreground/70" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.fundedProjects}</div>
                <p className="text-xs text-primary-foreground/80">Successi raggiunti</p>
              </CardContent>
            </Card>
            <Card className="bg-white/20 backdrop-blur-md border border-white/30 shadow-md text-primary-foreground">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Messaggi</CardTitle>
                <MessageSquareText className="h-4 w-4 text-primary-foreground/70" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.messages}</div>
                <p className="text-xs text-primary-foreground/80">Nuovi messaggi</p>
              </CardContent>
            </Card>
          </>
        )}

        {role === 'Influencer' && (
          <>
            <Card className="bg-white/20 backdrop-blur-md border border-white/30 shadow-md text-primary-foreground">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Proposte Inviate</CardTitle>
                <Handshake className="h-4 w-4 text-primary-foreground/70" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.proposals}</div>
                <p className="text-xs text-primary-foreground/80">In attesa di risposta</p>
              </CardContent>
            </Card>
            <Card className="bg-white/20 backdrop-blur-md border border-white/30 shadow-md text-primary-foreground">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Campagne Disponibili</CardTitle>
                <Users className="h-4 w-4 text-primary-foreground/70" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.campaigns}</div>
                <p className="text-xs text-primary-foreground/80">Opportunità attive</p>
              </CardContent>
            </Card>
            <Card className="bg-white/20 backdrop-blur-md border border-white/30 shadow-md text-primary-foreground">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Messaggi</CardTitle>
                <MessageSquareText className="h-4 w-4 text-primary-foreground/70" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.messages}</div>
                <p className="text-xs text-primary-foreground/80">Nuovi messaggi</p>
              </CardContent>
            </Card>
          </>
        )}

        {role === 'Investitore' && (
          <>
            <Card className="bg-white/20 backdrop-blur-md border border-white/30 shadow-md text-primary-foreground">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Startup in Valutazione</CardTitle>
                <TrendingUp className="h-4 w-4 text-primary-foreground/70" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.investments}</div>
                <p className="text-xs text-primary-foreground/80">Opportunità attive</p>
              </CardContent>
            </Card>
            <Card className="bg-white/20 backdrop-blur-md border border-white/30 shadow-md text-primary-foreground">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Progetti Social</CardTitle>
                <Handshake className="h-4 w-4 text-primary-foreground/70" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.sponsorshipRequests}</div>
                <p className="text-xs text-primary-foreground/80">In cerca di supporto</p>
              </CardContent>
            </Card>
            <Card className="bg-white/20 backdrop-blur-md border border-white/30 shadow-md text-primary-foreground">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Messaggi</CardTitle>
                <MessageSquareText className="h-4 w-4 text-primary-foreground/70" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.messages}</div>
                <p className="text-xs text-primary-foreground/80">Nuovi messaggi</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Placeholder for Recent Activity / Quick Actions */}
      <Card className="mt-8 bg-white/20 backdrop-blur-md border border-white/30 shadow-md text-primary-foreground">
        <CardHeader>
          <CardTitle className="text-primary-foreground">Attività Recenti</CardTitle>
          <CardDescription className="text-primary-foreground/80">Un riepilogo delle tue ultime interazioni sulla piattaforma.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-primary-foreground/90">
            <li>- Hai visualizzato 3 nuovi brief video.</li>
            <li>- La tua proposta per "Campagna Estiva Brand X" è stata accettata!</li>
            <li>- Un nuovo progetto di sostegno nella tua città è stato pubblicato.</li>
            <li>- Hai ricevuto un messaggio da "Supporto ConnectHub".</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;