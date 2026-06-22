import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaLocationDot, FaMagnifyingGlass, FaBed, FaBath, FaRulerCombined } from 'react-icons/fa6';
import { api } from '../services/api';

export default function Home() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState({ location: '', type: '', operation: '' });

  useEffect(() => {
    api.getProperties()
      .then(data => setProperties(Array.isArray(data) ? data.slice(0, 6) : []))
      .catch(() => setProperties([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <section className="hero">
        <h1>Encuentra tu próximo hogar a nivel nacional</h1>
        <p>Descubre miles de opciones en preventa, venta y alquiler.</p>
        <div className="search-container">
          <div className="search-field">
            <FaLocationDot className="icon" />
            <input
              type="text"
              placeholder="Ciudad, Estado o Zona..."
              value={search.location}
              onChange={e => setSearch({ ...search, location: e.target.value })}
            />
          </div>
          <div className="search-field">
            <select value={search.type} onChange={e => setSearch({ ...search, type: e.target.value })}>
              <option value="">Tipo de Inmueble</option>
              <option value="casa">Casa</option>
              <option value="apartamento">Apartamento</option>
              <option value="terreno">Terreno</option>
            </select>
          </div>
          <div className="search-field">
            <select value={search.operation} onChange={e => setSearch({ ...search, operation: e.target.value })}>
              <option value="">Operación</option>
              <option value="venta">En Venta</option>
              <option value="alquiler">En Alquiler</option>
            </select>
          </div>
          <Link to="/propiedades" className="btn-search">
            <FaMagnifyingGlass /> Buscar
          </Link>
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">Propiedades Destacadas</h2>
        <p className="section-subtitle">Las mejores oportunidades del mercado inmobiliario actual.</p>

        {loading ? (
          <div className="loading"><div className="spinner" /><p>Cargando propiedades...</p></div>
        ) : properties.length === 0 ? (
          <div className="empty-state">
            <div className="icon"><FaLocationDot /></div>
            <h3>No hay propiedades disponibles</h3>
            <p>Las propiedades aparecerán aquí cuando las agencias las publiquen.</p>
          </div>
        ) : (
          <div className="grid grid-3">
            {properties.map(prop => (
              <PropertyCard key={prop.id} property={prop} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}

function PropertyCard({ property }) {
  const imgSrc = property.portada
    ? property.portada
    : 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80';

  return (
    <div className="card">
      <div className="card-image">
        <img src={imgSrc} alt={property.title} loading="lazy" />
        <span className={`card-tag ${property.operation === 'venta' ? 'sale' : 'rent'}`}>
          {property.operation === 'venta' ? 'Venta' : 'Alquiler'}
        </span>
      </div>
      <div className="card-body">
        <h3>{property.title}</h3>
        <div className="card-location">
          <FaLocationDot /> {property.location || 'Sin ubicación'}
        </div>
        <div className="card-price">${Number(property.price || 0).toLocaleString()}</div>
        <div className="card-features">
          <span><FaBed /> {property.rooms || 0} Hab</span>
          <span><FaBath /> {property.baths || 0} Baños</span>
          <span><FaRulerCombined /> {property.area || 0} m²</span>
        </div>
      </div>
    </div>
  );
}
