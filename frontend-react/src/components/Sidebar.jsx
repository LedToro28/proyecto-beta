import { NavLink, useNavigate } from 'react-router-dom';
import { FaHouse, FaBuilding, FaBuildingUser, FaUsers, FaEnvelope, FaArrowRightToBracket, FaRightFromBracket, FaGauge, FaHouseChimney } from 'react-icons/fa6';
import { useSession } from '../hooks/useSession.jsx';

const publicLinks = [
  { to: '/', label: 'Inicio', icon: <FaHouse /> },
  { to: '/propiedades', label: 'Propiedades', icon: <FaBuilding /> },
  { to: '/agencias', label: 'Agencias', icon: <FaBuildingUser /> },
  { to: '/nosotros', label: 'Nosotros', icon: <FaUsers /> },
  { to: '/contacto', label: 'Contacto', icon: <FaEnvelope /> },
];

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useSession();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <>
      <div className={`sidebar-overlay${isOpen ? ' open' : ''}`} onClick={onClose} />
      <aside className={`sidebar${isOpen ? ' open' : ''}`}>
        <NavLink to="/" className="sidebar-logo" onClick={onClose}>
          <FaHouseChimney /> <span>InmoYa</span>
        </NavLink>

        <nav className="sidebar-nav">
          {publicLinks.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              onClick={onClose}
            >
              <span className="nav-icon">{link.icon}</span>
              {link.label}
            </NavLink>
          ))}

          {user?.role === 'admin' && (
            <NavLink to="/dashboard/admin" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} onClick={onClose}>
              <span className="nav-icon"><FaGauge /></span>
              Panel Admin
            </NavLink>
          )}
          {user?.role === 'agency' && (
            <NavLink to="/dashboard/agency" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} onClick={onClose}>
              <span className="nav-icon"><FaGauge /></span>
              Mi Panel
            </NavLink>
          )}
        </nav>

        <div className="sidebar-footer">
          {user ? (
            <div className="user-profile">
              <div className="user-avatar"><FaUsers /></div>
              <div className="user-info">
                <strong>{user.username}</strong>
                <span>{user.role === 'admin' ? 'Administrador' : user.agencyName || 'Agencia'}</span>
              </div>
              <button className="btn-session" onClick={handleLogout} title="Cerrar sesión">
                <FaRightFromBracket />
              </button>
            </div>
          ) : (
            <NavLink to="/ingresar" className="user-profile" onClick={onClose}>
              <div className="user-avatar"><FaUsers /></div>
              <div className="user-info">
                <strong>Invitado</strong>
                <span>Inicia sesión</span>
              </div>
              <span className="btn-session"><FaArrowRightToBracket /></span>
            </NavLink>
          )}
        </div>
      </aside>
    </>
  );
}
