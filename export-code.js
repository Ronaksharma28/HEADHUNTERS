// export-code.js
const fs = require('node:fs');
const path = require('node:path');

const ROOT_DIR = '.';
const OUTPUT_FILE = 'codebase-dump.txt';

const IGNORE_DIRS = new Set([
  'node_modules', '.git', '.next', 'dist', 'build', '.vercel',
  '.turbo', '.cache', 'coverage', '__pycache__', '.pytest_cache',
  '.vscode', '.idea', '.venv', 'venv', 'env'
]);

const IGNORE_FILES = new Set([
  OUTPUT_FILE, 'export-code.js', 'copy-clean.js',
  'package-lock.json', 'pnpm-lock.yaml', 'yarn.lock', 'bun.lockb',
  '.DS_Store', '.env', '.env.local'
]);

const IGNORE_EXTS = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.webp', '.ico', '.svg',
  '.mp4', '.mp3', '.wav', '.pdf', '.zip', '.tar', '.gz',
  '.woff', '.woff2', '.ttf', '.eot', '.exe', '.dll', '.bin',
  '.pyc', '.db', '.sqlite', '.sqlite3'
]);

function isIgnored(name, isDir) {
  if (isDir) return IGNORE_DIRS.has(name);
  if (IGNORE_FILES.has(name)) return true;
  return IGNORE_EXTS.has(path.extname(name).toLowerCase());
}

function buildTree(dir, prefix = '') {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
    .filter((entry) => !isIgnored(entry.name, entry.isDirectory()))
    .sort((a, b) => Number(b.isDirectory()) - Number(a.isDirectory()) || a.name.localeCompare(b.name));

  let tree = '';
  entries.forEach((entry, index) => {
    const isLast = index === entries.length - 1;
    tree += `${prefix}${isLast ? '└── ' : '├── '}${entry.name}\n`;
    if (entry.isDirectory()) {
      tree += buildTree(
        path.join(dir, entry.name),
        prefix + (isLast ? '    ' : '│   ')
      );
    }
  });
  return tree;
}

function collectFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
    .filter((entry) => !isIgnored(entry.name, entry.isDirectory()))
    .sort((a, b) => Number(b.isDirectory()) - Number(a.isDirectory()) || a.name.localeCompare(b.name));

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectFiles(fullPath, files);
    } else {
      files.push(fullPath);
    }
  }
  return files;
}

const projectName = path.basename(process.cwd());
let output = '=== PROJECT STRUCTURE ===\n\n';
output += `${projectName}/\n${buildTree(ROOT_DIR)}\n`;

const allFiles = collectFiles(ROOT_DIR);

output += '=== FILE CONTENTS ===\n\n';
for (const filePath of allFiles) {
  const cleanPath = filePath.replace(/\\/g, '/');
  const content = fs.readFileSync(filePath, 'utf8');
  output += `--- START OF ${cleanPath} ---\n${content}\n--- END OF ${cleanPath} ---\n\n`;
}

fs.writeFileSync(OUTPUT_FILE, output, 'utf8');
console.log(`Exported ${allFiles.length} files into ${OUTPUT_FILE}`);