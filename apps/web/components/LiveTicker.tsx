'use client';
import { useEffect, useState } from 'react';
import { getSocket } from '@/lib/socket';

export default function LiveTicker() {
  const [state, setState] = useState<{
    salesLastHour: number;
    t: string;
  } | null>(null);

  useEffect(() => {
    const socket = getSocket();
    socket.on('stats', (payload) => setState(payload));
    return () => {
      socket.off('stats');
    };
  }, []);

  return (
    <div className='flex items-center gap-3 text-sm text-default'>
      <span className='h-2 w-2 rounded-full bg-teal animate-pulse' />
      <span className='text-muted'>Live Market:</span>
      <span className='font-medium text-default'>
        {state?.salesLastHour ?? 0} sales
      </span>
      <span className='text-muted-weak'>last hour</span>
      <span className='ml-auto text-muted-weak'>
        {state?.t && new Date(state.t).toLocaleTimeString()}
      </span>
    </div>
  );
}