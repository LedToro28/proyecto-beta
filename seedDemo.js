const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');

const dbPath = path.join(__dirname, 'inmobiliaria.db');
const db = new sqlite3.Database(dbPath);

async function seed() {
  const hash = await bcrypt.hash('Agency123!', 10);

  const agencies = [
    { name: 'Inversiones Caracas', email: 'info@invcaracas.com', phone: '+58 212 555 0001', address: 'Av. Libertador, Caracas', username: 'invcaracas' },
    { name: 'Hogar Premium Valencia', email: 'ventas@hogarpremium.com', phone: '+58 241 555 0002', address: 'Av. Bolívar Norte, Valencia', username: 'hogarpremium' },
    { name: 'Tu Casa Maracaibo', email: 'contacto@tucasamcbo.com', phone: '+58 261 555 0003', address: 'Calle 72, Maracaibo', username: 'tucasamcbo' },
  ];

  const properties = [
    { title: 'Apartamento Moderno en Las Mercedes', desc: 'Hermoso apartamento remodelado con acabados de lujo, cocina empotrada, 2 puestos de estacionamiento y vigilancia 24/7.', op: 'venta', price: 85000, location: 'Las Mercedes, Caracas', rooms: 3, baths: 2, area: 120, agency: 1 },
    { title: 'Casa Familiar en El Hatillo', desc: 'Amplia casa con jardín, piscina, zona de parrillera y vista panorámica. Ideal para familias.', op: 'venta', price: 195000, location: 'El Hatillo, Miranda', rooms: 5, baths: 4, area: 350, agency: 1 },
    { title: 'Estudio en Altamira', desc: 'Estudio completamente amoblado en excelente ubicación. Cerca de centros comerciales y transporte público.', op: 'alquiler', price: 450, location: 'Altamira, Caracas', rooms: 1, baths: 1, area: 45, agency: 1 },
    { title: 'Penthouse con Vista al Ávila', desc: 'Espectacular penthouse duplex con terraza privada y vista panorámica al cerro El Ávila. 3 puestos de estacionamiento.', op: 'venta', price: 320000, location: 'Los Palos Grandes, Caracas', rooms: 4, baths: 3, area: 280, agency: 1 },
    { title: 'Townhouse en Naguanagua', desc: 'Townhouse en conjunto cerrado con áreas verdes, parque infantil y seguridad privada. Excelente distribución.', op: 'venta', price: 72000, location: 'Naguanagua, Carabobo', rooms: 3, baths: 3, area: 180, agency: 2 },
    { title: 'Apartamento Frente al Mar', desc: 'Apartamento con vista directa al mar, completamente amoblado, perfecto para vacaciones o inversión.', op: 'alquiler', price: 600, location: 'Puerto La Cruz, Anzoátegui', rooms: 2, baths: 2, area: 90, agency: 2 },
    { title: 'Local Comercial en Centro', desc: 'Local comercial en planta baja de centro comercial con alto tráfico peatonal. Ideal para franquicias.', op: 'alquiler', price: 800, location: 'Centro, Valencia', rooms: 0, baths: 1, area: 65, agency: 2 },
    { title: 'Quinta en La Lago', desc: 'Elegante quinta en zona residencial exclusiva. Amplio jardín, piscina climatizada y 4 puestos de estacionamiento.', op: 'venta', price: 280000, location: 'La Lago, Maracaibo', rooms: 6, baths: 5, area: 450, agency: 3 },
    { title: 'Apartamento Moderno Maracaibo', desc: 'Apartamento nuevo con diseño contemporáneo. Gimnasio, salón de eventos y estacionamiento techado incluido.', op: 'venta', price: 55000, location: 'Tierra Negra, Maracaibo', rooms: 2, baths: 2, area: 85, agency: 3 },
  ];

  db.serialize(() => {
    for (const a of agencies) {
      db.run(`INSERT OR IGNORE INTO agencies (name, email, phone, address) VALUES (?, ?, ?, ?)`,
        [a.name, a.email, a.phone, a.address], function(err) {
          if (err) return console.error(err.message);
          const agencyId = this.lastID;
          if (agencyId > 0) {
            db.run(`INSERT OR IGNORE INTO users (username, email, password_hash, role, agency_id) VALUES (?, ?, ?, 'agency', ?)`,
              [a.username, a.email, hash, agencyId]);
            console.log(`✅ Agencia "${a.name}" creada (user: ${a.username} / Agency123!)`);
          }
        });
    }

    setTimeout(() => {
      db.all(`SELECT id FROM agencies ORDER BY id`, (err, rows) => {
        if (err || !rows.length) { console.log('No agencies found'); db.close(); return; }
        const agencyMap = {};
        rows.forEach((r, i) => { agencyMap[i + 1] = r.id; });

        for (const p of properties) {
          const aId = agencyMap[p.agency] || rows[0].id;
          db.run(`INSERT INTO properties (agency_id, title, description, operation, price, location, rooms, baths, area, destacada)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [aId, p.title, p.desc, p.op, p.price, p.location, p.rooms, p.baths, p.area, p.price > 100000 ? 1 : 0],
            (err2) => {
              if (err2) console.error(err2.message);
              else console.log(`  📦 Propiedad: ${p.title}`);
            });
        }

        setTimeout(() => {
          console.log('\n✅ Datos de demostración insertados correctamente');
          db.close();
        }, 1000);
      });
    }, 500);
  });
}

seed().catch(console.error);
