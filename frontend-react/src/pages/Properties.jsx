import { useState, useEffect } from 'react';
import { FaLocationDot, FaBed, FaBath, FaRulerCombined, FaXmark, FaChevronLeft, FaChevronRight } from 'react-icons/fa6';
import { api } from '../services/api';

export default function Properties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    api.getProperties()
      .then(data => setProperties(Array.isArray(data) ? data : []))
      .catch(() => setProperties([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter
    ? properties.filter(p => p.operation === filter)
    : properties;

  return (
    <>
      <div className="page-header">
        <h1>Todas las Propiedades</h1>
        <p>Encuentra la casa o apartamento de tus sueños en todo el país</p>
      </div>

      <section className="section">
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <FilterBtn label="Todas" active={!filter} onClick={() => setFilter('')} />
          <FilterBtn label="En Venta" active={filter === 'venta'} onClick={() => setFilter('venta')} />
          <FilterBtn label="En Alquiler" active={filter === 'alquiler'} onClick={() => setFilter('alquiler')} />
        </div>

        {loading ? (
          <div className="loading"><div className="spinner" /><p>Cargando propiedades...</p></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <h3>No hay propiedades disponibles</h3>
            <p>Intenta con otro filtro o vuelve más tarde.</p>
          </div>
        ) : (
          <div className="grid grid-3">
            {filtered.map(prop => (
              <div key={prop.id} className="card" onClick={() => setSelected(prop)} style={{ cursor: 'pointer' }}>
                <div className="card-image">
                  <img
                    src={prop.portada ? `http://localhost:3001${prop.portada}` : 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80'}
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

      {selected && <PropertyModal property={selected} onClose={() => setSelected(null)} />}
    </>
  );
}

function FilterBtn({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={active ? 'btn-add' : 'btn-outline'}
    >
      {label}
    </button>
  );
}

function PropertyModal({ property, onClose }) {
  const [imgIdx, setImgIdx] = useState(0);
  const [msgForm, setMsgForm] = useState({ client_name: '', client_email: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const images = property.images?.length
    ? property.images.map(i => `http://localhost:3001${i}`)
    : ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80'];

  const handleSend = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await api.sendMessage({ property_id: property.id, ...msgForm });
      setSent(true);
    } catch { /* ignore */ }
    setSending(false);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '650px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ margin: 0 }}>{property.title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.3rem', color: '#718096' }}><FaXmark /></button>
        </div>

        <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', marginBottom: '1rem' }}>
          <img src={images[imgIdx]} alt="" style={{ width: '100%', height: '300px', objectFit: 'cover' }} />
          {images.length > 1 && (
            <>
              <button onClick={() => setImgIdx((imgIdx - 1 + images.length) % images.length)} style={navBtnStyle('left')}><FaChevronLeft /></button>
              <button onClick={() => setImgIdx((imgIdx + 1) % images.length)} style={navBtnStyle('right')}><FaChevronRight /></button>
            </>
          )}
          <span className={`card-tag ${property.operation === 'venta' ? 'sale' : 'rent'}`}>
            {property.operation === 'venta' ? 'Venta' : 'Alquiler'}
          </span>
        </div>

        <div className="card-price" style={{ fontSize: '1.5rem' }}>${Number(property.price || 0).toLocaleString()}</div>
        <div className="card-location" style={{ marginBottom: '0.5rem' }}><FaLocationDot /> {property.location}</div>
        <div className="card-features" style={{ marginBottom: '1rem' }}>
          <span><FaBed /> {property.rooms} Hab</span>
          <span><FaBath /> {property.baths} Baños</span>
          <span><FaRulerCombined /> {property.area} m²</span>
        </div>
        {property.description && <p style={{ fontSize: '0.9rem', color: '#4a5568', lineHeight: 1.6, marginBottom: '1.5rem' }}>{property.description}</p>}
        {property.agency_name && <p style={{ fontSize: '0.85rem', color: '#718096' }}>Publicado por: <strong>{property.agency_name}</strong></p>}

        <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '1.2rem 0' }} />

        {sent ? (
          <div style={{ textAlign: 'center', padding: '1rem', color: '#38a169' }}>
            <strong>Mensaje enviado correctamente</strong>
            <p style={{ fontSize: '0.85rem', marginTop: '0.3rem' }}>La agencia se pondrá en contacto contigo.</p>
          </div>
        ) : (
          <form onSubmit={handleSend}>
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Contactar a la agencia</h3>
            <div className="form-group">
              <input placeholder="Tu nombre" required value={msgForm.client_name} onChange={e => setMsgForm({ ...msgForm, client_name: e.target.value })} />
            </div>
            <div className="form-group">
              <input type="email" placeholder="Tu email" required value={msgForm.client_email} onChange={e => setMsgForm({ ...msgForm, client_email: e.target.value })} />
            </div>
            <div className="form-group">
              <textarea placeholder="Tu mensaje..." required rows={3} value={msgForm.message} onChange={e => setMsgForm({ ...msgForm, message: e.target.value })} />
            </div>
            <button type="submit" className="btn-primary" disabled={sending}>
              {sending ? 'Enviando...' : 'Enviar mensaje'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function navBtnStyle(side) {
  return {
    position: 'absolute', top: '50%', [side]: '8px', transform: 'translateY(-50%)',
    background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none',
    width: '32px', height: '32px', borderRadius: '50%', display: 'flex',
    alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
  };
}
