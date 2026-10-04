'use client';

import { FormEvent, useEffect, useState } from 'react';
import { ArrowUpRight, Check, LoaderCircle, MessageSquare } from 'lucide-react';
import { PublicSiteContent } from '@/lib/dataStore';

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxMCwPYLXYQlibvSujWGbB2y-jGfLlD8Tl8-J55kZBAI4L78VDYhwldzJT1z6dAm3wW/exec';

export default function ContactForm({ asModal = false, onClose }: { asModal?: boolean; onClose?: () => void }) {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [waUrl, setWaUrl] = useState('');
  const [contactPhone, setContactPhone] = useState('+91 79046 14023');
  const [adminNotificationEmail, setAdminNotificationEmail] = useState('dharaanish@gmail.com');
  const [smtpUser, setSmtpUser] = useState('monovawebsite@gmail.com');
  const [smtpPass, setSmtpPass] = useState('');
  const [resendApiKey, setResendApiKey] = useState('');
  const [serviceLabel, setServiceLabel] = useState('What are you looking for?');
  const [serviceOptions, setServiceOptions] = useState<string[]>([
    'Curtains',
    'Blinds & shades',
    'Sofa or upholstery',
    'Full room refresh',
    'Not sure yet'
  ]);

  const syncContent = () => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('elshadai_public_content') : null;
    if (stored) {
      try {
        const parsed: PublicSiteContent = JSON.parse(stored);
        if (parsed.contactPhone) setContactPhone(parsed.contactPhone);
        if (parsed.adminNotificationEmail) setAdminNotificationEmail(parsed.adminNotificationEmail);
        if (parsed.smtpUser) setSmtpUser(parsed.smtpUser);
        if (parsed.smtpPass) setSmtpPass(parsed.smtpPass);
        if (parsed.resendApiKey) setResendApiKey(parsed.resendApiKey);
        if (parsed.formServiceLabel) setServiceLabel(parsed.formServiceLabel);
        if (Array.isArray(parsed.formServiceOptions) && parsed.formServiceOptions.length > 0) {
          setServiceOptions(parsed.formServiceOptions);
        }
      } catch { /* use default */ }
    }
  };

  useEffect(() => {
    syncContent();
    window.addEventListener('storage', syncContent);
    return () => window.removeEventListener('storage', syncContent);
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
      smtpUser: smtpUser || 'monovawebsite@gmail.com',
      smtpPass: smtpPass || '',
      resendApiKey: resendApiKey || '',
    };

    // Format optional WhatsApp alert link
    const cleanDigits = (contactPhone || '+91 79046 14023').replace(/[^0-9]/g, '');
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

  const formContent = (
    <>
      <div className={asModal ? "mb-6" : "contact-intro"}>
        {!asModal && <p className="eyebrow"><span /> Let’s talk about your space</p>}
        {asModal && <div className="flex justify-between items-start">
          <h2 style={{ fontSize: '24px', margin: 0, fontFamily: '"Playfair Display", serif' }}>Get a Free Estimate</h2>
          {onClose && <button type="button" onClick={onClose} style={{ fontSize: '20px', background: 'none', border: 'none', cursor: 'pointer' }}>×</button>}
        </div>}
        {!asModal && <h2>Bring us a<br /><em>window.</em></h2>}
        <p style={{ marginTop: asModal ? '8px' : '0', color: asModal ? '#4f5d54' : 'inherit' }}>Tell us what you are imagining. We’ll get back to you to understand the room, share a few directions, and arrange a visit.</p>
        
        {!asModal && contactPhone && (
          <p className="mt-4 text-sm font-semibold">
            📞 Call or WhatsApp us: <a href={`tel:${contactPhone.replace(/\s/g, '')}`} className="underline">{contactPhone}</a>
          </p>
        )}
      </div>
      <div className={asModal ? "" : "contact-form-wrap"}>
        {sent ? (
          <div className="form-success text-center">
            <div style={{ margin: '0 auto', display: 'inline-flex', width: '40px', height: '40px', borderRadius: '50%', background: '#e9f5ef', color: '#25302c', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}><Check size={20} /></div>
            <h3 style={{ fontSize: '20px', fontFamily: '"Playfair Display", serif', marginBottom: '12px' }}>Thank you!</h3>
            <p style={{ color: '#4f5d54' }}>Our team will contact you for further enquiries.<br/><br/>Contact this number: <strong>{contactPhone}</strong></p>
            {waUrl && (
              <a href={waUrl} target="_blank" rel="noreferrer" className="button" style={{ background: '#25D366', borderColor: '#25D366', color: '#ffffff', display: 'inline-flex', alignItems: 'center', gap: '8px', marginTop: '16px', textDecoration: 'none' }}>
                <MessageSquare size={16} /> Contact on WhatsApp
              </a>
            )}
            {asModal && <button type="button" onClick={onClose} style={{ display: 'block', margin: '20px auto 0', padding: '8px 24px', background: 'var(--ink)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Close</button>}
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className={asModal ? "grid gap-3 mb-3" : "form-row"}>
              <label style={{ display: 'block' }}><span style={{ fontSize: '12px', textTransform: 'uppercase', color: '#6c756e', fontWeight: 'bold' }}>Name</span><input required name="name" placeholder="Your name" style={{ width: '100%', padding: '12px', border: '1px solid #d8d4ca', marginTop: '4px', borderRadius: '4px' }} /></label>
              <label style={{ display: 'block' }}><span style={{ fontSize: '12px', textTransform: 'uppercase', color: '#6c756e', fontWeight: 'bold' }}>Phone</span><input required name="phone" placeholder="Your number" style={{ width: '100%', padding: '12px', border: '1px solid #d8d4ca', marginTop: '4px', borderRadius: '4px' }} /></label>
            </div>
            <div className={asModal ? "grid gap-3 mb-3" : "form-row"}>
              <label style={{ display: 'block' }}><span style={{ fontSize: '12px', textTransform: 'uppercase', color: '#6c756e', fontWeight: 'bold' }}>Email</span><input required type="email" name="email" placeholder="you@example.com" style={{ width: '100%', padding: '12px', border: '1px solid #d8d4ca', marginTop: '4px', borderRadius: '4px' }} /></label>
              <label style={{ display: 'block' }}><span style={{ fontSize: '12px', textTransform: 'uppercase', color: '#6c756e', fontWeight: 'bold' }}>{serviceLabel || 'What are you looking for?'}</span>
                <select name="service" defaultValue={serviceOptions[0] || 'Curtains'} style={{ width: '100%', padding: '12px', border: '1px solid #d8d4ca', marginTop: '4px', borderRadius: '4px' }}>
                  {serviceOptions.map((opt, i) => (
                    <option key={i} value={opt}>{opt}</option>
                  ))}
                </select>
              </label>
            </div>
            <label style={{ display: 'block', marginBottom: '16px' }}><span style={{ fontSize: '12px', textTransform: 'uppercase', color: '#6c756e', fontWeight: 'bold' }}>Tell us a little about the room</span><textarea name="message" rows={asModal ? 3 : 4} placeholder="What would you like to change?" style={{ width: '100%', padding: '12px', border: '1px solid #d8d4ca', marginTop: '4px', borderRadius: '4px' }} /></label>
            {error && <p className="form-error">{error}</p>}
            <button className="button button-dark" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
              {loading ? <LoaderCircle className="spin" size={17} /> : null}
              {loading ? 'Sending...' : 'Submit Enquiry'}
            </button>
          </form>
        )}
      </div>
    </>
  );

  if (asModal) {
    return (
      <div className="cms-modal-overlay" style={{ zIndex: 10000 }}>
        <div className="cms-modal" style={{ background: '#fff', maxWidth: '500px' }}>
          {formContent}
        </div>
      </div>
    );
  }

  return (
    <section className="contact-section" id="contact">
      {formContent}
    </section>
  );
}
