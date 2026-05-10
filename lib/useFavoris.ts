'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'terrimo_favoris';

function readIds(): number[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x): x is number => typeof x === 'number') : [];
  } catch {
    return [];
  }
}

function writeIds(ids: number[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch { /* quota dépassé ou SSR */ }
}

export function useFavoris() {
  const [ids, setIds] = useState<number[]>([]);

  // Hydratation côté client uniquement
  useEffect(() => {
    setIds(readIds());

    // Synchronisation entre onglets
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setIds(readIds());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const toggle = useCallback((id: number) => {
    setIds(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      writeIds(next);
      return next;
    });
  }, []);

  const add = useCallback((id: number) => {
    setIds(prev => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      writeIds(next);
      return next;
    });
  }, []);

  const remove = useCallback((id: number) => {
    setIds(prev => {
      const next = prev.filter(x => x !== id);
      writeIds(next);
      return next;
    });
  }, []);

  const isFavori = useCallback((id: number) => ids.includes(id), [ids]);

  return { ids, count: ids.length, toggle, add, remove, isFavori };
}
