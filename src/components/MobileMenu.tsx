import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface NavItem {
  label: string;
  href: string;
}

interface Props {
  items: readonly NavItem[];
  current: string;
  applyUrl: string;
}

export default function MobileMenu({ items, current, applyUrl }: Props) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="relative z-[60] flex h-11 w-11 flex-col items-center justify-center gap-[6px]"
      >
        <span
          className="block h-[2px] w-7 bg-bone transition-transform duration-300"
          style={open ? { transform: 'translateY(8px) rotate(45deg)' } : undefined}
        />
        <span
          className="block h-[2px] w-7 bg-bone transition-opacity duration-200"
          style={open ? { opacity: 0 } : undefined}
        />
        <span
          className="block h-[2px] w-7 bg-bone transition-transform duration-300"
          style={open ? { transform: 'translateY(-8px) rotate(-45deg)' } : undefined}
        />
      </button>

      {mounted &&
        createPortal(
          <div
            className="fixed inset-0 z-[55] flex flex-col px-6 pt-28 pb-10 transition-opacity duration-300 md:hidden"
            style={{
              backgroundColor: 'var(--color-ink)',
              opacity: open ? 1 : 0,
              pointerEvents: open ? 'auto' : 'none',
            }}
            aria-hidden={!open}
          >
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center"
              tabIndex={open ? 0 : -1}
            >
              <span className="relative block h-7 w-7">
                <span className="absolute left-0 top-1/2 block h-[2px] w-7 -translate-y-1/2 rotate-45 bg-bone" />
                <span className="absolute left-0 top-1/2 block h-[2px] w-7 -translate-y-1/2 -rotate-45 bg-bone" />
              </span>
            </button>
            <nav className="flex flex-col">
              {items.map((item, i) => {
                const active = item.href === current;
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="border-b border-ink-line py-5 font-display text-4xl uppercase leading-none"
                    style={{
                      color: active
                        ? 'var(--color-rust-bright)'
                        : 'var(--color-bone)',
                    }}
                  >
                    <span className="mr-4 font-sans text-xs align-top text-bone-mute">
                      0{i + 1}
                    </span>
                    {item.label}
                  </a>
                );
              })}
            </nav>
            <a
              href={applyUrl}
              className="mt-auto inline-flex items-center justify-center bg-rust px-6 py-4 font-sans text-sm font-semibold uppercase tracking-[0.16em] text-bone"
            >
              Apply to Work With Me
            </a>
          </div>,
          document.body
        )}
    </div>
  );
}
