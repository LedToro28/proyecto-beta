import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaBuildingUser, FaEnvelope, FaPhone, FaLocationDot } from 'react-icons/fa6';
import { api } from '../services/api';

export default function Agencies() {
  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAgencies()
      .then(data => setAgencies(Array.isArray(data) ? data : []))
      .catch(() => setAgencies([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <div className="page-header" style={{
        backgroundImage: `linear-gradient(135deg, rgba(30,30,47,0.85), rgba(108,92,231,0.7)),
          url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1920&q=80')`
      }}>
        <h1>Agencias Inmobiliarias</h1>
        <p>Las mejores inmobiliarias del país, aliadas para encontrar tu hogar</p>
      </div>

      <section className="section">
        {loading ? (
          <div className="loading"><div className="spinner" /><p>Cargando agencias...</p></div>
        ) : agencies.length === 0 ? (
          <div className="empty-state">
            <div className="icon"><FaBuildingUser /></div>
            <h3>No hay agencias registradas aún</h3>
            <p>Las agencias aparecerán aquí cuando sean registradas por el administrador.</p>
          </div>
        ) : (
          <div className="grid grid-3">
            {agencies.map(agency => (
              <div key={agency.id} className="agency-card">
                <div className="agency-cover">
                  {agency.cover && <img src={`http://localhost:3001${agency.cover}`} alt="" />}
                </div>
                <div className="agency-logo-wrap">
                  <div className="agency-logo">
                    {agency.logo
                      ? <img src={`http://localhost:3001${agency.logo}`} alt={agency.name} />
                      : <FaBuildingUser />
                    }
                  </div>
                </div>
                <div className="agency-info">
                  <h3>{agency.name}</h3>
                  {agency.address && <p><FaLocationDot /> {agency.address}</p>}
                  {agency.email && <p><FaEnvelope /> {agency.email}</p>}
                  {agency.phone && <p><FaPhone /> {agency.phone}</p>}
                  <Link to={`/propiedades?agency=${agency.id}`} className="btn-sm">Ver propiedades</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
