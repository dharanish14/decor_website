'use client';

import { FormEvent, useState } from 'react';
import { ArrowUpRight, Check, LoaderCircle } from 'lucide-react';

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxMCwPYLXYQlibvSujWGbB2y-jGfLlD8Tl8-J55kZBAI4L78VDYhwldzJT1z6dAm3wW/exec';

export default function ContactForm() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');
    const form = event.currentTarget;
    const data = new FormData(form);
    const lead = {
      id: `lead-${Date.now()}`,
      name: data.get('name') || '',
      email: data.get('email') || '',
      phone: data.get('phone') || '',
      serviceType: data.get('service') || '',
      budget: 'Not specified',
      message: data.get('message') || '',
      createdAt: new Date().toISOString(),
      status: 'Pending',
    };
    try {
      let response = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(lead) });
      if (response.status === 404 || response.status === 502) {
        response = await fetch(APPS_SCRIPT_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ ...lead, source: 'elshadai-website' }) });
      }
      const result = await response.json().catch(() => null);
      if (!response.ok || result?.success === false) {
        const existing = JSON.parse(localStorage.getItem('manova_leads') || '[]');
        localStorage.setItem('manova_leads', JSON.stringify([lead, ...existing]));
        setLoading(false);
        setError(result?.error || 'The enquiry was saved only on this device. Google Sheets is not connected.');
        return;
      }
    } catch {
      setLoading(false);
      setError('We could not send your enquiry right now. Please try again after the site connection is restored.');
      return;
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
      <div className="contact-intro"><p className="eyebrow"><span /> Let’s talk about your space</p><h2>Bring us a<br /><em>window.</em></h2><p>Tell us what you are imagining. We’ll get back to you to understand the room, share a few directions, and arrange a visit when it feels right.</p><div className="contact-aside"><span>Prefer to browse first?</span><a href="https://www.instagram.com/elshadai_decors/" target="_blank" rel="noreferrer">See more on Instagram <ArrowUpRight size={15} /></a></div></div>
      <div className="contact-form-wrap">{sent ? <div className="form-success"><div><Check /></div><h3>Thank you for reaching out.</h3><p>Your enquiry is with our team. We’ll be in touch soon.</p><button onClick={() => setSent(false)}>Send another enquiry</button></div> : <form onSubmit={handleSubmit}><div className="form-row"><label>Name<input required name="name" placeholder="Your name" /></label><label>Phone<input required name="phone" placeholder="Your number" /></label></div><div className="form-row"><label>Email<input required type="email" name="email" placeholder="you@example.com" /></label><label>What are you looking for?<select name="service" defaultValue="Curtains"><option>Curtains</option><option>Blinds & shades</option><option>Sofa or upholstery</option><option>Full room refresh</option><option>Not sure yet</option></select></label></div><label>Tell us a little about the room<textarea name="message" rows={4} placeholder="What would you like to change?" /></label>{error && <p className="form-error">{error}</p>}<button className="button button-dark" disabled={loading}>{loading ? <LoaderCircle className="spin" size={17} /> : <ArrowUpRight size={17} />} {loading ? 'Sending...' : 'Send enquiry'}</button></form>}</div>
    </section>
  );
}
