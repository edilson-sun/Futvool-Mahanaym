import React, { useState, useEffect } from 'react';

export default function AdminTeams() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTeams = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${API_URL}/api/teams`);
      if (!res.ok) throw new Error('Error al cargar equipos');
      const data = await res.json();
      setTeams(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const changeStatus = async (id, newStatus) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${API_URL}/api/teams/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error('Error al actualizar estado');
      
      const updatedTeam = await res.json();
      setTeams(teams.map(t => t.id === id ? updatedTeam : t));
    } catch (err) {
      alert(err.message);
    }
  };

  const deleteTeam = async (id, name) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar permanentemente al equipo "${name}"? Esta acción no se puede deshacer.`)) return;
    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${API_URL}/api/teams/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar equipo');
      setTeams(teams.filter(t => t.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };


  const statusMap = {
    pending: { label: 'Pendiente', color: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30' },
    approved: { label: 'Aprobado', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    rejected: { label: 'Rechazado', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
    disqualified: { label: 'Descalificado', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' }
  };

  return (
    <div className="p-8 animate-in fade-in max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-black font-headline text-white mb-2">Módulo de Equipos</h2>
          <p className="text-on-surface-variant font-manrope">Acepta, rechaza y edita las inscripciones del torneo.</p>
        </div>
        <button onClick={fetchTeams} className="p-3 bg-surface-container rounded-xl hover:bg-surface-container-highest transition-colors text-white">
          <span className="material-symbols-outlined">refresh</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 text-red-400 p-4 rounded-xl mb-6 flex gap-3 items-center border border-red-500/20">
          <span className="material-symbols-outlined">error</span> {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <span className="material-symbols-outlined animate-spin text-4xl text-primary">sync</span>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left bg-surface-container rounded-2xl overflow-hidden glass-card">
            <thead className="bg-surface-container-highest/50">
              <tr>
                <th className="p-4 text-xs tracking-wider text-on-surface-variant font-bold uppercase">Equipo</th>
                <th className="p-4 text-xs tracking-wider text-on-surface-variant font-bold uppercase">Categoría</th>
                <th className="p-4 text-xs tracking-wider text-on-surface-variant font-bold uppercase">Capitán / Responsable</th>
                <th className="p-4 text-xs tracking-wider text-on-surface-variant font-bold uppercase">Contacto</th>
                <th className="p-4 text-xs tracking-wider text-on-surface-variant font-bold uppercase">Estado</th>
                <th className="p-4 text-xs tracking-wider text-on-surface-variant font-bold uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {teams.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-on-surface-variant">No hay equipos registrados todavía.</td>
                </tr>
              ) : teams.map((team) => (
                <tr key={team.id} className="hover:bg-surface-container-highest/30 transition-colors">
                  <td className="p-4 text-white font-bold flex items-center gap-3">
                    {team.logo_url ? (
                      <img src={team.logo_url} alt={team.name} className="w-10 h-10 object-cover rounded-full bg-surface-container-highest border border-outline-variant/20" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant border border-outline-variant/20">
                        <span className="material-symbols-outlined text-sm">shield</span>
                      </div>
                    )}
                    {team.name}
                  </td>
                  <td className="p-4 text-on-surface-variant capitalize">{team.category}</td>
                  <td className="p-4 text-white">{team.captain_name}</td>
                  <td className="p-4 text-on-surface-variant">
                     <div className="flex flex-col text-sm">
                        <span>{team.captain_phone}</span>
                        <span className="text-xs opacity-60">{team.user_email}</span>
                     </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 text-xs font-bold rounded-full border ${statusMap[team.status] ? statusMap[team.status].color : statusMap.pending.color}`}>
                      {statusMap[team.status] ? statusMap[team.status].label : team.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {team.status === 'pending' && (
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => changeStatus(team.id, 'approved')}
                            className="bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-400 p-2 rounded-lg transition-colors tooltip"
                            title="Aprobar"
                          >
                            <span className="material-symbols-outlined text-sm">check</span>
                          </button>
                          <button 
                            onClick={() => changeStatus(team.id, 'rejected')}
                            className="bg-red-500/20 hover:bg-red-500/40 text-red-400 p-2 rounded-lg transition-colors tooltip"
                            title="Rechazar"
                          >
                            <span className="material-symbols-outlined text-sm">close</span>
                          </button>
                        </div>
                      )}
                      {team.status === 'approved' && (
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => changeStatus(team.id, 'rejected')}
                            className="text-xs px-2 py-1 text-on-surface-variant hover:text-red-400 transition-colors bg-surface-container rounded"
                          >
                            Revocar
                          </button>
                          <button 
                            onClick={() => changeStatus(team.id, 'disqualified')}
                            className="text-xs px-2 py-1 text-on-surface-variant hover:text-gray-400 transition-colors bg-surface-container border border-outline-variant/10 rounded"
                            title="Descalificar del torneo"
                          >
                            Descalificar
                          </button>
                        </div>
                      )}
                      {team.status === 'rejected' && (
                        <button 
                          onClick={() => changeStatus(team.id, 'approved')}
                          className="text-xs px-2 py-1 text-on-surface-variant hover:text-emerald-400 transition-colors bg-surface-container rounded"
                        >
                          Aprobar
                        </button>
                      )}
                      {team.status === 'disqualified' && (
                        <button 
                          onClick={() => changeStatus(team.id, 'approved')}
                          className="text-xs px-2 py-1 text-on-surface-variant hover:text-emerald-400 transition-colors bg-surface-container rounded"
                        >
                          Quitar Descalificación
                        </button>
                      )}
                      
                      <button 
                        onClick={() => deleteTeam(team.id, team.name)}
                        className="p-2 text-on-surface-variant hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                        title="Eliminar Equipo"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
