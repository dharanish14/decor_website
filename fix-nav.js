const fs = require('fs');

const files = ['src/app/page.tsx', 'src/app/kitchen/page.tsx', 'src/app/bedroom/page.tsx', 'src/app/living-room/page.tsx', 'src/app/dining/page.tsx'];

files.forEach(f => {
  let text = fs.readFileSync(f, 'utf8');
  
  // 1. Update navigation
  text = text.replace(
    /<nav className=\{menuOpen \? 'main-nav is-open' : 'main-nav'\}>[\s\S]*?<\/nav>/,
    `<nav className={menuOpen ? 'main-nav is-open' : 'main-nav'}>\n            <a href="/">Home</a><a href="/kitchen">Kitchen</a><a href="/bedroom">Bedroom</a><a href="/living-room">Living Room</a><a href="/dining">Dining</a><a href="/#packages" onClick={() => setMenuOpen(false)}>Packages</a><a href="/#contact" onClick={() => setMenuOpen(false)}>Contact</a>\n          </nav>`
  );

  // 2. Hide phone number on mobile
  text = text.replace(
    /\{content\.contactPhone && \(\s*<a href=\{`tel:\$\{content\.contactPhone\.replace\(\/\\s\/g, ''\)\}`\} className="flex items-center gap-1\.5 text-xs font-bold text-\[\#25302c\] hover:text-\[\#c8714d\] transition-colors" style=\{\{ textDecoration: 'none' \}\}>\s*<Phone size=\{14\} \/> \{content\.contactPhone\}\s*<\/a>\s*\)\}/g,
    `{content.contactPhone && (
              <a href={\`tel:\${content.contactPhone.replace(/\\s/g, '')}\`} className="flex items-center gap-1.5 text-xs font-bold text-[#25302c] hover:text-[#c8714d] transition-colors" style={{ textDecoration: 'none' }}>
                <Phone size={14} /> <span className="hidden sm:inline">{content.contactPhone}</span>
              </a>
            )}`
  );

  fs.writeFileSync(f, text);
});

console.log("Updated navigation and phone across all pages");
