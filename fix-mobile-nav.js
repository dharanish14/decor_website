const fs = require('fs');

let css = fs.readFileSync('src/app/globals.css', 'utf8');

// Add color-scheme to root
css = css.replace(/:root \{/, `:root { color-scheme: light;`);

// Ensure mobile nav links have explicit contrast
css = css.replace(
  /\.main-nav a \{ border-bottom: 1px solid var\(--line\); padding: 15px 0; \}/,
  `.main-nav a { border-bottom: 1px solid var(--line); padding: 15px 0; color: var(--ink); background: var(--paper); }`
);

fs.writeFileSync('src/app/globals.css', css);
console.log('Fixed mobile styling contrast.');
