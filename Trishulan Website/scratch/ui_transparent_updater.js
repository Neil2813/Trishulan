const fs = require('fs');
const path = require('path');

const DIRECTORIES = [
  path.join(__dirname, '../frontend/src/app'),
  path.join(__dirname, '../frontend/src/components')
];

const EXCLUDE_DIRS = ['landing page'];

const REPLACEMENTS = [
  // Let the premium body background shine through
  { regex: /className="min-h-screen bg-bg/g, replacement: 'className="min-h-screen bg-transparent' },
  { regex: /className="min-h-\[100vh\] bg-bg/g, replacement: 'className="min-h-[100vh] bg-transparent' }
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
