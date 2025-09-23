import { fetchJSON } from '@/lib/api';
import Link from 'next/link';
import Image from 'next/image';
import { API_URL } from '@/lib/env';

export default async function CollectionsPage() {
  const data = await fetchJSON('/collections', { cache: 'no-store' });
  return (
    <div className='space-y-4'>
      <h1 className='text-xl md:text-2xl font-semibold'>Collections</h1>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        {data.items?.map((c: any) => {
          const src = (c.bannerSeed || '').startsWith('http')
            ? c.bannerSeed
            : `${API_URL}/image/${encodeURIComponent(c.bannerSeed || c.name)}.svg?size=800`;
          return (
            <Link
              key={c._id}
              href={`/collections/${c._id}`}
              className='card group sheen hover:scale-[1.01] transition'
            >
              <div className='h-32 rounded-xl overflow-hidden relative'>
                <Image
                  src={src}
                  alt={c.name}
                  fill
                  sizes='(max-width: 768px) 100vw, 33vw'
                  className='object-cover'
                />
              </div>
              <div className='mt-3 font-medium group-hover:opacity-90 text-default'>{c.name}</div>
              <div className='text-sm text-muted'>{c.category}</div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}