import dotenv from 'dotenv';
import pg from 'pg';
import bcrypt from 'bcrypt';

dotenv.config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

async function initDB(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(`
      CREATE TABLE IF NOT EXISTS agencies (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT,
        address TEXT,
        logo TEXT,
        cover TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('admin', 'agency')),
        agency_id INTEGER REFERENCES agencies(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS properties (
        id SERIAL PRIMARY KEY,
        agency_id INTEGER NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT,
        operation TEXT CHECK(operation IN ('venta', 'alquiler')),
        price NUMERIC,
        location TEXT,
        rooms INTEGER,
        baths INTEGER,
        area INTEGER,
        images TEXT,
        destacada INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        property_id INTEGER REFERENCES properties(id) ON DELETE SET NULL,
        agency_id INTEGER NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
        client_name TEXT,
        client_email TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    const adminUsername = 'admin';
    const adminEmail = 'admin@inmoya.com';
    const adminPassword = 'Admin123!';

    const existing = await client.query('SELECT id FROM users WHERE username = $1', [adminUsername]);
    if (existing.rows.length === 0) {
      const hash = await bcrypt.hash(adminPassword, 10);
      await client.query(
        'INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4)',
        [adminUsername, adminEmail, hash, 'admin']
      );
      console.log('✅ Usuario administrador creado: admin / Admin123!');
    } else {
      console.log('ℹ️ Usuario administrador ya existe.');
    }

    await client.query('COMMIT');
    console.log('✅ Base de datos inicializada correctamente (PostgreSQL)');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error inicializando DB:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

initDB().catch((err) => {
  console.error(err);
  process.exit(1);
});
