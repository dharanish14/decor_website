export function normalizeImageUrl(url: string | undefined | null): string {
  if (!url) return '';
  const driveMatch = url.match(/(?:id=|\/d\/|\/file\/d\/)([a-zA-Z0-9_-]{25,})/);
  if (driveMatch && driveMatch[1]) {
    return `https://drive.google.com/thumbnail?id=${driveMatch[1]}&sz=w1600`;
  }
  return url;
}

export interface PastWork {
  id: string;
  title: string;
  category: 'Residential' | 'Commercial' | 'Furniture & Lighting' | 'Architectural 3D' | 'Renovation';
  description: string;
  image: string;
  year: string;
  specs: { label: string; value: string }[];
  featured?: boolean;
}

export interface LeadSubmission {
  id: string;
  name: string;
  email: string;
  phone: string;
  serviceType: string;
  budget: string;
  message: string;
  createdAt: string;
  status: 'Pending' | 'Contacted' | 'Quoted' | 'Completed';
}

export interface SiteConfig {
  heroTitle: string;
  heroSubtitle: string;
  tagline: string;
  contactEmail: string;
  contactPhone: string;
  location: string;
}

export interface CollectionItem {
  id: string;
  number: string;
  title: string;
  copy: string;
  image: string;
}

export interface InspirationItem {
  id: string;
  title: string;
  type: string;
  image: string;
}

export interface PublicSiteContent {
  brandName: string;
  brandDescriptor: string;
  heroEyebrow: string;
  heroTitle: string;
  heroEmphasis: string;
  heroIntro: string;
  heroImage: string;
  heroImages: string[];
  heroNote: string;
  trustItems: string[];
  collectionHeading: string;
  collectionEmphasis: string;
  collectionIntro: string;
  collections: CollectionItem[];
  storyEyebrow: string;
  storyHeading: string;
  storyEmphasis: string;
  storyBody: string;
  storyImage: string;
  storyValues: string[];
  projectsHeading: string;
  projectsEmphasis: string;
  projectsIntro: string;
  projects: InspirationItem[];
  address: string;
  contactPhone: string;
  adminNotificationEmail: string;
  smtpUser?: string;
  smtpPass?: string;
  resendApiKey?: string;
  formServiceLabel?: string;
  formServiceOptions?: string[];
  instagramUrl: string;
  justdialUrl: string;
  effects: {
    revealOnScroll: boolean;
    imageHoverZoom: boolean;
    floatingAccent: boolean;
  };
}

export const INITIAL_PUBLIC_CONTENT: PublicSiteContent = {
  brandName: 'ELSHADAI',
  brandDescriptor: 'DECORS',
  heroEyebrow: 'Window stories & home comforts, Chennai',
  heroTitle: 'Bespoke curtains, blinds & sofas',
  heroEmphasis: 'crafted for your home.',
  heroIntro: 'Thoughtful curtains, blinds, sofas, and finishing touches for homes with a point of view.',
  heroImage: 'https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=1800&auto=format&fit=crop',
  heroImages: [
    'https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=1800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=1800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=1800&auto=format&fit=crop',
  ],
  heroNote: 'Personalised guidance from first fabric to final fitting',
  trustItems: ['Made for Chennai homes', 'Fabric-led design', 'Measured & fitted', 'Since 2019'],
  collectionHeading: 'Small changes.',
  collectionEmphasis: 'Big atmosphere.',
  collectionIntro: 'Whether you are refreshing one window or rethinking an entire room, we help you find the balance between beauty and the way you actually live.',
  collections: [
    { id: 'collection-1', number: '01', title: 'Curtains & drapes', copy: 'Soft layers, tailored pleats, and fabrics chosen to make Chennai light feel just right.', image: 'https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=1200&auto=format&fit=crop' },
    { id: 'collection-2', number: '02', title: 'Blinds & shades', copy: 'Clean, considered window solutions for privacy, comfort, and beautiful control of the sun.', image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=1200&auto=format&fit=crop' },
    { id: 'collection-3', number: '03', title: 'Sofas & upholstery', copy: 'Comfort-first pieces and fresh upholstery that bring a room together for everyday living.', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=1200&auto=format&fit=crop' },
  ],
  storyEyebrow: 'The Elshadai way',
  storyHeading: 'Good interiors',
  storyEmphasis: 'start with listening.',
  storyBody: 'We are a Chennai-based home furnishings studio helping people make their spaces warmer, calmer, and more their own. No one-size-fits-all packages. Just honest advice, good materials, and details that last.',
  storyImage: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1400&auto=format&fit=crop',
  storyValues: ['See samples in your own light', 'Get practical guidance, not pressure', 'Leave the measuring and fitting to us'],
  projectsHeading: 'Made for real',
  projectsEmphasis: 'life at home.',
  projectsIntro: 'From a softer bedroom to a living room that finally feels finished, here are a few directions to start with.',
  projects: [
    { id: 'project-1', title: 'A quiet living room', type: 'Curtains · K.K. Nagar', image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1400&auto=format&fit=crop' },
    { id: 'project-2', title: 'Morning light, softened', type: 'Roman blinds · Chennai', image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=1400&auto=format&fit=crop' },
    { id: 'project-3', title: 'Made for long evenings', type: 'Sofa upholstery · Mambalam', image: 'https://images.unsplash.com/photo-1550226891-ef816aed4a98?q=80&w=1400&auto=format&fit=crop' },
    { id: 'project-4', title: 'A more considered window', type: 'Sheers & blackout · Chennai', image: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=1400&auto=format&fit=crop' },
  ],
  address: 'Elshadai Decors\nNear MGR Statue, opposite Pillayar Kovil\nK.K. Nagar, Chennai',
  contactPhone: '+91 98400 12345',
  adminNotificationEmail: 'dharaanish@gmail.com',
  smtpUser: 'monovawebsite@gmail.com',
  smtpPass: '',
  formServiceLabel: 'What are you looking for?',
  formServiceOptions: ['Curtains', 'Blinds & shades', 'Sofa or upholstery', 'Full room refresh', 'Not sure yet'],
  instagramUrl: 'https://www.instagram.com/elshadai_decors/',
  justdialUrl: 'https://www.justdial.com/Chennai/Elshadai-Decors-Near-Mgr-Statue-Opp-to-Pillayar-Kovil-K-K-Nagar/044PXX44-XX44-091119153916-B3B2_BZDET',
  effects: { revealOnScroll: true, imageHoverZoom: true, floatingAccent: true },
};

export const INITIAL_PAST_WORKS: PastWork[] = [
  {
    id: 'work-1',
    title: 'The Obsidian Grand Penthouse',
    category: 'Residential',
    description: 'Ultra-luxury high-rise penthouse featuring custom Calacatta marble wall cladding, acoustic slotted oak paneling, and bespoke Italian velvet seating.',
    image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=1200&auto=format&fit=crop',
    year: '2026',
    featured: true,
    specs: [
      { label: 'Area', value: '4,200 sq.ft' },
      { label: 'Style', value: 'Modern Minimalist Luxury' },
      { label: 'Materials', value: 'Calacatta Marble & Smoked Oak' },
      { label: 'Lighting', value: 'Integrated DALI 2700K Warm LED' }
    ]
  },
  {
    id: 'work-2',
    title: 'Lumina Architectural Lounge',
    category: 'Commercial',
    description: 'Bespoke hospitality interior featuring floating modular sofas, sculptural bronze pendant chandeliers, and panoramic acoustic glass dividers.',
    image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1200&auto=format&fit=crop',
    year: '2025',
    featured: true,
    specs: [
      { label: 'Project Type', value: 'Bespoke Executive Lounge' },
      { label: 'Seating Capacity', value: '60 Guests' },
      { label: 'Acoustics', value: 'NRC 0.85 Soundproof Paneling' }
    ]
  },
  {
    id: 'work-3',
    title: 'Deconstructed Sculptural Armchair',
    category: 'Furniture & Lighting',
    description: 'Handcrafted ergonomic lounger constructed from CNC-machined walnut framing, brushed brass joinery, and full-grain Italian Nappa leather.',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=1200&auto=format&fit=crop',
    year: '2025',
    featured: false,
    specs: [
      { label: 'Craftsmanship', value: '100% Solid Walnut & Brass' },
      { label: 'Finish', value: 'Hand-Rubbed Organic Oil' },
      { label: 'Upholstery', value: 'Grade-A Aniline Leather' }
    ]
  },
  {
    id: 'work-4',
    title: 'Japandi Serenity Sanctuary Villa',
    category: 'Residential',
    description: 'Harmonious blend of Scandinavian functionality and Japanese wabi-sabi aesthetics with sunken living spaces and natural bamboo wall accents.',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1200&auto=format&fit=crop',
    year: '2026',
    featured: true,
    specs: [
      { label: 'Design Philosophy', value: 'Japandi Minimalist' },
      { label: 'Floor Plan', value: 'Open-Concept Biophilic Layout' },
      { label: 'Ceiling Height', value: '3.8m Vaulted Ceiling' }
    ]
  },
  {
    id: 'work-5',
    title: 'Monolith Executive Boardroom Suite',
    category: 'Commercial',
    description: 'Corporate interior solution incorporating integrated smart presentation screens, leather executive armchairs, and concealed HVAC linear diffusers.',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200&auto=format&fit=crop',
    year: '2025',
    featured: false,
    specs: [
      { label: 'Table Fabrication', value: '14-Foot Single-Slab Quartz' },
      { label: 'Automation', value: 'Crestron One-Touch Control' },
      { label: 'AV Integration', value: 'Concealed 4K Array' }
    ]
  },
  {
    id: 'work-6',
    title: 'Atelier Sculptural Kitchen & Bar Island',
    category: 'Renovation',
    description: 'Custom kitchen redesign centered around a cantilevered waterfall quartzite island, matte black hardware, and hidden appliance pantry doors.',
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=1200&auto=format&fit=crop',
    year: '2026',
    featured: false,
    specs: [
      { label: 'Countertop', value: 'Nero Marquina Quartzite' },
      { label: 'Cabinetry', value: 'Seamless Push-to-Open Lacquer' },
      { label: 'Hardware', value: 'Custom Knurled Brass' }
    ]
  }
];

export const INITIAL_SITE_CONFIG: SiteConfig = {
  heroTitle: 'ARCHITECTURAL INTERIOR & BESPOKE SPATIAL DESIGN',
  heroSubtitle: 'Deconstructed 3D spatial concepts, luxury residential penthouses, custom handcrafted furniture, and immersive architectural lighting.',
  tagline: 'MANOVA SPATIAL DESIGN & ARCHITECTURAL INTERIORS',
  contactEmail: 'design@manova.studio',
  contactPhone: '+1 (800) 555-SPATIAL',
  location: 'MANOVA Design Studio, Tech & Design District'
};

export const INITIAL_LEADS: LeadSubmission[] = [
  {
    id: 'lead-101',
    name: 'Sophia Montgomery',
    email: 'sophia@montgomeryholdings.com',
    phone: '+1 415-555-0812',
    serviceType: 'Full Residential Interior Design',
    budget: '$50,000 - $100,000',
    message: 'Seeking a full spatial design overhaul for a 5,000 sq.ft modern luxury penthouse with custom marble features and automated lighting.',
    createdAt: '2026-10-02 11:20',
    status: 'Quoted'
  },
  {
    id: 'lead-102',
    name: 'Julian Thorne',
    email: 'julian@thornecapital.io',
    phone: '+1 310-555-0941',
    serviceType: 'Executive Office & Commercial Space',
    budget: '$25,000 - $50,000',
    message: 'Looking for acoustic wood paneling, custom executive desk fabrication, and ambient architectural lighting for corporate headquarters.',
    createdAt: '2026-10-03 10:45',
    status: 'Pending'
  }
];
