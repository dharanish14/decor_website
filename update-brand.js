const fs = require('fs');

const files = ['src/app/page.tsx', 'src/app/kitchen/page.tsx', 'src/app/bedroom/page.tsx', 'src/app/living-room/page.tsx', 'src/app/dining/page.tsx'];

files.forEach(f => {
  let text = fs.readFileSync(f, 'utf8');
  
  // 1. Replace the text logo with the image logo
  text = text.replace(
    /<a href="\#top" className="brand".*?<\/span><\/a>/g,
    `<a href="/" className="brand" aria-label="Elshadai Decors home"><img src="/logo.png" alt="Elshadai Decors" style={{ height: '40px', width: 'auto' }} /></a>`
  );

  // 2. Update navigation to remove individual rooms and replace with relevant links
  text = text.replace(
    /<nav className=\{menuOpen \? 'main-nav is-open' : 'main-nav'\}>[\s\S]*?<\/nav>/,
    `<nav className={menuOpen ? 'main-nav is-open' : 'main-nav'}>\n            <a href="/">Home</a><a href="/#projects">Our Work</a><a href="/#packages" onClick={() => setMenuOpen(false)}>Packages</a><a href="/#contact" onClick={() => setMenuOpen(false)}>Contact</a>\n          </nav>`
  );

  fs.writeFileSync(f, text);
});

console.log("Updated brand logo and simplified navigation across all pages");
