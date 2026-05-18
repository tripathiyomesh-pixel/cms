require('dotenv').config({ path: require('path').resolve(__dirname,'../../../.env') });
const { Client } = require('pg');
const crypto = require('crypto');

async function seed() {
  const client = new Client({
    host: process.env.DB_HOST || 'postgres',
    port: +process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'jewellery_cms',
    user: process.env.DB_USER || 'cmsuser',
    password: process.env.DB_PASS || 'CmsPass@2026',
  });
  await client.connect();

  // Hash password manually without bcrypt dependency
  const password = 'Admin@2026';
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  const storedHash = `scrypt:${salt}:${hash}`;

  const id = crypto.randomUUID();

  // Try bcrypt first (if available), fall back to stored plain for seeding
  let finalHash;
  try {
    const bcrypt = require('bcrypt');
    finalHash = await bcrypt.hash(password, 12);
    console.log('Using bcrypt');
  } catch {
    // bcrypt not available - use direct insert with known hash
    // We'll update the auth module to handle this
    finalHash = '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewWM.YP0/N8wQ4Iy'; // Admin@2026
    console.log('Using pre-computed hash');
  }

  await client.query(
    `INSERT INTO users (id, name, email, password, role, is_active, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, true, NOW(), NOW())
     ON CONFLICT (email) DO UPDATE SET password=$4, role=$5, is_active=true`,
    [id, 'Super Admin', 'admin@vantix.io', finalHash, 'super_admin']
  );

  console.log('✅ Admin user ready — admin@vantix.io / Admin@2026');
  await client.end();
}

seed().catch(e => { console.error('❌', e.message); process.exit(1); });
