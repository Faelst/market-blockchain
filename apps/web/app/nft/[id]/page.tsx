import Image from 'next/image';
import { fetchJSON } from '@/lib/api';
import BuyButton from '@/app/market/components/BuyButton';
import { API_URL } from '@/lib/env';

export default async function NFTDetailPage({ params }: { params: { id: string } }) {
  const data = await fetchJSON(`/nfts/${params.id}`, { cache: 'no-store' });
  const nft = data.nft;
  const history = data.history || [];
  const img =
    nft.imageUrl ||
    `${API_URL}/image/${encodeURIComponent(nft.imageSeed || nft.name)}.svg?size=1200`;

  return (
    <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
      <div className='card p-2 overflow-hidden'>
        <div className='relative w-full aspect-square rounded-2xl overflow-hidden'>
          <Image
            src={img}
            alt={nft.name}
            fill
            sizes='(max-width: 1024px) 100vw, 50vw'
            className='object-cover'
          />
        </div>
      </div>

      <div className='space-y-6'>
        <div className='card p-6'>
          <h1 className='text-2xl md:text-3xl font-semibold text-default'>{nft.name}</h1>
          <div className='text-muted mt-2'>{nft.description}</div>

          <div className='mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2'>
            <div className='tag'>Owner: {nft.owner?.username || 'Unknown'}</div>
            <div className='tag'>Creator: {nft.creator?.username || 'Unknown'}</div>
            {nft.collection && <div className='tag'>Collection: {nft.collection?.name}</div>}
            {nft.onSale ? <div className='tag bg-teal/20'>On Sale</div> : <div className='tag'>Not for sale</div>}
          </div>

          <div className='mt-5'>
            <BuyButton id={nft._id} price={nft.price} ownerId={nft.owner?._id || nft.owner} />
          </div>
        </div>

        <div className='card p-6'>
          <h2 className='text-lg font-semibold text-default'>Attributes</h2>
          <div className='mt-3 grid grid-cols-2 md:grid-cols-3 gap-2'>
            {nft.attributes?.map((a: any, i: number) => (
              <div key={i} className='glass rounded-xl p-3'>
                <div className='text-xs text-muted'>{a.trait_type}</div>
                <div className='font-medium text-default'>{a.value}</div>
                {a.rarity && <div className='text-xs text-gold mt-1'>{a.rarity}</div>}
              </div>
            ))}
            {!nft.attributes?.length && <div className='text-muted text-sm'>No attributes</div>}
          </div>
        </div>

        <div className='card p-6'>
          <h2 className='text-lg font-semibold text-default'>History</h2>
          <div className='mt-3 space-y-2'>
            {history.map((h: any) => (
              <div
                key={h._id}
                className='flex items-center justify-between text-sm glass rounded-xl px-3 py-2'
              >
                <div className='text-default'>{h.type.toUpperCase()}</div>
                <div className='text-muted'>{new Date(h.createdAt).toLocaleString()}</div>
                <div className='text-default'>{h.price ? `${h.price} ETH` : '-'}</div>
              </div>
            ))}
            {!history.length && <div className='text-muted text-sm'>No history</div>}
          </div>
        </div>
      </div>
    </div>
  );
}