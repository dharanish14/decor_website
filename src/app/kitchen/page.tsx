'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { INITIAL_PUBLIC_CONTENT, PublicSiteContent, normalizeImageUrl } from '@/lib/dataStore';

export default function KitchenPage() {
  const [content, setContent] = useState<PublicSiteContent>(INITIAL_PUBLIC_CONTENT);

  useEffect(() => {
    const loadContent = () => {
      const stored = typeof window !== 'undefined' ? localStorage.getItem('elshadai_public_content') : null;
      if (stored) {
        try { setContent({ ...INITIAL_PUBLIC_CONTENT, ...JSON.parse(stored) }); } catch {}
      }
      fetch('/api/site?action=content', { cache: 'no-store' })
        .then(res => res.json())
        .then(data => { if (data.content) setContent({ ...INITIAL_PUBLIC_CONTENT, ...data.content }); })
        .catch(() => {});
    };
    loadContent();
    window.addEventListener('storage', loadContent);
    return () => window.removeEventListener('storage', loadContent);
  }, []);

  return (
    <main className="site-shell">
      <header className="site-header" style={{ padding: '20px 5vw', background: 'var(--paper)' }}>
        <Link href="/" className="text-link"><ArrowLeft size={16} /> Back to Home</Link>
        <div className="brand"><span className="brand-mark">E</span><span><strong>Kitchen Models</strong></span></div>
      </header>
      <section className="section">
        <div className="section-heading">
          <p className="eyebrow"><span /> Modular Kitchens</p>
          <h2>Explore our<br /><em>Kitchen Designs</em></h2>
          <p>Discover the latest models available for your modern kitchen.</p>
        </div>
        <div className="collection-grid">
          {((content.kitchenModels?.length ? content.kitchenModels : INITIAL_PUBLIC_CONTENT.kitchenModels) || []).map((model, index) => (
            <article className="collection-card" key={model.id || index}>
              <div className="collection-image">
                <img src={normalizeImageUrl(model.image) || 'https://images.unsplash.com/photo-1556910103-1c02745a872f?q=80&w=800&auto=format&fit=crop'} onError={(e) => { if (e.currentTarget.src !== 'https://images.unsplash.com/photo-1556910103-1c02745a872f?q=80&w=800&auto=format&fit=crop') e.currentTarget.src = 'https://images.unsplash.com/photo-1556910103-1c02745a872f?q=80&w=800&auto=format&fit=crop'; }} alt={model.title || 'Kitchen Model'} />
                <span>{model.number || String(index + 1).padStart(2, '0')}</span>
              </div>
              <div className="collection-copy">
                <h3>{model.title}</h3>
                <p>{model.copy}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
