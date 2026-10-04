const fs = require('fs');

let css = fs.readFileSync('src/app/globals.css', 'utf8');

// Ensure absolute brute-force styling on the mobile menu links
css = css.replace(
  /\.main-nav a \{ border-bottom: 1px solid var\(--line\); padding: 15px 0; color: var\(--ink\); background: var\(--paper\); \}/,
  `.main-nav a { display: block; border-bottom: 1px solid var(--line); padding: 15px 20px; color: #111 !important; font-weight: bold; font-size: 16px; background: var(--paper); }`
);

css = css.replace(
  /\.main-nav \{ background: var\(--paper\); border-bottom: 1px solid var\(--line\); display: none; flex-direction: column; gap: 0; left: 0; margin: 0; padding: 20px 6vw; position: absolute; right: 0; top: 82px; \}/,
  `.main-nav { background: var(--paper) !important; border-bottom: 1px solid var(--line); display: none; flex-direction: column; gap: 0; left: 0; margin: 0; padding: 0; position: absolute; right: 0; top: 82px; z-index: 999; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }`
);

fs.writeFileSync('src/app/globals.css', css);
console.log('Fixed mobile menu styles.');
