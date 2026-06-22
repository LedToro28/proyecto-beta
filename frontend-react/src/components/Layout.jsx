import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { FaBars } from 'react-icons/fa6';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      <button className="hamburger" onClick={() => setSidebarOpen(true)}>
        <FaBars />
      </button>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="main-content">
        <div className="page-content">
          <Outlet />
        </div>
        <footer className="footer">
          <p>&copy; 2026 InmoYa - Tu hogar nos importa</p>
        </footer>
      </main>
    </div>
  );
}
