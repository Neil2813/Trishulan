const fs = require('fs');
const path = require('path');

const DIRECTORIES = [
  path.join(__dirname, '../frontend/src/app'),
  path.join(__dirname, '../frontend/src/components')
];

const EXCLUDE_DIRS = ['landing page'];

const REPLACEMENTS = [
  // Page backgrounds
  { regex: /bg-\[#FCFBF8\]/g, replacement: 'bg-bg' },
  // Text colors
  { regex: /text-\[#0A1629\]/g, replacement: 'text-ink' },
  { regex: /text-\[#EA580C\]/g, replacement: 'text-accent' },
  { regex: /text-slate-600/g, replacement: 'text-muted' },
  { regex: /text-slate-500/g, replacement: 'text-muted' },
  { regex: /text-slate-400/g, replacement: 'text-muted/70' },
  { regex: /text-gray-600/g, replacement: 'text-muted' },
  { regex: /text-gray-500/g, replacement: 'text-muted' },
  { regex: /text-gray-400/g, replacement: 'text-muted/70' },
  // Background colors
  { regex: /bg-\[#EA580C\]/g, replacement: 'bg-accent' },
  { regex: /bg-slate-50/g, replacement: 'bg-card' },
  { regex: /bg-slate-100/g, replacement: 'bg-line/30' },
  { regex: /bg-white/g, replacement: 'bg-card' },
  { regex: /bg-gray-50/g, replacement: 'bg-card' },
  { regex: /bg-gray-100/g, replacement: 'bg-line/30' },
  // Borders
  { regex: /border-slate-200/g, replacement: 'border-line' },
  { regex: /border-slate-300/g, replacement: 'border-line' },
  { regex: /border-gray-200/g, replacement: 'border-line' },
  // Complex banners
  { regex: /bg-gradient-to-r from-[a-z]+-\d+\/\d+ via-white to-[a-z]+-\d+\/\d+/g, replacement: 'bg-card' },
  { regex: /border-2 border-[a-z]+-\d+/g, replacement: 'border border-line' },
  { regex: /border-2 border-[a-z]+-\d+\/\d+/g, replacement: 'border border-line' },
  // Misc
  { regex: /shadow-md/g, replacement: 'shadow' }
];

function walkSync(dir, callback) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filepath = path.join(dir, file);
    if (EXCLUDE_DIRS.some(ex => filepath.includes(ex))) {
      continue;
    }
    const stats = fs.statSync(filepath);
    if (stats.isDirectory()) {
      walkSync(filepath, callback);
    } else if (stats.isFile() && filepath.endsWith('.tsx')) {
      callback(filepath);
    }
  }
}

let modifiedFiles = 0;

DIRECTORIES.forEach(dir => {
  if (fs.existsSync(dir)) {
    walkSync(dir, (filepath) => {
      let content = fs.readFileSync(filepath, 'utf8');
      let newContent = content;

      REPLACEMENTS.forEach(({ regex, replacement }) => {
        newContent = newContent.replace(regex, replacement);
      });

      if (content !== newContent) {
        fs.writeFileSync(filepath, newContent, 'utf8');
        modifiedFiles++;
        console.log(`Updated: ${filepath}`);
      }
    });
  }
});

console.log(`\nCompleted! Modified ${modifiedFiles} files.`);
