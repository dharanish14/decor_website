'use client';

import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { Check, Download, ImagePlus, Lock, LogOut, Plus, Save, Settings, ShieldAlert, Trash2, Unlock, Upload, UserRound } from 'lucide-react';
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
          if (merged.heroTitle === 'Connection test') {
            merged.heroTitle = INITIAL_PUBLIC_CONTENT.heroTitle;
            merged.heroEmphasis = INITIAL_PUBLIC_CONTENT.heroEmphasis;
          }
          const savedUser = merged.adminUsername || localStorage.getItem('elshadai_admin_username') || 'admin@elshadai';
          const savedPass = merged.adminPassword || localStorage.getItem('elshadai_admin_password') || 'change-me-now';
          merged.adminUsername = savedUser;
          merged.adminPassword = savedPass;

          setContent(merged);
          localStorage.setItem('elshadai_public_content', JSON.stringify(merged));
          localStorage.setItem('elshadai_admin_username', savedUser);
          localStorage.setItem('elshadai_admin_password', savedPass);
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
      if (targetContent.adminUsername) localStorage.setItem('elshadai_admin_username', targetContent.adminUsername);
      if (targetContent.adminPassword) localStorage.setItem('elshadai_admin_password', targetContent.adminPassword);

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
    const validUsername = content.adminUsername || localStorage.getItem('elshadai_admin_username') || 'admin@elshadai';
    const validPassword = content.adminPassword || localStorage.getItem('elshadai_admin_password') || 'change-me-now';

    if (username === validUsername && password === validPassword) {
      sessionStorage.setItem('elshadai_admin_authed', 'true');
      setAuthenticated(true);
    } else {
      setLoginError('Invalid login username or password.');
    }
  }

  if (!authenticated) return (
    <main className="admin-login">
      <div className="admin-login-art">
        <div className="admin-login-art-copy">
          <span className="admin-kicker">ELSHADAI / PRIVATE STUDIO</span>
          <h1>Make every<br /><em>room matter.</em></h1>
          <p>Shape the public experience, keep your collection fresh, and follow every enquiry from one quiet control room.</p>
          <div className="admin-login-rule" />
        </div>
      </div>
      <form onSubmit={login} className="admin-login-form">
        <div className="admin-login-badge"><Settings size={20} /></div>
        <span className="admin-kicker">WELCOME BACK</span>
        <h2>Control room</h2>
        <p className="admin-login-subtitle">Manage your website, content, images, and enquiries.</p>
        {loginError && <p className="admin-login-error">{loginError}</p>}
        <label>Username<input className={fieldClass} placeholder="admin@elshadai" value={username} onChange={event => setUsername(event.target.value)} required /></label>
        <label>Password<input className={fieldClass} type="password" placeholder="Your password" value={password} onChange={event => setPassword(event.target.value)} required /></label>
        <button className="admin-login-submit">Open admin panel <span>↗</span></button>
        <small>Private workspace · Google Sheets + Drive connected</small>
      </form>
    </main>
  );

  return (
    <main className="min-h-screen bg-[#f5f2ec] p-4 text-[#25302c] sm:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.2em] text-[#c8714d]">ELSHADAI DECORS</p>
            <h1 className="font-serif text-4xl">Control room</h1>
            <p className="mt-1 text-sm text-[#6c756e]">{scriptReady ? 'Connected to Google Sheets and Google Drive' : 'Connect the Apps Script URL before publishing'}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => void publish()} className="flex items-center gap-2 bg-[#25302c] px-4 py-2.5 text-xs font-bold uppercase text-white"><Save size={15} /> Save & Publish</button>
            <button onClick={() => { sessionStorage.removeItem('elshadai_admin_authed'); setAuthenticated(false); }} className="flex items-center gap-2 border border-[#d8d4ca] px-4 py-2.5 text-xs font-bold uppercase"><LogOut size={15} /> Log out</button>
          </div>
        </header>
        {notice && <div className="fixed right-5 top-5 z-50 flex items-center gap-2 bg-[#25302c] px-4 py-3 text-sm text-white shadow-xl"><Check size={16} /> {notice}</div>}
        <nav className="mb-7 flex gap-2 overflow-auto border-b border-[#d8d4ca] pb-3">
          {([['leads', 'Enquiries', UserRound], ['content', 'Page content', ImagePlus], ['settings', 'Settings & Security', Settings]] as const).map(([key, label, Icon]) => (
            <button key={key} onClick={() => setTab(key)} className={`flex items-center gap-2 whitespace-nowrap px-4 py-2 text-xs font-bold uppercase tracking-wider ${tab === key ? 'bg-[#25302c] text-white' : 'bg-white text-[#6c756e]'}`}>
              <Icon size={15} /> {label}{key === 'leads' ? ` (${leads.length})` : ''}
            </button>
          ))}
        </nav>
        {tab === 'leads' && <LeadsTab leads={leads} updateLead={updateLead} deleteLead={deleteLead} notify={notify} />}
        {tab === 'content' && <ContentTab content={content} setField={setField} updateCollection={updateCollection} updateProject={updateProject} uploadImage={uploadImage} publish={publish} />}
        {tab === 'settings' && <SettingsTab content={content} setField={setField} />}
      </div>
    </main>
  );
}

function ProtectedSection({ title, description, currentPassword, children }: { title: string; description: string; currentPassword: string; children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState(false);
  const [passInput, setPassInput] = useState('');
  const [error, setError] = useState('');

  const handleUnlock = (e: FormEvent) => {
    e.preventDefault();
    if (passInput === currentPassword) {
      setUnlocked(true);
      setError('');
      setPassInput('');
    } else {
      setError('Incorrect current password. Access denied.');
    }
  };

  return (
    <div className="bg-white p-5 border-l-4 border-[#c8714d] shadow-sm rounded-lg">
      <div className="flex items-center justify-between gap-3 mb-1">
        <h3 className="font-serif text-2xl text-[#25302c] flex items-center gap-2">
          {title}
        </h3>
        {unlocked && (
          <button type="button" onClick={() => setUnlocked(false)} className="flex items-center gap-1 text-xs bg-[#ebe5da] hover:bg-[#d8d4ca] px-3 py-1 text-[#25302c] font-bold uppercase tracking-wider rounded">
            <Lock size={13} /> Lock Section
          </button>
        )}
      </div>
      <p className="mb-4 text-xs text-[#6c756e]">{description}</p>

      {!unlocked ? (
        <form onSubmit={handleUnlock} className="bg-[#faf8f5] p-4 rounded-lg border border-[#e5e0d8] space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase text-[#c8714d]">
            <ShieldAlert size={16} /> Security Password Verification Required
          </div>
          <p className="text-xs text-[#6c756e]">
            Enter your current Admin Password to edit these sensitive settings.
          </p>
          {error && <p className="text-xs text-red-600 font-bold">{error}</p>}
          <div className="flex gap-2 max-w-md">
            <input type="password" className={fieldClass} placeholder="Enter current admin password" value={passInput} onChange={e => setPassInput(e.target.value)} required />
            <button type="submit" className="bg-[#25302c] text-white text-xs px-4 py-2 font-bold uppercase whitespace-nowrap flex items-center gap-1 rounded-lg">
              <Unlock size={14} /> Unlock
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="bg-[#f0f9ff] border border-[#b9e6fe] p-2.5 text-xs text-[#026aa2] rounded flex items-center gap-2">
            <Check size={15} /> Section unlocked for editing. Click <b>"Save & Publish"</b> above when done.
          </div>
          {children}
        </div>
      )}
    </div>
  );
}

function LeadsTab({ leads, updateLead, deleteLead, notify }: { leads: LeadSubmission[]; updateLead: (id: string, patch: Partial<LeadSubmission>) => Promise<void>; deleteLead: (id: string) => Promise<void>; notify: (message: string) => void }) {
  return (
    <section>
      <div className="mb-5 flex flex-wrap justify-between gap-3">
        <div>
          <h2 className="font-serif text-3xl">Customer enquiries</h2>
          <p className="text-sm text-[#6c756e]">Stored in Google Sheets and available from any device.</p>
        </div>
        <button onClick={() => { exportLeadsToExcel(leads); notify('Excel file downloaded'); }} className="flex items-center gap-2 bg-[#c8714d] px-3 py-2 text-xs font-bold uppercase text-white"><Download size={14} /> Excel</button>
      </div>
      <div className="grid gap-4">
        {leads.length === 0 ? <div className="bg-white p-8 text-center text-sm text-[#6c756e]">No enquiries yet.</div> : leads.map(lead => (
          <article key={lead.id} className="bg-white p-5 shadow-sm">
            <div className="flex justify-between gap-3">
              <div>
                <h3 className="font-serif text-2xl">{lead.name}</h3>
                <p className="text-sm text-[#6c756e]">{lead.email} · {lead.phone}</p>
              </div>
              <button onClick={() => deleteLead(lead.id)} className="text-[#c8714d]" aria-label={`Delete ${lead.name}`}><Trash2 size={18} /></button>
            </div>
            <p className="mt-4 text-sm"><b>{lead.serviceType}</b> · {lead.message || 'No additional details.'}</p>
            <div className="mt-4 flex flex-wrap gap-2 border-t border-[#eeeae2] pt-3">
              {(['Pending', 'Contacted', 'Quoted', 'Completed'] as LeadSubmission['status'][]).map(status => (
                <button key={status} onClick={() => updateLead(lead.id, { status })} className={`px-3 py-1 text-xs ${lead.status === status ? 'bg-[#25302c] text-white' : 'bg-[#ebe5da] text-[#6c756e]'}`}>{status}</button>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ContentTab({ content, setField, updateCollection, updateProject, uploadImage, publish }: { content: PublicSiteContent; setField: <K extends keyof PublicSiteContent>(key: K, value: PublicSiteContent[K]) => void; updateCollection: (index: number, patch: Partial<PublicSiteContent['collections'][number]>) => void; updateProject: (index: number, patch: Partial<PublicSiteContent['projects'][number]>) => void; uploadImage: (event: ChangeEvent<HTMLInputElement>, onUploaded: (url: string) => PublicSiteContent) => Promise<void>; publish: (next?: PublicSiteContent) => Promise<void> }) {
  const [imageNames, setImageNames] = useState<Record<string, string>>({});
  const [editingItem, setEditingItem] = useState<{ key: string, index: number, data: any } | null>(null);

  const text = (label: string, value: string, onChange: (value: string) => void, area = false) => <label className="block text-xs font-bold uppercase tracking-wider text-[#6c756e]">{label}{area ? <textarea className={fieldClass} rows={3} value={value} onChange={event => onChange(event.target.value)} /> : <input className={fieldClass} value={value} onChange={event => onChange(event.target.value)} />}</label>;
  
  const image = (label: string, value: string, onUploaded: (url: string) => PublicSiteContent, identity: string) => (
    <div>
      <label className="block text-xs font-bold uppercase tracking-wider text-[#6c756e] mb-1">{label}</label>
      {value ? (
        <div className="flex items-center gap-3 rounded-lg border border-[#d8d4ca] bg-[#faf8f5] p-2 mb-2">
          <img src={normalizeImageUrl(value)} alt={label} className="h-12 w-12 rounded object-cover border border-[#e5e0d8]" onError={e => { e.currentTarget.style.display = 'none'; }} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-[#25302c]">{imageNames[identity] || 'Saved in Google Drive'}</p>
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

  const renderList = (key: keyof PublicSiteContent, title: string, subtitle?: string, defaultItem: any = {}) => {
    const collection = (content[key] as any[]) || [];
    return (
      <div className="bg-white p-5 mt-6 rounded shadow-sm border border-[#eeeae2]">
        <div className="mb-4 flex justify-between items-center">
          <div>
            <h3 className="font-serif text-2xl">{title}</h3>
            {subtitle && <p className="text-sm text-[#6c756e]">{subtitle}</p>}
          </div>
          <button onClick={() => {
            const nextArr = [...collection, { id: `${key}-${Date.now()}`, ...defaultItem }];
            setField(key, nextArr as any);
          }} className="flex items-center gap-1 bg-[#25302c] px-3 py-2 text-xs font-bold uppercase text-white rounded"><Plus size={14} /> Add New</button>
        </div>
        <div className="grid gap-2">
          {collection.map((item: any, index: number) => (
            <div key={item.id} className="flex items-center justify-between border border-[#d8d4ca] p-3 rounded bg-[#faf8f5]">
              <div className="flex items-center gap-3">
                {item.image && <img src={normalizeImageUrl(item.image)} className="w-10 h-10 object-cover rounded" />}
                <span className="font-bold text-sm">{item.title || item.type || 'Unnamed Item'}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditingItem({ key, index, data: JSON.parse(JSON.stringify(item)) })} className="text-xs px-3 py-1 bg-white border border-[#d8d4ca] rounded font-bold uppercase text-[#25302c] hover:bg-[#eeeae2]">Edit</button>
                <button onClick={() => {
                  const arr = collection.filter((row: any) => row.id !== item.id);
                  setField(key, arr as any);
                  void publish({ ...content, [key]: arr });
                }} className="text-xs px-3 py-1 bg-[#f8e4df] text-[#9d442d] rounded font-bold uppercase hover:bg-[#f1c3b8]">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <section className="space-y-6">
      {editingItem && (
        <div className="cms-modal-overlay">
          <div className="cms-modal">
            <h3 className="font-serif text-2xl mb-4 text-[#25302c]">Edit Item</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {editingItem.data.title !== undefined && text('Title', editingItem.data.title, val => setEditingItem({ ...editingItem, data: { ...editingItem.data, title: val } }))}
              {editingItem.data.badge !== undefined && text('Badge', editingItem.data.badge, val => setEditingItem({ ...editingItem, data: { ...editingItem.data, badge: val } }))}
              
              {editingItem.data.image !== undefined && image('Image', editingItem.data.image, url => { 
                setEditingItem({ ...editingItem, data: { ...editingItem.data, image: url } }); 
                return content; // Doesn't publish immediately for modals
              }, `edit-${editingItem.data.id}`)}
              
              {editingItem.data.link !== undefined && text('Link URL', editingItem.data.link, val => setEditingItem({ ...editingItem, data: { ...editingItem.data, link: val } }))}
              {editingItem.data.oldPrice !== undefined && text('Old Price', editingItem.data.oldPrice, val => setEditingItem({ ...editingItem, data: { ...editingItem.data, oldPrice: val } }))}
              {editingItem.data.newPrice !== undefined && text('New Price', editingItem.data.newPrice, val => setEditingItem({ ...editingItem, data: { ...editingItem.data, newPrice: val } }))}
              
              {editingItem.data.copy !== undefined && <div className="sm:col-span-2">{text('Description', editingItem.data.copy, val => setEditingItem({ ...editingItem, data: { ...editingItem.data, copy: val } }), true)}</div>}
              
              {editingItem.data.features !== undefined && <div className="sm:col-span-2">
                {text('Features (comma separated)', (editingItem.data.features || []).join(', '), val => setEditingItem({ ...editingItem, data: { ...editingItem.data, features: val.split(',').map(s => s.trim()).filter(Boolean) } }), true)}
              </div>}
            </div>
            <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-[#eeeae2]">
              <button onClick={() => setEditingItem(null)} className="px-4 py-2 text-xs font-bold uppercase text-[#6c756e] border border-[#d8d4ca] rounded hover:bg-[#eeeae2]">Cancel</button>
              <button onClick={() => {
                const arr = [...(content[editingItem.key as keyof PublicSiteContent] as any[])];
                arr[editingItem.index] = editingItem.data;
                const nextContent = { ...content, [editingItem.key]: arr };
                setField(editingItem.key as any, arr as any);
                setEditingItem(null);
                void publish(nextContent);
              }} className="px-4 py-2 text-xs font-bold uppercase text-white bg-[#c8714d] rounded hover:bg-[#b05d3a]">Save & Push</button>
            </div>
          </div>
        </div>
      )}

      <div>
        <h2 className="font-serif text-3xl">Page content</h2>
        <p className="text-sm text-[#6c756e]">Manage all sections of your website. Lists are now managed via clean popups.</p>
      </div>

      <div className="grid gap-4 bg-white p-5 sm:grid-cols-2 rounded shadow-sm border border-[#eeeae2]">
        {text('Hero eyebrow', content.heroEyebrow, value => setField('heroEyebrow', value))}
        {text('Hero title', content.heroTitle, value => setField('heroTitle', value))}
        {text('Hero emphasis', content.heroEmphasis, value => setField('heroEmphasis', value))}
        {text('Hero intro', content.heroIntro, value => setField('heroIntro', value), true)}
      </div>

      {renderList('roomCategories', 'Homepage Room Categories', 'Edit the main navigation cards on the homepage.', { title: 'New Category', link: '/', image: '', copy: '' })}
      {renderList('packages', 'Special Offers (Packages)', 'Edit the 30% off packages shown on the homepage.', { title: 'New Package', badge: '-30%', oldPrice: '₹0', newPrice: '₹0', features: ['Feature 1'] })}
      
      {renderList('collections', 'Collections', 'Edit the main collections list.', { title: 'New Collection', copy: '', image: '', number: '01' })}
      
      {renderList('kitchenModels', 'Kitchen Models', 'Manage models for the Kitchen page.', { title: 'New Kitchen Model', copy: '', image: '' })}
      {renderList('bedroomModels', 'Bedroom Models', 'Manage models for the Bedroom page.', { title: 'New Bedroom Model', copy: '', image: '' })}
      {renderList('livingRoomModels', 'Living Room Models', 'Manage models for the Living Room page.', { title: 'New Living Room Model', copy: '', image: '' })}
      {renderList('diningModels', 'Dining Models', 'Manage models for the Dining page.', { title: 'New Dining Model', copy: '', image: '' })}
      
      {renderList('projects', 'Inspiration Projects', 'Projects displayed on the homepage.', { title: 'New Project', type: 'Category', image: '' })}

      <div className="bg-white p-5 rounded shadow-sm border border-[#eeeae2]">
        <h3 className="mb-3 font-serif text-2xl">Our approach / Story section</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {text('Story eyebrow', content.storyEyebrow, value => setField('storyEyebrow', value))}
          {text('Story heading', content.storyHeading, value => setField('storyHeading', value))}
          {text('Story emphasis', content.storyEmphasis, value => setField('storyEmphasis', value))}
          {image('Story image', content.storyImage, url => { const next = { ...content, storyImage: url }; setField('storyImage', url); return next; }, 'story-image')}
          <div className="sm:col-span-2">{text('Story body text', content.storyBody, value => setField('storyBody', value), true)}</div>
        </div>
      </div>

      <div className="bg-white p-5 rounded shadow-sm border border-[#eeeae2]">
        <h3 className="mb-2 font-serif text-2xl">Contact Form Settings</h3>
        <p className="mb-4 text-xs text-[#6c756e]">Customize the dropdown label and choices customers select on your enquiry form.</p>
        <div className="space-y-4">
          {text('Dropdown Question Label', content.formServiceLabel || '', value => setField('formServiceLabel', value))}
          {text('Dropdown Options (comma separated)', (content.formServiceOptions || []).join(', '), value => setField('formServiceOptions', value.split(',').map(s => s.trim()).filter(Boolean)), true)}
        </div>
      </div>
    </section>
  );
}

function SettingsTab({ content, setField }: { content: PublicSiteContent; setField: <K extends keyof PublicSiteContent>(key: K, value: PublicSiteContent[K]) => void }) {
  const text = (label: string, value: string, onChange: (value: string) => void, area = false, type = 'text') => (
    <label className="block text-xs font-bold uppercase tracking-wider text-[#6c756e]">
      {label}
      {area ? (
        <textarea className={fieldClass} rows={3} value={value} onChange={event => onChange(event.target.value)} />
      ) : (
        <input type={type} className={fieldClass} value={value} onChange={event => onChange(event.target.value)} />
      )}
    </label>
  );

  const currentPassword = content.adminPassword || (typeof window !== 'undefined' ? localStorage.getItem('elshadai_admin_password') : null) || 'change-me-now';

  return (
    <section className="space-y-6">
      <div>
        <h2 className="font-serif text-3xl">Site Settings & Security</h2>
        <p className="text-sm text-[#6c756e]">Manage your admin credentials, email alerts, and site details.</p>
      </div>

      <ProtectedSection
        title="🔑 Admin Credentials (Change Username & Password)"
        description="Update the username and password used to log in to this control room."
        currentPassword={currentPassword}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {text('Admin Login Username', content.adminUsername || 'admin@elshadai', value => setField('adminUsername', value))}
          {text('New Admin Login Password', content.adminPassword || 'change-me-now', value => setField('adminPassword', value), false, 'password')}
        </div>
      </ProtectedSection>

      <ProtectedSection
        title="🔔 Automated HTML Email Alert Settings"
        description="Enter your Resend API key OR Gmail App Password below to send automatic, formatted HTML emails whenever an enquiry is submitted."
        currentPassword={currentPassword}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {text('Alert Recipient Emails (Comma separated)', content.adminNotificationEmail || 'dharaanish@gmail.com, monovawebsite@gmail.com', value => setField('adminNotificationEmail', value))}
          {text('Resend API Key (re_...)', content.resendApiKey || '', value => setField('resendApiKey', value))}
          {text('Sender Gmail Address', content.smtpUser || 'monovawebsite@gmail.com', value => setField('smtpUser', value))}
          {text('Sender Gmail App Password (16 chars)', content.smtpPass || '', value => setField('smtpPass', value), false, 'password')}
        </div>
      </ProtectedSection>

      <div className="grid gap-4 bg-white p-5 rounded-lg shadow-sm">
        <h3 className="font-serif text-2xl">General Site Information</h3>
        {text('Contact Mobile Number (Website & WhatsApp)', content.contactPhone || '', value => setField('contactPhone', value))}
        {text('Instagram URL', content.instagramUrl, value => setField('instagramUrl', value))}
        {text('Address', content.address, value => setField('address', value), true)}
      </div>

      <div className="bg-white p-5 rounded-lg shadow-sm">
        <h3 className="mb-3 font-serif text-2xl">Visual effects</h3>
        {Object.entries({ revealOnScroll: 'Reveal sections as visitors scroll', imageHoverZoom: 'Subtle image hover zoom', floatingAccent: 'Floating decorative accent' }).map(([key, label]) => (
          <label className="flex items-center gap-3 border-b border-[#eeeae2] py-3 text-sm" key={key}>
            <input type="checkbox" checked={content.effects[key as keyof PublicSiteContent['effects']]} onChange={event => setField('effects', { ...content.effects, [key]: event.target.checked })} />
            {label}
          </label>
        ))}
      </div>
    </section>
  );
}
