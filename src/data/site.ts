/**
 * Single source of truth for site-wide content.
 * Edit copy, links, packages, and brand info here — every page reads from it.
 */

export const site = {
  name: 'Jelani Woods',
  shortName: 'Jelani Woods',
  domain: 'jelaniwoods.com',
  url: 'https://jelaniwoods.com',
  positioning: 'IFBB road-to-pro competitor · Toronto coach · Content creator',
  tagline: 'Fifteen years under the bar. A body built on the stage, a coaching practice built on it.',
  location: {
    city: 'Toronto',
    region: 'ON',
    country: 'CA',
  },
  // Update these to real destinations before launch.
  contact: {
    email: 'hello@jelaniwoods.com',
    brandEmail: 'brands@jelaniwoods.com',
    // Replace with the real Calendly / application scheduling link.
    applyUrl: 'https://calendly.com/jelaniwoods/coaching-application',
    // Free, no-backend form endpoint. Paste an access key from
    // https://web3forms.com to make the brand inquiry form submit inline.
    // Left blank → the form gracefully falls back to a prefilled email.
    web3formsKey: '',
  },
  social: {
    instagram: 'https://instagram.com/jelaniwoodstv',
    instagramHandle: '@jelaniwoodstv',
    tiktok: '',
    youtube: '',
  },
} as const;

export const nav = [
  { label: 'Home', href: '/' },
  { label: 'Career', href: '/career' },
  { label: 'About', href: '/about' },
  { label: 'Brand / UGC', href: '/ugc' },
  { label: 'Work With Me', href: '/work-with-me' },
] as const;

export const careerTimeline = [
  {
    year: '2011',
    heading: 'First rep',
    body: 'Walked into the gym at fifteen with no plan and no patience. The patience came later. The obsession came first.',
  },
  {
    year: '2016',
    heading: 'On stage',
    body: 'Stepped on a competitive stage for the first time. Learned that peak week is a discipline of subtraction, not effort.',
  },
  {
    year: '2019',
    heading: 'First hardware',
    body: 'Placed for the first time. The medal mattered less than the proof: the process worked when I ran it honestly.',
  },
  {
    year: '2022',
    heading: 'Four-time medalist',
    body: 'Four podium finishes across the circuit. Refined a system for peaking, dieting down, and holding condition without burning out.',
  },
  {
    year: '2024',
    heading: 'Road to pro',
    body: 'Chasing the IFBB pro card at the national level — the hardest, leanest, most deliberate prep of the run so far.',
  },
  {
    year: '2026',
    heading: 'The next chapter',
    body: 'One more national push, then the pivot: everything I learned dieting my own body to the stage becomes the practice I coach and the content I create.',
  },
] as const;

export const brands = [
  { name: 'Grindstone Blends', note: 'Supplements' },
  { name: 'BuildApe', note: 'Apparel' },
  { name: 'F45 Training', note: 'Coaching' },
] as const;

export interface UgcPackage {
  name: string;
  price: string;
  cadence: string;
  summary: string;
  featured?: boolean;
  includes: string[];
}

export const ugcPackages: UgcPackage[] = [
  {
    name: 'Single Spark',
    price: 'Starting at $220',
    cadence: 'per video',
    summary: 'One ad-ready short-form video, shot and edited in a 9:16 phone frame.',
    includes: [
      '1 concept + script pass',
      'Vertical (9:16) edit, captioned',
      '1 round of revisions',
      'Organic usage on your channels',
    ],
  },
  {
    name: 'The Bundle',
    price: 'Starting at $560',
    cadence: '3-video pack',
    summary: 'Three videos from one shoot — a testing set for paid or a mini campaign.',
    featured: true,
    includes: [
      '3 concepts + scripts',
      '3 vertical edits, captioned',
      'Hook variations for testing',
      '2 rounds of revisions',
      'Organic usage included',
    ],
  },
  {
    name: 'Monthly Retainer',
    price: 'Starting at $1,600',
    cadence: 'per month',
    summary: 'A steady content pipeline for brands running always-on creative.',
    includes: [
      '6–8 videos / month',
      'Priority scheduling',
      'Ongoing hook + format testing',
      'Bundle-rate pricing on add-ons',
    ],
  },
];

export const ugcAddOns = [
  { label: 'Paid usage rights', detail: '+30–50% extended · +100–150% perpetual' },
  { label: 'Whitelisting / Spark Ads', detail: '~+30% per month' },
  { label: 'Raw footage', detail: '+30–50%' },
  { label: 'Rush delivery', detail: '+25–50%' },
];

export const coachingTiers = [
  {
    name: 'Online Coaching',
    frame: '1:1 · fully remote',
    price: 'By application',
    summary:
      'Training, nutrition, and check-ins built around your body and your schedule. Contest prep or the first serious offseason of your life.',
    includes: [
      'Custom training program, updated as you progress',
      'Macro / nutrition structure with weekly adjustments',
      'Weekly check-ins + form review',
      'Direct line for questions between check-ins',
    ],
  },
  {
    name: 'Contest Prep',
    frame: '1:1 · stage-focused',
    price: 'By application',
    summary:
      'The full road to the stage: dieting down, peaking, posing, and holding condition. Run by someone who is still doing it himself.',
    includes: [
      'Everything in Online Coaching',
      'Peak-week protocol + carb strategy',
      'Posing and stage-presence coaching',
      'Show-day game plan',
    ],
  },
] as const;

export const testimonials = [
  {
    quote:
      'Jelani coaches the way he competes — nothing wasted, everything measured. First prep and I brought my best conditioning ever.',
    name: 'Client, contest prep',
    detail: 'Placeholder — replace with a real, attributed testimonial before launch.',
  },
  {
    quote:
      'The content converted. He gets on camera like he trains: confident, specific, no filler. Reorder rate on the ad set went up.',
    name: 'Brand partner',
    detail: 'Placeholder — replace with a real, attributed testimonial before launch.',
  },
] as const;
