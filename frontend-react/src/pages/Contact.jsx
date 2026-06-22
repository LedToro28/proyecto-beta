import { useState } from 'react';
import { FaLocationDot, FaPhone, FaEnvelope, FaClock } from 'react-icons/fa6';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 4000);
    setForm({ name: '', email: '', phone: '', subject: '', message: '' });
  };

  const update = (field, value) => setForm({ ...form, [field]: value });

  return (
    <>
      <div className="page-header" style={{
        backgroundImage: `linear-gradient(135deg, rgba(30,30,47,0.85), rgba(108,92,231,0.7)),
          url('https://images.unsplash.com/photo-1423666639041-f56000c27a9a?auto=format&fit=crop&w=1920&q=80')`
      }}>
        <h1>Contacto</h1>
        <p>Estamos para ayudarte. Escríbenos o visítanos.</p>
      </div>

      <section className="section">
        <div className="contact-layout">
          <div className="contact-form">
            <h2>Envíanos un mensaje</h2>
            {sent && <div style={{ background: '#c6f6d5', color: '#22543d', padding: '0.7rem 1rem', borderRadius: '8px', marginBottom: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>Mensaje enviado correctamente</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nombre completo *</label>
                <input required value={form.name} onChange={e => update('name', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Correo electrónico *</label>
                <input type="email" required value={form.email} onChange={e => update('email', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Teléfono</label>
                <input value={form.phone} onChange={e => update('phone', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Asunto *</label>
                <input required value={form.subject} onChange={e => update('subject', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Mensaje *</label>
                <textarea required rows={4} value={form.message} onChange={e => update('message', e.target.value)} />
              </div>
              <button type="submit" className="btn-primary">Enviar mensaje</button>
            </form>
          </div>

          <div className="contact-sidebar">
            <div className="contact-card">
              <h3><FaLocationDot className="icon" /> Oficina principal</h3>
              <p>Av. Francisco de Miranda, Centro Empresarial, Piso 5<br />Caracas, Distrito Capital, Venezuela</p>
            </div>
            <div className="contact-card">
              <h3><FaPhone className="icon" /> Teléfonos</h3>
              <p>+58 212 555 1234<br />+58 424 555 6789</p>
            </div>
            <div className="contact-card">
              <h3><FaEnvelope className="icon" /> Correo electrónico</h3>
              <p>info@inmoya.com<br />soporte@inmoya.com</p>
            </div>
            <div className="contact-card">
              <h3><FaClock className="icon" /> Horario de atención</h3>
              <p>Lunes a Viernes: 8:00 AM - 5:00 PM<br />Sábados: 9:00 AM - 1:00 PM</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
