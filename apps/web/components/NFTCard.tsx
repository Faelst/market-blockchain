/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState, useEffect, useCallback } from 'react';
import { API_URL } from '@/lib/env';
import { Heart } from 'lucide-react';

const LS_KEY = 'nft:favorites';

function readFavs(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(LS_KEY);
    return new Set<string>(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function writeFavs(favs: Set<string>) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(Array.from(favs)));
  } catch {
    // ignore
  }
}

export default function NFTCard({ nft }: { nft: any }) {
  const id = String(nft._id);

  const img = useMemo(() => {
    if (nft.imageUrl) return nft.imageUrl;
    return `${API_URL}/image/${encodeURIComponent(nft.imageSeed || nft.name)}.svg?size=800`;
  }, [nft]);

  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    const favs = readFavs();
    setIsFav(favs.has(id));
  }, [id]);

  const toggleFav = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const favs = readFavs();
      const next = new Set(favs);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      setIsFav(next.has(id));
      writeFavs(next);
    },
    [id]
  );

  return (
    <Link
      href={`/nft/${id}`}
      className="group card p-2 hover:scale-[1.01] transition tilt sheen relative"
    >
      <div className="relative w-full aspect-square rounded-xl overflow-hidden">
        <Image
          src={img}
          alt={nft.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 16vw"
          className="object-cover transition-transform group-hover:scale-[1.03]"
        />

        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/15 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition" />

        <button
          onClick={toggleFav}
          aria-label={isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          aria-pressed={isFav}
          className="absolute bottom-1 right-1 z-10 p-1.5 rounded-full bg-black/40 backdrop-blur text-white hover:bg-black/60 transition"
        >
          <Heart
            size={18}
            className={isFav ? 'fill-red-500 text-red-500' : 'text-white'}
          />
        </button>
      </div>

      <div className="px-2 py-3">
        <div className="text-sm font-medium truncate text-default">{nft.name}</div>
        <div className="flex items-center justify-between mt-1">
          {nft.onSale && nft.price ? (
            <div className="text-gold text-sm">{nft.price} ETH</div>
          ) : (
            <div className="text-muted text-xs">Not for sale</div>
          )}
          <div className="text-xs text-muted">
            {nft.collection?.name || nft.collectionId?.name || '--'}
          </div>
        </div>
      </div>
    </Link>
  );
}
