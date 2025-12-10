#!/usr/bin/env node
/**
 * Create a deterministic lambda zip from ./dist into ../terraform/birdsongquiz_lambdas.zip
 * - Stable file ordering
 * - Fixed timestamps to avoid hash churn
 */
import { existsSync, statSync, readdirSync, createWriteStream } from 'fs';
import { resolve, join } from 'path';
import zlib from 'zlib';
import { ZipFile } from 'yazl';

const DIST_DIR = resolve(__dirname, '..', 'dist');
// terraform directory is one level above /api
const OUTPUT_ZIP = resolve(__dirname, '..', '..', 'terraform', 'birdsongquiz_lambdas.zip');

if (!existsSync(DIST_DIR)) {
  console.error(`dist directory not found at ${DIST_DIR}. Did you run npm run build?`);
  process.exit(1);
}

// Fixed DOS timestamp (Zip standard). Using 1980-01-01 00:00:00 to avoid churn.
const FIXED_DOS_TIME = new Date('1980-01-01T00:00:00Z');

const zip = new ZipFile();

function addFile(fullPath, relativePath) {
  const stats = statSync(fullPath);
  if (!stats.isFile()) return;
  zip.addFile(fullPath, relativePath, {
    mtime: FIXED_DOS_TIME,
    mode: 0o644,
    compress: true,
  });
}

function walk(dir, prefix = '') {
  const entries = readdirSync(dir).sort();
  for (const entry of entries) {
    const full = join(dir, entry);
    const rel = join(prefix, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      walk(full, rel);
    } else if (stat.isFile()) {
      addFile(full, rel);
    }
  }
}

walk(DIST_DIR);

zip.end({ forceZip64Format: false });

const out = createWriteStream(OUTPUT_ZIP);
zip.outputStream.pipe(out);

zip.outputStream.on('end', () => {
  console.log(`Wrote ${OUTPUT_ZIP}`);
});

zip.outputStream.on('error', (err) => {
  console.error('Zip creation failed:', err);
  process.exit(1);
});


