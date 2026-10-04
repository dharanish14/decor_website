const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('./src/app', (filePath) => {
  if (!filePath.endsWith('.tsx')) return;
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace roomCategories images
  content = content.replace(
    /<img src=\{normalizeImageUrl\(cat\.image\) \|\| '([^']+)'\} alt=\{cat\.title \|\| '([^']+)'\} \/>/g,
    `<img src={normalizeImageUrl(cat.image) || '$1'} onError={(e) => { if (e.currentTarget.src !== '$1') e.currentTarget.src = '$1'; }} alt={cat.title || '$2'} />`
  );
  
  // Replace collections images
  content = content.replace(
    /<img src=\{normalizeImageUrl\(item\.image\) \|\| '([^']+)'\} alt=\{item\.title \|\| '([^']+)'\} \/>/g,
    `<img src={normalizeImageUrl(item.image) || '$1'} onError={(e) => { if (e.currentTarget.src !== '$1') e.currentTarget.src = '$1'; }} alt={item.title || '$2'} />`
  );
  
  // Replace projects images
  content = content.replace(
    /<img src=\{normalizeImageUrl\(project\.image\) \|\| '([^']+)'\} alt=\{project\.title \|\| '([^']+)'\} \/>/g,
    `<img src={normalizeImageUrl(project.image) || '$1'} onError={(e) => { if (e.currentTarget.src !== '$1') e.currentTarget.src = '$1'; }} alt={project.title || '$2'} />`
  );
  
  // Replace model images (kitchen, etc)
  content = content.replace(
    /<img src=\{normalizeImageUrl\(model\.image\) \|\| '([^']+)'\} alt=\{model\.title \|\| '([^']+)'\} \/>/g,
    `<img src={normalizeImageUrl(model.image) || '$1'} onError={(e) => { if (e.currentTarget.src !== '$1') e.currentTarget.src = '$1'; }} alt={model.title || '$2'} />`
  );

  fs.writeFileSync(filePath, content, 'utf8');
});

console.log('Images fixed');
