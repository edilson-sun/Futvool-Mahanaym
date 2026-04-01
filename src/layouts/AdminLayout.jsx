import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function AdminLayout({ children }) {
  const location = useLocation();
  const path = location.pathname;
  const [notifications, setNotifications] = useState([]);
  
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${API_URL}/api/notifications`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch(`${API_URL}/api/notifications/read-all`, { method: 'PUT' });
      setNotifications([]);
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  const handleCreateTournament = async () => {
    if (!confirm('¿Deseas iniciar un nuevo torneo? Esto reiniciará el fixture actual.')) return;
    try {
      const res = await fetch(`${API_URL}/api/matches/generate`, { method: 'POST' });
      if (res.ok) {
        alert('Torneo creado con éxito (Fixture de 2 equipos generado)');
        window.location.reload(); // Quick way to refresh data across pages
      } else {
        const err = await res.json();
        alert(err.error || 'Error al crear torneo');
      }
    } catch (error) {
      alert('Error de conexión');
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-surface text-on-surface font-body selection:bg-primary selection:text-on-primary-container">
      {/* Sidebar Navigation */}
      <aside className="h-screen w-64 fixed left-0 top-0 bg-neutral-900 flex flex-col py-6 z-50 border-r border-outline-variant/10">
        <div className="px-8 mb-10">
          <h1 className="text-xl font-bold text-emerald-400 font-headline tracking-tight italic">Torneo Mahanaym</h1>
          <p className="text-[10px] uppercase tracking-widest text-on-surface-variant mt-1">Admin Control</p>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <Link
            to="/admin"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-manrope text-sm font-medium transition-all duration-300 ${
              path === '/admin' ? 'text-emerald-400 bg-emerald-500/5 border-r-4 border-emerald-500' : 'text-neutral-500 hover:text-emerald-300 hover:bg-neutral-800'
            }`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: path === '/admin' ? "'FILL' 1" : "'FILL' 0" }}>dashboard</span>
            Dashboard
          </Link>
          <Link
            to="/admin/fixture"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-manrope text-sm font-medium transition-all duration-100 ${
              path.includes('/fixture') ? 'text-emerald-400 bg-emerald-500/5 border-r-4 border-emerald-500' : 'text-neutral-500 hover:text-emerald-300 hover:bg-neutral-800'
            }`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: path.includes('/fixture') ? "'FILL' 1" : "'FILL' 0" }}>sports_soccer</span>
            Matches
          </Link>
          <Link
            to="/admin/equipos"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-manrope text-sm font-medium transition-all duration-300 ${
              path.includes('/equipos') ? 'text-emerald-400 bg-emerald-500/5 border-r-4 border-emerald-500' : 'text-neutral-500 hover:text-emerald-300 hover:bg-neutral-800'
            }`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: path.includes('/equipos') ? "'FILL' 1" : "'FILL' 0" }}>groups</span>
            Teams
          </Link>
        </nav>
        <div className="px-4 mt-auto space-y-2">
          <div className="p-4 rounded-xl bg-surface-container-low mb-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center">
                <span className="material-symbols-outlined text-primary">trophy</span>
              </div>
              <div>
                <p className="text-xs font-bold text-on-surface">Mahanaym League</p>
                <p className="text-[10px] text-on-surface-variant">Temporada 2024</p>
              </div>
            </div>
            <button 
              onClick={handleCreateTournament}
              className="w-full py-2 bg-primary text-on-primary-container text-xs font-bold rounded-lg hover:brightness-110 transition-all"
            >
              Crear Torneo
            </button>
          </div>
          <Link to="/" className="flex items-center gap-3 px-4 py-3 text-neutral-500 hover:text-emerald-300 transition-colors text-sm">
            <span className="material-symbols-outlined">public</span>
            Ir al Portal Público
          </Link>
        </div>
      </aside>
      
      {/* Main Content Area */}
      <main className="ml-64 min-h-screen">
        {/* Top Navigation Bar */}
        <header className="w-full sticky top-0 z-40 bg-neutral-950/60 backdrop-blur-xl flex justify-between items-center px-8 py-4 shadow-[0_20px_40px_rgba(0,0,0,0.4)] border-b border-outline-variant/10">
          <div className="flex items-center gap-6 flex-1">
            <div className="relative w-full max-w-md">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
              <input type="text" placeholder="Buscar partidos, equipos, o jugadores..." className="w-full bg-surface-container-lowest border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-1 focus:ring-primary focus:bg-surface-container-high transition-all text-white outline-none" />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <button 
              onClick={markAllAsRead}
              className={`relative p-2 text-white hover:bg-emerald-500/10 rounded-full transition-colors group ${notifications.length > 0 ? 'animate-bounce' : ''}`}
            >
              <span className="material-symbols-outlined group-hover:scale-110 transition-transform">notifications</span>
              {notifications.length > 0 && (
                <>
                  <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-neutral-950 shadow-[0_0_8px_rgba(107,254,156,0.6)] animate-ping"></span>
                  <span className="absolute -top-1 -right-1 bg-primary text-black text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-neutral-950 shadow-lg">
                    {notifications.length}
                  </span>
                </>
              )}
            </button>
            <div className="flex items-center gap-3 pl-6 border-l border-outline-variant/20">
              <div className="text-right">
                <p className="text-sm font-bold text-on-surface">Admin Web</p>
                <p className="text-[10px] text-on-surface-variant uppercase tracking-tighter">Super Admin</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-surface-container-highest border border-primary/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary">person</span>
              </div>
            </div>
          </div>
        </header>

        {children}
      </main>
    </div>
  );
}

