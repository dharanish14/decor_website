const fs = require('fs');
let css = fs.readFileSync('src/app/globals.css', 'utf8');

css = css.replace(
  /\.site-header \{ align-items: center; display: flex; justify-content: space-between; margin: auto; max-width: 1440px; padding: 26px 5vw; position: relative; z-index: 5; \}/,
  `.site-header { align-items: center; display: flex; justify-content: space-between; margin: auto; max-width: 1440px; padding: 26px 5vw; position: relative; z-index: 500; }`
);

fs.writeFileSync('src/app/globals.css', css);
console.log('Fixed site-header z-index stacking context problem!');
