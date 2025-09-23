'use client';
import { useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { apiRequest } from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { API_URL } from '@/lib/env';
import { CreateCollectionForm } from '@/lib/types';

export default function CreateCollectionPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateCollectionForm>({
    name: '',
    description: '',
    category: '',
    bannerSeed: '',
  });

  if (!user) {
    return (
      <div className='max-w-2xl mx-auto'>
        <div className='card p-6 text-center'>
          <h1 className='text-2xl font-semibold mb-4'>Create Collection</h1>
          <p className='text-muted mb-4'>Please sign in to create a collection.</p>
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const collection = await apiRequest('/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      router.push(`/collections/${collection.id}`);
    } catch (error: any) {
      alert(error.message || 'Failed to create collection');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateCollectionForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const previewUrl = formData.bannerSeed 
    ? `${API_URL}/image/${encodeURIComponent(formData.bannerSeed)}.svg?size=800`
    : `${API_URL}/image/${encodeURIComponent(formData.name || 'Collection')}.svg?size=800`;

  return (
    <div className='max-w-4xl mx-auto'>
      <div className='card p-6'>
        <div className='flex items-center justify-between mb-6'>
          <h1 className='text-2xl font-semibold'>Create Collection</h1>
          <Link href='/collections' className='btn btn-ghost'>
            ← Back to Collections
          </Link>
        </div>

        <form onSubmit={handleSubmit} className='grid grid-cols-1 md:grid-cols-2 gap-8'>
          <div className='space-y-6'>
            <div>
              <label className='block text-sm font-medium text-default mb-2'>
                Collection Name *
              </label>
              <input
                type='text'
                className='w-full'
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder='e.g., Digital Dreams'
                required
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-default mb-2'>
                Description
              </label>
              <textarea
                className='w-full'
                rows={4}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder='Describe your collection...'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-default mb-2'>
                Category
              </label>
              <select
                className='w-full'
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
              >
                <option value=''>Select a category</option>
                <option value='Art'>Art</option>
                <option value='Photography'>Photography</option>
                <option value='Gaming'>Gaming</option>
                <option value='Music'>Music</option>
                <option value='3D'>3D</option>
                <option value='AI'>AI</option>
                <option value='Generative'>Generative</option>
              </select>
            </div>

            <div>
              <label className='block text-sm font-medium text-default mb-2'>
                Banner Seed
              </label>
              <input
                type='text'
                className='w-full'
                value={formData.bannerSeed}
                onChange={(e) => handleInputChange('bannerSeed', e.target.value)}
                placeholder='Leave empty for auto-generated banner'
              />
              <p className='text-xs text-muted mt-1'>
                A unique seed for generating the collection banner
              </p>
            </div>

            <button
              type='submit'
              disabled={loading || !formData.name}
              className='btn btn-primary w-full'
            >
              {loading ? 'Creating...' : 'Create Collection'}
            </button>
          </div>

          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-default mb-2'>
                Preview
              </label>
              <div className='relative w-full aspect-video rounded-2xl overflow-hidden glass'>
                <Image
                  src={previewUrl}
                  alt='Collection preview'
                  fill
                  sizes='(max-width: 768px) 100vw, 50vw'
                  className='object-cover'
                />
              </div>
            </div>

            <div className='text-sm text-muted'>
              <p>• Collection name: {formData.name || 'Untitled'}</p>
              <p>• Category: {formData.category || 'Uncategorized'}</p>
              <p>• Creator: {user.username}</p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
