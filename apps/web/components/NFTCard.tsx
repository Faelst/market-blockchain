'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useMemo } from 'react';
import { API_URL } from '@/lib/env';

export default function NFTCard({ nft }: { nft: any }) {
  const img = useMemo(() => {
    if (nft.imageUrl) return nft.imageUrl;
    return `${API_URL}/image/${encodeURIComponent(nft.imageSeed || nft.name)}.svg?size=800`;
  }, [nft]);

  return (
    <Link href={`/nft/${nft._id}`} className='group card p-2 hover:scale-[1.01] transition tilt sheen'>
      <div className='relative w-full aspect-square rounded-xl overflow-hidden'>
        <Image
          src={img}
          alt={nft.name}
          fill
          sizes='(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 16vw'
          className='object-cover transition-transform group-hover:scale-[1.03]'
        />
        <div className='absolute inset-0 pointer-events-none bg-gradient-to-t from-black/15 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition' />
      </div>
      <div className='px-2 py-3'>
        <div className='text-sm font-medium truncate text-default'>{nft.name}</div>
        <div className='flex items-center justify-between mt-1'>
          {nft.onSale && nft.price ? (
            <div className='text-gold text-sm'>{nft.price} ETH</div>
          ) : (
            <div className='text-muted text-xs'>Not for sale</div>
          )}
          <div className='text-xs text-muted'>
            {nft.collection?.name || nft.collectionId?.name || '--'}
          </div>
        </div>
      </div>
    </Link>
  );
}