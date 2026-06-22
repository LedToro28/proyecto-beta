import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SessionProvider, useSession } from './hooks/useSession.jsx';
import Layout from './components/Layout';
import Home from './pages/Home';
import Properties from './pages/Properties';
import Agencies from './pages/Agencies';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import AgencyDashboard from './pages/AgencyDashboard';

function ProtectedRoute({ children, role }) {
  const { user, loading } = useSession();
  if (loading) return <div className="loading"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/ingresar" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}

function App() {
  return (
    <SessionProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/ingresar" element={<Login />} />
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="propiedades" element={<Properties />} />
            <Route path="agencias" element={<Agencies />} />
            <Route path="nosotros" element={<About />} />
            <Route path="contacto" element={<Contact />} />
            <Route path="dashboard/admin" element={
              <ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>
            } />
            <Route path="dashboard/agency" element={
              <ProtectedRoute role="agency"><AgencyDashboard /></ProtectedRoute>
            } />
          </Route>
        </Routes>
      </BrowserRouter>
    </SessionProvider>
  );
}

export default App;
