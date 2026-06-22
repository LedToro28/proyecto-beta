import { FaBullseye, FaEye, FaHeart, FaLinkedin, FaEnvelope } from 'react-icons/fa6';

const team = [
  { name: 'Carlos Mendoza', role: 'CEO & Fundador', img: 'https://randomuser.me/api/portraits/men/32.jpg' },
  { name: 'María González', role: 'Directora de Operaciones', img: 'https://randomuser.me/api/portraits/women/44.jpg' },
  { name: 'Andrés Ramírez', role: 'Director de Tecnología', img: 'https://randomuser.me/api/portraits/men/67.jpg' },
  { name: 'Laura Herrera', role: 'Jefa de Marketing', img: 'https://randomuser.me/api/portraits/women/65.jpg' },
];

const stats = [
  { value: '500+', label: 'Propiedades listadas' },
  { value: '50+', label: 'Agencias asociadas' },
  { value: '10K+', label: 'Usuarios activos' },
  { value: '24', label: 'Estados cubiertos' },
];

export default function About() {
  return (
    <>
      <div className="page-header" style={{
        backgroundImage: `linear-gradient(135deg, rgba(30,30,47,0.85), rgba(108,92,231,0.7)),
          url('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1920&q=80')`
      }}>
        <h1>Nosotros</h1>
        <p>Conoce la plataforma que conecta personas con el hogar de sus sueños</p>
      </div>

      <section className="section">
        <div className="about-grid">
          <div className="about-card">
            <div className="about-icon"><FaBullseye /></div>
            <h3>Misión</h3>
            <p>Facilitar la búsqueda de inmuebles a nivel nacional, ofreciendo una plataforma confiable, moderna y accesible para compradores, vendedores e inmobiliarias.</p>
          </div>
          <div className="about-card">
            <div className="about-icon"><FaEye /></div>
            <h3>Visión</h3>
            <p>Ser el ecosistema inmobiliario líder en Latinoamérica, transformando la experiencia de alquilar, vender o comprar una propiedad.</p>
          </div>
          <div className="about-card">
            <div className="about-icon"><FaHeart /></div>
            <h3>Valores</h3>
            <p>Transparencia, innovación, compromiso con el cliente, integridad y trabajo en equipo.</p>
          </div>
        </div>

        <h2 className="section-title" style={{ textAlign: 'center' }}>Nuestro Equipo</h2>
        <p className="section-subtitle" style={{ textAlign: 'center' }}>Profesionales apasionados por el sector inmobiliario</p>

        <div className="team-grid" style={{ maxWidth: '800px', margin: '0 auto 2.5rem' }}>
          {team.map(member => (
            <div key={member.name} className="team-member">
              <div className="team-avatar">
                <img src={member.img} alt={member.name} />
              </div>
              <h4>{member.name}</h4>
              <p>{member.role}</p>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '0.5rem' }}>
                <FaLinkedin style={{ color: '#6c5ce7', cursor: 'pointer' }} />
                <FaEnvelope style={{ color: '#6c5ce7', cursor: 'pointer' }} />
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: 'linear-gradient(135deg, #1e1e2f, #2d2460)', borderRadius: '20px', padding: '2.5rem', color: 'white', textAlign: 'center' }}>
          <h2 style={{ marginBottom: '1.5rem', fontSize: '1.4rem' }}>InmoYa en Números</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1.5rem' }}>
            {stats.map(s => (
              <div key={s.label}>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#a29bfe' }}>{s.value}</div>
                <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
