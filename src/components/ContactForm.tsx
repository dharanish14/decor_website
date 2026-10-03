'use client';

import { FormEvent, useEffect, useState } from 'react';
import { ArrowUpRight, Check, LoaderCircle, MessageSquare } from 'lucide-react';
import { PublicSiteContent } from '@/lib/dataStore';

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxMCwPYLXYQlibvSujWGbB2y-jGfLlD8Tl8-J55kZBAI4L78VDYhwldzJT1z6dAm3wW/exec';

export default function ContactForm() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [waUrl, setWaUrl] = useState('');
  const [contactPhone, setContactPhone] = useState('+91 98400 12345');
  const [adminNotificationEmail, setAdminNotificationEmail] = useState('dharaanish@gmail.com');

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('elshadai_public_content') : null;
    if (stored) {
      try {
        const parsed: PublicSiteContent = JSON.parse(stored);
        if (parsed.contactPhone) setContactPhone(parsed.contactPhone);
        if (parsed.adminNotificationEmail) setAdminNotificationEmail(parsed.adminNotificationEmail);
      } catch { /* use default */ }
    }
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');
    const form = event.currentTarget;
    const data = new FormData(form);
    const lead = {
      id: `lead-${Date.now()}`,
      name: String(data.get('name') || ''),
      email: String(data.get('email') || ''),
      phone: String(data.get('phone') || ''),
      serviceType: String(data.get('service') || ''),
      budget: 'Not specified',
      message: String(data.get('message') || ''),
      createdAt: new Date().toISOString(),
      status: 'Pending' as const,
      adminNotificationEmail: adminNotificationEmail || 'dharaanish@gmail.com',
    };

    // Format optional WhatsApp alert link
    const cleanDigits = (contactPhone || '+91 98400 12345').replace(/[^0-9]/g, '');
    const fullWaPhone = cleanDigits.length === 10 ? `91${cleanDigits}` : cleanDigits;
    const waText = `*New Website Enquiry - Elshadai Decors*\n\n👤 *Name:* ${lead.name}\n📞 *Phone:* ${lead.phone}\n📧 *Email:* ${lead.email}\n🛋️ *Looking for:* ${lead.serviceType}\n💬 *Details:* ${lead.message || 'No additional details'}`;
    const generatedWaUrl = `https://wa.me/${fullWaPhone}?text=${encodeURIComponent(waText)}`;
    setWaUrl(generatedWaUrl);

    try {
      let response = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(lead) });
      if (response.status === 404 || response.status === 502) {
        response = await fetch(APPS_SCRIPT_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ ...lead, source: 'elshadai-website' }) });
      }
    } catch {
      /* continue to local save */
    }

    if (typeof window !== 'undefined') {
      const existing = JSON.parse(localStorage.getItem('manova_leads') || '[]');
      localStorage.setItem('manova_leads', JSON.stringify([lead, ...existing]));
    }

    setLoading(false);
    setSent(true);
  }

  return (
    <section className="contact-section" id="contact">
      <div className="contact-intro">
        <p className="eyebrow"><span /> Let’s talk about your space</p>
        <h2>Bring us a<br /><em>window.</em></h2>
        <p>Tell us what you are imagining. We’ll get back to you to understand the room, share a few directions, and arrange a visit when it feels right.</p>
        {contactPhone && (
          <p className="mt-4 text-sm font-semibold">
            📞 Call or WhatsApp us: <a href={`tel:${contactPhone.replace(/\s/g, '')}`} className="underline">{contactPhone}</a>
          </p>
        )}
        <div className="contact-aside">
          <span>Prefer to browse first?</span>
          <a href="https://www.instagram.com/elshadai_decors/" target="_blank" rel="noreferrer">See more on Instagram <ArrowUpRight size={15} /></a>
        </div>
      </div>
      <div className="contact-form-wrap">
        {sent ? (
          <div className="form-success">
            <div><Check /></div>
            <h3>Thank you for reaching out.</h3>
            <p>Your enquiry has been saved and forwarded. Connect on WhatsApp for an instant response:</p>
            {waUrl && (
              <a href={waUrl} target="_blank" rel="noreferrer" className="button" style={{ background: '#25D366', borderColor: '#25D366', color: '#ffffff', display: 'inline-flex', alignItems: 'center', gap: '8px', marginTop: '12px', textDecoration: 'none' }}>
                <MessageSquare size={16} /> Open WhatsApp Chat ↗
              </a>
            )}
            <button onClick={() => setSent(false)} className="mt-4 block text-xs underline text-[#6c756e]">Send another enquiry</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <label>Name<input required name="name" placeholder="Your name" /></label>
              <label>Phone<input required name="phone" placeholder="Your number" /></label>
            </div>
            <div className="form-row">
              <label>Email<input required type="email" name="email" placeholder="you@example.com" /></label>
              <label>What are you looking for?
                <select name="service" defaultValue="Curtains">
                  <option>Curtains</option>
                  <option>Blinds & shades</option>
                  <option>Sofa or upholstery</option>
                  <option>Full room refresh</option>
                  <option>Not sure yet</option>
                </select>
              </label>
            </div>
            <label>Tell us a little about the room<textarea name="message" rows={4} placeholder="What would you like to change?" /></label>
            {error && <p className="form-error">{error}</p>}
            <button className="button button-dark" disabled={loading}>
              {loading ? <LoaderCircle className="spin" size={17} /> : <ArrowUpRight size={17} />}
              {loading ? 'Sending...' : 'Send enquiry'}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
