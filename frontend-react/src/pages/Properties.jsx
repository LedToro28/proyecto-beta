import { useState, useEffect, useMemo } from 'react';
import { FaLocationDot, FaBed, FaBath, FaRulerCombined, FaXmark, FaChevronLeft, FaChevronRight } from 'react-icons/fa6';
import { api } from '../services/api';

export default function Properties() {
  const [allProperties, setAllProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [operation, setOperation] = useState('');

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    api.getProperties()
      .then(data => setAllProperties(Array.isArray(data) ? data : []))
      .catch(() => setAllProperties([]))
      .finally(() => setLoading(false));
  }, []);

  // Propiedades filtradas
  const filteredProperties = useMemo(() => {
    return allProperties.filter(p => {
      if (operation && p.operation !== operation) return false;
      if (propertyType) {
        const typeLower = propertyType.toLowerCase();
        const titleMatch = p.title?.toLowerCase().includes(typeLower);
        const descMatch = p.description?.toLowerCase().includes(typeLower);
        if (!titleMatch && !descMatch) return false;
      }
      if (searchTerm) {
        const locationMatch = p.location?.toLowerCase().includes(searchTerm.toLowerCase());
        if (!locationMatch) return false;
      }
      return true;
    });
  }, [allProperties, searchTerm, propertyType, operation]);

  // Paginación
  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProperties = filteredProperties.slice(startIndex, endIndex);

  // Resetear página cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, propertyType, operation]);

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    // Scroll al inicio de la sección
    document.querySelector('.section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <div className="page-header">
        <h1>Todas las Propiedades</h1>
        <p>Encuentra la casa o apartamento de tus sueños en todo el país</p>
      </div>

      <section className="section">
        {/* Barra de filtros */}
        <div className="filters-bar" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem', marginBottom: '1.5rem', alignItems: 'center' }}>
          <div className="search-field" style={{ flex: 2, minWidth: '200px' }}>
            <FaLocationDot className="icon" />
            <input
              type="text"
              placeholder="Buscar por ubicación..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="search-field" style={{ flex: 1, minWidth: '150px' }}>
            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', padding: '0.5rem' }}
            >
              <option value="">Todos los tipos</option>
              <option value="casa">Casa</option>
              <option value="apartamento">Apartamento</option>
              <option value="terreno">Terreno</option>
              <option value="local">Local</option>
              <option value="oficina">Oficina</option>
            </select>
          </div>
          <div className="search-field" style={{ flex: 1, minWidth: '150px' }}>
            <select
              value={operation}
              onChange={(e) => setOperation(e.target.value)}
              style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', padding: '0.5rem' }}
            >
              <option value="">Todas las operaciones</option>
              <option value="venta">Venta</option>
              <option value="alquiler">Alquiler</option>
            </select>
          </div>
        </div>

        {/* Botones de filtro rápido */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <FilterBtn
            label="Todas"
            active={operation === ''}
            onClick={() => setOperation('')}
          />
          <FilterBtn
            label="En Venta"
            active={operation === 'venta'}
            onClick={() => setOperation('venta')}
          />
          <FilterBtn
            label="En Alquiler"
            active={operation === 'alquiler'}
            onClick={() => setOperation('alquiler')}
          />
        </div>

        {loading ? (
          <div className="loading"><div className="spinner" /><p>Cargando propiedades...</p></div>
        ) : filteredProperties.length === 0 ? (
          <div className="empty-state">
            <h3>No hay propiedades disponibles</h3>
            <p>Intenta con otro filtro o vuelve más tarde.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-3">
              {currentProperties.map(prop => (
                <div key={prop.id} className="card" onClick={() => setSelected(prop)} style={{ cursor: 'pointer' }}>
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

            {/* Controles de paginación */}
            {totalPages > 1 && (
              <div className="pagination" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '2rem' }}>
                <button
                  className="btn-outline"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Anterior
                </button>
                <span style={{ padding: '0.5rem 1rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', boxShadow: 'var(--shadow-sm)' }}>
                  Página {currentPage} de {totalPages}
                </span>
                <button
                  className="btn-outline"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
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
    ? property.images.map(i => i)
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