const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

function loadDotenv(file) {
  if (!fs.existsSync(file)) return;
  const content = fs.readFileSync(file, 'utf8');
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('##')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    // remove optional surrounding quotes
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

async function run() {
  // load local env if present
  const envFile = path.join(__dirname, '..', '.env.local');
  loadDotenv(envFile);

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('DATABASE_URL not set. Set it in .env.local or environment.');
    process.exit(2);
  }

  const sqlPath = path.join(__dirname, '..', 'sql', 'create_users.sql');
  if (!fs.existsSync(sqlPath)) {
    console.error('Migration file not found:', sqlPath);
    process.exit(2);
  }
  const sql = fs.readFileSync(sqlPath, 'utf8');

  const pool = new Pool({ connectionString: dbUrl });
  const client = await pool.connect();
  try {
    console.log('Applying migration...');
    await client.query(sql);
    console.log('Migration applied successfully.');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exitCode = 1;
  } finally {
    try { client.release(); } catch (e) {}
    await pool.end();
  }
}

run();
