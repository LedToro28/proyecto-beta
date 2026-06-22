import { useState, useEffect } from 'react';
import { FaBuilding, FaEnvelope, FaPlus, FaTrash, FaXmark } from 'react-icons/fa6';
import { api } from '../services/api';

export default function AgencyDashboard() {
  const [profile, setProfile] = useState(null);
  const [properties, setProperties] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const load = async () => {
    try {
      const [prof, props, msgs] = await Promise.all([
        api.getAgencyProfile(),
        api.getAgencyProperties(),
        api.getAgencyMessages(),
      ]);
      setProfile(prof);
      setProperties(props);
      setMessages(msgs);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta propiedad?')) return;
    try {
      await api.deleteProperty(id);
      load();
    } catch { /* ignore */ }
  };

  if (loading) return <div className="section"><div className="loading"><div className="spinner" /></div></div>;

  return (
    <>
      <div className="page-header">
        <h1>{profile?.name || 'Mi Panel'}</h1>
        <p>Gestiona tus propiedades y mensajes de clientes</p>
      </div>

      <section className="section">
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ margin: 0 }}>Mis Propiedades</h2>
            <button className="btn-add" onClick={() => setShowModal(true)}><FaPlus /> Nueva Propiedad</button>
          </div>

          {properties.length === 0 ? (
            <div className="empty-state"><h3>No tienes propiedades publicadas</h3><p>Publica tu primera propiedad para comenzar.</p></div>
          ) : (
            <div className="table-responsive">
              <table>
                <thead><tr><th>Título</th><th>Ubicación</th><th>Operación</th><th>Precio</th><th>Acciones</th></tr></thead>
                <tbody>
                  {properties.map(p => (
                    <tr key={p.id}>
                      <td><strong>{p.title}</strong></td>
                      <td>{p.location || '-'}</td>
                      <td><span className={`card-tag ${p.operation === 'venta' ? 'sale' : 'rent'}`} style={{ position: 'static' }}>{p.operation}</span></td>
                      <td>${Number(p.price || 0).toLocaleString()}</td>
                      <td><button className="btn-danger" onClick={() => handleDelete(p.id)}><FaTrash /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
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

      {showModal && <NewPropertyModal onClose={() => setShowModal(false)} onCreated={() => { setShowModal(false); load(); }} />}
    </>
  );
}

function NewPropertyModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ title: '', description: '', operation: 'venta', price: '', location: '', rooms: '', baths: '', area: '' });
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
      const res = await api.createProperty(fd);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onCreated();
    } catch (err) {
      setError(err.message);
    }
    setSaving(false);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>Nueva Propiedad</h2>
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
          <div className="form-group"><label>Imágenes (máx 6)</label><input type="file" accept="image/*" multiple onChange={e => setImages(e.target.files)} /></div>
          <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Guardando...' : 'Publicar Propiedad'}</button>
        </form>
      </div>
    </div>
  );
}
