import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaHouseChimney } from 'react-icons/fa6';
import { useSession } from '../hooks/useSession.jsx';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useSession();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(username, password);
      if (data.role === 'admin') navigate('/dashboard/admin');
      else navigate('/dashboard/agency');
    } catch (err) {
      setError(err.message || 'Credenciales incorrectas');
    }
    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
          <FaHouseChimney style={{ fontSize: '2rem', color: '#6c5ce7' }} />
        </div>
        <h1>InmoYa</h1>
        <p className="login-sub">Inicia sesión para acceder a tu panel</p>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Usuario</label>
            <input
              required
              autoFocus
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Tu nombre de usuario"
            />
          </div>
          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Tu contraseña"
            />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.82rem', color: '#718096' }}>
          ¿No tienes cuenta? Contacta al administrador.
        </p>

        <Link to="/" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
          marginTop: '1rem', padding: '0.6rem 1.2rem', borderRadius: '8px',
          background: 'rgba(108, 92, 231, 0.1)', border: '1px solid rgba(108, 92, 231, 0.3)',
          color: '#6c5ce7', textDecoration: 'none', fontSize: '0.9rem',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(108, 92, 231, 0.2)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(108, 92, 231, 0.1)'; }}
        >
          <FaHouseChimney style={{ fontSize: '1rem' }} />
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
