import { useState, useEffect } from 'react';
import { FaBuildingUser, FaBuilding, FaUsers, FaPlus, FaTrash, FaXmark } from 'react-icons/fa6';
import { api } from '../services/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState({});
  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const load = async () => {
    try {
      const [s, a] = await Promise.all([api.getAdminStats(), api.getAdminAgencies()]);
      setStats(s);
      setAgencies(a);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id, name) => {
    if (!confirm(`¿Eliminar la agencia "${name}"?`)) return;
    try {
      await api.deleteAgency(id);
      load();
    } catch { /* ignore */ }
  };

  if (loading) return <div className="section"><div className="loading"><div className="spinner" /></div></div>;

  return (
    <>
      <div className="page-header">
        <h1>Panel de Administración</h1>
        <p>Gestiona agencias, propiedades y usuarios del sistema</p>
      </div>

      <section className="section">
        <div className="dash-stats">
          <div className="stat-card">
            <div className="stat-icon purple"><FaBuildingUser /></div>
            <div><div className="stat-value">{stats.total_agencies || 0}</div><div className="stat-label">Agencias</div></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green"><FaBuilding /></div>
            <div><div className="stat-value">{stats.total_properties || 0}</div><div className="stat-label">Propiedades</div></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon blue"><FaUsers /></div>
            <div><div className="stat-value">{stats.total_agency_users || 0}</div><div className="stat-label">Usuarios</div></div>
          </div>
        </div>

        <div className="dash-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ margin: 0 }}>Agencias Registradas</h2>
            <button className="btn-add" onClick={() => setShowModal(true)}><FaPlus /> Nueva Agencia</button>
          </div>

          {agencies.length === 0 ? (
            <div className="empty-state"><h3>No hay agencias registradas</h3></div>
          ) : (
            <div className="table-responsive">
              <table>
                <thead>
                  <tr><th>Nombre</th><th>Email</th><th>Teléfono</th><th>Usuarios</th><th>Acciones</th></tr>
                </thead>
                <tbody>
                  {agencies.map(a => (
                    <tr key={a.id}>
                      <td><strong>{a.name}</strong></td>
                      <td>{a.email}</td>
                      <td>{a.phone || '-'}</td>
                      <td>{a.user_count}</td>
                      <td><button className="btn-danger" onClick={() => handleDelete(a.id, a.name)}><FaTrash /> Eliminar</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {showModal && <NewAgencyModal onClose={() => setShowModal(false)} onCreated={() => { setShowModal(false); load(); }} />}
    </>
  );
}

function NewAgencyModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', username: '', password: '', confirm_password: '' });
  const [logo, setLogo] = useState(null);
  const [cover, setCover] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const update = (field, value) => setForm({ ...form, [field]: value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm_password) { setError('Las contraseñas no coinciden'); return; }
    if (form.password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return; }

    setSaving(true);
    setError('');
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (logo) fd.append('logo', logo);
    if (cover) fd.append('cover', cover);

    try {
      const res = await api.createAgency(fd);
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
          <h2 style={{ margin: 0 }}>Registrar Nueva Agencia</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.2rem', color: '#718096' }}><FaXmark /></button>
        </div>

        {error && <div className="login-error" style={{ marginTop: '1rem' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
          <div className="form-group"><label>Nombre de la agencia *</label><input required value={form.name} onChange={e => update('name', e.target.value)} /></div>
          <div className="form-group"><label>Email *</label><input type="email" required value={form.email} onChange={e => update('email', e.target.value)} /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group"><label>Teléfono</label><input value={form.phone} onChange={e => update('phone', e.target.value)} /></div>
            <div className="form-group"><label>Dirección</label><input value={form.address} onChange={e => update('address', e.target.value)} /></div>
          </div>
          <div className="form-group"><label>Logo</label><input type="file" accept="image/*" onChange={e => setLogo(e.target.files[0])} /></div>
          <div className="form-group"><label>Portada</label><input type="file" accept="image/*" onChange={e => setCover(e.target.files[0])} /></div>
          <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '1rem 0' }} />
          <div className="form-group"><label>Nombre de usuario *</label><input required value={form.username} onChange={e => update('username', e.target.value)} /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group"><label>Contraseña *</label><input type="password" required value={form.password} onChange={e => update('password', e.target.value)} /></div>
            <div className="form-group"><label>Confirmar *</label><input type="password" required value={form.confirm_password} onChange={e => update('confirm_password', e.target.value)} /></div>
          </div>
          <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Guardando...' : 'Registrar Agencia'}</button>
        </form>
      </div>
    </div>
  );
}
