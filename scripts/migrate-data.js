#!/usr/bin/env node
/**
 * Firestore → Cloudflare D1 Data Migration Script
 *
 * Prerequisites:
 *   1. npm install firebase-admin
 *   2. Place your Firebase service account key at ./serviceAccountKey.json
 *   3. Install wrangler: npm install -g wrangler
 *   4. Update D1_DATABASE_NAME and D1_DATABASE_ID below
 *   5. Ensure the D1 schema has been applied: wrangler d1 execute <db> --file=../workers/schema.sql
 *
 * Usage:
 *   node scripts/migrate-data.js [--collection <name>] [--dry-run]
 *
 *   --collection <name>  Migrate only the specified collection (posts, enquiries, etc.)
 *   --dry-run            Print SQL statements without executing them
 */

const { execSync } = require('child_process');
const admin = require('firebase-admin');
const path = require('path');

// ── Configuration ──────────────────────────────────────────────────────────
const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'serviceAccountKey.json');
const D1_DATABASE_NAME = 'katla-prod'; // Change to your D1 database name

// ── Firebase init ──────────────────────────────────────────────────────────
const serviceAccount = require(SERVICE_ACCOUNT_PATH);
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

// ── Helpers ────────────────────────────────────────────────────────────────
function escapeSQL(value) {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'number') return String(value);
  if (typeof value === 'boolean') return value ? '1' : '0';
  return `'${String(value).replace(/'/g, "''")}'`;
}

function toISO(firestoreTimestamp) {
  if (!firestoreTimestamp) return null;
  if (firestoreTimestamp.toDate) return firestoreTimestamp.toDate().toISOString();
  if (firestoreTimestamp instanceof Date) return firestoreTimestamp.toISOString();
  if (typeof firestoreTimestamp === 'string') return firestoreTimestamp;
  if (typeof firestoreTimestamp === 'number') return new Date(firestoreTimestamp).toISOString();
  // Handle {seconds, nanoseconds} objects
  if (firestoreTimestamp.seconds) return new Date(firestoreTimestamp.seconds * 1000).toISOString();
  return null;
}

function toJSON(value) {
  if (!value) return 'NULL';
  if (Array.isArray(value)) return escapeSQL(JSON.stringify(value));
  return 'NULL';
}

function executeD1(sql, dryRun) {
  if (dryRun) {
    console.log('[DRY RUN]', sql.substring(0, 200) + (sql.length > 200 ? '...' : ''));
    return;
  }
  try {
    execSync(`wrangler d1 execute ${D1_DATABASE_NAME} --command="${sql.replace(/"/g, '\\"')}"`, {
      stdio: 'pipe',
      encoding: 'utf-8',
    });
  } catch (err) {
    console.error('D1 execution error:', err.message);
    throw err;
  }
}

// ── Collection Migrators ───────────────────────────────────────────────────

async function migratePosts(dryRun) {
  console.log('\n📝 Migrating posts...');
  const snapshot = await db.collection('posts').get();
  let count = 0;

  for (const doc of snapshot.docs) {
    const d = doc.data();
    const sql = `INSERT OR IGNORE INTO posts (id, title, slug, excerpt, content, category, tags, image_url, status, author, read_time, created_at, updated_at)
      VALUES (${escapeSQL(doc.id)}, ${escapeSQL(d.title)}, ${escapeSQL(d.slug)}, ${escapeSQL(d.excerpt)}, ${escapeSQL(d.content)}, ${escapeSQL(d.category)}, ${toJSON(d.tags)}, ${escapeSQL(d.imageUrl || d.image_url)}, ${escapeSQL(d.status || 'published')}, ${escapeSQL(d.author)}, ${escapeSQL(d.readTime || d.read_time)}, ${escapeSQL(toISO(d.createdAt || d.created_at))}, ${escapeSQL(toISO(d.updatedAt || d.updated_at))});`;
    executeD1(sql, dryRun);
    count++;
  }
  console.log(`  ✅ ${count} posts migrated`);
}

async function migrateEnquiries(dryRun) {
  console.log('\n📬 Migrating enquiries...');
  const snapshot = await db.collection('enquiries').get();
  let count = 0;

  for (const doc of snapshot.docs) {
    const d = doc.data();
    const sql = `INSERT OR IGNORE INTO enquiries (id, name, email, company, service, message, status, created_at)
      VALUES (${escapeSQL(doc.id)}, ${escapeSQL(d.name)}, ${escapeSQL(d.email)}, ${escapeSQL(d.company)}, ${escapeSQL(d.service)}, ${escapeSQL(d.message)}, ${escapeSQL(d.status || 'new')}, ${escapeSQL(toISO(d.createdAt || d.created_at || d.timestamp))});`;
    executeD1(sql, dryRun);
    count++;
  }
  console.log(`  ✅ ${count} enquiries migrated`);
}

async function migrateCaseStudies(dryRun) {
  console.log('\n📊 Migrating case studies...');
  const snapshot = await db.collection('caseStudies').get();
  let count = 0;

  for (const doc of snapshot.docs) {
    const d = doc.data();
    const sql = `INSERT OR IGNORE INTO case_studies (id, title, slug, client, industry, excerpt, content, challenge, solution, image_url, metrics, technologies, status, "order", created_at, updated_at)
      VALUES (${escapeSQL(doc.id)}, ${escapeSQL(d.title)}, ${escapeSQL(d.slug)}, ${escapeSQL(d.client)}, ${escapeSQL(d.industry)}, ${escapeSQL(d.excerpt)}, ${escapeSQL(d.content)}, ${escapeSQL(d.challenge)}, ${escapeSQL(d.solution)}, ${escapeSQL(d.imageUrl || d.image_url)}, ${toJSON(d.metrics)}, ${toJSON(d.technologies)}, ${escapeSQL(d.status || 'published')}, ${escapeSQL(d.order || 0)}, ${escapeSQL(toISO(d.createdAt || d.created_at))}, ${escapeSQL(toISO(d.updatedAt || d.updated_at))});`;
    executeD1(sql, dryRun);
    count++;
  }
  console.log(`  ✅ ${count} case studies migrated`);
}

async function migrateJobs(dryRun) {
  console.log('\n💼 Migrating jobs...');
  const snapshot = await db.collection('jobs').get();
  let count = 0;

  for (const doc of snapshot.docs) {
    const d = doc.data();
    const sql = `INSERT OR IGNORE INTO jobs (id, title, slug, department, location, type, description, requirements, status, "order", created_at, updated_at)
      VALUES (${escapeSQL(doc.id)}, ${escapeSQL(d.title)}, ${escapeSQL(d.slug)}, ${escapeSQL(d.department)}, ${escapeSQL(d.location)}, ${escapeSQL(d.type)}, ${escapeSQL(d.description)}, ${toJSON(d.requirements)}, ${escapeSQL(d.status || 'published')}, ${escapeSQL(d.order || 0)}, ${escapeSQL(toISO(d.createdAt || d.created_at))}, ${escapeSQL(toISO(d.updatedAt || d.updated_at))});`;
    executeD1(sql, dryRun);
    count++;
  }
  console.log(`  ✅ ${count} jobs migrated`);
}

async function migrateResearch(dryRun) {
  console.log('\n🔬 Migrating research...');
  const snapshot = await db.collection('research').get();
  let count = 0;

  for (const doc of snapshot.docs) {
    const d = doc.data();
    const sql = `INSERT OR IGNORE INTO research (id, title, slug, abstract, content, authors, tags, image_url, pdf_url, status, published_at, created_at, updated_at)
      VALUES (${escapeSQL(doc.id)}, ${escapeSQL(d.title)}, ${escapeSQL(d.slug)}, ${escapeSQL(d.abstract)}, ${escapeSQL(d.content)}, ${toJSON(d.authors)}, ${toJSON(d.tags)}, ${escapeSQL(d.imageUrl || d.image_url)}, ${escapeSQL(d.pdfUrl || d.pdf_url)}, ${escapeSQL(d.status || 'published')}, ${escapeSQL(toISO(d.publishedAt || d.published_at))}, ${escapeSQL(toISO(d.createdAt || d.created_at))}, ${escapeSQL(toISO(d.updatedAt || d.updated_at))});`;
    executeD1(sql, dryRun);
    count++;
  }
  console.log(`  ✅ ${count} research papers migrated`);
}

async function migrateSubscribers(dryRun) {
  console.log('\n📧 Migrating subscribers...');
  const snapshot = await db.collection('subscribers').get();
  let count = 0;

  for (const doc of snapshot.docs) {
    const d = doc.data();
    const sql = `INSERT OR IGNORE INTO subscribers (id, email, source, created_at)
      VALUES (${escapeSQL(doc.id)}, ${escapeSQL(d.email)}, ${escapeSQL(d.source || 'blog')}, ${escapeSQL(toISO(d.createdAt || d.created_at || d.subscribedAt))});`;
    executeD1(sql, dryRun);
    count++;
  }
  console.log(`  ✅ ${count} subscribers migrated`);
}

// ── Main ───────────────────────────────────────────────────────────────────

const MIGRATORS = {
  posts: migratePosts,
  enquiries: migrateEnquiries,
  caseStudies: migrateCaseStudies,
  jobs: migrateJobs,
  research: migrateResearch,
  subscribers: migrateSubscribers,
};

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const collectionIdx = args.indexOf('--collection');
  const targetCollection = collectionIdx !== -1 ? args[collectionIdx + 1] : null;

  console.log('═══════════════════════════════════════════════════════');
  console.log('  Firestore → Cloudflare D1 Migration');
  console.log('═══════════════════════════════════════════════════════');
  if (dryRun) console.log('  ⚠️  DRY RUN MODE — no data will be written\n');

  if (targetCollection) {
    const migrator = MIGRATORS[targetCollection];
    if (!migrator) {
      console.error(`Unknown collection: ${targetCollection}`);
      console.error(`Available: ${Object.keys(MIGRATORS).join(', ')}`);
      process.exit(1);
    }
    await migrator(dryRun);
  } else {
    for (const [name, migrator] of Object.entries(MIGRATORS)) {
      await migrator(dryRun);
    }
  }

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  Migration complete!');
  console.log('═══════════════════════════════════════════════════════\n');
  process.exit(0);
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
