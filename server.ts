import dotenv from 'dotenv';
import express, { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import path from 'path';
import pg from 'pg';
import bcrypt from 'bcrypt';
import multer from 'multer';
import fs from 'fs';

dotenv.config();

const __dirname = import.meta.url.replace('file://', '').split('/').slice(0, -1).join('/');

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));
app.use(session({
  secret: process.env.SESSION_SECRET || 'clave_super_secreta_inmoya',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 3600000 }
}));

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

function isAuthenticated(req: any, res: Response, next: NextFunction) {
  if (req.session.user) return next();
  res.redirect('/ingresar');
}
function isAdmin(req: any, res: Response, next: NextFunction) {
  if (req.session.user && req.session.user.role === 'admin') return next();
  res.status(403).send('Acceso denegado');
}
function isAgency(req: any, res: Response, next: NextFunction) {
  if (req.session.user && req.session.user.role === 'agency') return next();
  res.status(403).send('Acceso denegado');
}

// ---------- LOGIN / SESSION ----------
app.post('/api/login', async (req: Request, res: Response) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query(
      `SELECT u.*, a.name as agency_name FROM users u
       LEFT JOIN agencies a ON u.agency_id = a.id
       WHERE u.username = $1`, [username]
    );
    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });

    (req.session as any).user = {
      id: user.id,
      username: user.username,
      role: user.role,
      agency_id: user.agency_id,
      agency_name: user.agency_name
    };
    res.json({ role: user.role });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/api/session', (req: Request, res: Response) => {
  const user = (req.session as any).user;
  if (user) {
    res.json({
      loggedIn: true,
      username: user.username,
      role: user.role,
      agencyName: user.agency_name
    });
  } else {
    res.json({ loggedIn: false });
  }
});

app.get('/api/logout', (req: Request, res: Response) => {
  req.session.destroy(() => {});
  res.redirect('/');
});

// ---------- API PÚBLICA ----------
app.get('/api/properties', async (req: Request, res: Response) => {
  const { agency_id } = req.query;
  try {
    let sql = `SELECT p.*, a.name as agency_name FROM properties p
               LEFT JOIN agencies a ON p.agency_id = a.id`;
    const params: any[] = [];
    if (agency_id) {
      sql += ` WHERE p.agency_id = $1`;
      params.push(agency_id);
    }
    sql += ` ORDER BY p.created_at DESC`;

    const result = await pool.query(sql, params);
    const properties = result.rows.map((p: any) => ({
      ...p,
      images: p.images ? JSON.parse(p.images) : [],
      portada: p.images ? JSON.parse(p.images)[0] : null
    }));
    res.json(properties);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/agencies', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, phone, address, logo, cover, created_at FROM agencies'
    );
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ---------- PANEL DE AGENCIA ----------
app.get('/api/agency/profile', isAuthenticated, isAgency, async (req: any, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, phone, address, logo, cover, created_at FROM agencies WHERE id = $1',
      [req.session.user.agency_id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Agencia no encontrada' });
    res.json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/agency/properties', isAuthenticated, isAgency, async (req: any, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM properties WHERE agency_id = $1', [req.session.user.agency_id]);
    const props = result.rows.map((p: any) => ({ ...p, images: p.images ? JSON.parse(p.images) : [] }));
    res.json(props);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/agency/properties', isAuthenticated, isAgency, upload.array('images', 6), async (req: any, res: Response) => {
  const { title, description, operation, price, location, rooms, baths, area } = req.body;
  const agencyId = req.session.user.agency_id;
  const imageFiles = (req.files as Express.Multer.File[]).map(f => '/uploads/properties/' + f.filename);
  const imagesJson = JSON.stringify(imageFiles);

  try {
    const result = await pool.query(
      `INSERT INTO properties (agency_id, title, description, operation, price, location, rooms, baths, area, images)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id`,
      [agencyId, title, description, operation, price, location, rooms, baths, area, imagesJson]
    );
    res.json({ id: result.rows[0].id, images: imageFiles });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/agency/properties/:id', isAuthenticated, isAgency, async (req: any, res: Response) => {
  try {
    const result = await pool.query(
      'DELETE FROM properties WHERE id = $1 AND agency_id = $2',
      [req.params.id, req.session.user.agency_id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Propiedad no encontrada' });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/agency/messages', isAuthenticated, isAgency, async (req: any, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT m.*, p.title as property_title FROM messages m
       LEFT JOIN properties p ON m.property_id = p.id
       WHERE m.agency_id = $1
       ORDER BY m.created_at DESC`,
      [req.session.user.agency_id]
    );
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/send-message', async (req: Request, res: Response) => {
  const { property_id, client_name, client_email, message } = req.body;
  try {
    const prop = await pool.query('SELECT agency_id FROM properties WHERE id = $1', [property_id]);
    if (prop.rows.length === 0) return res.status(404).json({ error: 'Propiedad no encontrada' });

    await pool.query(
      `INSERT INTO messages (property_id, agency_id, client_name, client_email, message)
       VALUES ($1, $2, $3, $4, $5)`,
      [property_id, prop.rows[0].agency_id, client_name, client_email, message]
    );
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ---------- PANEL DE ADMINISTRADOR ----------
app.get('/api/admin/agencies', isAuthenticated, isAdmin, async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT a.*, COUNT(u.id)::int as user_count FROM agencies a
       LEFT JOIN users u ON u.agency_id = a.id
       GROUP BY a.id`
    );
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/agencies', isAuthenticated, isAdmin, uploadAgencyFiles, async (req: any, res: Response) => {
  const { name, email, phone, address, username, password, confirm_password } = req.body;
  const logoPath = req.files['logo'] ? '/uploads/agencies/' + req.files['logo'][0].filename : null;
  const coverPath = req.files['cover'] ? '/uploads/agencies/' + req.files['cover'][0].filename : null;

  if (!name || !email || !username || !password) {
    return res.status(400).json({ error: 'Nombre, email, usuario y contraseña son obligatorios' });
  }
  if (password !== confirm_password) {
    return res.status(400).json({ error: 'Las contraseñas no coinciden' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
  }

  const client = await pool.connect();
  try {
    const emailCheck = await client.query('SELECT id FROM users WHERE email = $1', [email]);
    if (emailCheck.rows.length > 0) return res.status(400).json({ error: 'El correo electrónico ya está registrado.' });

    const userCheck = await client.query('SELECT id FROM users WHERE username = $1', [username]);
    if (userCheck.rows.length > 0) return res.status(400).json({ error: 'El nombre de usuario ya está en uso.' });

    const passwordHash = await bcrypt.hash(password, 10);

    await client.query('BEGIN');

    const agencyResult = await client.query(
      'INSERT INTO agencies (name, email, phone, address, logo, cover) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [name, email, phone, address, logoPath, coverPath]
    );
    const agencyId = agencyResult.rows[0].id;

    await client.query(
      `INSERT INTO users (username, email, password_hash, role, agency_id)
       VALUES ($1, $2, $3, 'agency', $4)`,
      [username, email, passwordHash, agencyId]
    );

    await client.query('COMMIT');
    res.json({ success: true, message: 'Agencia registrada correctamente' });
  } catch (err: any) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Error al crear agencia: ' + err.message });
  } finally {
    client.release();
  }
});

app.put('/api/admin/agencies/:id', isAuthenticated, isAdmin, uploadAgencyFiles, async (req: any, res: Response) => {
  const { name, email, phone, address } = req.body;
  const agencyId = req.params.id;

  if (!name || !email) {
    return res.status(400).json({ error: 'Nombre y email son obligatorios' });
  }

  try {
    const existing = await pool.query('SELECT * FROM agencies WHERE id = $1', [agencyId]);
    if (existing.rows.length === 0) return res.status(404).json({ error: 'Agencia no encontrada' });

    const logoPath = req.files?.['logo'] ? '/uploads/agencies/' + req.files['logo'][0].filename : existing.rows[0].logo;
    const coverPath = req.files?.['cover'] ? '/uploads/agencies/' + req.files['cover'][0].filename : existing.rows[0].cover;

    await pool.query(
      `UPDATE agencies SET name = $1, email = $2, phone = $3, address = $4, logo = $5, cover = $6 WHERE id = $7`,
      [name, email, phone || null, address || null, logoPath, coverPath, agencyId]
    );

    res.json({ success: true, message: 'Agencia actualizada correctamente' });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar: ' + err.message });
  }
});

app.delete('/api/admin/agencies/:id', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const result = await pool.query('DELETE FROM agencies WHERE id = $1', [req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Agencia no encontrada' });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/stats', isAuthenticated, isAdmin, async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT
        (SELECT COUNT(*)::int FROM agencies) as total_agencies,
        (SELECT COUNT(*)::int FROM properties) as total_properties,
        (SELECT COUNT(*)::int FROM users WHERE role='agency') as total_agency_users
    `);
    res.json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ---------- RUTAS DE VISTAS ----------
const reactDist = path.join(__dirname, 'frontend-react', 'dist');
const viewsPath = path.join(__dirname, 'public', 'views');

if (fs.existsSync(reactDist)) {
  app.use(express.static(reactDist));
  app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.join(reactDist, 'index.html'));
  });
} else {
  app.use(express.static(path.join(__dirname, 'public')));
  app.get('/', (req: Request, res: Response) => res.sendFile(path.join(viewsPath, 'index.html')));
  app.get('/propiedades', (req: Request, res: Response) => res.sendFile(path.join(viewsPath, 'propiedades.html')));
  app.get('/agencias', (req: Request, res: Response) => res.sendFile(path.join(viewsPath, 'agencias.html')));
  app.get('/nosotros', (req: Request, res: Response) => res.sendFile(path.join(viewsPath, 'nosotros.html')));
  app.get('/contacto', (req: Request, res: Response) => res.sendFile(path.join(viewsPath, 'contacto.html')));
  app.get('/ingresar', (req: Request, res: Response) => res.sendFile(path.join(viewsPath, 'ingresar.html')));
  app.get('/dashboard/admin', isAuthenticated, isAdmin, (req: Request, res: Response) => {
    res.sendFile(path.join(viewsPath, 'admin-dashboard.html'));
  });
  app.get('/dashboard/agency', isAuthenticated, isAgency, (req: Request, res: Response) => {
    res.sendFile(path.join(viewsPath, 'agency-dashboard.html'));
  });
  app.get('/agencia/:id', (req: Request, res: Response) => {
    res.sendFile(path.join(viewsPath, 'agencia-perfil.html'));
  });
  app.get('/favicon.ico', (req: Request, res: Response) => res.status(204).end());
  app.use((req: Request, res: Response) => res.status(404).sendFile(path.join(viewsPath, '404.html')));
}

app.listen(PORT, () => {
  console.log(`✅ Servidor InmoYa Nacional corriendo en http://localhost:${PORT} (PostgreSQL)`);
});
