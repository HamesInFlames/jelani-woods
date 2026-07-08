import { useEffect, useRef, useState } from 'react';
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

  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

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

  // On open: move focus to the close button immediately (overlay is interactive
  // right away even though opacity animates). On close: return focus to the
  // hamburger trigger.
  const wasOpen = useRef(false);
  useEffect(() => {
    if (open) {
      closeButtonRef.current?.focus();
    } else if (wasOpen.current) {
      triggerRef.current?.focus();
    }
    wasOpen.current = open;
  }, [open]);

  // Focus trap: wrap Tab / Shift+Tab within the overlay's focusable elements.
  const onOverlayKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Tab' || !overlayRef.current) return;

    const focusable = overlayRef.current.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled])'
    );
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;

    if (e.shiftKey) {
      if (active === first || !overlayRef.current.contains(active)) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (active === last || !overlayRef.current.contains(active)) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  return (
    <div className="md:hidden">
      <button
        ref={triggerRef}
        type="button"
        aria-label="Open menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="relative z-[60] flex h-11 w-11 flex-col items-center justify-center gap-[6px]"
      >
        <span className="block h-[2px] w-7 bg-bone" />
        <span className="block h-[2px] w-7 bg-bone" />
        <span className="block h-[2px] w-7 bg-bone" />
      </button>

      {mounted &&
        createPortal(
          <div
            ref={overlayRef}
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            onKeyDown={onOverlayKeyDown}
            className={`fixed inset-0 z-[55] flex flex-col bg-ink px-6 pt-28 pb-10 transition-opacity duration-300 md:hidden ${
              open ? 'opacity-100' : 'pointer-events-none opacity-0'
            }`}
            aria-hidden={!open}
            inert={!open}
          >
            <button
              ref={closeButtonRef}
              type="button"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center"
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
                    aria-current={active ? 'page' : undefined}
                    className={`border-b border-ink-line py-5 font-display text-4xl uppercase leading-none ${
                      active ? 'text-rust-bright' : 'text-bone'
                    }`}
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
              className="mt-auto inline-flex items-center justify-center bg-rust-ui px-6 py-4 font-sans text-sm font-semibold uppercase tracking-[0.16em] text-bone"
            >
              Apply to Work With Me
            </a>
          </div>,
          document.body
        )}
    </div>
  );
}
