const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');

const dbPath = path.join(__dirname, 'inmobiliaria.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  // ========== CREAR TABLAS SI NO EXISTEN (con todas las columnas) ==========
  db.run(`CREATE TABLE IF NOT EXISTS agencies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    address TEXT,
    logo TEXT,
    cover TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('admin', 'agency')),
    agency_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (agency_id) REFERENCES agencies(id) ON DELETE CASCADE
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS properties (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    agency_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    operation TEXT CHECK(operation IN ('venta', 'alquiler')),
    price REAL,
    location TEXT,
    rooms INTEGER,
    baths INTEGER,
    area INTEGER,
    images TEXT,
    destacada INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (agency_id) REFERENCES agencies(id) ON DELETE CASCADE
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    property_id INTEGER,
    agency_id INTEGER NOT NULL,
    client_name TEXT,
    client_email TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE SET NULL,
    FOREIGN KEY (agency_id) REFERENCES agencies(id) ON DELETE CASCADE
  )`);

  // ========== AGREGAR COLUMNAS FALTANTES EN TABLAS EXISTENTES ==========
  // Para agencies: logo y cover
  db.all("PRAGMA table_info(agencies)", (err, columns) => {
    if (err) return console.error(err);
    const hasLogo = columns.some(col => col.name === 'logo');
    const hasCover = columns.some(col => col.name === 'cover');
    if (!hasLogo) {
      db.run("ALTER TABLE agencies ADD COLUMN logo TEXT", (err2) => {
        if (err2) console.error("Error agregando logo:", err2.message);
        else console.log("✅ Columna 'logo' agregada a agencies.");
      });
    }
    if (!hasCover) {
      db.run("ALTER TABLE agencies ADD COLUMN cover TEXT", (err2) => {
        if (err2) console.error("Error agregando cover:", err2.message);
        else console.log("✅ Columna 'cover' agregada a agencies.");
      });
    }
  });

  // Para properties: destacada
  db.all("PRAGMA table_info(properties)", (err, columns) => {
    if (err) return console.error(err);
    const hasDestacada = columns.some(col => col.name === 'destacada');
    if (!hasDestacada) {
      db.run("ALTER TABLE properties ADD COLUMN destacada INTEGER DEFAULT 0", (err2) => {
        if (err2) console.error("Error agregando destacada:", err2.message);
        else console.log("✅ Columna 'destacada' agregada a properties.");
      });
    }
  });

  // ========== CREAR USUARIO ADMIN POR DEFECTO ==========
  const adminUsername = 'admin';
  const adminEmail = 'admin@inmoya.com';
  const adminPassword = 'Admin123!';

  db.get("SELECT id FROM users WHERE username = ?", [adminUsername], async (err, row) => {
    if (err) {
      console.error(err);
      return db.close();
    }
    if (!row) {
      const hash = await bcrypt.hash(adminPassword, 10);
      db.run("INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)",
        [adminUsername, adminEmail, hash, 'admin'], (err2) => {
          if (err2) console.error(err2);
          else console.log('✅ Usuario administrador creado: admin / Admin123!');
          db.close();
        });
    } else {
      console.log('ℹ️ Usuario administrador ya existe.');
      db.close();
    }
  });
});