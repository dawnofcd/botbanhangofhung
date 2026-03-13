#!/usr/bin/env node
'use strict';

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const args = new Set(process.argv.slice(2));

if (args.has('--help') || args.has('-h')) {
  console.log('Usage: node scripts/db_init.js [--seed]');
  console.log('');
  console.log('Options:');
  console.log('  --seed    Apply docs/supabase_seed.sql after schema');
  process.exit(0);
}

const shouldSeed = args.has('--seed');
const rootDir = path.resolve(__dirname, '..');
const schemaPath = path.join(rootDir, 'docs', 'supabase_schema.sql');
const seedPath = path.join(rootDir, 'docs', 'supabase_seed.sql');
const databaseUrl = String(process.env.DATABASE_URL || '').trim();

if (!databaseUrl) {
  console.error('[db:init] Missing DATABASE_URL in environment.');
  process.exit(1);
}

if (!fs.existsSync(schemaPath)) {
  console.error(`[db:init] Missing schema file: ${schemaPath}`);
  process.exit(1);
}

if (shouldSeed && !fs.existsSync(seedPath)) {
  console.error(`[db:init] Missing seed file: ${seedPath}`);
  process.exit(1);
}

function stripBom(text) {
  return String(text || '').replace(/^\uFEFF/, '');
}

const schemaSql = stripBom(fs.readFileSync(schemaPath, 'utf8'));
const seedSql = shouldSeed ? stripBom(fs.readFileSync(seedPath, 'utf8')) : '';

async function runSql(ssl, label) {
  const client = new Client({
    connectionString: databaseUrl,
    ssl,
  });

  await client.connect();
  try {
    console.log(`[db:init] Connected (${label}). Applying schema...`);
    await client.query(schemaSql);
    console.log('[db:init] Schema applied successfully.');

    if (shouldSeed) {
      console.log('[db:init] Applying seed...');
      await client.query(seedSql);
      console.log('[db:init] Seed applied successfully.');
    }

    const tablesRes = await client.query(`
      select table_name
      from information_schema.tables
      where table_schema = 'public'
      order by table_name
    `);

    const tableNames = tablesRes.rows.map((row) => row.table_name);
    console.log(`[db:init] Public tables (${tableNames.length}): ${tableNames.join(', ')}`);
  } finally {
    await client.end();
  }
}

async function main() {
  const attempts = [
    { ssl: { rejectUnauthorized: false }, label: 'ssl_relaxed' },
    { ssl: false, label: 'ssl_disabled' },
  ];

  let lastError = null;
  for (const attempt of attempts) {
    try {
      await runSql(attempt.ssl, attempt.label);
      return;
    } catch (error) {
      lastError = error;
      console.error(`[db:init] Attempt failed (${attempt.label}): ${error.message}`);
    }
  }

  console.error('[db:init] Failed to apply database schema.');
  if (lastError && /ENOTFOUND|ECONNRESET|ETIMEDOUT|EHOSTUNREACH/i.test(String(lastError.code || lastError.message))) {
    console.error('[db:init] Network issue detected. If using *.railway.internal, run this command inside Railway environment.');
  }
  process.exit(1);
}

main().catch((error) => {
  console.error('[db:init] Unexpected error:', error.message);
  process.exit(1);
});
