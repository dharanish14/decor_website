const fs = require('fs');
const base64 = fs.readFileSync('public/logo.png', 'base64');
const dataUri = 'data:image/png;base64,' + base64;

let page = fs.readFileSync('src/app/admin/estimate/page.tsx', 'utf8');

// Replace the fake text logo with the actual image
const pdfLogoLogic = `
    // Top Right (Company & Logo)
    const rightX = 195;
    
    // Logo Image
    doc.addImage('${dataUri}', 'PNG', rightX - 50, 15, 50, 15);
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
`;

page = page.replace(/\/\/ Top Right \(Company & Logo\)[\s\S]*?doc\.setFontSize\(8\);\s*doc\.setFont\('helvetica', 'normal'\);/, pdfLogoLogic);

fs.writeFileSync('src/app/admin/estimate/page.tsx', page);
console.log('PDF updated with logo image.');
