import { useState, useMemo } from "react";
import type { SortDir } from "../types/denial_summary";


export function useSortable<T>(data: T[]) {
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(-1);
 
  function handleSort(key: keyof T) {
    if (sortKey === key) setSortDir((d) => (d === 1 ? -1 : 1));
    else { setSortKey(key); setSortDir(-1); }
  }
 
  const sorted = useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const av = a[sortKey] as any;
      const bv = b[sortKey] as any;
      if (typeof av === "number") return (av - bv) * sortDir;
      return String(av ?? "").localeCompare(String(bv ?? "")) * sortDir;
    });
  }, [data, sortKey, sortDir]);
 
  return { sorted, sortKey, sortDir, handleSort };
}

export function topValue(items: string[]): string {
  const freq: Record<string, number> = {};
  items.forEach((v) => { freq[v] = (freq[v] ?? 0) + 1; });
  return Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
}
