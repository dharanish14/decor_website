const fs = require('fs');

const files = ['src/app/page.tsx', 'src/app/kitchen/page.tsx', 'src/app/bedroom/page.tsx', 'src/app/living-room/page.tsx', 'src/app/dining/page.tsx'];

files.forEach(f => {
  let text = fs.readFileSync(f, 'utf8');
  
  // Replace the old text logo in the footer
  text = text.replace(
    /<div className="footer-brand">[\s\S]*?<\/div><p>/,
    `<div className="footer-brand"><img src="/logo.png" alt="Elshadai Decors" style={{ height: '40px', width: 'auto' }} /></div><p>`
  );

  fs.writeFileSync(f, text);
});

console.log("Updated footer brand logo across all pages");
