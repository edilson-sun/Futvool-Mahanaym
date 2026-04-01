import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PublicLayout({ children }) {
  const location = useLocation();
  const path = location.pathname;
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [hasTeam, setHasTeam] = useState(false);

  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'admin@mahanaym.com';
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  useEffect(() => {
    async function checkTeam() {
      if (currentUser?.email) {
        try {
          const res = await fetch(`${API_URL}/api/teams/my-team?email=${currentUser.email}`);
          if (res.ok) setHasTeam(true);
          else setHasTeam(false);
        } catch (error) {
          console.error('Error checking team:', error);
        }
      }
    }
    checkTeam();
  }, [currentUser]);

  async function handleLogout() {
    try {
      await logout();
      setHasTeam(false);
      navigate('/');
    } catch (error) {
      console.error('Logout error', error);
    }
  }

  return (
    <div className="bg-background text-on-surface font-body selection:bg-primary/30 min-h-screen hero-gradient">
      {/* Top Navigation Bar - Simplified */}
      <nav className="fixed top-0 w-full z-50 bg-[#0e0e0e]/60 backdrop-blur-xl shadow-[0_20px_40px_rgba(0,0,0,0.4)] flex justify-between items-center px-8 h-20 border-b border-outline-variant/10">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-2xl font-bold tracking-tighter text-emerald-400 font-headline hover:brightness-110 transition-all">Torneo Mahanaym</Link>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="relative group hidden lg:block">
            <input type="text" placeholder="Buscar partidos..." className="bg-surface-container-lowest border-none focus:ring-1 focus:ring-primary rounded-full px-4 py-2 text-sm w-64 text-white outline-none transition-all placeholder-outline" />
            <span className="material-symbols-outlined absolute right-3 top-2 text-outline-variant">search</span>
          </div>
          
          {currentUser && currentUser.email === adminEmail && (
            <Link to="/admin" className="text-neutral-400 hover:text-emerald-300 transition-colors font-manrope font-bold text-xs uppercase tracking-widest px-4 border-r border-outline-variant/20">Panel Admin</Link>
          )}

          {currentUser ? (
            <div className="flex items-center gap-4">
              <span className="text-sm font-bold text-emerald-300 hidden md:inline-block">{currentUser.email}</span>
              <button onClick={handleLogout} className="bg-surface-container border border-outline-variant/20 hover:bg-surface-container-high text-white font-bold px-4 py-2 rounded-full text-sm transition-colors flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">logout</span> Salir
              </button>
            </div>
          ) : (
            <Link to="/login" className="bg-primary text-black font-bold px-4 py-2 rounded-full text-sm hover:bg-emerald-400 transition-colors flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">login</span> Iniciar Sesión
            </Link>
          )}
        </div>
      </nav>

      {/* Sidebar Navigation */}
      <aside className="h-screen w-64 fixed left-0 top-0 pt-24 bg-[#131313] flex flex-col gap-y-4 p-6 hidden md:flex border-r border-outline-variant/10 z-40">
        <div className="mb-8">
          <h2 className="text-emerald-400 font-black font-headline tracking-widest text-xs uppercase">Secciones</h2>
          <p className="text-on-surface-variant text-[10px] uppercase tracking-tighter">Temporada 2024</p>
        </div>
        <nav className="flex flex-col gap-2">
          <Link to="/" className={`flex items-center gap-3 p-3 font-manrope uppercase tracking-widest text-xs transition-all ${path === '/' ? 'bg-emerald-500/10 text-emerald-400 border-r-4 border-emerald-500' : 'text-neutral-500 hover:text-neutral-200 hover:bg-white/5'}`}>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: path === '/' ? "'FILL' 1" : "'FILL' 0" }}>leaderboard</span>
            Posiciones
          </Link>
          
          {!hasTeam && (
            <Link to="/registro" className={`flex items-center gap-3 p-3 font-manrope uppercase tracking-widest text-xs transition-all ${path === '/registro' ? 'bg-emerald-500/10 text-emerald-400 border-r-4 border-emerald-500' : 'text-neutral-500 hover:text-neutral-200 hover:bg-white/5'}`}>
              <span className="material-symbols-outlined" style={{ fontVariationSettings: path === '/registro' ? "'FILL' 1" : "'FILL' 0" }}>how_to_reg</span>
              Inscribir Equipo
            </Link>
          )}

          {currentUser && (
            <Link to="/mi-equipo" className={`flex items-center gap-3 p-3 font-manrope uppercase tracking-widest text-xs transition-all ${path === '/mi-equipo' ? 'bg-emerald-500/10 text-emerald-400 border-r-4 border-emerald-500' : 'text-neutral-500 hover:text-neutral-200 hover:bg-white/5'}`}>
              <span className="material-symbols-outlined" style={{ fontVariationSettings: path === '/mi-equipo' ? "'FILL' 1" : "'FILL' 0" }}>groups</span>
              Mi Equipo {hasTeam && <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(107,254,156,0.6)]"></span>}
            </Link>
          )}
        </nav>
        <div className="mt-auto pb-8">
          <button className="w-full bg-primary-container text-on-primary-container py-3 rounded-lg font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-transform duration-200 active:scale-95">
            <span className="material-symbols-outlined text-sm">sensors</span>
            Modo en vivo
          </button>
        </div>
      </aside>

      {/* Main Content Canvas */}
      <main className="ml-0 md:ml-64 pt-24 px-8 pb-12">
        {children}
      </main>

      {/* Footer Area Area */}
      <footer className="ml-0 md:ml-64 px-8 py-10 border-t border-outline-variant/10 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-xs text-on-surface-variant tracking-wider uppercase">© 2024 Torneo Mahanaym. Todos los derechos reservados.</p>
        <div className="flex gap-6 text-on-surface-variant">
          <a href="#" className="hover:text-primary transition-colors"><span className="material-symbols-outlined">social_leaderboard</span></a>
          <a href="#" className="hover:text-primary transition-colors"><span className="material-symbols-outlined">camera</span></a>
        </div>
      </footer>
    </div>
  );
}

