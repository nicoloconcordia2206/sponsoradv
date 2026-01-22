"use client";

import { useState, useEffect } from 'react';

export type UserRole = 'Azienda' | 'Influencer' | 'Squadra/Negozio' | 'Investitore' | null;

const ROLE_STORAGE_KEY = 'connecthub_user_role';

export const useRole = () => {
  const [role, setRole] = useState<UserRole>(null);

  useEffect(() => {
    const storedRole = localStorage.getItem(ROLE_STORAGE_KEY) as UserRole;
    if (storedRole) {
      setRole(storedRole);
    }
  }, []);

  const selectRole = (newRole: UserRole) => {
    if (newRole) {
      localStorage.setItem(ROLE_STORAGE_KEY, newRole);
    } else {
      localStorage.removeItem(ROLE_STORAGE_KEY);
    }
    setRole(newRole);
  };

  return { role, selectRole };
};