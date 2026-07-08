import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion, type Transition } from 'motion/react';
import { DUR, EASE } from '../data/motion';

interface Props {
  /** Web3Forms access key. Empty → falls back to a prefilled mailto. */
  accessKey?: string;
  /** Fallback address used when no access key is configured. */
  fallbackEmail: string;
}

type Status = 'idle' | 'sending' | 'ok' | 'error';

const budgets = [
  'Under $500',
  '$500 – $1,500',
  '$1,500 – $3,000',
  '$3,000+',
  'Not sure yet',
];

// Motion's Transition type wants a mutable tuple; EASE is `as const` (readonly).
const ease: [number, number, number, number] = [...EASE];

// MOTION.md §4.2 — state swap: crossfade + 0.5rem rise at --dur-base.
const RISE = 8; // 0.5rem in px

export default function InquiryForm({ accessKey, fallbackEmail }: Props) {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');
  // Height of the form at the moment of success, reserved as min-height on the
  // wrapper so the (much shorter) success card never shifts surrounding layout.
  const [reservedHeight, setReservedHeight] = useState<number>();
  const successRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  // T2.7 — focus moves to the success status immediately on swap (independent
  // of the crossfade; the success card is interactive at animation start).
  useEffect(() => {
    if (status === 'ok') successRef.current?.focus();
  }, [status]);

  // Shared tween for every state transition. Reduced motion → instant swaps.
  const swap: Transition = reduceMotion
    ? { duration: 0 }
    : { type: 'tween', duration: DUR.base, ease };

  function showSuccess() {
    // Measure the form before it unmounts so the wrapper can hold its height.
    if (wrapRef.current) setReservedHeight(wrapRef.current.offsetHeight);
    setStatus('ok');
  }

  async function handleSubmit(form: HTMLFormElement) {
    const data = new FormData(form);

    // Honeypot — real users never fill this.
    if (data.get('company_url')) return;

    const name = String(data.get('name') || '');
    const email = String(data.get('email') || '');
    const brand = String(data.get('brand') || '');
    const budget = String(data.get('budget') || '');
    const message = String(data.get('message') || '');

    // No key configured → open a prefilled email instead.
    if (!accessKey) {
      const subject = `Brand inquiry — ${brand || name}`;
      const body = `Name: ${name}\nEmail: ${email}\nBrand: ${brand}\nBudget: ${budget}\n\n${message}`;
      window.location.href = `mailto:${fallbackEmail}?subject=${encodeURIComponent(
        subject
      )}&body=${encodeURIComponent(body)}`;
      showSuccess();
      return;
    }

    setStatus('sending');
    setError('');
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: accessKey,
          subject: `Brand inquiry — ${brand || name}`,
          from_name: name,
          name,
          email,
          brand,
          budget,
          message,
        }),
      });
      const json = await res.json();
      if (json.success) {
        form.reset();
        showSuccess();
      } else {
        throw new Error(json.message || 'Submission failed');
      }
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }
  }

  const field =
    'w-full rounded-md border border-ink-line bg-ink px-4 py-3 font-sans text-sm text-bone placeholder:text-bone-mute focus:border-rust focus:outline-none';
  const labelCls =
    'mb-2 block font-sans text-xs font-semibold uppercase tracking-[0.16em] text-bone-dim';

  const sending = status === 'sending';

  return (
    // Grid stacking: during the crossfade both form (exiting) and success card
    // (entering) occupy grid-area 1/1, so nothing is absolutely positioned and
    // the container's height stays put. `reservedHeight` (set at swap time)
    // keeps the wrapper at the form's height after the form unmounts, so the
    // success swap never shifts surrounding content.
    <div
      ref={wrapRef}
      className="grid"
      style={reservedHeight ? { minHeight: reservedHeight } : undefined}
    >
      <AnimatePresence initial={false}>
        {status === 'ok' ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: reduceMotion ? 0 : RISE }}
            animate={{ opacity: 1, y: 0 }}
            transition={swap}
            className="[grid-area:1/1] self-start"
          >
            <div
              ref={successRef}
              role="status"
              tabIndex={-1}
              className="rounded-xl border border-rust/40 bg-ink p-8 text-center"
            >
              <p className="font-display text-3xl uppercase text-bone">Got it.</p>
              <p className="mt-3 font-sans text-sm text-bone-dim">
                {accessKey
                  ? "Thanks — your inquiry is in. I'll come back with concepts and a quote, usually within a day."
                  : 'Your email app should be opening with the details filled in. Hit send and I’ll be in touch.'}
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduceMotion ? 0 : -RISE }}
            transition={swap}
            onSubmit={(e) => {
              e.preventDefault();
              void handleSubmit(e.currentTarget);
            }}
            className="flex flex-col gap-5 [grid-area:1/1]"
          >
            {/* honeypot */}
            <input
              type="text"
              name="company_url"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="absolute left-[-9999px] h-0 w-0 opacity-0"
            />

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="if-name" className={labelCls}>
                  Your name
                </label>
                <input id="if-name" name="name" required className={field} placeholder="Jane Doe" />
              </div>
              <div>
                <label htmlFor="if-email" className={labelCls}>
                  Email
                </label>
                <input
                  id="if-email"
                  name="email"
                  type="email"
                  required
                  className={field}
                  placeholder="jane@brand.com"
                />
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="if-brand" className={labelCls}>
                  Brand / company
                </label>
                <input id="if-brand" name="brand" className={field} placeholder="Grindstone Blends" />
              </div>
              <div>
                <label htmlFor="if-budget" className={labelCls}>
                  Budget
                </label>
                <select id="if-budget" name="budget" className={field} defaultValue="">
                  <option value="" disabled>
                    Select a range
                  </option>
                  {budgets.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="if-message" className={labelCls}>
                What are you looking for?
              </label>
              <textarea
                id="if-message"
                name="message"
                required
                rows={4}
                className={`${field} resize-y`}
                placeholder="Product, goal, timeline, and where the content will run."
              />
            </div>

            {/* Error + submit share one flex child so the error's animated
                height (0 → auto, same tween) pushes the button smoothly —
                a bare flex sibling would snap by one `gap-5` when removed. */}
            <div>
              <AnimatePresence initial={false}>
                {status === 'error' && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, y: reduceMotion ? 0 : RISE, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: reduceMotion ? 0 : RISE, height: 0 }}
                    transition={swap}
                    className="overflow-hidden"
                  >
                    <p role="alert" className="pb-5 font-sans text-sm text-rust-bright">
                      {error}. You can also email{' '}
                      <a href={`mailto:${fallbackEmail}`} className="underline">
                        {fallbackEmail}
                      </a>
                      .
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={sending}
                className="inline-flex w-full items-center justify-center bg-rust-ui px-7 py-4 font-sans text-sm font-semibold uppercase tracking-[0.16em] text-bone transition-colors hover:bg-rust-deep disabled:opacity-60"
              >
                {/* Both labels stacked in one grid cell: the button keeps the
                    width/height of the longer label, so the idle ↔ sending
                    crossfade never resizes it. */}
                <span className="grid justify-items-center">
                  <motion.span
                    initial={false}
                    animate={sending ? { opacity: 0, y: reduceMotion ? 0 : -RISE } : { opacity: 1, y: 0 }}
                    transition={swap}
                    aria-hidden={sending}
                    className="[grid-area:1/1]"
                  >
                    Send brand inquiry
                  </motion.span>
                  <motion.span
                    initial={false}
                    animate={sending ? { opacity: 1, y: 0 } : { opacity: 0, y: reduceMotion ? 0 : RISE }}
                    transition={swap}
                    aria-hidden={!sending}
                    className="[grid-area:1/1]"
                  >
                    Sending…
                  </motion.span>
                </span>
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
