'use client';

import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'dark';
    const stored = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (stored === 'light' || stored === 'dark') return stored;
    return window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('theme', theme);
    } catch {}
  }, [theme]);

  const next = theme === 'dark' ? 'light' : 'dark';

  return (
    <button
      className='icon-btn'
      onClick={() => setTheme(next)}
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
    >
      {theme === 'dark' ? (
        <svg width='18' height='18' viewBox='0 0 24 24' fill='currentColor' className='opacity-80'>
          <path d='M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12ZM12 1a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0V2a1 1 0 0 1 1-1Zm0 18a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0v-1a1 1 0 0 1 1-1ZM4.222 4.222a1 1 0 0 1 1.414 0l.707.707A1 1 0 1 1 4.93 7.05l-.707-.707a1 1 0 0 1 0-1.414Zm12.728 12.728a1 1 0 0 1 1.415 1.414l-.708.707a1 1 0 1 1-1.414-1.414l.707-.707ZM1 12a1 1 0 0 1 1-1h1a1 1 0 1 1 0 2H2a1 1 0 0 1-1-1Zm18-1h1a1 1 0 1 1 0 2h-1a1 1 0 1 1 0-2ZM4.222 19.778a1 1 0 0 1 1.414-1.415l.707.708a1 1 0 1 1-1.414 1.414l-.707-.707Zm12.728-12.728a1 1 0 0 1 1.415-1.415l.707.708A1 1 0 0 1 18.364 7.05l-.707-.707Z' />
        </svg>
      ) : (
        <svg width='18' height='18' viewBox='0 0 24 24' fill='currentColor' className='opacity-80'>
          <path d='M21 12.79A9 9 0 1 1 11.21 3a7 7 0 1 0 9.79 9.79Z' />
        </svg>
      )}
    </button>
  );
}