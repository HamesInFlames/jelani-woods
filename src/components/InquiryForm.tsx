import { useEffect, useRef, useState } from 'react';

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

export default function InquiryForm({ accessKey, fallbackEmail }: Props) {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');
  const successRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === 'ok') successRef.current?.focus();
  }, [status]);

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
      setStatus('ok');
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
        setStatus('ok');
        form.reset();
      } else {
        throw new Error(json.message || 'Submission failed');
      }
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }
  }

  if (status === 'ok') {
    return (
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
    );
  }

  const field =
    'w-full rounded-md border border-ink-line bg-ink px-4 py-3 font-sans text-sm text-bone placeholder:text-bone-mute focus:border-rust focus:outline-none';
  const labelCls =
    'mb-2 block font-sans text-xs font-semibold uppercase tracking-[0.16em] text-bone-dim';

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void handleSubmit(e.currentTarget);
      }}
      className="flex flex-col gap-5"
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

      {status === 'error' && (
        <p role="alert" className="font-sans text-sm text-rust-bright">
          {error}. You can also email{' '}
          <a href={`mailto:${fallbackEmail}`} className="underline">
            {fallbackEmail}
          </a>
          .
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'sending'}
        className="inline-flex items-center justify-center bg-rust-ui px-7 py-4 font-sans text-sm font-semibold uppercase tracking-[0.16em] text-bone transition-colors hover:bg-rust-deep disabled:opacity-60"
      >
        {status === 'sending' ? 'Sending…' : 'Send brand inquiry'}
      </button>
    </form>
  );
}
