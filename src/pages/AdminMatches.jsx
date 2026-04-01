import React, { useState, useEffect } from 'react';

export default function AdminMatches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [scores, setScores] = useState({ home: 0, away: 0 });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  const fetchMatches = async () => {
    try {
      const res = await fetch(`${API_URL}/api/matches`);
      const data = await res.json();
      setMatches(data);
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateFixture = async () => {
    if (!confirm('¿Estás seguro de generar un nuevo fixture de 20 partidos? Esto agregará partidos aleatorios entre equipos aprobados.')) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/matches/generate`, { method: 'POST' });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }
      await fetchMatches();
      alert('Fixture generado con éxito');
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveResult = async () => {
    try {
      const res = await fetch(`${API_URL}/api/matches/${selectedMatch.id}/result`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ home_goals: scores.home, away_goals: scores.away })
      });
      if (res.ok) {
        setShowModal(false);
        fetchMatches();
      }
    } catch (error) {
      console.error('Error saving result:', error);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10 border-b border-outline-variant/10 pb-6">
        <div>
          <h1 className="text-3xl font-black font-headline tracking-tight text-white mb-2">Fixture y Resultados</h1>
          <p className="text-sm text-on-surface-variant font-manrope">Gestión de jornadas, horarios y resultados oficiales</p>
        </div>
        <div className="flex gap-4">
          <button onClick={fetchMatches} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-surface-container border border-outline-variant/20 hover:bg-surface-container-high transition-colors text-sm font-bold text-white">
            <span className="material-symbols-outlined text-sm">refresh</span>
            Actualizar
          </button>
          <button 
            onClick={generateFixture}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-black font-bold uppercase tracking-widest text-xs hover:bg-emerald-400 transition-colors shadow-[0_0_15px_rgba(107,254,156,0.2)]"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Generar Fixture
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Col - Filters & Matchdays */}
        <div className="lg:w-1/3 xl:w-1/4 space-y-4">
          <div className="bg-surface-container-high rounded-2xl p-4 border border-outline-variant/10">
             <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4 px-2">Torneo</h3>
             <div className="p-4 bg-primary/5 rounded-xl border border-primary/20">
                <p className="text-xs font-bold text-primary uppercase mb-1">Estado</p>
                <p className="text-white font-bold text-sm">Fase Regular en curso</p>
             </div>
          </div>
        </div>

        {/* Right Col - Matches List */}
        <div className="flex-1 space-y-4">
          
          <div className="flex items-center justify-between bg-surface-container p-4 rounded-2xl border border-outline-variant/10 text-sm mb-6">
            <span className="font-bold text-white tracking-tight">Próximos Partidos</span>
            <span className="text-on-surface-variant">{matches.length} Registrados</span>
          </div>

          <div className="grid gap-4">
            {loading ? (
              <div className="py-20 text-center">
                <span className="material-symbols-outlined animate-spin text-primary text-4xl">sync</span>
              </div>
            ) : matches.length === 0 ? (
              <div className="bg-surface-container-low p-10 rounded-2xl text-center border border-dashed border-outline-variant/20">
                <p className="text-on-surface-variant">No hay partidos programados. Usa "Generar Fixture" para empezar.</p>
              </div>
            ) : matches.map(match => (
              <div key={match.id} className={`bg-surface-container-low border border-outline-variant/10 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between hover:border-outline-variant/30 transition-all gap-6 ${match.status === 'finished' ? 'opacity-70' : ''}`}>
                <div className="flex items-center gap-6 w-full md:w-auto">
                   <div className="text-center w-24">
                     <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold mb-1">{match.field || 'Cancha TBD'}</p>
                     <p className="font-bold text-white font-manrope">{match.match_time.substring(0,5)}</p>
                     <p className="text-[10px] text-primary font-bold">{new Date(match.match_date).toLocaleDateString()}</p>
                   </div>
                   <div className="h-10 w-px bg-outline-variant/20 hidden md:block"></div>
                   <div className="flex items-center gap-4 flex-1">
                     <div className="flex items-center gap-3 w-32 justify-end text-right">
                       <span className="font-bold text-white text-sm">{match.home_team_name}</span>
                       <div className="w-8 h-8 rounded-full bg-surface-container-highest shrink-0 border border-outline-variant/20"></div>
                     </div>
                     
                     {match.status === 'finished' ? (
                       <div className="px-5 py-2 rounded-lg bg-surface-container-highest border border-outline-variant/10 text-xl font-black text-white font-manrope tracking-widest">
                         {match.home_goals} - {match.away_goals}
                       </div>
                     ) : (
                       <div className="px-4 py-1 rounded bg-surface-container border border-outline-variant/10 text-xs font-bold text-on-surface-variant">VS</div>
                     )}

                     <div className="flex items-center gap-3 w-32 justify-start font-bold">
                       <div className="w-8 h-8 rounded-full bg-surface-container-highest shrink-0 border border-outline-variant/20"></div>
                       <span className="font-bold text-white text-sm">{match.away_team_name}</span>
                     </div>
                   </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {match.status !== 'finished' ? (
                    <button 
                      onClick={() => {
                        setSelectedMatch(match);
                        setScores({ home: 0, away: 0 });
                        setShowModal(true);
                      }}
                      className="px-4 py-2 bg-primary/10 text-primary font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-primary/20 transition-colors whitespace-nowrap"
                    >
                      Cargar Resultado
                    </button>
                  ) : (
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest border border-emerald-400/20 px-2 py-1 rounded">Finalizado</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Result Modal */}
      {showModal && selectedMatch && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-highest rounded-3xl p-8 w-full max-w-md border border-outline-variant/20 shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-black text-white mb-6 font-headline tracking-tight text-center">Acta de Partido</h2>
            
            <div className="grid grid-cols-3 gap-4 items-center mb-8">
              <div className="text-center">
                <p className="text-xs font-bold text-on-surface-variant uppercase mb-2 truncate">{selectedMatch.home_team_name}</p>
                <input 
                  type="number" 
                  value={scores.home}
                  onChange={(e) => setScores({...scores, home: parseInt(e.target.value) || 0})}
                  className="w-full bg-surface-container p-4 rounded-2xl text-3xl font-black text-center text-white border border-outline-variant/20 focus:border-primary outline-none transition-all"
                />
              </div>
              <div className="text-center text-on-surface-variant font-black text-2xl">-</div>
              <div className="text-center">
                <p className="text-xs font-bold text-on-surface-variant uppercase mb-2 truncate">{selectedMatch.away_team_name}</p>
                <input 
                  type="number" 
                  value={scores.away}
                  onChange={(e) => setScores({...scores, away: parseInt(e.target.value) || 0})}
                  className="w-full bg-surface-container p-4 rounded-2xl text-3xl font-black text-center text-white border border-outline-variant/20 focus:border-primary outline-none transition-all"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button onClick={() => setShowModal(false)} className="flex-1 py-3 font-bold text-on-surface-variant hover:text-white transition-colors">Cancelar</button>
              <button 
                onClick={handleSaveResult}
                className="flex-1 py-3 bg-primary text-black font-black uppercase tracking-widest text-xs rounded-xl hover:bg-emerald-400 transition-all"
              >
                Guardar Acta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
