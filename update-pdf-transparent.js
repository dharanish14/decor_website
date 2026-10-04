const fs = require('fs');
const base64 = fs.readFileSync('public/logo.png', 'base64');
const dataUri = 'data:image/png;base64,' + base64;

let page = fs.readFileSync('src/app/admin/estimate/page.tsx', 'utf8');

// The new logo is rectangular, so we change the aspect ratio back to width: 50, height: 15
page = page.replace(
  /doc\.addImage\('data:image\/png;base64,.*?','PNG', rightX - 25, 10, 25, 25\);/,
  `doc.addImage('${dataUri}', 'PNG', rightX - 50, 15, 50, 15);`
);

fs.writeFileSync('src/app/admin/estimate/page.tsx', page);
console.log('PDF updated with new transparent background logo and rectangular aspect ratio.');
