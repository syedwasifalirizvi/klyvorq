import fs from 'fs';
import path from 'path';

const faviconSnippet = `  <!-- Favicons -->
  <link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml">
  <link rel="alternate icon" href="/assets/img/favicon.ico">
  <link rel="apple-touch-icon" href="/assets/img/apple-touch-icon.png">

  <link rel="stylesheet" href="/assets/css/main.css">`;

function walk(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file === 'node_modules' || file.startsWith('.')) continue;
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath, fileList);
    } else if (file.endsWith('.html')) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

const allHtml = walk('.');
let updated = 0;

for (const htmlFile of allHtml) {
  let content = fs.readFileSync(htmlFile, 'utf8');
  if (!content.includes('rel="icon"')) {
    if (content.includes('<link rel="stylesheet" href="/assets/css/main.css">')) {
      content = content.replace('<link rel="stylesheet" href="/assets/css/main.css">', faviconSnippet);
      fs.writeFileSync(htmlFile, content, 'utf8');
      updated++;
      console.log('✓ Added favicon to:', htmlFile);
    } else {
      console.warn('⚠ Could not find main.css in:', htmlFile);
    }
  } else {
    console.log('✓ Already has favicon:', htmlFile);
  }
}

console.log(`\nUpdated ${updated} HTML files. Total HTML files: ${allHtml.length}`);
