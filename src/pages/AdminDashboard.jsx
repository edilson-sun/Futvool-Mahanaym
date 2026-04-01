import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState({
    teamsCount: 0,
    pendingTeams: 0,
    matchesCount: 0,
    finishedMatches: 0,
    approvedTeams: []
  });
  const [venues, setVenues] = useState({ total: 2, active: 2 });
  const [recentMatches, setRecentMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || '';

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [teams, matches, venueData] = await Promise.all([
        fetch(`${API_URL}/api/teams`).then(res => res.json()),
        fetch(`${API_URL}/api/matches`).then(res => res.json()),
        fetch(`${API_URL}/api/settings/venues`).then(res => res.json())
      ]);

      const approved = teams.filter(t => t.status === 'approved');
      
      setMetrics({
        teamsCount: teams.length,
        pendingTeams: teams.filter(t => t.status === 'pending').length,
        matchesCount: matches.length,
        finishedMatches: matches.filter(m => m.status === 'finished').length,
        approvedTeams: approved
      });

      setVenues(venueData);
      setRecentMatches(matches.slice(-3).reverse());
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleUpdateVenues = async (newActive) => {
    if (newActive < 0 || newActive > venues.total) return;
    try {
      const res = await fetch(`${API_URL}/api/settings/venues`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...venues, active: newActive })
      });
      if (res.ok) {
        setVenues({ ...venues, active: newActive });
      }
    } catch (error) {
      alert('Error updating venues');
    }
  };

  const handleGenerateFixture = async () => {
    if (metrics.approvedTeams.length !== 2) {
      alert('Atención: El torneo requiere exactamente 2 equipos aprobados para iniciar.');
      return;
    }
    if (!confirm('¿Deseas generar el fixture para la final entre estos 2 equipos?')) return;
    try {
      const res = await fetch(`${API_URL}/api/matches/generate`, { method: 'POST' });
      if (res.ok) {
        alert('Torneo generado con éxito');
        fetchDashboardData();
      } else {
        const err = await res.json();
        alert(err.error || 'Error al generar fixture');
      }
    } catch (error) {
      alert('Error de conexión');
    }
  };


  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black font-headline tracking-tight text-white mb-2">Panel de Control</h1>
          <p className="text-sm font-medium text-on-surface-variant/80 font-manrope">Gestión integral del Torneo Mahanaym</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <button 
            onClick={handleGenerateFixture}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-black text-sm font-bold hover:bg-emerald-400 transition-all shadow-[0_0_15px_rgba(107,254,156,0.2)]"
          >
            <span className="material-symbols-outlined text-[20px]">auto_fix_high</span>
            Crear Torneo (Fixture)
          </button>
          <Link to="/admin/fixture" className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-surface-container-highest text-white text-sm font-bold hover:bg-surface-container-high transition-all border border-outline-variant/20">
            <span className="material-symbols-outlined text-[20px]">sports_soccer</span>
            Gestionar Partidos
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-3xl bg-surface-container-high border border-outline-variant/10 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors"></div>
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 mb-4">
            <span className="material-symbols-outlined">groups</span>
          </div>
          <h3 className="text-3xl font-black text-white font-manrope tracking-tighter mb-1">{metrics.teamsCount}</h3>
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Equipos Registrados</p>
        </div>

        <div className="p-6 rounded-3xl bg-surface-container-high border border-outline-variant/10 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-400/5 rounded-full blur-2xl group-hover:bg-cyan-400/10 transition-colors"></div>
          <div className="w-12 h-12 rounded-xl bg-cyan-400/10 text-cyan-400 flex items-center justify-center border border-cyan-400/20 mb-4">
            <span className="material-symbols-outlined">check_circle</span>
          </div>
          <h3 className="text-3xl font-black text-white font-manrope tracking-tighter mb-1">{metrics.finishedMatches}</h3>
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Partidos Jugados</p>
        </div>

        <div className="p-6 rounded-3xl bg-surface-container-high border border-outline-variant/10 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-400/5 rounded-full blur-2xl group-hover:bg-orange-400/10 transition-colors"></div>
          <div className="w-12 h-12 rounded-xl bg-orange-400/10 text-orange-400 flex items-center justify-center border border-orange-400/20 mb-4">
            <span className="material-symbols-outlined">hourglass_empty</span>
          </div>
          <h3 className="text-3xl font-black text-white font-manrope tracking-tighter mb-1">{metrics.pendingTeams}</h3>
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Equipos Pendientes</p>
        </div>

        <div className="p-6 rounded-3xl bg-surface-container-high border border-outline-variant/10 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-400/5 rounded-full blur-2xl group-hover:bg-purple-400/10 transition-colors"></div>
          <div className="w-12 h-12 rounded-xl bg-purple-400/10 text-purple-400 flex items-center justify-center border border-purple-400/20 mb-4">
            <span className="material-symbols-outlined">stadium</span>
          </div>
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-3xl font-black text-white font-manrope tracking-tighter">
              {venues.active}/{venues.total}
            </h3>
            <div className="flex gap-1">
              <button 
                onClick={() => handleUpdateVenues(venues.active - 1)}
                className="w-8 h-8 rounded-lg bg-surface-container-highest hover:bg-surface-container-high flex items-center justify-center text-white transition-colors"
              >
                <span className="material-symbols-outlined text-sm">remove</span>
              </button>
              <button 
                onClick={() => handleUpdateVenues(venues.active + 1)}
                className="w-8 h-8 rounded-lg bg-primary/20 hover:bg-primary/40 text-primary flex items-center justify-center transition-colors border border-primary/20"
              >
                <span className="material-symbols-outlined text-sm">add</span>
              </button>
            </div>
          </div>
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Sedes Activas</p>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Matchday Panel (Jornada Actual Dynamic) */}
        <div className="rounded-3xl bg-surface-container-high border border-outline-variant/10 overflow-hidden flex flex-col shadow-xl">
          <div className="px-8 py-6 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container-low/50">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <h2 className="font-bold text-white tracking-tight">Actividad Reciente</h2>
            </div>
            <Link to="/admin/fixture" className="text-[10px] uppercase font-black text-primary tracking-widest hover:underline">Ver Todo</Link>
          </div>
          
          <div className="p-6 flex-1 flex flex-col gap-4">
            {recentMatches.length === 0 ? (
              <div className="py-12 text-center">
                <span className="material-symbols-outlined text-4xl text-on-surface-variant/20 mb-2">event_busy</span>
                <p className="text-xs text-on-surface-variant">No hay partidos registrados recientemente.</p>
              </div>
            ) : recentMatches.map(match => (
              <div key={match.id} className="bg-surface-container-low p-4 rounded-2xl flex items-center justify-between border border-outline-variant/5">
                <div className="flex flex-col items-center gap-1 flex-1 text-center">
                  <span className="text-[10px] font-black text-white truncate max-w-[100px]">{match.home_team_name}</span>
                </div>
                <div className="flex flex-col items-center gap-0.5 mx-2 min-w-[80px]">
                   {match.status === 'finished' ? (
                     <span className="text-xl font-black text-white">{match.home_goals} - {match.away_goals}</span>
                   ) : (
                     <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded uppercase tracking-tighter">{match.match_time.slice(0,5)}</span>
                   )}
                   <span className="text-[8px] uppercase font-bold text-on-surface-variant/60">{match.status === 'finished' ? 'Finalizado' : match.match_date.split('T')[0]}</span>
                </div>
                <div className="flex flex-col items-center gap-1 flex-1 text-center">
                  <span className="text-[10px] font-black text-white truncate max-w-[100px]">{match.away_team_name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Equipos en Juego (New Section) */}
        <div className="rounded-3xl bg-surface-container-high border border-outline-variant/10 overflow-hidden flex flex-col shadow-xl">
           <div className="px-8 py-6 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container-low/50">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-sm">stadium</span>
              <h2 className="font-bold text-white tracking-tight">Equipos en Juego</h2>
            </div>
            <span className="text-[10px] font-black text-primary px-3 py-1 bg-primary/10 rounded-full">{metrics.approvedTeams.length} Aprobados</span>
          </div>
          <div className="p-6 flex-1">
             {metrics.approvedTeams.length === 0 ? (
               <div className="py-12 text-center text-on-surface-variant italic text-xs">Aún no hay equipos aprobados.</div>
             ) : (
               <div className="grid grid-cols-2 gap-3">
                 {metrics.approvedTeams.slice(0, 6).map(team => (
                   <div key={team.id} className="flex items-center gap-3 p-3 bg-surface-container rounded-xl border border-outline-variant/5">
                      <div className="w-8 h-8 rounded-lg bg-surface-container-highest flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-xs text-primary">shield</span>
                      </div>
                      <span className="text-[10px] font-bold text-white truncate">{team.name}</span>
                   </div>
                 ))}
               </div>
             )}
             {metrics.approvedTeams.length > 6 && (
               <div className="mt-4 text-center">
                 <Link to="/admin/equipos" className="text-[9px] uppercase font-black text-on-surface-variant tracking-widest hover:text-white transition-colors">Y {metrics.approvedTeams.length - 6} equipos más...</Link>
               </div>
             )}
          </div>
        </div>
      </div>

      {/* Pending Actions Footer */}
      <div className="bg-surface-container border border-outline-variant/10 rounded-3xl p-6 shadow-xl">
         <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="flex -space-x-3">
               {[1,2,3].map(i => (
                 <div key={i} className="w-10 h-10 rounded-full bg-surface-container-highest border-2 border-surface-container-high flex items-center justify-center">
                   <span className="material-symbols-outlined text-xs text-on-surface-variant">person</span>
                 </div>
               ))}
            </div>
            <div className="flex-1 text-center md:text-left">
              <p className="text-sm font-bold text-white mb-0.5">Gestión de Inscripciones</p>
              <p className="text-xs text-on-surface-variant">Hay {metrics.pendingTeams} equipos esperando aprobación para unirse a la liga.</p>
            </div>
            <Link to="/admin/equipos" className="px-6 py-2.5 bg-white text-black font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-neutral-200 transition-all">Revisar Ahora</Link>
         </div>
      </div>
    </div>
  );
}
