#!/usr/bin/env node
/**
 * Create a deterministic lambda zip from ./dist into ../terraform/birdsongquiz_lambdas.zip
 * - Stable file ordering
 * - Fixed timestamps to avoid hash churn
 */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { ZipFile } = require('yazl');

const DIST_DIR = path.resolve(__dirname, '..', 'dist');
// terraform directory is one level above /api
const OUTPUT_ZIP = path.resolve(__dirname, '..', '..', 'terraform', 'birdsongquiz_lambdas.zip');

if (!fs.existsSync(DIST_DIR)) {
  console.error(`dist directory not found at ${DIST_DIR}. Did you run npm run build?`);
  process.exit(1);
}

// Fixed DOS timestamp (Zip standard). Using 1980-01-01 00:00:00 to avoid churn.
const FIXED_DOS_TIME = new Date('1980-01-01T00:00:00Z');

const zip = new ZipFile();

function addFile(fullPath, relativePath) {
  const stats = fs.statSync(fullPath);
  if (!stats.isFile()) return;
  zip.addFile(fullPath, relativePath, {
    mtime: FIXED_DOS_TIME,
    mode: 0o644,
    compress: true,
  });
}

function walk(dir, prefix = '') {
  const entries = fs.readdirSync(dir).sort();
  for (const entry of entries) {
    const full = path.join(dir, entry);
    const rel = path.join(prefix, entry);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      walk(full, rel);
    } else if (stat.isFile()) {
      addFile(full, rel);
    }
  }
}

walk(DIST_DIR);

zip.end({ forceZip64Format: false });

const out = fs.createWriteStream(OUTPUT_ZIP);
zip.outputStream.pipe(out);

zip.outputStream.on('end', () => {
  console.log(`Wrote ${OUTPUT_ZIP}`);
});

zip.outputStream.on('error', (err) => {
  console.error('Zip creation failed:', err);
  process.exit(1);
});

