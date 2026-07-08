import { useEffect, useState } from 'react';

/**
 * Instagram section with graceful degradation.
 *
 * Launch mode (default): a hand-curated grid of tiles that link out to
 * Instagram — zero API risk, on-brand, works day one.
 *
 * Live mode (Phase 2): set `beholdFeedId` to a Behold.so feed id (the account
 * must be a Professional/Creator account). Behold's JSON feed is client-safe —
 * no tokens. If the fetch fails for any reason, the curated grid is shown, so
 * the section never breaks on an API change.
 */

interface BeholdPost {
  id: string;
  permalink: string;
  mediaType: string;
  sizes?: { medium?: { mediaUrl: string } };
  mediaUrl?: string;
  prunedCaption?: string;
}

interface Props {
  handle: string;
  profileUrl: string;
  /** Behold.so feed id. Leave empty to use the curated grid only. */
  beholdFeedId?: string;
  /** Number of tiles to show. */
  count?: number;
}

// Curated fallback tiles. Swap captions/links for real hero posts.
const CURATED = [
  { tag: 'Stage', note: 'Nationals prep — final week condition' },
  { tag: 'Coaching', note: 'Client posing session breakdown' },
  { tag: 'Brand', note: 'Grindstone Blends — supplement spot' },
  { tag: 'Training', note: 'Back day, heavy rows, full ROM' },
  { tag: 'Lifestyle', note: 'Meal prep that actually tastes good' },
  { tag: 'Reel', note: 'Peak-week myths, debunked' },
];

export default function InstagramGrid({
  handle,
  profileUrl,
  beholdFeedId,
  count = 6,
}: Props) {
  const [posts, setPosts] = useState<BeholdPost[] | null>(null);

  useEffect(() => {
    if (!beholdFeedId) return;
    let alive = true;
    fetch(`https://feeds.behold.so/${beholdFeedId}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((data) => {
        if (alive && Array.isArray(data?.posts)) setPosts(data.posts.slice(0, count));
      })
      .catch(() => {
        /* keep curated fallback */
      });
    return () => {
      alive = false;
    };
  }, [beholdFeedId, count]);

  const tiles = CURATED.slice(0, count);

  return (
    <div>
      <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3">
        {posts
          ? posts.map((post) => (
              <a
                key={post.id}
                href={post.permalink}
                target="_blank"
                rel="noopener"
                className="group relative block aspect-square overflow-hidden bg-ink-soft"
              >
                {/* MOTION.md §4.2 media hover: scale 1 → 1.05 max at --dur-slow.
                    The transform is motion-safe gated (§5.2) — reduced motion
                    gets no scale movement at all. */}
                <img
                  src={post.sizes?.medium?.mediaUrl ?? post.mediaUrl}
                  alt={post.prunedCaption?.slice(0, 120) ?? `Instagram post from ${handle}`}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-[var(--dur-slow)] ease-[var(--ease-out)] motion-safe:group-hover:scale-105"
                />
                {/* Color-only hover — allowed under reduced motion at --dur-fast. */}
                <span className="absolute inset-0 bg-ink/0 transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] group-hover:bg-ink/30" />
              </a>
            ))
          : tiles.map((tile, i) => (
              <a
                key={i}
                href={profileUrl}
                target="_blank"
                rel="noopener"
                className="group relative block aspect-square overflow-hidden grain-overlay"
                aria-label={`${tile.tag} — view on Instagram`}
              >
                <span className="frame-grain absolute inset-0" />
                <span className="absolute inset-0 flex flex-col justify-between p-4">
                  <span className="font-sans text-[0.62rem] uppercase tracking-[0.22em] text-rust-bright">
                    {tile.tag}
                  </span>
                  <span className="font-sans text-[0.72rem] leading-snug text-bone-dim">
                    {tile.note}
                  </span>
                </span>
                {/* Color-only hover — allowed under reduced motion at --dur-fast. */}
                <span className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-ink-line transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] group-hover:ring-rust/60" />
              </a>
            ))}
      </div>
    </div>
  );
}
