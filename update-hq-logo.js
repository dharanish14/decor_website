const fs = require('fs');
const base64 = fs.readFileSync('public/logo.png', 'base64');
const dataUri = 'data:image/png;base64,' + base64;

let page = fs.readFileSync('src/app/admin/estimate/page.tsx', 'utf8');

// Replace the old base64 string with the new one
page = page.replace(/doc\.addImage\('data:image\/png;base64,.*?','PNG', rightX - 50, 15, 50, 15\);/, `doc.addImage('${dataUri}', 'PNG', rightX - 50, 15, 50, 15);`);

fs.writeFileSync('src/app/admin/estimate/page.tsx', page);
console.log('PDF updated with new high-quality logo.');
