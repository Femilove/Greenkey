"use client";

import { useCallback, useEffect, useState } from "react";
import type { Property } from "@/types/property";

const KEY = "savedProperties";

function read(): Property[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(next: Property[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable */
  }
}

export function useSavedProperties() {
  const [saved, setSaved] = useState<Property[]>([]);
  const [ready, setReady] = useState(false);

  // localStorage only exists in the browser, so load after mount.
  useEffect(() => {
    setSaved(read());
    setReady(true);
  }, []);

  const isSaved = useCallback((id: string) => saved.some((p) => p.id === id), [saved]);

  const toggle = useCallback((property: Property) => {
    const current = read();
    const next = current.some((p) => p.id === property.id)
      ? current.filter((p) => p.id !== property.id)
      : [...current, property];
    write(next);
    setSaved(next);
  }, []);

  const remove = useCallback((id: string) => {
    const next = read().filter((p) => p.id !== id);
    write(next);
    setSaved(next);
  }, []);

  return { saved, ready, isSaved, toggle, remove };
}
