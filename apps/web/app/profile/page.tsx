'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { apiRequest } from '@/lib/api';
import { User, UserStats, NFT, Collection } from '@/lib/types';
import Image from 'next/image';
import Link from 'next/link';
import { API_URL } from '@/lib/env';
import NFTCard from '@/components/NFTCard';

export default function ProfilePage() {
  const { user, refresh } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [ownedNfts, setOwnedNfts] = useState<NFT[]>([]);
  const [createdNfts, setCreatedNfts] = useState<NFT[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'owned' | 'created' | 'collections'>('owned');

  useEffect(() => {
    if (user) {
      loadProfileData();
    }
  }, [user]);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      const [statsData, ownedData, createdData, collectionsData] = await Promise.all([
        apiRequest<UserStats>('/auth/stats'),
        apiRequest<{ items: NFT[] }>('/nfts?owner=true'),
        apiRequest<{ items: NFT[] }>('/nfts?creator=true'),
        apiRequest<{ items: Collection[] }>('/collections?creator=true'),
      ]);

      setStats(statsData);
      setOwnedNfts(ownedData.items);
      setCreatedNfts(createdData.items);
      setCollections(collectionsData.items);
    } catch (error) {
      console.error('Failed to load profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className='max-w-4xl mx-auto'>
        <div className='card p-6 text-center'>
          <h1 className='text-2xl font-semibold mb-4'>Profile</h1>
          <p className='text-muted mb-4'>Please sign in to view your profile.</p>
          <div className='flex gap-3 justify-center'>
            <Link href='/auth/login' className='btn btn-primary'>
              Sign In
            </Link>
            <Link href='/auth/register' className='btn btn-ghost'>
              Register
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className='max-w-4xl mx-auto space-y-6'>
        <div className='card p-6 animate-pulse'>
          <div className='h-8 bg-white/10 rounded w-1/3 mb-4' />
          <div className='h-4 bg-white/10 rounded w-1/2' />
        </div>
        <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4'>
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className='card p-2 animate-pulse'>
              <div className='rounded-xl w-full aspect-square bg-white/10' />
              <div className='h-4 bg-white/10 rounded mt-3 w-3/4' />
              <div className='h-3 bg-white/10 rounded mt-2 w-1/2' />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const avatarUrl = user.avatarSeed 
    ? `${API_URL}/image/${encodeURIComponent(user.avatarSeed)}.svg?size=200`
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&size=200&background=8B5CF6&color=fff`;

  return (
    <div className='max-w-4xl mx-auto space-y-6'>
      {/* Profile Header */}
      <div className='card p-6'>
        <div className='flex flex-col md:flex-row gap-6'>
          <div className='relative w-32 h-32 rounded-2xl overflow-hidden'>
            <Image
              src={avatarUrl}
              alt={user.username}
              fill
              className='object-cover'
            />
          </div>
          <div className='flex-1'>
            <h1 className='text-3xl font-bold text-default'>{user.username}</h1>
            <p className='text-muted mb-2'>{user.email}</p>
            {user.bio && <p className='text-default mb-4'>{user.bio}</p>}
            <div className='flex flex-wrap gap-2'>
              <div className='tag'>Balance: {(user.balance || 0).toFixed(3)} ETH</div>
              <div className='tag'>Member since {new Date(user.createdAt).toLocaleDateString()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
          <div className='card p-4 text-center'>
            <div className='text-2xl font-bold text-primary'>{stats.ownedNfts}</div>
            <div className='text-sm text-muted'>Owned NFTs</div>
          </div>
          <div className='card p-4 text-center'>
            <div className='text-2xl font-bold text-teal'>{stats.createdNfts}</div>
            <div className='text-sm text-muted'>Created NFTs</div>
          </div>
          <div className='card p-4 text-center'>
            <div className='text-2xl font-bold text-gold'>{(stats.totalEarned || 0).toFixed(3)}</div>
            <div className='text-sm text-muted'>Total Earned (ETH)</div>
          </div>
          <div className='card p-4 text-center'>
            <div className='text-2xl font-bold text-default'>{(stats.totalSpent || 0).toFixed(3)}</div>
            <div className='text-sm text-muted'>Total Spent (ETH)</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className='card p-6'>
        <div className='flex gap-4 mb-6'>
          <button
            className={`px-4 py-2 rounded-lg font-medium transition ${
              activeTab === 'owned'
                ? 'bg-primary text-white'
                : 'text-muted hover:text-default'
            }`}
            onClick={() => setActiveTab('owned')}
          >
            Owned NFTs ({ownedNfts.length})
          </button>
          <button
            className={`px-4 py-2 rounded-lg font-medium transition ${
              activeTab === 'created'
                ? 'bg-primary text-white'
                : 'text-muted hover:text-default'
            }`}
            onClick={() => setActiveTab('created')}
          >
            Created NFTs ({createdNfts.length})
          </button>
          <button
            className={`px-4 py-2 rounded-lg font-medium transition ${
              activeTab === 'collections'
                ? 'bg-primary text-white'
                : 'text-muted hover:text-default'
            }`}
            onClick={() => setActiveTab('collections')}
          >
            Collections ({collections.length})
          </button>
        </div>

        {/* Content */}
        <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4'>
          {activeTab === 'owned' && ownedNfts.map((nft) => (
            <NFTCard key={nft.id} nft={nft} />
          ))}
          {activeTab === 'created' && createdNfts.map((nft) => (
            <NFTCard key={nft.id} nft={nft} />
          ))}
          {activeTab === 'collections' && collections.map((collection) => {
            const bannerUrl = collection.bannerSeed 
              ? `${API_URL}/image/${encodeURIComponent(collection.bannerSeed)}.svg?size=800`
              : `${API_URL}/image/${encodeURIComponent(collection.name)}.svg?size=800`;
            
            return (
              <Link
                key={collection.id}
                href={`/collections/${collection.id}`}
                className='group card p-2 hover:scale-[1.01] transition tilt sheen'
              >
                <div className='relative w-full aspect-square rounded-xl overflow-hidden'>
                  <Image
                    src={bannerUrl}
                    alt={collection.name}
                    fill
                    sizes='(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 16vw'
                    className='object-cover transition-transform group-hover:scale-[1.03]'
                  />
                </div>
                <div className='px-2 py-3'>
                  <div className='text-sm font-medium truncate text-default'>{collection.name}</div>
                  <div className='text-xs text-muted'>{collection.category || 'Uncategorized'}</div>
                </div>
              </Link>
            );
          })}
        </div>

        {((activeTab === 'owned' && ownedNfts.length === 0) ||
          (activeTab === 'created' && createdNfts.length === 0) ||
          (activeTab === 'collections' && collections.length === 0)) && (
          <div className='text-center py-12 text-muted'>
            <div className='text-4xl mb-4'>🎨</div>
            <div className='text-lg font-medium mb-2'>No {activeTab} yet</div>
            <div className='text-sm'>
              {activeTab === 'owned' && "You haven't purchased any NFTs yet."}
              {activeTab === 'created' && "You haven't created any NFTs yet."}
              {activeTab === 'collections' && "You haven't created any collections yet."}
            </div>
            {activeTab !== 'owned' && (
              <Link href='/create' className='btn btn-primary mt-4'>
                Create {activeTab === 'created' ? 'NFT' : 'Collection'}
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}