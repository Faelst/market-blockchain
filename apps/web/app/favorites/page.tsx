/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import Link from 'next/link';
import { fetchJSON } from '@/lib/api';
import { Heart, Trash2 } from 'lucide-react';
import NFTCard from '@/components/NFTCard';

const LS_KEY = 'nft:favorites';

function readFavoriteIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LS_KEY);
    const arr = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(arr) ? [...new Set(arr.map(String))] : [];
  } catch {
    return [];
  }
}

function writeFavoriteIds(ids: string[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify([...new Set(ids.map(String))]));
  } catch {
    /* ignore */
  }
}

async function fetchNFT(id: string) {
  const res = await fetchJSON(`/nfts/${encodeURIComponent(id)}`, { cache: 'no-store' });
  
  if (!res.nft) throw new Error(`Failed to load NFT ${id}`);

  return res.nft;
}

export default function FavoritesPage() {
  const [ids, setIds] = useState<string[]>([]);
  const [nfts, setNfts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIds(readFavoriteIds());
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await Promise.allSettled(ids.map((id) => fetchNFT(id)));
        if (cancelled) return;
        const ok = data
          .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
          .map((r) => r.value);
        setNfts(ok);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [ids]);

  const clearAll = useCallback(() => {
    writeFavoriteIds([]);
    setIds([]);
    setNfts([]);
  }, []);

  const title = useMemo(
    () => (ids.length ? `Your Favorites (${ids.length})` : 'Your Favorites'),
    [ids.length]
  );

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-2xl p-6 md:p-10 glass">
        <div className="max-w-xl">
          <h1 className="hero-title">{title}</h1>
          <p className="hero-sub">
            All NFTs you’ve favorited. Manage your list or jump back to the market to find more gems.
          </p>
          <div className="mt-6 flex gap-3">
            <Link href="/market" className="btn btn-primary">
              Explore Market
            </Link>
            {ids.length > 0 && (
              <button onClick={clearAll} className="btn btn-ghost inline-flex items-center gap-2">
                <Trash2 size={16} />
                Clear all
              </button>
            )}
          </div>
        </div>
        <div className="absolute right-4 bottom-4 w-40 h-40 md:w-64 md:h-64 rounded-2xl bg-gradient-to-br from-primary/30 via-teal/30 to-gold/30 blur-2xl pointer-events-none" />
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-teal/20 blur-3xl" />
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-semibold">Favorited NFTs</h2>
          {ids.length > 0 && (
            <div className="text-sm text-muted inline-flex items-center gap-2">
              <Heart size={16} className="text-red-500 fill-red-500" />
              {ids.length} saved
            </div>
          )}
        </div>

        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card p-2 animate-pulse">
                <div className="w-full aspect-square rounded-xl bg-default/10" />
                <div className="mt-3 h-4 w-2/3 bg-default/10 rounded" />
                <div className="mt-2 h-3 w-1/3 bg-default/10 rounded" />
              </div>
            ))}
          </div>
        )}

        {!loading && ids.length === 0 && (
          <div className="glass rounded-2xl p-6 flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-lg font-medium">No favorites yet</div>
              <div className="text-muted">
                Tap the <Heart size={14} className="inline text-red-500 align-text-top" /> on any NFT to save it.
              </div>
            </div>
            <Link href="/market" className="btn btn-primary">
              Browse NFTs
            </Link>
          </div>
        )}

        {!loading && ids.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {nfts.map((nft) => (
              <NFTCard key={nft._id} nft={nft} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
