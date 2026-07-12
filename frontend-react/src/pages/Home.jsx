import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaLocationDot, FaBed, FaBath, FaRulerCombined } from 'react-icons/fa6';
import { api } from '../services/api';

export default function Home() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getProperties()
      .then(data => {
        const destacadas = Array.isArray(data) ? data.filter(p => p.destacada === 1 || p.destacada === true) : [];
        setProperties(destacadas);
      })
      .catch(() => setProperties([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <section className="hero">
        <h1>Encuentra tu próximo hogar a nivel nacional</h1>
        <p>Descubre miles de opciones en preventa, venta y alquiler.</p>
      </section>

      <section className="section">
        <h2 className="section-title">Propiedades Destacadas</h2>
        <p className="section-subtitle">Las mejores oportunidades del mercado inmobiliario actual.</p>

        {loading ? (
          <div className="loading"><div className="spinner" /><p>Cargando propiedades destacadas...</p></div>
        ) : properties.length === 0 ? (
          <div className="empty-state">
            <div className="icon"><FaLocationDot /></div>
            <h3>No hay propiedades destacadas aún</h3>
            <p>Las agencias destacarán sus mejores propiedades aquí.</p>
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
        <span className="card-tag featured-tag" style={{ background: '#f6ad55', top: '52px', left: '12px' }}>
          ⭐ Destacada
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