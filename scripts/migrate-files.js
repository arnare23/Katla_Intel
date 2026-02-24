#!/usr/bin/env node
/**
 * Firebase Storage → Cloudflare R2 File Migration Script
 *
 * Prerequisites:
 *   1. npm install firebase-admin @aws-sdk/client-s3
 *   2. Place your Firebase service account key at ./serviceAccountKey.json
 *   3. Configure R2 credentials via environment variables or wrangler:
 *        R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY
 *   4. Update R2_BUCKET_NAME and R2_ENDPOINT below
 *   5. Firebase Storage bucket name (usually <project-id>.appspot.com)
 *
 * Usage:
 *   node scripts/migrate-files.js [--prefix images/] [--dry-run]
 *
 *   --prefix <path>   Only migrate files under this prefix (e.g., "images/", "pdfs/")
 *   --dry-run         List files without uploading
 */

const admin = require('firebase-admin');
const { S3Client, PutObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');
const path = require('path');
const { Readable } = require('stream');

// ── Configuration ──────────────────────────────────────────────────────────
const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'serviceAccountKey.json');
const FIREBASE_STORAGE_BUCKET = 'katlagroupehf.appspot.com'; // Update if different

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = 'katla-assets'; // Your R2 bucket name

// ── Firebase init ──────────────────────────────────────────────────────────
const serviceAccount = require(SERVICE_ACCOUNT_PATH);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: FIREBASE_STORAGE_BUCKET,
});
const bucket = admin.storage().bucket();

// ── R2 (S3-compatible) client ──────────────────────────────────────────────
const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

// ── Helpers ────────────────────────────────────────────────────────────────

async function streamToBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

function getMimeType(filename) {
  const ext = path.extname(filename).toLowerCase();
  const mimes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf',
    '.mp4': 'video/mp4',
    '.json': 'application/json',
  };
  return mimes[ext] || 'application/octet-stream';
}

async function existsInR2(key) {
  try {
    await r2.send(new HeadObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key }));
    return true;
  } catch {
    return false;
  }
}

// ── Migration ──────────────────────────────────────────────────────────────

async function migrateFiles(prefix, dryRun) {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  Firebase Storage → Cloudflare R2 Migration');
  console.log('═══════════════════════════════════════════════════════');
  if (dryRun) console.log('  ⚠️  DRY RUN MODE — no files will be uploaded\n');
  if (prefix) console.log(`  📂 Prefix filter: ${prefix}\n`);

  const options = prefix ? { prefix } : {};
  const [files] = await bucket.getFiles(options);

  console.log(`  Found ${files.length} files in Firebase Storage\n`);

  let migrated = 0;
  let skipped = 0;
  let errors = 0;

  for (const file of files) {
    const key = file.name;

    // Skip directories (trailing slash)
    if (key.endsWith('/')) {
      continue;
    }

    if (dryRun) {
      const [metadata] = await file.getMetadata();
      const size = metadata.size ? `${(parseInt(metadata.size) / 1024).toFixed(1)}KB` : 'unknown';
      console.log(`  [DRY RUN] ${key} (${size})`);
      migrated++;
      continue;
    }

    try {
      // Check if already exists in R2
      const exists = await existsInR2(key);
      if (exists) {
        console.log(`  ⏭️  ${key} (already exists)`);
        skipped++;
        continue;
      }

      // Download from Firebase Storage
      const [fileBuffer] = await file.download();
      const contentType = getMimeType(key);

      // Upload to R2
      await r2.send(new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
        Body: fileBuffer,
        ContentType: contentType,
      }));

      console.log(`  ✅ ${key} (${(fileBuffer.length / 1024).toFixed(1)}KB)`);
      migrated++;
    } catch (err) {
      console.error(`  ❌ ${key}: ${err.message}`);
      errors++;
    }
  }

  console.log('\n═══════════════════════════════════════════════════════');
  console.log(`  Migration complete!`);
  console.log(`  ✅ Migrated: ${migrated}`);
  console.log(`  ⏭️  Skipped: ${skipped}`);
  console.log(`  ❌ Errors: ${errors}`);
  console.log('═══════════════════════════════════════════════════════\n');
}

// ── Main ───────────────────────────────────────────────────────────────────

async function main() {
  // Validate R2 credentials
  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
    console.error('Missing R2 credentials. Set environment variables:');
    console.error('  R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY');
    process.exit(1);
  }

  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const prefixIdx = args.indexOf('--prefix');
  const prefix = prefixIdx !== -1 ? args[prefixIdx + 1] : null;

  await migrateFiles(prefix, dryRun);
  process.exit(0);
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
