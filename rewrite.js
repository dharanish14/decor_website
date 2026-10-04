const fs = require('fs');
const path = 'D:/projects/manova/src/components/AdminCMS.tsx';
let content = fs.readFileSync(path, 'utf8');

const newContentTab = `function ContentTab({ content, setField, updateCollection, updateProject, uploadImage, publish }: { content: PublicSiteContent; setField: <K extends keyof PublicSiteContent>(key: K, value: PublicSiteContent[K]) => void; updateCollection: (index: number, patch: Partial<PublicSiteContent['collections'][number]>) => void; updateProject: (index: number, patch: Partial<PublicSiteContent['projects'][number]>) => void; uploadImage: (event: ChangeEvent<HTMLInputElement>, onUploaded: (url: string) => PublicSiteContent) => Promise<void>; publish: (next?: PublicSiteContent) => Promise<void> }) {
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
            const nextArr = [...collection, { id: \`\${key}-\${Date.now()}\`, ...defaultItem }];
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
              }, \`edit-\${editingItem.data.id}\`)}
              
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
    </section>
  );
}`;

const startIndex = content.indexOf('function ContentTab(');
const endIndex = content.indexOf('function SettingsTab(');
if (startIndex !== -1 && endIndex !== -1) {
  content = content.substring(0, startIndex) + newContentTab + '\\n\\n' + content.substring(endIndex);
  fs.writeFileSync(path, content, 'utf8');
  console.log('Successfully replaced ContentTab');
} else {
  console.error('Could not find functions to replace');
}
