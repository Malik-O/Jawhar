'use client';

import { useAuth } from '@clerk/nextjs';
import { useCallback, useEffect, useState } from 'react';
import { PlatformUser, UserRole } from '../types/platform';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export function useUserRole() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const [user, setUser] = useState<PlatformUser | null>(null);
  const [loading, setLoading] = useState(true);

  const syncUser = useCallback(async () => {
    if (!isSignedIn) return;
    const token = await getToken();
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/users/sync`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      }
    } catch (err) {
      console.error('Failed to sync user:', err);
    }
  }, [isSignedIn, getToken]);

  const fetchMe = useCallback(async () => {
    if (!isSignedIn) return;
    const token = await getToken();
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else if (res.status === 404) {
        await syncUser();
      }
    } catch (err) {
      console.error('Failed to fetch user:', err);
    } finally {
      setLoading(false);
    }
  }, [isSignedIn, getToken, syncUser]);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchMe();
    } else if (isLoaded && !isSignedIn) {
      setLoading(false);
    }
  }, [isLoaded, isSignedIn, fetchMe]);

  const role: UserRole = user?.role || 'student';
  const isSheikh = role === 'sheikh';
  const isAdmin = role === 'super_admin';

  return { user, role, isSheikh, isAdmin, loading, syncUser, refresh: fetchMe };
}

export function useAuthToken() {
  const { getToken } = useAuth();
  return useCallback(async () => {
    const token = await getToken();
    return token;
  }, [getToken]);
}
