'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { INITIAL_PUBLIC_CONTENT, PublicSiteContent, normalizeImageUrl } from '@/lib/dataStore';

export default function LivingRoomPage() {
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
        <div className="brand"><span className="brand-mark">E</span><span><strong>Living Room Models</strong></span></div>
      </header>
      <section className="section">
        <div className="section-heading">
          <p className="eyebrow"><span /> Living Space</p>
          <h2>Explore our<br /><em>Living Room Designs</em></h2>
          <p>Discover the latest models available for your living room.</p>
        </div>
        <div className="collection-grid">
          {((content.livingRoomModels?.length ? content.livingRoomModels : INITIAL_PUBLIC_CONTENT.livingRoomModels) || []).map((model, index) => (
            <article className="collection-card" key={model.id || index}>
              <div className="collection-image">
                <img src={normalizeImageUrl(model.image) || 'https://placehold.co/800x600/f3f2ef/333333?text=living-room'} onError={(e) => { if (e.currentTarget.src !== 'https://placehold.co/800x600/f3f2ef/333333?text=living-room') e.currentTarget.src = 'https://placehold.co/800x600/f3f2ef/333333?text=living-room'; }} alt={model.title || 'Living Room Model'} />
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
