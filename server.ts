import dotenv from 'dotenv';
import express, { Express, Request, Response, NextFunction } from 'express';
import session from 'express-session';
import path from 'path';
import sqlite3 from 'sqlite3';
import bcrypt from 'bcrypt';
import multer from 'multer';
import fs from 'fs';

dotenv.config();

const __dirname = import.meta.url.replace('file://', '').split('/').slice(0, -1).join('/');

const app: Express = express();
const PORT: number = parseInt(process.env.PORT || '3000', 10);

// Base de datos
const dbPath: string = path.join(__dirname, 'inmobiliaria.db');
const db: sqlite3.Database = new (sqlite3.verbose()).Database(dbPath);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));
app.use(session({
  secret: 'clave_super_secreta_inmoya',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 3600000 }
}));

// Configuración de multer para subida de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let dir = '';
    if (file.fieldname === 'images') dir = path.join(__dirname, 'public', 'uploads', 'properties');
    else if (file.fieldname === 'logo' || file.fieldname === 'cover') dir = path.join(__dirname, 'public', 'uploads', 'agencies');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const prefix = file.fieldname === 'logo' ? 'logo-' : (file.fieldname === 'cover' ? 'cover-' : 'prop-');
    cb(null, prefix + unique + path.extname(file.originalname));
  }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });
const uploadAgencyFiles = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }).fields([
  { name: 'logo', maxCount: 1 },
  { name: 'cover', maxCount: 1 }
]);

// Middlewares de autenticación
function isAuthenticated(req, res, next) {
  if (req.session.user) return next();
  res.redirect('/ingresar');
}
function isAdmin(req, res, next) {
  if (req.session.user && req.session.user.role === 'admin') return next();
  res.status(403).send('Acceso denegado');
}
function isAgency(req, res, next) {
  if (req.session.user && req.session.user.role === 'agency') return next();
  res.status(403).send('Acceso denegado');
}

// ---------- LOGIN / SESSION ----------
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  db.get(`SELECT u.*, a.name as agency_name FROM users u
          LEFT JOIN agencies a ON u.agency_id = a.id
          WHERE u.username = ?`, [username], async (err, user) => {
    if (err || !user) return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    req.session.user = {
      id: user.id,
      username: user.username,
      role: user.role,
      agency_id: user.agency_id,
      agency_name: user.agency_name
    };
    res.json({ role: user.role });
  });
});

app.get('/api/session', (req, res) => {
  if (req.session.user) {
    res.json({
      loggedIn: true,
      username: req.session.user.username,
      role: req.session.user.role,
      agencyName: req.session.user.agency_name
    });
  } else {
    res.json({ loggedIn: false });
  }
});

app.get('/api/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

// ---------- API PÚBLICA ----------
app.get('/api/properties', (req, res) => {
  const { agency_id } = req.query;
  let sql = `SELECT p.*, a.name as agency_name FROM properties p
             LEFT JOIN agencies a ON p.agency_id = a.id`;
  const params = [];
  if (agency_id) {
    sql += ` WHERE p.agency_id = ?`;
    params.push(agency_id);
  }
  sql += ` ORDER BY p.created_at DESC`;
  db.all(sql, params, (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
    const properties = rows.map(p => ({
      ...p,
      images: p.images ? JSON.parse(p.images) : [],
      portada: p.images ? JSON.parse(p.images)[0] : null
    }));
    res.json(properties);
  });
});

app.get('/api/agencies', (req, res) => {
  db.all(`SELECT id, name, email, phone, address, logo, cover, created_at FROM agencies`, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// ---------- PANEL DE AGENCIA ----------
app.get('/api/agency/profile', isAuthenticated, isAgency, (req, res) => {
  const agencyId = req.session.user.agency_id;
  db.get(`SELECT id, name, email, phone, address, logo, cover, created_at FROM agencies WHERE id = ?`, [agencyId], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Agencia no encontrada' });
    res.json(row);
  });
});

app.get('/api/agency/properties', isAuthenticated, isAgency, (req, res) => {
  const agencyId = req.session.user.agency_id;
  db.all(`SELECT * FROM properties WHERE agency_id = ?`, [agencyId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const props = rows.map(p => ({ ...p, images: p.images ? JSON.parse(p.images) : [] }));
    res.json(props);
  });
});

app.post('/api/agency/properties', isAuthenticated, isAgency, upload.array('images', 6), (req, res) => {
  const { title, description, operation, price, location, rooms, baths, area } = req.body;
  const agencyId = req.session.user.agency_id;
  const imageFiles = req.files.map(f => '/uploads/properties/' + f.filename);
  const imagesJson = JSON.stringify(imageFiles);
  db.run(`INSERT INTO properties (agency_id, title, description, operation, price, location, rooms, baths, area, images)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [agencyId, title, description, operation, price, location, rooms, baths, area, imagesJson],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, images: imageFiles });
    });
});

app.delete('/api/agency/properties/:id', isAuthenticated, isAgency, (req, res) => {
  const propertyId = req.params.id;
  const agencyId = req.session.user.agency_id;
  db.run(`DELETE FROM properties WHERE id = ? AND agency_id = ?`, [propertyId, agencyId], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Propiedad no encontrada' });
    res.json({ success: true });
  });
});

app.get('/api/agency/messages', isAuthenticated, isAgency, (req, res) => {
  const agencyId = req.session.user.agency_id;
  db.all(`SELECT m.*, p.title as property_title FROM messages m
          LEFT JOIN properties p ON m.property_id = p.id
          WHERE m.agency_id = ?
          ORDER BY m.created_at DESC`, [agencyId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/send-message', (req, res) => {
  const { property_id, client_name, client_email, message } = req.body;
  db.get(`SELECT agency_id FROM properties WHERE id = ?`, [property_id], (err, prop) => {
    if (err || !prop) return res.status(404).json({ error: 'Propiedad no encontrada' });
    db.run(`INSERT INTO messages (property_id, agency_id, client_name, client_email, message)
            VALUES (?, ?, ?, ?, ?)`, [property_id, prop.agency_id, client_name, client_email, message], (err2) => {
      if (err2) return res.status(500).json({ error: err2.message });
      res.json({ success: true });
    });
  });
});

// ---------- PANEL DE ADMINISTRADOR ----------
app.get('/api/admin/agencies', isAuthenticated, isAdmin, (req, res) => {
  db.all(`SELECT a.*, COUNT(u.id) as user_count FROM agencies a
          LEFT JOIN users u ON u.agency_id = a.id
          GROUP BY a.id`, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/admin/agencies', isAuthenticated, isAdmin, uploadAgencyFiles, async (req, res) => {
  const { name, email, phone, address, username, password, confirm_password } = req.body;
  const logoPath = req.files['logo'] ? '/uploads/agencies/' + req.files['logo'][0].filename : null;
  const coverPath = req.files['cover'] ? '/uploads/agencies/' + req.files['cover'][0].filename : null;

  // Validaciones
  if (!name || !email || !username || !password) {
    return res.status(400).json({ error: 'Nombre, email, usuario y contraseña son obligatorios' });
  }
  if (password !== confirm_password) {
    return res.status(400).json({ error: 'Las contraseñas no coinciden' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
  }

  // Verificar duplicados
  const emailCheck = await new Promise((resolve) => {
    db.get("SELECT id FROM users WHERE email = ?", [email], (err, row) => resolve(row));
  });
  if (emailCheck) return res.status(400).json({ error: 'El correo electrónico ya está registrado.' });

  const userCheck = await new Promise((resolve) => {
    db.get("SELECT id FROM users WHERE username = ?", [username], (err, row) => resolve(row));
  });
  if (userCheck) return res.status(400).json({ error: 'El nombre de usuario ya está en uso.' });

  // Hashear la contraseña
  const passwordHash = await bcrypt.hash(password, 10);

  db.serialize(() => {
    db.run(`INSERT INTO agencies (name, email, phone, address, logo, cover) VALUES (?, ?, ?, ?, ?, ?)`,
      [name, email, phone, address, logoPath, coverPath], function(err) {
        if (err) return res.status(500).json({ error: 'Error al crear agencia: ' + err.message });
        const agencyId = this.lastID;
        db.run(`INSERT INTO users (username, email, password_hash, role, agency_id)
                VALUES (?, ?, ?, 'agency', ?)`,
          [username, email, passwordHash, agencyId], async (err2) => {
            if (err2) {
              db.run(`DELETE FROM agencies WHERE id = ?`, [agencyId]);
              return res.status(500).json({ error: 'Error al crear usuario: ' + err2.message });
            }
            res.json({ success: true, message: 'Agencia registrada correctamente' });
          });
      });
  });
});

app.delete('/api/admin/agencies/:id', isAuthenticated, isAdmin, (req, res) => {
  const agencyId = req.params.id;
  db.run(`DELETE FROM agencies WHERE id = ?`, [agencyId], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Agencia no encontrada' });
    res.json({ success: true });
  });
});

app.get('/api/admin/stats', isAuthenticated, isAdmin, (req, res) => {
  db.get(`SELECT (SELECT COUNT(*) FROM agencies) as total_agencies,
                 (SELECT COUNT(*) FROM properties) as total_properties,
                 (SELECT COUNT(*) FROM users WHERE role='agency') as total_agency_users`,
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(row);
    });
});

// ---------- RUTAS DE VISTAS ----------
const reactDist = path.join(__dirname, 'frontend-react', 'dist');
const viewsPath = path.join(__dirname, 'public', 'views');

if (fs.existsSync(reactDist)) {
  // Producción: servir el build de React
  app.use(express.static(reactDist));
  app.get('*', (req, res) => {
    res.sendFile(path.join(reactDist, 'index.html'));
  });
} else {
  // Fallback: servir el frontend legacy (HTML vanilla)
  app.use(express.static(path.join(__dirname, 'public')));
  app.get('/', (req, res) => res.sendFile(path.join(viewsPath, 'index.html')));
  app.get('/propiedades', (req, res) => res.sendFile(path.join(viewsPath, 'propiedades.html')));
  app.get('/agencias', (req, res) => res.sendFile(path.join(viewsPath, 'agencias.html')));
  app.get('/nosotros', (req, res) => res.sendFile(path.join(viewsPath, 'nosotros.html')));
  app.get('/contacto', (req, res) => res.sendFile(path.join(viewsPath, 'contacto.html')));
  app.get('/ingresar', (req, res) => res.sendFile(path.join(viewsPath, 'ingresar.html')));
  app.get('/dashboard/admin', isAuthenticated, isAdmin, (req, res) => {
    res.sendFile(path.join(viewsPath, 'admin-dashboard.html'));
  });
  app.get('/dashboard/agency', isAuthenticated, isAgency, (req, res) => {
    res.sendFile(path.join(viewsPath, 'agency-dashboard.html'));
  });
  app.get('/agencia/:id', (req, res) => {
    res.sendFile(path.join(viewsPath, 'agencia-perfil.html'));
  });
  app.get('/favicon.ico', (req, res) => res.status(204).end());
  app.use((req, res) => res.status(404).sendFile(path.join(viewsPath, '404.html')));
}

app.listen(PORT, () => {
  console.log(`✅ Servidor InmoYa Nacional corriendo en http://localhost:${PORT}`);
});