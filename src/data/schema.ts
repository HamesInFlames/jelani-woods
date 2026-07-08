import { site } from './site';

/** Person / Athlete — used on Home, About, Career. */
export const personSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: site.name,
  url: site.url,
  image: `${site.url}/og-default.png`,
  jobTitle: 'Bodybuilding Coach & Content Creator',
  description:
    'IFBB road-to-pro bodybuilding competitor, online coach, and fitness content creator based in Toronto.',
  address: {
    '@type': 'PostalAddress',
    addressLocality: site.location.city,
    addressRegion: site.location.region,
    addressCountry: site.location.country,
  },
  sameAs: [site.social.instagram].filter(Boolean),
  knowsAbout: [
    'Bodybuilding',
    'Contest prep',
    'Online fitness coaching',
    'Nutrition',
    'Fitness content creation',
  ],
};

/** WebSite — used on Home. */
export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: site.name,
  url: site.url,
};

/** LocalBusiness / ProfessionalService — used on Home, Work With Me. */
export const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  name: `${site.name} Coaching`,
  url: `${site.url}/work-with-me`,
  image: `${site.url}/og-default.png`,
  description:
    'Online bodybuilding and contest-prep coaching in Toronto — 1:1 training, nutrition, and check-ins.',
  areaServed: 'Toronto, ON and online worldwide',
  address: {
    '@type': 'PostalAddress',
    addressLocality: site.location.city,
    addressRegion: site.location.region,
    addressCountry: site.location.country,
  },
  priceRange: '$$$',
};

/** Service — the coaching offer, used on Work With Me. */
export const coachingServiceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  serviceType: 'Online Bodybuilding & Contest-Prep Coaching',
  provider: {
    '@type': 'Person',
    name: site.name,
  },
  areaServed: {
    '@type': 'City',
    name: 'Toronto',
  },
  description:
    'Selective 1:1 online coaching for physique athletes and serious lifters — training, nutrition, peaking, and posing.',
};

export function breadcrumbSchema(
  items: { name: string; path: string }[]
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${site.url}${item.path}`,
    })),
  };
}
