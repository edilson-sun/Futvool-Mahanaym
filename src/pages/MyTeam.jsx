import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function MyTeam() {
  const { currentUser } = useAuth();
  const [team, setTeam] = useState(null);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('jugadores');
  const [newPlayer, setNewPlayer] = useState({ name: '', number: '', position: 'Portero' });
  const [error, setError] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  const fetchTeamData = async () => {
    if (!currentUser?.email) return;
    try {
      setLoading(true);
      // Fetch team
      const teamRes = await fetch(`${API_URL}/api/teams/my-team?email=${currentUser.email}`);
      if (!teamRes.ok) throw new Error('No se encontró equipo');
      const teamData = await teamRes.json();
      setTeam(teamData);

      // Fetch players
      const playersRes = await fetch(`${API_URL}/api/players?team_id=${teamData.id}`);
      const playersData = await playersRes.json();
      setPlayers(playersData);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamData();
  }, [currentUser]);

  const handleAddPlayer = async (e) => {
    e.preventDefault();
    if (!newPlayer.name || !newPlayer.number) return;
    
    try {
      const res = await fetch(`${API_URL}/api/players`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          team_id: team.id,
          ...newPlayer
        })
      });
      
      if (res.ok) {
        setNewPlayer({ name: '', number: '', position: 'Portero' });
        fetchTeamData();
      }
    } catch (err) {
      console.error('Error adding player:', err);
    }
  };

  const handleDeletePlayer = async (id) => {
    if (!confirm('¿Eliminar jugador?')) return;
    try {
      const res = await fetch(`${API_URL}/api/players/${id}`, { method: 'DELETE' });
      if (res.ok) fetchTeamData();
    } catch (err) {
      console.error('Error deleting player:', err);
    }
  };

  if (loading) return (
    <div className="flex h-96 items-center justify-center">
      <span className="material-symbols-outlined animate-spin text-4xl text-primary">sync</span>
    </div>
  );

  if (!team) return (
    <div className="p-12 text-center bg-surface-container-low rounded-3xl border border-dashed border-outline-variant/30">
      <span className="material-symbols-outlined text-6xl text-on-surface-variant/20 mb-4 font-variation-fill">shield</span>
      <h2 className="text-xl font-bold text-white mb-2">No tienes un equipo registrado</h2>
      <p className="text-on-surface-variant text-sm mb-6">Regístrate para empezar a competir en la liga.</p>
      <a href="/registro" className="inline-block bg-primary text-black font-black uppercase tracking-widest text-xs px-8 py-3 rounded-xl hover:bg-emerald-400 transition-all">Registrar Equipo</a>
    </div>
  );

  return (
    <div className="animate-in fade-in duration-500 max-w-5xl mx-auto">
      {/* Team Header */}
      <div className="bg-surface-container-high rounded-3xl p-8 border border-outline-variant/10 shadow-xl mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="flex flex-col md:flex-row md:items-center gap-8 relative z-10">
          <div className="w-24 h-24 rounded-2xl bg-surface-container-highest border border-outline-variant/20 flex items-center justify-center shrink-0 shadow-inner">
            <span className="material-symbols-outlined text-5xl text-primary">shield</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
               <h1 className="text-3xl font-black text-white tracking-tight">{team.name}</h1>
               <span className={`text-[10px] uppercase font-black px-3 py-1 rounded-full border ${
                 team.status?.toLowerCase() === 'approved' ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20' :
                 team.status?.toLowerCase() === 'pending' ? 'bg-orange-400/10 text-orange-400 border-orange-400/20' :
                 'bg-error/10 text-error border-error/20'
               }`}>
                 {team.status?.toLowerCase() === 'approved' ? 'Aprobado' : team.status?.toLowerCase() === 'pending' ? 'Pendiente' : 'Rechazado'}
               </span>
            </div>
            <p className="text-on-surface-variant font-medium flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">category</span> {team.category}
            </p>
          </div>
          <div className="flex gap-4">
            <div className="bg-surface-container-low px-6 py-4 rounded-2xl border border-outline-variant/5 text-center min-w-[100px]">
              <p className="text-2xl font-black text-white">{players.length}</p>
              <p className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">Jugadores</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 bg-surface-container-low p-1 rounded-2xl border border-outline-variant/5 w-fit">
        <button 
          onClick={() => setActiveTab('jugadores')}
          className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'jugadores' ? 'bg-primary text-black shadow-lg' : 'text-on-surface-variant hover:text-white'}`}
        >
          Jugadores
        </button>
        <button 
          onClick={() => setActiveTab('info')}
          className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'info' ? 'bg-primary text-black shadow-lg' : 'text-on-surface-variant hover:text-white'}`}
        >
          Configuración
        </button>
      </div>

      {activeTab === 'jugadores' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Player Form */}
          {team.status?.toLowerCase() === 'approved' ? (
            <div className="lg:col-span-1">
              <div className="bg-surface-container-high rounded-3xl p-6 border border-outline-variant/10 shadow-lg sticky top-24">
                <h3 className="font-bold text-white mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-sm">person_add</span>
                  Registrar Jugador
                </h3>
                <form onSubmit={handleAddPlayer} className="space-y-4">
                  <div>
                    <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-2 block ml-1">Nombre Completo</label>
                    <input 
                      required
                      type="text" 
                      placeholder="Ej. Juan Pérez"
                      className="w-full bg-surface-container border border-outline-variant/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-primary transition-all transition-all"
                      value={newPlayer.name}
                      onChange={e => setNewPlayer({...newPlayer, name: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-2 block ml-1">Número</label>
                      <input 
                        required
                        type="number" 
                        placeholder="10"
                        className="w-full bg-surface-container border border-outline-variant/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-primary transition-all"
                        value={newPlayer.number}
                        onChange={e => setNewPlayer({...newPlayer, number: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-2 block ml-1">Posición</label>
                      <select 
                        className="w-full bg-surface-container border border-outline-variant/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-primary appearance-none transition-all"
                        value={newPlayer.position}
                        onChange={e => setNewPlayer({...newPlayer, position: e.target.value})}
                      >
                        <option>Portero</option>
                        <option>Defensa</option>
                        <option>Mediocampo</option>
                        <option>Delantero</option>
                      </select>
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-primary text-black font-black uppercase tracking-widest text-xs py-4 rounded-xl hover:bg-emerald-400 transition-all shadow-[0_0_15px_rgba(107,254,156,0.1)] mt-4">
                    Agregar a Plantilla
                  </button>
                </form>
              </div>
            </div>
          ) : (
             <div className="lg:col-span-1">
               <div className="bg-orange-400/5 rounded-3xl p-6 border border-orange-400/10 text-orange-400 flex flex-col items-center text-center gap-4">
                  <span className="material-symbols-outlined text-4xl">lock</span>
                  <p className="text-sm font-bold">Tu equipo debe estar aprobado para registrar jugadores oficiales.</p>
               </div>
             </div>
          )}

          {/* Players List */}
          <div className="lg:col-span-2 space-y-4">
             <div className="flex items-center justify-between px-2 mb-2">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant">Plantilla Actual</h3>
                <span className="text-[10px] text-on-surface-variant">{players.length} / 18 registrados</span>
             </div>
             
             {players.length === 0 ? (
               <div className="py-20 text-center bg-surface-container-low rounded-3xl border border-dashed border-outline-variant/10">
                 <p className="text-on-surface-variant italic">No hay jugadores registrados todavía.</p>
               </div>
             ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {players.map(player => (
                   <div key={player.id} className="bg-surface-container-high rounded-2xl p-4 border border-outline-variant/10 flex items-center justify-between group hover:border-outline-variant/30 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center font-black text-white border border-outline-variant/20">
                          {player.number}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white tracking-tight">{player.name}</p>
                          <p className="text-[10px] uppercase font-black text-primary tracking-widest">{player.position}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDeletePlayer(player.id)}
                        className="w-8 h-8 rounded-lg bg-error/10 text-error flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-error/20"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                   </div>
                 ))}
               </div>
             )}
          </div>
        </div>
      )}

      {activeTab === 'info' && (
        <div className="bg-surface-container-high rounded-3xl p-8 border border-outline-variant/10">
           <h3 className="text-xl font-bold text-white mb-6">Detalles del Equipo</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-black text-on-surface-variant mb-1">Capitán / Responsable</p>
                  <p className="text-white font-bold">{team.captain_name}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-black text-on-surface-variant mb-1">Teléfono de Contacto</p>
                  <p className="text-white font-bold">{team.captain_phone}</p>
                </div>
                 <div>
                  <p className="text-[10px] uppercase tracking-widest font-black text-on-surface-variant mb-1">Correo Registrado</p>
                  <p className="text-white font-bold">{team.user_email}</p>
                </div>
              </div>
              <div className="p-6 bg-surface-container rounded-2xl border border-outline-variant/10 border-dashed">
                 <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-4">Próximos Pasos</h4>
                 <ul className="space-y-3 text-xs text-on-surface-variant">
                   <li className="flex gap-2">
                     <span className="material-symbols-outlined text-emerald-400 text-sm">check_circle</span>
                     Registrar al menos 7 jugadores para competir.
                   </li>
                   <li className="flex gap-2">
                     <span className="material-symbols-outlined text-emerald-400 text-sm">check_circle</span>
                     Mantener los números de camiseta actualizados.
                   </li>
                   <li className="flex gap-2">
                     <span className="material-symbols-outlined text-red-400 text-sm">error</span>
                     No se permiten cambios después de la Jornada 2.
                   </li>
                 </ul>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
