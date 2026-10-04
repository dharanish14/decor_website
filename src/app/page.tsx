'use client';

import { useEffect, useState } from 'react';
import { ArrowUpRight, Check, ChevronDown, Instagram, MapPin, Menu, Phone, Sparkles, X, MessageCircle } from 'lucide-react';
import ContactForm from '@/components/ContactForm';
import { INITIAL_PUBLIC_CONTENT, normalizeImageUrl, PublicSiteContent } from '@/lib/dataStore';

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [heroIndex, setHeroIndex] = useState(0);
  const [content, setContent] = useState<PublicSiteContent>(INITIAL_PUBLIC_CONTENT);

  useEffect(() => {
    const loadContent = () => {
      const stored = typeof window !== 'undefined' ? localStorage.getItem('elshadai_public_content') : null;
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.heroTitle === 'Connection test') {
            parsed.heroTitle = INITIAL_PUBLIC_CONTENT.heroTitle;
            parsed.heroEmphasis = INITIAL_PUBLIC_CONTENT.heroEmphasis;
          }
          setContent({ ...INITIAL_PUBLIC_CONTENT, ...parsed });
        } catch { /* use current */ }
      }
      void fetch('/api/site?action=content', { cache: 'no-store' })
        .then(response => response.json())
        .then(data => {
          if (data.content) {
            const merged = { ...INITIAL_PUBLIC_CONTENT, ...data.content };
            if (merged.heroTitle === 'Connection test') {
              merged.heroTitle = INITIAL_PUBLIC_CONTENT.heroTitle;
              merged.heroEmphasis = INITIAL_PUBLIC_CONTENT.heroEmphasis;
            }
            setContent(merged);
            localStorage.setItem('elshadai_public_content', JSON.stringify(merged));
          }
        })
        .catch(() => {});
    };
    loadContent();
    window.addEventListener('storage', loadContent);
    return () => window.removeEventListener('storage', loadContent);
  }, []);

  useEffect(() => {
    const images = content.heroImages?.filter(Boolean).map(normalizeImageUrl).length ? content.heroImages.filter(Boolean).map(normalizeImageUrl) : [normalizeImageUrl(content.heroImage)];
    setHeroIndex(0);
    const timer = window.setInterval(() => setHeroIndex(index => (index + 1) % images.length), 5000);
    return () => window.clearInterval(timer);
  }, [content.heroImages, content.heroImage]);

  const heroImages = content.heroImages?.filter(Boolean).map(normalizeImageUrl).length ? content.heroImages.filter(Boolean).map(normalizeImageUrl) : [normalizeImageUrl(content.heroImage)];

  return (
    <main className={`site-shell ${content.effects.imageHoverZoom ? 'effect-image-zoom' : 'no-image-zoom'} ${content.effects.revealOnScroll ? 'effect-reveal' : ''} ${content.effects.floatingAccent ? 'effect-floating' : ''}`}>
      <header className="site-header">
        <a href="#top" className="brand" aria-label="Elshadai Decors home"><span className="brand-mark">E</span><span><strong>{content.brandName}</strong><small>{content.brandDescriptor}</small></span></a>
        <nav className={menuOpen ? 'main-nav is-open' : 'main-nav'}>
          <a href="/kitchen">Kitchen</a><a href="/bedroom">Bedroom</a><a href="/living-room">Living Room</a><a href="/dining">Dining</a><a href="#packages" onClick={() => setMenuOpen(false)}>Packages</a><a href="#contact" onClick={() => setMenuOpen(false)}>Free Estimation</a>
        </nav>
        <div className="header-actions">
          {content.contactPhone && (
            <a href={`tel:${content.contactPhone.replace(/\s/g, '')}`} className="flex items-center gap-1.5 text-xs font-bold text-[#25302c] hover:text-[#c8714d] transition-colors" style={{ textDecoration: 'none' }}>
              <Phone size={14} /> {content.contactPhone}
            </a>
          )}
          <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">{menuOpen ? <X /> : <Menu />}</button>
        </div>
      </header>

      <section className="hero" id="top"><div className="hero-copy"><p className="eyebrow"><span /> {content.heroEyebrow}</p><h1>{content.heroTitle}<br /><em>{content.heroEmphasis}</em></h1><p className="hero-intro">{content.heroIntro}</p><div className="hero-actions"><a className="button button-dark" href="#contact">Free Estimation <ArrowUpRight size={17} /></a><a className="text-link" href="#packages">View 30% Off Packages <ChevronDown size={16} /></a></div><div className="hero-note"><Sparkles size={16} /> {content.heroNote}</div></div><div className="hero-image-wrap">{heroImages.map((image, index) => <img key={`${image}-${index}`} className={`hero-image ${index === heroIndex % heroImages.length ? 'is-active' : ''}`} src={image} onError={event => { const fallback = INITIAL_PUBLIC_CONTENT.heroImages[index % INITIAL_PUBLIC_CONTENT.heroImages.length]; if (event.currentTarget.src !== fallback) event.currentTarget.src = fallback; }} alt="Warm, layered living room with curtains and a sofa" />)}<div className="hero-caption"><span>{String((heroIndex % heroImages.length) + 1).padStart(2, '0')} / {String(heroImages.length).padStart(2, '0')}</span><span>Living beautifully, daily</span></div><div className="hero-dots">{heroImages.map((image, index) => <button key={image} className={index === heroIndex % heroImages.length ? 'is-active' : ''} onClick={() => setHeroIndex(index)} aria-label={`Show image ${index + 1}`} />)}</div></div></section>

      <section className="section collection-section" id="room-categories">
        <div className="section-heading">
          <p className="eyebrow"><span /> Spaces</p>
          <h2>Explore our<br /><em>Design Categories</em></h2>
          <p>Discover tailored models and layouts for every room in your home.</p>
        </div>
        <div className="collection-grid">
          {((content.roomCategories?.length ? content.roomCategories : INITIAL_PUBLIC_CONTENT.roomCategories) || []).map((cat) => (
            <article className="collection-card" key={cat.id}>
              <a href={cat.link} className="block" style={{ textDecoration: 'none' }}>
                <div className="collection-image">
                  <img src={normalizeImageUrl(cat.image) || 'https://images.unsplash.com/photo-1556910103-1c02745a872f?q=80&w=800&auto=format&fit=crop'} onError={(e) => { if (e.currentTarget.src !== 'https://images.unsplash.com/photo-1556910103-1c02745a872f?q=80&w=800&auto=format&fit=crop') e.currentTarget.src = 'https://images.unsplash.com/photo-1556910103-1c02745a872f?q=80&w=800&auto=format&fit=crop'; }} alt={cat.title || 'Category'} />
                </div>
                <div className="collection-copy">
                  <h3>{cat.title}</h3>
                  <p>{cat.copy}</p>
                  <ArrowUpRight size={19} />
                </div>
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="trust-strip">{content.trustItems.map(item => <span key={item}>{item}</span>)}</section>

      <section className="section collection-section" id="collections"><div className="section-heading"><p className="eyebrow"><span /> The edit</p><h2>{content.collectionHeading}<br /><em>{content.collectionEmphasis}</em></h2><p>{content.collectionIntro}</p></div><div className="collection-grid">{((content.collections?.length ? content.collections : INITIAL_PUBLIC_CONTENT.collections) || []).map((item) => <article className="collection-card" key={item.id}><div className="collection-image"><img src={normalizeImageUrl(item.image) || 'https://images.unsplash.com/photo-1583847268964-b28ce8f52859?q=80&w=800&auto=format&fit=crop'} onError={(e) => { if (e.currentTarget.src !== 'https://images.unsplash.com/photo-1583847268964-b28ce8f52859?q=80&w=800&auto=format&fit=crop') e.currentTarget.src = 'https://images.unsplash.com/photo-1583847268964-b28ce8f52859?q=80&w=800&auto=format&fit=crop'; }} alt={item.title || 'Collection'} /><span>{item.number}</span></div><div className="collection-copy"><h3>{item.title}</h3><p>{item.copy}</p><ArrowUpRight size={19} /></div></article>)}</div></section>

      <section className="story-section" id="story"><div className="story-image"><img src={normalizeImageUrl(content.storyImage)} alt="Sunlit interior with textured fabrics" /></div><div className="story-copy"><p className="eyebrow"><span /> {content.storyEyebrow}</p><h2>{content.storyHeading}<br /><em>{content.storyEmphasis}</em></h2><p>{content.storyBody}</p><div className="values">{content.storyValues.map(value => <div key={value}><Check size={16} /><span>{value}</span></div>)}</div><a className="text-link" href="#contact">Tell us about your space <ArrowUpRight size={16} /></a></div></section>

      <section className="section projects-section" id="projects"><div className="section-heading projects-heading"><div><p className="eyebrow"><span /> A little inspiration</p><h2>{content.projectsHeading}<br /><em>{content.projectsEmphasis}</em></h2></div><p>{content.projectsIntro}</p></div><div className="project-grid">{((content.projects?.length ? content.projects : INITIAL_PUBLIC_CONTENT.projects) || []).map((project) => <article className="project-card" key={project.id}><img src={normalizeImageUrl(project.image) || 'https://images.unsplash.com/photo-1556910103-1c02745a872f?q=80&w=800&auto=format&fit=crop'} onError={(e) => { if (e.currentTarget.src !== 'https://images.unsplash.com/photo-1556910103-1c02745a872f?q=80&w=800&auto=format&fit=crop') e.currentTarget.src = 'https://images.unsplash.com/photo-1556910103-1c02745a872f?q=80&w=800&auto=format&fit=crop'; }} alt={project.title || 'Project'} /><div><p>{project.type}</p><h3>{project.title}</h3></div></article>)}</div></section>

      <section className="visit-section"><div><p className="eyebrow"><MapPin size={16} /> Come by</p><h2>Let’s find your<br /><em>room’s rhythm.</em></h2>{content.contactPhone && <a className="direct-phone" href={`tel:${content.contactPhone.replace(/\s/g, '')}`}><Phone size={17} /> {content.contactPhone}</a>}</div><div className="visit-details"><p>{content.address}</p><a className="button button-light" href="https://www.google.com/maps/search/?api=1&query=Elshadai+Decors+K.K.+Nagar+Chennai" target="_blank" rel="noreferrer">Get directions <ArrowUpRight size={17} /></a></div></section>

      <section className="map-section"><div className="map-heading"><p className="eyebrow"><MapPin size={16} /> Find us in Chennai</p><h2>Near MGR Statue,<br /><em>K.K. Nagar.</em></h2><p>Use the map to plan your visit. The pin is set near the listed Elshadai Decors location in Nesapakkam.</p></div><div className="map-frame"><iframe title="Elshadai Decors satellite location" src="https://www.google.com/maps?q=13.030309,80.190689&z=17&t=k&output=embed" loading="lazy" referrerPolicy="no-referrer-when-downgrade" /><a className="map-open" href="https://www.google.com/maps/@13.030309,80.190689,17z/data=!3m1!1e3" target="_blank" rel="noreferrer">Open satellite view <ArrowUpRight size={15} /></a></div></section>

      <section className="packages-section" id="packages">
        <div className="section-heading">
          <p className="eyebrow"><span /> Special Offers</p>
          <h2>Flat 30% Off<br /><em>On Essential Packages</em></h2>
          <p>Get everything essential for your new home at unbeatable prices.</p>
        </div>
        <div className="collection-grid">
          {((content.packages?.length ? content.packages : INITIAL_PUBLIC_CONTENT.packages) || []).map(pkg => (
            <article className="package-card" key={pkg.id}>
              {pkg.badge && <div className="package-badge">{pkg.badge}</div>}
              <h3>{pkg.title}</h3>
              <div className="package-price"><s>{pkg.oldPrice}</s><br/>{pkg.newPrice}</div>
              <ul className="package-features">
                {(pkg.features || []).map((feature, i) => (
                  <li key={i}>{feature}</li>
                ))}
              </ul>
              <a className="button button-dark" style={{width: '100%', justifyContent: 'center'}} href="#contact">Get Free Estimate</a>
            </article>
          ))}
        </div>
      </section>

      <div className="floating-actions">
        <a href="#contact" className="enquiry-float" aria-label="Enquire Now">
          <span>Enquiry</span>
        </a>
        <a href="https://wa.me/919876543210" target="_blank" rel="noreferrer" className="whatsapp-float" aria-label="Chat on WhatsApp">
          <MessageCircle size={24} />
        </a>
      </div>

      <ContactForm /><footer className="site-footer"><div className="footer-brand"><span className="brand-mark">E</span><span><strong>{content.brandName}</strong><small>{content.brandDescriptor}</small></span></div><p>Window treatments, upholstery, and considered home furnishings in Chennai.{content.contactPhone && <> · 📞 <a href={`tel:${content.contactPhone.replace(/\s/g, '')}`} style={{ color: 'inherit', textDecoration: 'underline' }}>{content.contactPhone}</a></>}</p><div className="footer-links"><a href={content.instagramUrl} target="_blank" rel="noreferrer"><Instagram size={16} /> Instagram</a><a href="#contact">Enquire</a><span>© {new Date().getFullYear()} Elshadai Decors</span></div></footer>
    </main>
  );
}
