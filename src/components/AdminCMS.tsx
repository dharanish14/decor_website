'use client';

import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { Check, Download, ImagePlus, LogOut, Plus, Save, Settings, Trash2, Upload, UserRound } from 'lucide-react';
import { exportLeadsToExcel } from '@/lib/excelExport';
import { INITIAL_PUBLIC_CONTENT, LeadSubmission, normalizeImageUrl, PublicSiteContent } from '@/lib/dataStore';

type Tab = 'leads' | 'content' | 'settings';
const fieldClass = 'mt-1 w-full rounded-lg border border-[#d8d4ca] bg-white px-3 py-2 text-sm text-[#25302c] outline-none focus:border-[#c8714d]';

async function resizeImage(file: File) {
  const bitmap = await createImageBitmap(file);
  const maxSide = 1800;
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(value => value ? resolve(value) : reject(new Error('Could not process image')), 'image/jpeg', 0.86));
  const baseName = file.name.replace(/\.[^.]+$/, '') || 'elshadai-image';
  return new File([blob], `${baseName}.jpg`, { type: 'image/jpeg' });
}

export default function AdminCMS() {
  const [authenticated, setAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [tab, setTab] = useState<Tab>('leads');
  const [content, setContent] = useState<PublicSiteContent>(INITIAL_PUBLIC_CONTENT);
  const [leads, setLeads] = useState<LeadSubmission[]>([]);
  const [scriptReady, setScriptReady] = useState(false);
  const [notice, setNotice] = useState('');
  const [leadsUpdatedAt, setLeadsUpdatedAt] = useState('');
  const [busy, setBusyValue] = useState('');
  const setBusy = (message: string) => {
    setBusyValue(message);
    if (typeof document !== 'undefined') {
      if (message) document.body.dataset.adminBusy = message;
      else delete document.body.dataset.adminBusy;
    }
  };

  useEffect(() => {
    setAuthenticated(sessionStorage.getItem('elshadai_admin_authed') === 'true');
    void loadRemoteData();
    const poll = window.setInterval(() => { void loadRemoteLeads(); }, 10000);
    return () => window.clearInterval(poll);
  }, []);

  async function loadRemoteLeads() {
    try {
      const response = await fetch('/api/site?action=listLeads', { cache: 'no-store' });
      const data = await response.json();
      if (response.ok && data.success !== false && Array.isArray(data.leads)) {
        setLeads(data.leads);
        setLeadsUpdatedAt(new Date().toLocaleTimeString());
      }
    } catch { /* Keep the last known data visible during a temporary outage. */ }
  }

  async function loadRemoteData() {
    let remoteContentLoaded = false;
    let remoteLeadsLoaded = false;
    try {
      const response = await fetch('/api/site?action=content', { cache: 'no-store' });
      const data = await response.json();
      if (response.ok && data.success !== false) {
        if (data.content) {
          const merged = { ...INITIAL_PUBLIC_CONTENT, ...data.content };
          setContent(merged);
          localStorage.setItem('elshadai_public_content', JSON.stringify(merged));
        }
        remoteContentLoaded = true;
      }
      setScriptReady(response.ok && data.success !== false);
    } catch {
      setScriptReady(false);
    }
    try {
      const response = await fetch('/api/site?action=listLeads', { cache: 'no-store' });
      const data = await response.json();
      if (response.ok && data.success !== false && Array.isArray(data.leads)) {
        setLeads(data.leads);
        setLeadsUpdatedAt(new Date().toLocaleTimeString());
        remoteLeadsLoaded = true;
      }
    } catch { /* The panel remains usable while the connection is repaired. */ }
    if (!remoteContentLoaded || !remoteLeadsLoaded) {
      const localContent = localStorage.getItem('elshadai_public_content');
      const localLeads = localStorage.getItem('manova_leads');
      if (!remoteContentLoaded && localContent) setContent({ ...INITIAL_PUBLIC_CONTENT, ...JSON.parse(localContent) });
      if (!remoteLeadsLoaded && localLeads) setLeads(JSON.parse(localLeads));
    }
  }

  const notify = (message: string) => { setNotice(message); window.setTimeout(() => setNotice(''), 2800); };
  const setField = <K extends keyof PublicSiteContent>(key: K, value: PublicSiteContent[K]) => setContent(previous => ({ ...previous, [key]: value }));
  const updateCollection = (index: number, patch: Partial<PublicSiteContent['collections'][number]>) => setField('collections', content.collections.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item));
  const updateProject = (index: number, patch: Partial<PublicSiteContent['projects'][number]>) => setField('projects', content.projects.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item));

  async function publish(contentToPublish?: PublicSiteContent) {
    if (busy) return;
    setBusy('Processing...');
    const targetContent = contentToPublish || content;
    try {
      const response = await fetch('/api/site', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'saveContent', content: targetContent }) });
      const data = await response.json();
      if (!response.ok || !data.success) {
        notify(data.error || 'Google Sheets rejected this publish. Nothing was written.');
        return;
      }
      localStorage.setItem('elshadai_public_content', JSON.stringify(targetContent));
      notify('Published to Google Sheets & updated website');
      window.dispatchEvent(new Event('storage'));
    } catch {
      notify('Google Sheets is unavailable. Nothing was written.');
    } finally {
      setBusy('');
    }
  }

  async function uploadImage(event: ChangeEvent<HTMLInputElement>, onUploaded: (url: string) => PublicSiteContent) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (busy) return;
    setBusy('Processing...');
    try {
      const formData = new FormData();
      const resized = await resizeImage(file);
      formData.append('file', resized);
      const response = await fetch('/api/site/upload', { method: 'POST', body: formData });
      const data = await response.json();
      if (!response.ok || !data.url) { notify(data.error || 'Upload failed'); return; }
      const normalizedUrl = normalizeImageUrl(data.url);
      const nextContent = onUploaded(normalizedUrl);
      await publish(nextContent);
      notify(`${file.name} processed, saved, and published`);
    } finally {
      setBusy('');
    }
  }

  async function updateLead(id: string, patch: Partial<LeadSubmission>) {
    if (busy) return;
    setBusy('Processing...');
    try {
    const response = await fetch('/api/site', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'updateLead', id, ...patch }) });
    if (!response.ok) {
      const next = leads.map(lead => lead.id === id ? { ...lead, ...patch } : lead);
      setLeads(next);
      localStorage.setItem('manova_leads', JSON.stringify(next));
      notify('Updated locally. Sheets sync needs the current Apps Script deployment.');
      return;
    }
    setLeads(previous => previous.map(lead => lead.id === id ? { ...lead, ...patch } : lead));
    } finally {
      setBusy('');
    }
  }

  async function deleteLead(id: string) {
    if (busy) return;
    setBusy('Processing...');
    try {
    const response = await fetch('/api/site', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'deleteLead', id }) });
    const next = leads.filter(lead => lead.id !== id);
    if (!response.ok) {
      setLeads(next);
      localStorage.setItem('manova_leads', JSON.stringify(next));
      notify('Deleted locally. Sheets sync needs the current Apps Script deployment.');
      return;
    }
    setLeads(next);
    } finally {
      setBusy('');
    }
  }

  function login(event: FormEvent) {
    event.preventDefault();
    if (username === 'admin@elshadai' && password === 'change-me-now') {
      sessionStorage.setItem('elshadai_admin_authed', 'true');
      setAuthenticated(true);
    } else setLoginError('Invalid login. Change the starter credentials before launch.');
  }

  if (!authenticated) return <main className="admin-login"><div className="admin-login-art"><div className="admin-login-art-copy"><span className="admin-kicker">ELSHADAI / PRIVATE STUDIO</span><h1>Make every<br /><em>room matter.</em></h1><p>Shape the public experience, keep your collection fresh, and follow every enquiry from one quiet control room.</p><div className="admin-login-rule" /></div></div><form onSubmit={login} className="admin-login-form"><div className="admin-login-badge"><Settings size={20} /></div><span className="admin-kicker">WELCOME BACK</span><h2>Control room</h2><p className="admin-login-subtitle">Manage your website, content, images, and enquiries.</p>{loginError && <p className="admin-login-error">{loginError}</p>}<label>Username<input className={fieldClass} placeholder="admin@elshadai" value={username} onChange={event => setUsername(event.target.value)} required /></label><label>Password<input className={fieldClass} type="password" placeholder="Your password" value={password} onChange={event => setPassword(event.target.value)} required /></label><button className="admin-login-submit">Open admin panel <span>↗</span></button><small>Private workspace · Google Sheets + Drive connected</small></form></main>;

  return <main className="min-h-screen bg-[#f5f2ec] p-4 text-[#25302c] sm:p-8"><div className="mx-auto max-w-7xl"><header className="mb-7 flex flex-wrap items-center justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-[#c8714d]">ELSHADAI DECORS</p><h1 className="font-serif text-4xl">Control room</h1><p className="mt-1 text-sm text-[#6c756e]">{scriptReady ? 'Connected to Google Sheets and Google Drive' : 'Connect the Apps Script URL before publishing'}</p></div><div className="flex gap-2"><button onClick={() => void publish()} className="flex items-center gap-2 bg-[#25302c] px-4 py-2.5 text-xs font-bold uppercase text-white"><Save size={15} /> Publish</button><button onClick={() => { sessionStorage.removeItem('elshadai_admin_authed'); setAuthenticated(false); }} className="flex items-center gap-2 border border-[#d8d4ca] px-4 py-2.5 text-xs font-bold uppercase"><LogOut size={15} /> Log out</button></div></header>{notice && <div className="fixed right-5 top-5 z-50 flex items-center gap-2 bg-[#25302c] px-4 py-3 text-sm text-white shadow-xl"><Check size={16} /> {notice}</div>}<nav className="mb-7 flex gap-2 overflow-auto border-b border-[#d8d4ca] pb-3">{([['leads', 'Enquiries', UserRound], ['content', 'Page content', ImagePlus], ['settings', 'Settings', Settings]] as const).map(([key, label, Icon]) => <button key={key} onClick={() => setTab(key)} className={`flex items-center gap-2 whitespace-nowrap px-4 py-2 text-xs font-bold uppercase tracking-wider ${tab === key ? 'bg-[#25302c] text-white' : 'bg-white text-[#6c756e]'}`}><Icon size={15} /> {label}{key === 'leads' ? ` (${leads.length})` : ''}</button>)}</nav>{tab === 'leads' && <LeadsTab leads={leads} updateLead={updateLead} deleteLead={deleteLead} notify={notify} />}{tab === 'content' && <ContentTab content={content} setField={setField} updateCollection={updateCollection} updateProject={updateProject} uploadImage={uploadImage} publish={publish} />}{tab === 'settings' && <SettingsTab content={content} setField={setField} />}</div></main>;
}

function LeadsTab({ leads, updateLead, deleteLead, notify }: { leads: LeadSubmission[]; updateLead: (id: string, patch: Partial<LeadSubmission>) => Promise<void>; deleteLead: (id: string) => Promise<void>; notify: (message: string) => void }) {
  return <section><div className="mb-5 flex flex-wrap justify-between gap-3"><div><h2 className="font-serif text-3xl">Customer enquiries</h2><p className="text-sm text-[#6c756e]">Stored in Google Sheets and available from any device.</p></div><button onClick={() => { exportLeadsToExcel(leads); notify('Excel file downloaded'); }} className="flex items-center gap-2 bg-[#c8714d] px-3 py-2 text-xs font-bold uppercase text-white"><Download size={14} /> Excel</button></div><div className="grid gap-4">{leads.length === 0 ? <div className="bg-white p-8 text-center text-sm text-[#6c756e]">No enquiries yet.</div> : leads.map(lead => <article key={lead.id} className="bg-white p-5 shadow-sm"><div className="flex justify-between gap-3"><div><h3 className="font-serif text-2xl">{lead.name}</h3><p className="text-sm text-[#6c756e]">{lead.email} · {lead.phone}</p></div><button onClick={() => deleteLead(lead.id)} className="text-[#c8714d]" aria-label={`Delete ${lead.name}`}><Trash2 size={18} /></button></div><p className="mt-4 text-sm"><b>{lead.serviceType}</b> · {lead.message || 'No additional details.'}</p><div className="mt-4 flex flex-wrap gap-2 border-t border-[#eeeae2] pt-3">{(['Pending', 'Contacted', 'Quoted', 'Completed'] as LeadSubmission['status'][]).map(status => <button key={status} onClick={() => updateLead(lead.id, { status })} className={`px-3 py-1 text-xs ${lead.status === status ? 'bg-[#25302c] text-white' : 'bg-[#ebe5da] text-[#6c756e]'}`}>{status}</button>)}</div></article>)}</div></section>;
}

function ContentTab({ content, setField, updateCollection, updateProject, uploadImage, publish }: { content: PublicSiteContent; setField: <K extends keyof PublicSiteContent>(key: K, value: PublicSiteContent[K]) => void; updateCollection: (index: number, patch: Partial<PublicSiteContent['collections'][number]>) => void; updateProject: (index: number, patch: Partial<PublicSiteContent['projects'][number]>) => void; uploadImage: (event: ChangeEvent<HTMLInputElement>, onUploaded: (url: string) => PublicSiteContent) => Promise<void>; publish: (next?: PublicSiteContent) => Promise<void> }) {
  const [imageNames, setImageNames] = useState<Record<string, string>>({});
  const text = (label: string, value: string, onChange: (value: string) => void, area = false) => <label className="block text-xs font-bold uppercase tracking-wider text-[#6c756e]">{label}{area ? <textarea className={fieldClass} rows={3} value={value} onChange={event => onChange(event.target.value)} /> : <input className={fieldClass} value={value} onChange={event => onChange(event.target.value)} />}</label>;
  const image = (label: string, value: string, onUploaded: (url: string) => PublicSiteContent, identity: string) => (
    <div>
      <label className="block text-xs font-bold uppercase tracking-wider text-[#6c756e] mb-1">{label}</label>
      {value ? (
        <div className="flex items-center gap-3 rounded-lg border border-[#d8d4ca] bg-[#faf8f5] p-2 mb-2">
          <img src={normalizeImageUrl(value)} alt={label} className="h-12 w-12 rounded object-cover border border-[#e5e0d8]" onError={e => { e.currentTarget.style.display = 'none'; }} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-[#25302c]">{imageNames[identity] || 'Saved in Google Drive'}</p>
            <a href={normalizeImageUrl(value)} target="_blank" rel="noreferrer" className="truncate text-[11px] text-[#c8714d] underline block">View direct image ↗</a>
          </div>
        </div>
      ) : (
        <input className={fieldClass} value={imageNames[identity] || 'No image selected'} readOnly />
      )}
      <label className="mt-1 inline-flex cursor-pointer items-center gap-2 rounded border border-[#c8714d] px-3 py-1.5 text-xs font-bold uppercase text-[#c8714d] hover:bg-[#c8714d] hover:text-white transition-colors">
        <Upload size={14} /> {value ? 'Change image' : 'Choose local image'}
        <input className="hidden" type="file" accept="image/*" onChange={event => { const fileName = event.target.files?.[0]?.name; if (fileName) setImageNames(previous => ({ ...previous, [identity]: fileName })); void uploadImage(event, onUploaded); }} />
      </label>
    </div>
  );

  return <section className="space-y-6"><div><h2 className="font-serif text-3xl">Page content</h2><p className="text-sm text-[#6c756e]">Every image upload is stored in your Google Drive folder.</p></div><div className="grid gap-4 bg-white p-5 sm:grid-cols-2">{text('Hero eyebrow', content.heroEyebrow, value => setField('heroEyebrow', value))}{text('Hero title', content.heroTitle, value => setField('heroTitle', value))}{text('Hero emphasis', content.heroEmphasis, value => setField('heroEmphasis', value))}{text('Hero intro', content.heroIntro, value => setField('heroIntro', value), true)}<div className="sm:col-span-2"><h3 className="mb-3 font-serif text-2xl">Hero slideshow</h3><div className="grid gap-4 sm:grid-cols-3">{content.heroImages.map((imageUrl, index) => <div key={`hero-slide-${index}`} className="rounded-lg border border-[#eeeae2] bg-[#faf8f5] p-3">{image(`Slide ${index + 1}`, imageUrl, url => { const next = { ...content, heroImages: content.heroImages.map((item, itemIndex) => itemIndex === index ? url : item) }; setField('heroImages', next.heroImages); return next; }, `hero-slide-${index}`)}<button onClick={() => { const next = { ...content, heroImages: content.heroImages.filter((_, itemIndex) => itemIndex !== index) }; setField('heroImages', next.heroImages); void publish(next); }} className="mt-3 flex items-center gap-1 text-xs text-[#c8714d]"><Trash2 size={14} /> Remove slide</button></div>)}</div><button onClick={() => { const next = { ...content, heroImages: [...content.heroImages, ''] }; setField('heroImages', next.heroImages); void publish(next); }} className="mt-4 flex items-center gap-1 bg-[#25302c] px-3 py-2 text-xs font-bold uppercase text-white"><Plus size={14} /> Add slide</button></div></div><div className="bg-white p-5"><div className="mb-4 flex justify-between"><h3 className="font-serif text-2xl">Collections</h3><button onClick={() => { const next = { ...content, collections: [...content.collections, { id: `collection-${Date.now()}`, number: String(content.collections.length + 1).padStart(2, '0'), title: 'New collection', copy: '', image: '' }] }; setField('collections', next.collections); void publish(next); }} className="flex items-center gap-1 bg-[#25302c] px-3 py-2 text-xs font-bold uppercase text-white"><Plus size={14} /> Add</button></div>{content.collections.map((item, index) => <div className="grid gap-3 border-t border-[#eeeae2] py-4 sm:grid-cols-2" key={item.id}>{text('Title', item.title, value => updateCollection(index, { title: value }))}{image('Image', item.image, url => { const nextCollections = content.collections.map((c, i) => i === index ? { ...c, image: url } : c); const next = { ...content, collections: nextCollections }; setField('collections', next.collections); return next; }, `collection-${item.id}`)}{text('Description', item.copy, value => updateCollection(index, { copy: value }), true)}<button onClick={() => { const next = { ...content, collections: content.collections.filter(row => row.id !== item.id) }; setField('collections', next.collections); void publish(next); }} className="flex items-center gap-1 text-xs text-[#c8714d]"><Trash2 size={14} /> Delete collection</button></div>)}</div><div className="bg-white p-5"><h3 className="mb-3 font-serif text-2xl">Our approach / Story section</h3><div className="grid gap-4 sm:grid-cols-2">{text('Story eyebrow', content.storyEyebrow, value => setField('storyEyebrow', value))}{text('Story heading', content.storyHeading, value => setField('storyHeading', value))}{text('Story emphasis', content.storyEmphasis, value => setField('storyEmphasis', value))}{image('Story image', content.storyImage, url => { const next = { ...content, storyImage: url }; setField('storyImage', url); return next; }, 'story-image')}<div className="sm:col-span-2">{text('Story body text', content.storyBody, value => setField('storyBody', value), true)}</div></div></div><div className="bg-white p-5"><div className="mb-4 flex justify-between"><h3 className="font-serif text-2xl">Inspiration images</h3><button onClick={() => { const next = { ...content, projects: [...content.projects, { id: `project-${Date.now()}`, title: 'New project', type: 'Chennai', image: '' }] }; setField('projects', next.projects); void publish(next); }} className="flex items-center gap-1 bg-[#25302c] px-3 py-2 text-xs font-bold uppercase text-white"><Plus size={14} /> Add</button></div><div className="grid gap-4 sm:grid-cols-2">{content.projects.map((item, index) => <div className="border-t border-[#eeeae2] pt-4" key={item.id}>{text('Title', item.title, value => updateProject(index, { title: value }))}{text('Label', item.type, value => updateProject(index, { type: value }))}{image('Image', item.image, url => { const nextProjects = content.projects.map((p, i) => i === index ? { ...p, image: url } : p); const next = { ...content, projects: nextProjects }; setField('projects', next.projects); return next; }, `project-${item.id}`)}<button onClick={() => { const next = { ...content, projects: content.projects.filter(row => row.id !== item.id) }; setField('projects', next.projects); void publish(next); }} className="mt-2 flex items-center gap-1 text-xs text-[#c8714d]"><Trash2 size={14} /> Delete image</button></div>)}</div></div></section>;
}

function SettingsTab({ content, setField }: { content: PublicSiteContent; setField: <K extends keyof PublicSiteContent>(key: K, value: PublicSiteContent[K]) => void }) {
  return <section className="space-y-6"><div><h2 className="font-serif text-3xl">Site settings</h2><p className="text-sm text-[#6c756e]">These settings are also stored in the Content sheet.</p></div><div className="grid gap-4 bg-white p-5"><label className="text-xs font-bold uppercase tracking-wider text-[#6c756e]">Mobile number<input className={fieldClass} placeholder="+91 9XXXXXXXXX" value={content.contactPhone} onChange={event => setField('contactPhone', event.target.value)} /></label><label className="text-xs font-bold uppercase tracking-wider text-[#6c756e]">Instagram URL<input className={fieldClass} value={content.instagramUrl} onChange={event => setField('instagramUrl', event.target.value)} /></label><label className="text-xs font-bold uppercase tracking-wider text-[#6c756e]">Address<textarea className={fieldClass} rows={3} value={content.address} onChange={event => setField('address', event.target.value)} /></label></div><div className="bg-white p-5"><h3 className="mb-3 font-serif text-2xl">Visual effects</h3>{Object.entries({ revealOnScroll: 'Reveal sections as visitors scroll', imageHoverZoom: 'Subtle image hover zoom', floatingAccent: 'Floating decorative accent' }).map(([key, label]) => <label className="flex items-center gap-3 border-b border-[#eeeae2] py-3 text-sm" key={key}><input type="checkbox" checked={content.effects[key as keyof PublicSiteContent['effects']]} onChange={event => setField('effects', { ...content.effects, [key]: event.target.checked })} />{label}</label>)}</div></section>;
}

