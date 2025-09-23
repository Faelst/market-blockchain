'use client';
import useSWRInfinite from 'swr/infinite';
import { fetcher } from '@/lib/api';
import NFTCard from '@/components/NFTCard';
import { useEffect, useMemo, useState } from 'react';
import Select from '@/components/Select';
import Toggle from '@/components/Toggle';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { API_URL } from '@/lib/env';

function useDebounce<T>(value: T, delay = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

export default function MarketPage() {
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [q, setQ] = useState(sp.get('q') || '');
  const [category, setCategory] = useState(sp.get('category') || '');
  const [rarity, setRarity] = useState(sp.get('rarity') || '');
  const [minPrice, setMinPrice] = useState(sp.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(sp.get('maxPrice') || '');
  const [onSale, setOnSale] = useState(sp.get('onSale') !== 'false');
  const [sort, setSort] = useState(sp.get('sort') || 'new');

  const debouncedQ = useDebounce(q, 400);

  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedQ) params.set('q', debouncedQ);
    if (category) params.set('category', category);
    if (rarity) params.set('rarity', rarity);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (!onSale) params.set('onSale', 'false');
    if (sort && sort !== 'new') params.set('sort', sort);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  }, [
    debouncedQ,
    category,
    rarity,
    minPrice,
    maxPrice,
    onSale,
    sort,
    pathname,
    router,
  ]);

  const baseParams = useMemo(
    () => ({
      q: debouncedQ,
      category,
      rarity,
      minPrice,
      maxPrice,
      onSale: String(onSale),
      sort,
    }),
    [debouncedQ, category, rarity, minPrice, maxPrice, onSale, sort]
  );

  const getKey = (pageIndex: number, previousPageData: any) => {
    if (previousPageData && !previousPageData.items?.length) return null;
    const params = new URLSearchParams({
      ...baseParams,
      page: String(pageIndex + 1),
      limit: '12',
    });
    return `${API_URL}/nfts?${params.toString()}`;
  };

  const { data, size, setSize, isValidating } = useSWRInfinite(getKey, fetcher);
  const items = (data || []).flatMap((d: any) => d.items || []);
  const isLoadingInitialData = !data && isValidating;
  const isLoadingMore = isValidating && size > 0;
  const isReachingEnd = data && data[data.length - 1]?.items?.length < 12;

  const categoryOptions = useMemo(
    () => [
      { label: 'All Categories', value: '' },
      { label: 'Art', value: 'Art' },
      { label: 'Photography', value: 'Photography' },
      { label: 'Gaming', value: 'Gaming' },
      { label: 'Music', value: 'Music' },
    ],
    []
  );

  const rarityOptions = useMemo(
    () => [
      { label: 'Any Rarity', value: '' },
      { label: 'Common', value: 'Common' },
      { label: 'Uncommon', value: 'Uncommon' },
      { label: 'Rare', value: 'Rare' },
      { label: 'Epic', value: 'Epic' },
      { label: 'Legendary', value: 'Legendary' },
    ],
    []
  );

  const sortOptions = useMemo(
    () => [
      { label: 'Newest', value: 'new' },
      { label: 'Price ↑', value: 'price_asc' },
      { label: 'Price ↓', value: 'price_desc' },
    ],
    []
  );

  useEffect(() => {
    setSize(1);
  }, [baseParams, setSize]);

  return (
    <div className='space-y-6'>
      <div className='card p-4 md:p-6'>
        <div className='flex items-center justify-between gap-3'>
          <h1 className='text-xl md:text-2xl font-semibold'>Market</h1>
          <div className='hidden md:block text-sm text-white/60'>
            Browse curated digital assets
          </div>
        </div>

        <div className='mt-4 grid grid-cols-2 md:grid-cols-12 gap-3'>
          <input
            className='col-span-2 md:col-span-4'
            placeholder='Search NFTs'
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label='Search NFTs'
          />

          <Select
            className='col-span-1 md:col-span-2'
            value={category}
            onChange={setCategory}
            options={categoryOptions}
            ariaLabel='Category'
          />

          <Select
            className='col-span-1 md:col-span-2'
            value={rarity}
            onChange={setRarity}
            options={rarityOptions}
            ariaLabel='Rarity'
          />

          <div className='col-span-2 md:col-span-3 glass rounded-2xl border border-white/10 p-2.5 flex items-center gap-2'>
            <div className='flex-1'>
              <input
                className='w-full bg-transparent border-0 focus:ring-0 px-2 py-1'
                placeholder='Min'
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                inputMode='decimal'
                aria-label='Minimum price'
              />
            </div>
            <div className='text-white/30'>--</div>
            <div className='flex-1'>
              <input
                className='w-full bg-transparent border-0 focus:ring-0 px-2 py-1'
                placeholder='Max'
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                inputMode='decimal'
                aria-label='Maximum price'
              />
            </div>
            <div className='ml-2 text-xs text-white/50'>ETH</div>
          </div>

          <div className='col-span-1 md:col-span-1 flex items-center'>
            <Toggle checked={onSale} onChange={setOnSale} label='On sale' id='sale' />
          </div>

          <Select
            className='col-span-1 md:col-span-2'
            value={sort}
            onChange={setSort}
            options={sortOptions}
            ariaLabel='Sort'
          />
        </div>
      </div>

      <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4'>
        {items.map((nft: any) => (
          <NFTCard key={nft._id} nft={nft} />
        ))}

        {isLoadingInitialData &&
          Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className='card p-2 animate-pulse'>
              <div className='rounded-xl w-full aspect-square bg-white/10' />
              <div className='h-4 bg-white/10 rounded mt-3 w-3/4' />
              <div className='h-3 bg-white/10 rounded mt-2 w-1/2' />
            </div>
          ))}

        {!isLoadingInitialData && !items.length && (
          <div className='col-span-full glass rounded-2xl p-6 text-center text-white/70'>
            No items found. Try adjusting your filters.
          </div>
        )}
      </div>

      <div className='flex justify-center'>
        <button
          className='btn btn-ghost'
          onClick={() => setSize(size + 1)}
          disabled={isLoadingMore || isReachingEnd}
        >
          {isLoadingMore ? 'Loading…' : isReachingEnd ? 'No more items' : 'Load more'}
        </button>
      </div>
    </div>
  );
}