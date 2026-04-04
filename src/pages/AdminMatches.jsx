import React, { useState, useEffect } from 'react';

export default function AdminMatches() {
  const [matches, setMatches] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeTab, setActiveTab] = useState('matches'); // matches | requests
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [scores, setScores] = useState({ home: 0, away: 0 });
  const [homePlayers, setHomePlayers] = useState([]);
  const [awayPlayers, setAwayPlayers] = useState([]);
  const [matchStats, setMatchStats] = useState({});
  const [editData, setEditData] = useState({ match_date: '', match_time: '', field: '' });

  const API_URL = import.meta.env.VITE_API_URL || '';

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

  const fetchRequests = async () => {
    try {
      const res = await fetch(`${API_URL}/api/matches/change-requests/all`);
      const data = await res.json();
      setRequests(data);
    } catch (error) {
      console.error('Error fetching requests:', error);
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

  const generateFinal = async () => {
    if (!confirm('¿Estás seguro de generar la Gran Final con los ganadores de los últimos 2 partidos?')) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/matches/generate-final`, { method: 'POST' });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }
      await fetchMatches();
      alert('¡Gran Final generada con éxito!');
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveResult = async () => {
    const homePlayerGoals = homePlayers.reduce((acc, p) => acc + (matchStats[p.id]?.goals || 0), 0);
    const awayPlayerGoals = awayPlayers.reduce((acc, p) => acc + (matchStats[p.id]?.goals || 0), 0);

    if (homePlayerGoals !== scores.home) {
      alert(`Error en Acta Local: Los goles anotados por los jugadores suman ${homePlayerGoals}, pero el marcador indica ${scores.home}. Deben coincidir exactamente.`);
      return;
    }
    if (awayPlayerGoals !== scores.away) {
      alert(`Error en Acta Visitante: Los goles anotados por los jugadores suman ${awayPlayerGoals}, pero el marcador indica ${scores.away}. Deben coincidir exactamente.`);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/matches/${selectedMatch.id}/result`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            home_goals: scores.home, 
            away_goals: scores.away,
            players_stats: Object.values(matchStats)
        })
      });
      if (res.ok) {
        setShowModal(false);
        fetchMatches();
      }
    } catch (error) {
      console.error('Error saving result:', error);
    }
  };

  const handleSaveEdit = async () => {
    try {
      const res = await fetch(`${API_URL}/api/matches/${selectedMatch.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData)
      });
      if (res.ok) {
        setShowEditModal(false);
        fetchMatches();
      }
    } catch (error) {
      console.error('Error saving match:', error);
    }
  };

  const handleRequestStatus = async (reqId, status, reqData) => {
    try {
      const bodyParams = { status };
      if (status === 'approved') {
        bodyParams.match_id = reqData.match_id;
        bodyParams.new_date = reqData.requested_date;
        bodyParams.new_time = reqData.requested_time;
        // Keep same field if not provided by user request
        bodyParams.new_field = reqData.field || 'Cancha Central';
      }

      const res = await fetch(`${API_URL}/api/matches/change-requests/${reqId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyParams)
      });

      if (res.ok) {
        fetchRequests();
        if (status === 'approved') fetchMatches();
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchMatches();
    fetchRequests();
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
          <button 
            onClick={generateFinal}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-orange-400 text-black font-bold uppercase tracking-widest text-xs hover:bg-orange-300 transition-colors shadow-[0_0_15px_rgba(251,146,60,0.2)]"
          >
            <span className="material-symbols-outlined text-sm">emoji_events</span>
            Generar Final
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Col - Filters & Matchdays */}
        <div className="lg:w-1/3 xl:w-1/4 space-y-4">
          <div className="bg-surface-container-high rounded-2xl p-4 border border-outline-variant/10">
             <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4 px-2">Torneo</h3>
             <div className="p-4 bg-primary/5 rounded-xl border border-primary/20 mb-4">
                <p className="text-xs font-bold text-primary uppercase mb-1">Estado</p>
                <p className="text-white font-bold text-sm">Fase Regular en curso</p>
             </div>
             <div className="flex flex-col gap-2">
               <button 
                 onClick={() => setActiveTab('matches')}
                 className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'matches' ? 'bg-surface-container-highest text-white border border-outline-variant/20' : 'text-on-surface-variant hover:bg-surface-container-low'}`}
               >
                 Fixture
               </button>
               <button 
                 onClick={() => setActiveTab('requests')}
                 className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all flex justify-between ${activeTab === 'requests' ? 'bg-surface-container-highest text-white border border-outline-variant/20' : 'text-on-surface-variant hover:bg-surface-container-low'}`}
               >
                 <span>Solicitudes</span>
                 {requests.filter(r => r.status === 'pending').length > 0 && (
                   <span className="bg-orange-400 text-black px-2 py-0.5 rounded text-xs">{requests.filter(r => r.status === 'pending').length}</span>
                 )}
               </button>
             </div>
          </div>
        </div>

        {/* Right Col - Content */}
        <div className="flex-1 space-y-4">
          
          {activeTab === 'matches' && (
            <>
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
                       <div className="flex flex-col items-end">
                         <span className="font-bold text-white text-sm">{match.home_team_name}</span>
                         <span className="text-[9px] uppercase font-bold text-primary">{match.home_team_category}</span>
                       </div>
                       <div className="w-8 h-8 rounded-full bg-surface-container-highest shrink-0 border border-outline-variant/20 overflow-hidden">
                         {match.home_team_logo && <img src={match.home_team_logo} alt={match.home_team_name} className="w-full h-full object-cover" />}
                       </div>
                     </div>
                     
                     {match.status === 'finished' ? (
                       <div className="px-5 py-2 rounded-lg bg-surface-container-highest border border-outline-variant/10 text-xl font-black text-white font-manrope tracking-widest">
                         {match.home_goals} - {match.away_goals}
                       </div>
                     ) : (
                       <div className="px-4 py-1 rounded bg-surface-container border border-outline-variant/10 text-xs font-bold text-on-surface-variant">VS</div>
                     )}

                     <div className="flex items-center gap-3 w-32 justify-start font-bold">
                       <div className="w-8 h-8 rounded-full bg-surface-container-highest shrink-0 border border-outline-variant/20 overflow-hidden">
                         {match.away_team_logo && <img src={match.away_team_logo} alt={match.away_team_name} className="w-full h-full object-cover" />}
                       </div>
                       <div className="flex flex-col items-start">
                         <span className="font-bold text-white text-sm">{match.away_team_name}</span>
                         <span className="text-[9px] uppercase font-bold text-primary">{match.away_team_category}</span>
                       </div>
                     </div>
                   </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {match.status !== 'finished' ? (
                    <>
                      <button 
                        onClick={() => {
                          setSelectedMatch(match);
                          setEditData({ 
                            match_date: match.match_date ? match.match_date.split('T')[0] : '', 
                            match_time: match.match_time || '', 
                            field: match.field || '' 
                          });
                          setShowEditModal(true);
                        }}
                        className="px-4 py-2 bg-surface-container text-white border border-outline-variant/10 font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-surface-container-highest transition-colors whitespace-nowrap"
                      >
                        Editar
                      </button>
                      <button 
                        onClick={async () => {
                          setSelectedMatch(match);
                          setScores({ home: 0, away: 0 });
                          setLoading(true);
                          
                          try {
                            const [resHome, resAway] = await Promise.all([
                                fetch(`${API_URL}/api/players?team_id=${match.home_team_id}`),
                                fetch(`${API_URL}/api/players?team_id=${match.away_team_id}`)
                            ]);
                            const homeData = await resHome.ok ? await resHome.json() : [];
                            const awayData = await resAway.ok ? await resAway.json() : [];
                            
                            setHomePlayers(homeData);
                            setAwayPlayers(awayData);
                            
                            const initials = {};
                            [...homeData, ...awayData].forEach(p => {
                                initials[p.id] = { player_id: p.id, played: false, goals: 0, yellow_cards: 0, red_cards: 0 };
                            });
                            setMatchStats(initials);
                          } catch (e) {
                              console.error(e);
                          }
                          
                          setLoading(false);
                          setShowModal(true);
                        }}
                        className="px-4 py-2 bg-primary/10 text-primary font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-primary/20 transition-colors whitespace-nowrap"
                      >
                        Cargar Resultado
                      </button>
                    </>
                  ) : (
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest border border-emerald-400/20 px-2 py-1 rounded">Finalizado</span>
                  )}
                </div>
              </div>
            ))}
          </div>
            </>
          )}

          {activeTab === 'requests' && (
            <>
              <div className="flex items-center justify-between bg-surface-container p-4 rounded-2xl border border-outline-variant/10 text-sm mb-6">
                <span className="font-bold text-white tracking-tight">Solicitudes de Cambio</span>
                <span className="text-on-surface-variant">{requests.filter(r => r.status === 'pending').length} Pendientes</span>
              </div>

              <div className="grid gap-4">
                {requests.length === 0 ? (
                  <div className="bg-surface-container-low p-10 rounded-2xl text-center border border-dashed border-outline-variant/20">
                    <p className="text-on-surface-variant">No hay solicitudes recientes.</p>
                  </div>
                ) : requests.map(req => (
                  <div key={req.id} className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-6 hover:border-outline-variant/30 transition-all">
                    <div className="flex flex-col lg:flex-row gap-6 justify-between">
                       <div className="space-y-4 flex-1">
                          <div className="flex items-center justify-between">
                             <div className="flex gap-2 items-center">
                               <span className="text-sm font-bold text-white">{req.requesting_team_name}</span>
                               <span className="text-xs text-on-surface-variant">solicitó un cambio</span>
                             </div>
                             {req.status === 'pending' ? (
                               <span className="px-2 py-1 text-[10px] uppercase font-black bg-orange-400/10 text-orange-400 rounded">Pendiente</span>
                             ) : req.status === 'approved' ? (
                               <span className="px-2 py-1 text-[10px] uppercase font-black bg-emerald-400/10 text-emerald-400 rounded">Aprobado</span>
                             ) : (
                               <span className="px-2 py-1 text-[10px] uppercase font-black bg-error/10 text-error rounded">Rechazado</span>
                             )}
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 bg-surface-container-highest p-4 rounded-xl border border-outline-variant/5">
                             <div>
                               <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">Partido Original</p>
                               <p className="text-sm text-white">{req.home_team_name} vs {req.away_team_name}</p>
                               <p className="text-xs text-on-surface-variant">{req.original_date ? new Date(req.original_date).toLocaleDateString() : 'TBD'} a las {req.original_time?.substring(0,5) || 'TBD'}</p>
                             </div>
                             <div>
                               <p className="text-[10px] uppercase tracking-widest text-primary font-bold mb-1">Nueva Fecha / Hora</p>
                               <p className="text-sm text-white font-bold">{req.requested_date ? new Date(req.requested_date).toLocaleDateString() : 'N/A'}</p>
                               <p className="text-xs text-primary">{req.requested_time ? req.requested_time.substring(0,5) : 'N/A'}</p>
                             </div>
                          </div>

                          <div>
                             <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">Justificación del Capitán</p>
                             <p className="text-sm text-white bg-surface-container p-3 rounded-lg italic">"{req.reason}"</p>
                          </div>
                       </div>
                       
                       {req.status === 'pending' && (
                         <div className="flex lg:flex-col gap-2 shrink-0">
                           <button onClick={() => handleRequestStatus(req.id, 'approved', req)} className="px-4 py-2 bg-emerald-400/10 text-emerald-400 font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-emerald-400/20 w-full">
                             Aprobar
                           </button>
                           <button onClick={() => handleRequestStatus(req.id, 'rejected', req)} className="px-4 py-2 bg-error/10 text-error font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-error/20 w-full">
                             Denegar
                           </button>
                         </div>
                       )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

        </div>
      </div>

      {/* Result Modal */}
      {showModal && selectedMatch && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-surface-container-highest rounded-3xl p-6 md:p-8 w-full max-w-4xl border border-outline-variant/20 shadow-2xl animate-in zoom-in-95 duration-200 my-8">
            <h2 className="text-2xl font-black text-white mb-6 font-headline tracking-tight text-center">Acta de Partido Oficial</h2>
            
            <div className="grid grid-cols-3 gap-2 items-center mb-8 max-w-lg mx-auto bg-surface-container p-6 rounded-3xl border border-outline-variant/10">
              <div className="text-center">
                <p className="text-xs font-bold text-on-surface-variant uppercase mb-2 truncate">{selectedMatch.home_team_name}</p>
                <input 
                  type="number" 
                  value={scores.home}
                  onChange={(e) => setScores({...scores, home: parseInt(e.target.value) || 0})}
                  className="w-20 mx-auto bg-surface-container-highest p-4 rounded-2xl text-4xl font-black text-center text-white border border-outline-variant/20 focus:border-primary outline-none transition-all"
                />
              </div>
              <div className="text-center text-on-surface-variant font-black text-2xl">VS</div>
              <div className="text-center">
                <p className="text-xs font-bold text-on-surface-variant uppercase mb-2 truncate">{selectedMatch.away_team_name}</p>
                <input 
                  type="number" 
                  value={scores.away}
                  onChange={(e) => setScores({...scores, away: parseInt(e.target.value) || 0})}
                  className="w-20 mx-auto bg-surface-container-highest p-4 rounded-2xl text-4xl font-black text-center text-white border border-outline-variant/20 focus:border-primary outline-none transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Home Players */}
              <div>
                 <h3 className="text-primary font-black uppercase tracking-widest text-sm mb-4 border-b border-outline-variant/20 pb-2">{selectedMatch.home_team_name}</h3>
                 <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                    {homePlayers.length === 0 ? <p className="text-xs text-on-surface-variant italic">No hay jugadores registrados</p> : homePlayers.map(p => (
                       <div key={p.id} className="bg-surface-container p-3 rounded-xl border border-outline-variant/5">
                          <div className="flex items-center justify-between mb-2">
                             <div className="flex items-center gap-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                  <input 
                                    type="checkbox" 
                                    className="w-4 h-4 accent-primary rounded"
                                    checked={matchStats[p.id]?.played || false}
                                    onChange={(e) => setMatchStats({...matchStats, [p.id]: { ...matchStats[p.id], played: e.target.checked }})}
                                  />
                                  <span className={`text-sm font-bold ${matchStats[p.id]?.played ? 'text-white' : 'text-on-surface-variant'}`}>{p.name} <span className="text-[10px]">#{p.number}</span></span>
                                </label>
                             </div>
                          </div>
                          {matchStats[p.id]?.played && (
                            <div className="flex gap-2 items-center pl-6 animate-in slide-in-from-top-2 duration-300">
                               <div className="flex items-center gap-1 bg-surface-container-highest rounded px-2 py-1">
                                  <span className="material-symbols-outlined text-[14px] text-emerald-400">sports_soccer</span>
                                  <input type="number" min="0" value={matchStats[p.id]?.goals || ''} onChange={e => setMatchStats({...matchStats, [p.id]: {...matchStats[p.id], goals: parseInt(e.target.value)||0}})} className="w-8 text-xs bg-transparent text-white outline-none text-center" placeholder="0" />
                               </div>
                               <div className="flex items-center gap-1 bg-surface-container-highest rounded px-2 py-1">
                                  <div className="w-3 h-4 bg-yellow-400 rounded-sm"></div>
                                  <input type="number" min="0" max="2" value={matchStats[p.id]?.yellow_cards || ''} onChange={e => setMatchStats({...matchStats, [p.id]: {...matchStats[p.id], yellow_cards: parseInt(e.target.value)||0}})} className="w-8 text-xs bg-transparent text-white outline-none text-center" placeholder="0" />
                               </div>
                               <div className="flex items-center gap-1 bg-surface-container-highest rounded px-2 py-1">
                                  <div className="w-3 h-4 bg-red-500 rounded-sm"></div>
                                  <input type="number" min="0" max="1" value={matchStats[p.id]?.red_cards || ''} onChange={e => setMatchStats({...matchStats, [p.id]: {...matchStats[p.id], red_cards: parseInt(e.target.value)||0}})} className="w-8 text-xs bg-transparent text-white outline-none text-center" placeholder="0" />
                               </div>
                            </div>
                          )}
                       </div>
                    ))}
                 </div>
              </div>

              {/* Away Players */}
              <div>
                 <h3 className="text-secondary font-black uppercase tracking-widest text-sm mb-4 border-b border-outline-variant/20 pb-2 text-white">{selectedMatch.away_team_name}</h3>
                 <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                    {awayPlayers.length === 0 ? <p className="text-xs text-on-surface-variant italic">No hay jugadores registrados</p> : awayPlayers.map(p => (
                       <div key={p.id} className="bg-surface-container p-3 rounded-xl border border-outline-variant/5">
                          <div className="flex items-center justify-between mb-2">
                             <div className="flex items-center gap-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                  <input 
                                    type="checkbox" 
                                    className="w-4 h-4 accent-primary rounded"
                                    checked={matchStats[p.id]?.played || false}
                                    onChange={(e) => setMatchStats({...matchStats, [p.id]: { ...matchStats[p.id], played: e.target.checked }})}
                                  />
                                  <span className={`text-sm font-bold ${matchStats[p.id]?.played ? 'text-white' : 'text-on-surface-variant'}`}>{p.name} <span className="text-[10px]">#{p.number}</span></span>
                                </label>
                             </div>
                          </div>
                          {matchStats[p.id]?.played && (
                            <div className="flex gap-2 items-center pl-6 animate-in slide-in-from-top-2 duration-300">
                               <div className="flex items-center gap-1 bg-surface-container-highest rounded px-2 py-1">
                                  <span className="material-symbols-outlined text-[14px] text-emerald-400">sports_soccer</span>
                                  <input type="number" min="0" value={matchStats[p.id]?.goals || ''} onChange={e => setMatchStats({...matchStats, [p.id]: {...matchStats[p.id], goals: parseInt(e.target.value)||0}})} className="w-8 text-xs bg-transparent text-white outline-none text-center" placeholder="0" />
                               </div>
                               <div className="flex items-center gap-1 bg-surface-container-highest rounded px-2 py-1">
                                  <div className="w-3 h-4 bg-yellow-400 rounded-sm"></div>
                                  <input type="number" min="0" max="2" value={matchStats[p.id]?.yellow_cards || ''} onChange={e => setMatchStats({...matchStats, [p.id]: {...matchStats[p.id], yellow_cards: parseInt(e.target.value)||0}})} className="w-8 text-xs bg-transparent text-white outline-none text-center" placeholder="0" />
                               </div>
                               <div className="flex items-center gap-1 bg-surface-container-highest rounded px-2 py-1">
                                  <div className="w-3 h-4 bg-red-500 rounded-sm"></div>
                                  <input type="number" min="0" max="1" value={matchStats[p.id]?.red_cards || ''} onChange={e => setMatchStats({...matchStats, [p.id]: {...matchStats[p.id], red_cards: parseInt(e.target.value)||0}})} className="w-8 text-xs bg-transparent text-white outline-none text-center" placeholder="0" />
                               </div>
                            </div>
                          )}
                       </div>
                    ))}
                 </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button onClick={() => setShowModal(false)} className="flex-1 py-3 font-bold text-on-surface-variant hover:text-white transition-colors">Cancelar</button>
              <button 
                onClick={handleSaveResult}
                className="flex-[2] py-4 bg-primary text-black font-black uppercase tracking-widest text-sm rounded-xl hover:bg-emerald-400 transition-all shadow-[0_0_15px_rgba(107,254,156,0.2)]"
              >
                Guardar Acta Oficial
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Edit Match Modal */}
      {showEditModal && selectedMatch && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-highest rounded-3xl p-8 w-full max-w-md border border-outline-variant/20 shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-black text-white mb-2 font-headline tracking-tight text-center">Editar Partido</h2>
            <p className="text-sm text-center text-on-surface-variant font-bold uppercase tracking-widest mb-6">
              {selectedMatch.home_team_name} vs {selectedMatch.away_team_name}
            </p>
            
            <div className="space-y-4 mb-8">
               <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-2 block ml-1">Fecha</label>
                  <input 
                    type="date"
                    value={editData.match_date}
                    onChange={(e) => setEditData({...editData, match_date: e.target.value})}
                    className="w-full bg-surface-container border border-outline-variant/10 text-white text-sm rounded-xl px-4 py-3 outline-none focus:border-primary"
                  />
               </div>
               <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-2 block ml-1">Hora</label>
                  <input 
                    type="time"
                    value={editData.match_time}
                    onChange={(e) => setEditData({...editData, match_time: e.target.value})}
                    className="w-full bg-surface-container border border-outline-variant/10 text-white text-sm rounded-xl px-4 py-3 outline-none focus:border-primary"
                  />
               </div>
               <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-2 block ml-1">Cancha</label>
                  <input 
                    type="text"
                    value={editData.field}
                    onChange={(e) => setEditData({...editData, field: e.target.value})}
                    placeholder="Ej. Cancha 1"
                    className="w-full bg-surface-container border border-outline-variant/10 text-white text-sm rounded-xl px-4 py-3 outline-none focus:border-primary"
                  />
               </div>
            </div>

            <div className="flex gap-4">
              <button onClick={() => setShowEditModal(false)} className="flex-1 py-3 font-bold text-on-surface-variant hover:text-white transition-colors">Cancelar</button>
              <button 
                onClick={handleSaveEdit}
                className="flex-1 py-3 bg-primary text-black font-black uppercase tracking-widest text-xs rounded-xl hover:bg-emerald-400 transition-all"
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
