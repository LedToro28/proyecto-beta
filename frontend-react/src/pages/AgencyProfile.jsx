import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaEnvelope, FaPhone, FaLocationDot, FaBuildingUser, FaBed, FaBath, FaRulerCombined } from 'react-icons/fa6';
import { api } from '../services/api';

export default function AgencyProfile() {
  const { id } = useParams();
  const [agency, setAgency] = useState(null);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [agencyData, propsData] = await Promise.all([
          api.getAgency(id),
          api.getProperties(id)
        ]);
        setAgency(agencyData);
        setProperties(Array.isArray(propsData) ? propsData : []);
      } catch (err) {
        setError('No se pudo cargar la información de la agencia.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return (
    <div className="loading"><div className="spinner" /><p>Cargando...</p></div>
  );

  if (error || !agency) return (
    <div className="empty-state">
      <div className="icon"><FaBuildingUser /></div>
      <h3>Agencia no encontrada</h3>
      <p>La agencia que buscas no existe o ha sido eliminada.</p>
      <Link to="/agencias" className="btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>Volver a agencias</Link>
    </div>
  );

  return (
    <>
      {/* Header con cover y logo usando Flexbox */}
      <div 
        className="agency-profile-header" 
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(30,30,47,0.85), rgba(108,92,231,0.7)),
            url(${agency.cover || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1920&q=80'})`
        }}
      >
        <div className="agency-profile-cover">
          <div className="agency-profile-logo-wrapper">
            <div className="agency-profile-logo">
              {agency.logo
                ? <img src={agency.logo} alt={agency.name} />
                : <FaBuildingUser style={{ fontSize: '2rem', color: 'white' }} />
              }
            </div>
          </div>
          <h1>{agency.name}</h1>
          <div className="agency-profile-contact">
            {agency.address && <span><FaLocationDot /> {agency.address}</span>}
            {agency.email && <span><FaEnvelope /> {agency.email}</span>}
            {agency.phone && <span><FaPhone /> {agency.phone}</span>}
          </div>
        </div>
      </div>

      {/* Sección de propiedades */}
      <section className="section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <h2 className="section-title" style={{ marginBottom: 0 }}>Propiedades de esta agencia</h2>
          <Link to="/propiedades" className="btn-outline">Ver todas las propiedades</Link>
        </div>

        {properties.length === 0 ? (
          <div className="empty-state">
            <h3>Esta agencia aún no tiene propiedades publicadas</h3>
            <p>Vuelve más tarde para ver sus novedades.</p>
          </div>
        ) : (
          <div className="grid grid-3">
            {properties.map(prop => (
              <div key={prop.id} className="card">
                <div className="card-image">
                  <img
                    src={prop.portada || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80'}
                    alt={prop.title}
                    loading="lazy"
                  />
                  <span className={`card-tag ${prop.operation === 'venta' ? 'sale' : 'rent'}`}>
                    {prop.operation === 'venta' ? 'Venta' : 'Alquiler'}
                  </span>
                </div>
                <div className="card-body">
                  <h3>{prop.title}</h3>
                  <div className="card-location"><FaLocationDot /> {prop.location || 'Sin ubicación'}</div>
                  <div className="card-price">${Number(prop.price || 0).toLocaleString()}</div>
                  <div className="card-features">
                    <span><FaBed /> {prop.rooms || 0} Hab</span>
                    <span><FaBath /> {prop.baths || 0} Baños</span>
                    <span><FaRulerCombined /> {prop.area || 0} m²</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}