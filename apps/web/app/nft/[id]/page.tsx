/* eslint-disable @typescript-eslint/no-explicit-any */
import Image from 'next/image';
import { fetchJSON } from '@/lib/api';
import BuyButton from '@/app/market/components/BuyButton';
import { API_URL } from '@/lib/env';

type Tx = {
  _id?: string;
  type?: string;
  createdAt?: string;
  price?: number;
};

const TYPE_ORDER = ['sale', 'listing', 'mint', 'transfer', 'bid', 'cancel', 'other'] as const;
const TYPE_LABEL: Record<string, string> = {
  sale: 'Sales',
  listing: 'Listings',
  mint: 'Mints',
  transfer: 'Transfers',
  bid: 'Bids',
  cancel: 'Cancellations',
  other: 'Other Events',
};

function normalizeType(t?: string) {
  const s = (t || 'other').toLowerCase();
  return TYPE_ORDER.includes(s as any) ? s : 'other';
}

function groupByType(transactions: Tx[]) {
  const groups = new Map<string, Tx[]>();
  for (const tx of transactions) {
    const key = normalizeType(tx.type);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(tx);
  }

  const ordered = Array.from(groups.entries()).sort((a, b) => {
    const ia = TYPE_ORDER.indexOf(a[0] as any);
    const ib = TYPE_ORDER.indexOf(b[0] as any);
    if (ia === -1 && ib === -1) return a[0].localeCompare(b[0]);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });
  return ordered;
}

export default async function NFTDetailPage({ params }: { params: { id: string } }) {
  const id = encodeURIComponent(params.id);

  // Fetch NFT and its transactions in parallel
  const [{ nft }, txRes] = await Promise.all([
    fetchJSON(`/nfts/${id}`, { cache: 'no-store' }),
    fetchJSON(`/nfts/${id}/transactions`, { cache: 'no-store' }),
  ]);

  const transactions: Tx[] = Array.isArray(txRes) ? txRes : (txRes?.transactions ?? []);
  const grouped = groupByType(transactions);

  const img =
    nft.imageUrl ||
    `${API_URL}/image/${encodeURIComponent(nft.imageSeed || nft.name)}.svg?size=1200`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="card p-2 overflow-hidden">
        <div className="relative w-full aspect-square rounded-2xl overflow-hidden">
          <Image
            src={img}
            alt={nft.name}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
      </div>

      <div className="space-y-6">
        <div className="card p-6">
          <h1 className="text-2xl md:text-3xl font-semibold text-default">{nft.name}</h1>
          <div className="text-muted mt-2">{nft.description}</div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="tag">Owner: {nft.owner?.username || 'Unknown'}</div>
            <div className="tag">Creator: {nft.creator?.username || 'Unknown'}</div>
            {nft.collection && <div className="tag">Collection: {nft.collection?.name}</div>}
            {nft.onSale ? (
              <div className="tag bg-teal/20">On Sale</div>
            ) : (
              <div className="tag">Not for sale</div>
            )}
          </div>

          <div className="mt-5">
            <BuyButton id={nft._id} price={nft.price} ownerId={nft.owner?._id || nft.owner} />
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold text-default">Attributes</h2>
          <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-2">
            {nft.attributes?.map((a: any, i: number) => (
              <div key={i} className="glass rounded-xl p-3">
                <div className="text-xs text-muted">{a.trait_type}</div>
                <div className="font-medium text-default">{a.value}</div>
                {a.rarity && <div className="text-xs text-gold mt-1">{a.rarity}</div>}
              </div>
            ))}
            {!nft.attributes?.length && <div className="text-muted text-sm">No attributes</div>}
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold text-default">History</h2>

          {grouped.length === 0 && (
            <div
              role="status"
              aria-live="polite"
              className="mt-3 glass rounded-xl p-4 text-sm text-muted"
            >
              No history
            </div>
          )}

          {grouped.length > 0 && (
            <div className="mt-4 space-y-6">
              {grouped.map(([type, rows]) => {
                const label = TYPE_LABEL[type] ?? type.charAt(0).toUpperCase() + type.slice(1);
                return (
                  <div key={type} className="space-y-2">
                    <h3 className="text-default font-medium">{label}</h3>
                    <div className="overflow-x-auto rounded-xl border border-default/10">
                      <table className="w-full text-sm">
                        <caption className="sr-only">{label} events</caption>
                        <thead>
                          <tr className="text-left">
                            <th scope="col" className="p-3 text-muted font-medium">
                              Event
                            </th>
                            <th scope="col" className="p-3 text-muted font-medium">
                              Time
                            </th>
                            <th scope="col" className="p-3 text-right text-muted font-medium">
                              Price
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {rows.map((t) => {
                            const key = t._id ?? `${type}-${t.createdAt}-${t.price ?? '0'}`;
                            const dt = t.createdAt ? new Date(t.createdAt) : null;
                            return (
                              <tr key={key} className="odd:bg-default/5">
                                <td className="p-3 text-default uppercase">
                                  {String(t.type || 'event')}
                                </td>
                                <td className="p-3 text-muted">
                                  {dt ? (
                                    <time dateTime={dt.toISOString()}>
                                      {dt.toLocaleString()}
                                    </time>
                                  ) : (
                                    '--'
                                  )}
                                </td>
                                <td className="p-3 text-right text-default">
                                  {t.price ? `${t.price} ETH` : '-'}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
