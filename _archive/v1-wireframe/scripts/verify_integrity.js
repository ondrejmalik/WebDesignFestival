const fs = require('fs');
const path = require('path');

const files = [
  'index.html', 'program.html', 'artists.html', 'artist-detail.html',
  'stages.html', 'practical-info.html', 'my-schedule.html', 'search.html'
];

let issues = 0;

files.forEach(f => {
  if (!fs.existsSync(f)) {
    console.error('Missing file:', f);
    issues++;
    return;
  }
  const html = fs.readFileSync(f, 'utf8');
  
  // Check title
  if (!html.includes('<title>') || !html.includes('</title>')) {
    console.error(f + ' is missing <title>');
    issues++;
  }
  
  // Check meta description
  if (!html.includes('name="description"')) {
    console.error(f + ' is missing meta description');
    issues++;
  }
  
  // Check viewport
  if (!html.includes('name="viewport"')) {
    console.error(f + ' is missing meta viewport');
    issues++;
  }
  
  // Check CSS links
  const cssRegex = /<link[^>]+href=["']([^"']+)["']/g;
  let m;
  while ((m = cssRegex.exec(html)) !== null) {
    const href = m[1].split('?')[0].split('#')[0];
    if (!href.startsWith('http') && !fs.existsSync(href)) {
      console.error(f + ' has broken CSS link: ' + href);
      issues++;
    }
  }

  // Check script src
  const jsRegex = /<script[^>]+src=["']([^"']+)["']/g;
  while ((m = jsRegex.exec(html)) !== null) {
    const src = m[1].split('?')[0].split('#')[0];
    if (!src.startsWith('http') && !fs.existsSync(src)) {
      console.error(f + ' has broken script src: ' + src);
      issues++;
    }
  }

  // Check internal hrefs
  const linkRegex = /<a[^>]+href=["']([^"']+)["']/g;
  while ((m = linkRegex.exec(html)) !== null) {
    const href = m[1].split('?')[0].split('#')[0];
    if (href && !href.startsWith('http') && !href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('tel:') && !href.startsWith('javascript:')) {
      if (!fs.existsSync(href)) {
        console.error(f + ' has broken link to: ' + href);
        issues++;
      }
    }
  }
});

// Also check web/ folder
console.log('--- Checking web/ folder ---');
files.forEach(f => {
  const webFile = path.join('web', f);
  if (!fs.existsSync(webFile)) {
    console.error('Missing file in web/:', webFile);
    issues++;
    return;
  }
  const html = fs.readFileSync(webFile, 'utf8');
  
  const cssRegex = /<link[^>]+href=["']([^"']+)["']/g;
  let m;
  while ((m = cssRegex.exec(html)) !== null) {
    const href = m[1].split('?')[0].split('#')[0];
    const resolvedPath = path.join('web', href);
    if (!href.startsWith('http') && !fs.existsSync(resolvedPath)) {
      console.error(webFile + ' has broken CSS link: ' + resolvedPath);
      issues++;
    }
  }

  const jsRegex = /<script[^>]+src=["']([^"']+)["']/g;
  while ((m = jsRegex.exec(html)) !== null) {
    const src = m[1].split('?')[0].split('#')[0];
    const resolvedPath = path.join('web', src);
    if (!src.startsWith('http') && !fs.existsSync(resolvedPath)) {
      console.error(webFile + ' has broken script src: ' + resolvedPath);
      issues++;
    }
  }
});

if (issues === 0) {
  console.log('PASS: All files in root and web/ have valid title, meta, scripts, CSS, and internal links!');
} else {
  console.log('FAILED with ' + issues + ' issues.');
  process.exit(1);
}
