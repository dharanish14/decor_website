const fs = require('fs');

const files = ['src/app/page.tsx', 'src/app/kitchen/page.tsx', 'src/app/bedroom/page.tsx', 'src/app/living-room/page.tsx', 'src/app/dining/page.tsx'];

files.forEach(f => {
  let text = fs.readFileSync(f, 'utf8');
  
  // Replace header logo style
  text = text.replace(
    /<img src="\/logo\.png" alt="Elshadai Decors" style=\{\{ height: '40px', width: 'auto' \}\} \/>/g,
    `<img src="/logo.png" alt="Elshadai Decors" style={{ height: '140px', width: 'auto', margin: '-50px -10px' }} />`
  );

  fs.writeFileSync(f, text);
});

console.log("Updated logo size across all pages");
