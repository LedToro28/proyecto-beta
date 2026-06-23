import dotenv from 'dotenv';
import pg from 'pg';
import bcrypt from 'bcrypt';

dotenv.config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

interface Agency {
  name: string;
  email: string;
  phone: string;
  address: string;
  username: string;
}

interface Property {
  title: string;
  desc: string;
  op: 'venta' | 'alquiler';
  price: number;
  location: string;
  rooms: number;
  baths: number;
  area: number;
  agency: number;
}

async function seed(): Promise<void> {
  const client = await pool.connect();
  try {
    const hash = await bcrypt.hash('Agency123!', 10);

    const agencies: Agency[] = [
      { name: 'Inversiones Caracas', email: 'info@invcaracas.com', phone: '+58 212 555 0001', address: 'Av. Libertador, Caracas', username: 'invcaracas' },
      { name: 'Hogar Premium Valencia', email: 'ventas@hogarpremium.com', phone: '+58 241 555 0002', address: 'Av. Bolívar Norte, Valencia', username: 'hogarpremium' },
      { name: 'Tu Casa Maracaibo', email: 'contacto@tucasamcbo.com', phone: '+58 261 555 0003', address: 'Calle 72, Maracaibo', username: 'tucasamcbo' },
    ];

    const properties: Property[] = [
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

    await client.query('BEGIN');

    const agencyIds: number[] = [];
    for (const a of agencies) {
      const result = await client.query(
        `INSERT INTO agencies (name, email, phone, address)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
         RETURNING id`,
        [a.name, a.email, a.phone, a.address]
      );
      const agencyId = result.rows[0].id;
      agencyIds.push(agencyId);

      await client.query(
        `INSERT INTO users (username, email, password_hash, role, agency_id)
         VALUES ($1, $2, $3, 'agency', $4)
         ON CONFLICT (username) DO NOTHING`,
        [a.username, a.email, hash, agencyId]
      );
      console.log(`✅ Agencia "${a.name}" creada (user: ${a.username} / Agency123!)`);
    }

    for (const p of properties) {
      const aId = agencyIds[p.agency - 1];
      await client.query(
        `INSERT INTO properties (agency_id, title, description, operation, price, location, rooms, baths, area, destacada)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [aId, p.title, p.desc, p.op, p.price, p.location, p.rooms, p.baths, p.area, p.price > 100000 ? 1 : 0]
      );
      console.log(`  📦 Propiedad: ${p.title}`);
    }

    await client.query('COMMIT');
    console.log('\n✅ Datos de demostración insertados correctamente');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error en seed:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
