"use client";

import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { showError } from '@/utils/toast'; // Import showError

export type UserRole = 'Azienda/Startup' | 'Influencer' | 'Squadra/Negozio' | 'Investitore' | null;

export const useRole = () => {
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
          console.error("Error fetching user role:", error); // Log detailed error for debugging
          showError("Errore nel caricamento del ruolo utente."); // Generic error message
          setRole(null);
        } else if (data) {
          setRole(data.role as UserRole);
        } else {
          setRole(null); // User exists but no role in profiles table
        }
      } else {
        setRole(null);
      }
      setLoading(false);
    };

    fetchUserRole();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        // If user logs in or session changes, refetch role
        fetchUserRole();
      } else {
        // If user logs out
        setRole(null);
        setLoading(false);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // The selectRole function is now primarily used during registration,
  // but we keep it here for consistency if needed elsewhere (e.g., admin panel)
  const selectRole = async (newRole: UserRole) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase
        .from('profiles')
        .upsert({ id: user.id, role: newRole });

      if (error) {
        console.error("Error updating user role:", error); // Log detailed error for debugging
        showError("Errore nell'aggiornamento del ruolo."); // Generic error message
      } else {
        setRole(newRole);
      }
    } else {
      console.warn("Cannot select role: user not authenticated.");
      showError("Devi essere autenticato per selezionare un ruolo.");
    }
  };

  return { role, selectRole, loading };
};