'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

type Option = { label: string; value: string };

export default function Select({
  value,
  onChange,
  options,
  placeholder = 'Select…',
  className = '',
  ariaLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
  ariaLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const active = options.find((o) => o.value === value);

  const [menuStyle, setMenuStyle] = useState<React.CSSProperties | undefined>();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      const t = e.target as Node;
      if (!rootRef.current?.contains(t) && !menuRef.current?.contains(t)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('click', onClickOutside);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onClickOutside);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  useEffect(() => {
    if (!open || !mounted) return;
    const btn = buttonRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    setMenuStyle({
      position: 'absolute',
      top: `${rect.bottom + window.scrollY}px`,
      left: `${rect.left + window.scrollX}px`,
      width: `${rect.width}px`,
      zIndex: 9999,
    });
  }, [open, mounted]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setOpen((v) => !v);
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      requestAnimationFrame(() => {
        const el =
          menuRef.current?.querySelector<HTMLButtonElement>('[data-option]');
        el?.focus();
      });
    }
  };

  return (
    <>
      <div className={`relative ${className}`} ref={rootRef}>
        <button
          type='button'
          ref={buttonRef}
          aria-haspopup='listbox'
          aria-expanded={open}
          aria-label={ariaLabel}
          className='w-full flex items-center justify-between gap-2 rounded-lg px-3 py-2.5
                     bg-[color:var(--surface)] border border-[color:var(--glass-border)]
                     hover:bg-[color:var(--surface-strong)]
                     focus:outline-none focus:ring-2 focus:ring-primary/40
                     text-sm md:text-base'
          onClick={() => setOpen((v) => !v)}
          onKeyDown={handleKey}
        >
          <span className={active ? 'text-default' : 'text-muted'}>
            {active ? active.label : placeholder}
          </span>
          <svg
            className={`h-4 w-4 text-muted transition-transform ${open ? 'rotate-180' : ''}`}
            viewBox='0 0 20 20'
            fill='currentColor'
            aria-hidden='true'
          >
            <path d='M5.23 7.21a.75.75 0 011.06.02L10 10.585l3.71-3.354a.75.75 0 111.02 1.1l-4.24 3.83a.75.75 0 01-1.02 0l-4.24-3.83a.75.75 0 01.02-1.1z' />
          </svg>
        </button>
      </div>

      {open &&
        mounted &&
        createPortal(
          <div
            role='listbox'
            ref={menuRef}
            className='menu max-h-64 overflow-auto'
            aria-activedescendant={value ? `opt-${value}` : undefined}
            style={menuStyle}
          >
            {options.map((opt) => {
              const selected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  id={`opt-${opt.value}`}
                  data-option
                  role='option'
                  aria-selected={selected}
                  className={`menu-item w-full justify-between ${selected ? 'bg-white/10' : ''}`}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                    (buttonRef.current as HTMLButtonElement | null)?.focus();
                  }}
                >
                  <span>{opt.label}</span>
                  {selected && (
                    <svg className='h-4 w-4 text-teal' viewBox='0 0 20 20' fill='currentColor'>
                      <path d='M16.704 5.29a1 1 0 010 1.414l-7.2 7.2a1 1 0 01-1.415 0l-3.2-3.2A1 1 0 016.6 9.29l2.493 2.492 6.493-6.492a1 1 0 011.414 0z' />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>,
          document.body
        )}
    </>
  );
}