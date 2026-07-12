import { useState, useEffect } from 'react';
import { FaBuilding, FaEnvelope, FaPlus, FaTrash, FaXmark, FaStar, FaRegStar, FaPen } from 'react-icons/fa6';
import { api } from '../services/api';

export default function AgencyDashboard() {
  const [profile, setProfile] = useState(null);
  const [properties, setProperties] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);

  // Función de carga completa con logs
  const load = async () => {
    setLoading(true);
    setError('');
    try {
      console.log('🔄 Cargando dashboard...');
      const [prof, props, msgs] = await Promise.all([
        api.getAgencyProfile(),
        api.getAgencyProperties(),
        api.getAgencyMessages(),
      ]);
      console.log('📦 Propiedades recibidas:', props);
      setProfile(prof);
      setProperties(Array.isArray(props) ? props : []);
      setMessages(Array.isArray(msgs) ? msgs : []);
    } catch (err) {
      console.error('Error cargando dashboard:', err);
      setError(err.message || 'Error al cargar los datos. Asegúrate de estar autenticado como agencia.');
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta propiedad?')) return;
    try {
      await api.deleteProperty(id);
      // Recarga completa después de eliminar
      await load();
    } catch (err) {
      alert('Error al eliminar: ' + err.message);
    }
  };

  const handleToggleDestacada = async (id) => {
    try {
      const res = await fetch(`/api/agency/properties/${id}/toggle-destacada`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al cambiar destacada');
      // Actualización local para no recargar todo
      setProperties(prev =>
        prev.map(p => p.id === id ? { ...p, destacada: data.destacada } : p)
      );
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleEdit = (property) => {
    setEditingProperty(property);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingProperty(null);
  };

  // Después de guardar (crear o editar), recarga completa y cierra modal
  const handlePropertySaved = async () => {
    handleModalClose();
    console.log('🔄 Recargando después de guardar...');
    await load(); // Espera a que termine la recarga
  };

  if (loading) return <div className="section"><div className="loading"><div className="spinner" /></div></div>;

  if (error) return (
    <div className="section">
      <div className="empty-state" style={{ padding: '3rem 0' }}>
        <div className="icon"><FaBuilding /></div>
        <h3>Error al cargar el panel</h3>
        <p>{error}</p>
        <button className="btn-primary" onClick={load} style={{ marginTop: '1rem', width: 'auto' }}>Reintentar</button>
      </div>
    </div>
  );

  return (
    <>
      <div
        className="agency-profile-header"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(30,30,47,0.85), rgba(108,92,231,0.7)),
            url(${profile?.cover || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1920&q=80'})`
        }}
      >
        <div className="agency-profile-cover">
          <div className="agency-profile-logo-wrapper">
            <div className="agency-profile-logo">
              {profile?.logo
                ? <img src={profile.logo} alt={profile.name} />
                : <FaBuilding style={{ fontSize: '2rem', color: 'white' }} />
              }
            </div>
          </div>
          <h1>{profile?.name || 'Mi Panel'}</h1>
          <div className="agency-profile-contact">
            {profile?.address && <span><FaBuilding /> {profile.address}</span>}
            {profile?.email && <span><FaEnvelope /> {profile.email}</span>}
            {profile?.phone && <span><FaBuilding /> {profile.phone}</span>}
          </div>
        </div>
      </div>

      <section className="section" style={{ paddingTop: '2rem' }}>
        <div className="dash-stats">
          <div className="stat-card">
            <div className="stat-icon purple"><FaBuilding /></div>
            <div><div className="stat-value">{properties.length}</div><div className="stat-label">Propiedades</div></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green"><FaEnvelope /></div>
            <div><div className="stat-value">{messages.length}</div><div className="stat-label">Mensajes</div></div>
          </div>
        </div>

        <div className="dash-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <h2 style={{ margin: 0 }}>Mis Propiedades</h2>
            <button className="btn-add" onClick={() => { setEditingProperty(null); setShowModal(true); }}><FaPlus /> Nueva Propiedad</button>
          </div>

          {properties.length === 0 ? (
            <div className="empty-state">
              <h3>No tienes propiedades publicadas</h3>
              <p>Publica tu primera propiedad para comenzar.</p>
            </div>
          ) : (
            <div className="grid grid-3">
              {properties.map(prop => {
                const isDestacada = prop.destacada === 1 || prop.destacada === true;
                const imgSrc = prop.portada || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80';
                return (
                  <div key={prop.id} className="card dashboard-property-card">
                    <div className="card-image">
                      <img src={imgSrc} alt={prop.title} loading="lazy" />
                      <span className={`card-tag ${prop.operation === 'venta' ? 'sale' : 'rent'}`}>
                        {prop.operation === 'venta' ? 'Venta' : 'Alquiler'}
                      </span>
                      {isDestacada && (
                        <span className="card-tag featured-tag" style={{ background: '#f6ad55', top: '52px' }}>
                          <FaStar style={{ marginRight: '4px' }} /> Destacada
                        </span>
                      )}
                    </div>
                    <div className="card-body">
                      <h3>{prop.title}</h3>
                      <div className="card-location"><FaBuilding /> {prop.location || 'Sin ubicación'}</div>
                      <div className="card-price">${Number(prop.price || 0).toLocaleString()}</div>
                      <div className="card-features" style={{ marginBottom: '0.8rem' }}>
                        <span><FaBuilding /> {prop.rooms || 0} Hab</span>
                        <span><FaBuilding /> {prop.baths || 0} Baños</span>
                        <span><FaBuilding /> {prop.area || 0} m²</span>
                      </div>
                      <div className="dashboard-actions">
                        <button
                          className={`btn-action featured ${isDestacada ? 'active' : ''}`}
                          onClick={() => handleToggleDestacada(prop.id)}
                          title={isDestacada ? 'Quitar destacada' : 'Destacar propiedad'}
                        >
                          {isDestacada ? <FaStar /> : <FaRegStar />}
                          {isDestacada ? 'Destacada' : 'Destacar'}
                        </button>
                        <button
                          className="btn-action edit"
                          onClick={() => handleEdit(prop)}
                          title="Editar propiedad"
                        >
                          <FaPen /> Editar
                        </button>
                        <button
                          className="btn-action delete"
                          onClick={() => handleDelete(prop.id)}
                          title="Eliminar propiedad"
                        >
                          <FaTrash /> Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {messages.length > 0 && (
          <div className="dash-section">
            <h2>Mensajes Recibidos</h2>
            <div className="table-responsive">
              <table>
                <thead><tr><th>Cliente</th><th>Email</th><th>Propiedad</th><th>Mensaje</th><th>Fecha</th></tr></thead>
                <tbody>
                  {messages.map(m => (
                    <tr key={m.id}>
                      <td>{m.client_name}</td>
                      <td>{m.client_email}</td>
                      <td>{m.property_title || '-'}</td>
                      <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.message}</td>
                      <td>{new Date(m.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {showModal && (
        <PropertyModal
          property={editingProperty}
          onClose={handleModalClose}
          onSuccess={handlePropertySaved}
        />
      )}
    </>
  );
}

function PropertyModal({ property, onClose, onSuccess }) {
  const isEditing = !!property;
  const [form, setForm] = useState({
    title: property?.title || '',
    description: property?.description || '',
    operation: property?.operation || 'venta',
    price: property?.price || '',
    location: property?.location || '',
    rooms: property?.rooms || '',
    baths: property?.baths || '',
    area: property?.area || '',
  });
  const [images, setImages] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const update = (field, value) => setForm({ ...form, [field]: value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (images) {
      Array.from(images).forEach(f => fd.append('images', f));
    }
    try {
      let res;
      if (isEditing) {
        res = await api.updateProperty(property.id, fd);
      } else {
        res = await api.createProperty(fd);
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al guardar propiedad');
      await onSuccess(); // Espera a que termine la recarga
    } catch (err) {
      setError(err.message);
    }
    setSaving(false);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>{isEditing ? 'Editar Propiedad' : 'Nueva Propiedad'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.2rem', color: '#718096' }}><FaXmark /></button>
        </div>

        {error && <div className="login-error" style={{ marginTop: '1rem' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
          <div className="form-group"><label>Título *</label><input required value={form.title} onChange={e => update('title', e.target.value)} /></div>
          <div className="form-group"><label>Descripción</label><textarea rows={3} value={form.description} onChange={e => update('description', e.target.value)} /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Operación *</label>
              <select value={form.operation} onChange={e => update('operation', e.target.value)}>
                <option value="venta">Venta</option>
                <option value="alquiler">Alquiler</option>
              </select>
            </div>
            <div className="form-group"><label>Precio *</label><input type="number" required value={form.price} onChange={e => update('price', e.target.value)} /></div>
          </div>
          <div className="form-group"><label>Ubicación *</label><input required value={form.location} onChange={e => update('location', e.target.value)} /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div className="form-group"><label>Habitaciones</label><input type="number" value={form.rooms} onChange={e => update('rooms', e.target.value)} /></div>
            <div className="form-group"><label>Baños</label><input type="number" value={form.baths} onChange={e => update('baths', e.target.value)} /></div>
            <div className="form-group"><label>Área (m²)</label><input type="number" value={form.area} onChange={e => update('area', e.target.value)} /></div>
          </div>
          <div className="form-group"><label>Imágenes (máx 6) {isEditing && '(dejar vacío para mantener las actuales)'}</label><input type="file" accept="image/*" multiple onChange={e => setImages(e.target.files)} /></div>
          <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Guardando...' : (isEditing ? 'Actualizar Propiedad' : 'Publicar Propiedad')}</button>
        </form>
      </div>
    </div>
  );
}