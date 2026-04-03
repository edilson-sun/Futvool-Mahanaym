import React, { useState, useEffect } from 'react';

export default function PublicDashboard() {
  const [standings, setStandings] = useState([]);
  const [scorers, setScorers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || '';

  const fetchData = async () => {
    try {
      const [standingsRes, playersRes, matchesRes] = await Promise.all([
        fetch(`${API_URL}/api/standings`),
        fetch(`${API_URL}/api/players`),
        fetch(`${API_URL}/api/matches`)
      ]);
      
      const standingsData = await standingsRes.json();
      const playersData = await playersRes.json();
      const matchesData = await matchesRes.json();

      setStandings(standingsData);
      setScorers(playersData.sort((a, b) => b.goals - a.goals).slice(0, 5));
      // Filter next 4 upcoming or recently finished matches
      setMatches(matchesData.slice(-4).reverse());
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="animate-in fade-in duration-700">
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-300 font-headline mb-4 tracking-tighter">
            Liga Mahanaym
          </h1>
          <p className="text-on-surface-variant font-medium text-lg md:text-xl font-manrope">
            Torneo Clausura 2024
          </p>
        </div>
        <div className="hidden lg:flex items-center gap-4 bg-surface-container-high p-4 rounded-2xl border border-outline-variant/10">
           <div className="text-right">
             <p className="text-[10px] uppercase font-black text-on-surface-variant tracking-widest">Estado del Torneo</p>
             <p className="text-sm font-bold text-white">Fase de Grupos</p>
           </div>
           <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
             <span className="material-symbols-outlined text-primary text-sm">paddlestat</span>
           </div>
        </div>
      </div>

      {/* Matches Preview */}
      <div className="mb-12">
        <h2 className="text-xl font-bold font-headline tracking-tight flex items-center gap-2 mb-6">
          <span className="material-symbols-outlined text-primary">event_upcoming</span>
          Próximos Encuentros
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
           {loading ? (
             [1,2,3,4].map(i => <div key={i} className="h-32 bg-surface-container-high rounded-2xl animate-pulse"></div>)
           ) : matches.length === 0 ? (
             <div className="col-span-full py-8 text-center bg-surface-container-low rounded-2xl border border-dashed border-outline-variant/20 italic text-on-surface-variant text-sm">
               No hay partidos programados próximamente.
             </div>
           ) : matches.map(match => (
             <div key={match.id} className="glass-card p-5 rounded-2xl border border-outline-variant/5 flex flex-col items-center justify-center gap-4 hover:border-primary/20 transition-all group">
                <div className="flex items-center justify-between w-full">
                  <div className="flex flex-col items-center gap-2 flex-1">
                    {match.home_team_logo ? (
                      <div className="w-10 h-10 rounded-full bg-surface-container-highest border border-outline-variant/10 shadow-inner overflow-hidden">
                        <img src={match.home_team_logo} alt={match.home_team_name} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-xs font-black border border-outline-variant/10 shadow-inner">{match.home_team_name.slice(0,2).toUpperCase()}</div>
                    )}
                    <span className="text-[9px] uppercase font-black text-on-surface-variant truncate w-full text-center">{match.home_team_name}</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center">
                     {match.status === 'finished' ? (
                       <span className="text-xl font-black text-white">{match.home_goals} - {match.away_goals}</span>
                     ) : (
                       <div className="bg-primary/10 px-2 py-0.5 rounded">
                         <span className="text-[10px] font-black text-primary uppercase">{match.match_time.slice(0,5)}</span>
                       </div>
                     )}
                     <span className="text-[8px] uppercase font-bold text-on-surface-variant mt-1">{match.status === 'finished' ? 'FINAL' : match.match_date.split('T')[0]}</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 flex-1">
                    {match.away_team_logo ? (
                      <div className="w-10 h-10 rounded-full bg-surface-container-highest border border-outline-variant/10 shadow-inner overflow-hidden">
                        <img src={match.away_team_logo} alt={match.away_team_name} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-xs font-black border border-outline-variant/10 shadow-inner">{match.away_team_name.slice(0,2).toUpperCase()}</div>
                    )}
                    <span className="text-[9px] uppercase font-black text-on-surface-variant truncate w-full text-center">{match.away_team_name}</span>
                  </div>
                </div>
             </div>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-headline tracking-tight flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">leaderboard</span>
              Tabla de Posiciones
            </h2>
          </div>

          <div className="glass-panel rounded-2xl overflow-hidden border border-outline-variant/10 shadow-2xl relative min-h-[400px]">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-tertiary to-primary"></div>
            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex justify-center items-center h-64">
                   <span className="material-symbols-outlined animate-spin text-4xl text-primary">sync</span>
                </div>
              ) : (
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="bg-surface-container-highest/50 border-b border-outline-variant/10 text-on-surface-variant text-[10px] uppercase tracking-widest font-bold">
                      <th className="p-4 pl-6 w-16 text-center">Pos</th>
                      <th className="p-4">Club</th>
                      <th className="p-4 text-center w-12">PJ</th>
                      <th className="p-4 text-center w-12">G</th>
                      <th className="p-4 text-center w-12">E</th>
                      <th className="p-4 text-center w-12">P</th>
                      <th className="p-4 text-center w-12">GF</th>
                      <th className="p-4 text-center w-12">GC</th>
                      <th className="p-4 text-center w-12">DIF</th>
                      <th className="p-4 pr-6 text-center w-16 text-primary">PTS</th>
                    </tr>
                  </thead>
                  <tbody className="font-manrope text-sm font-medium">
                    {standings.length === 0 ? (
                      <tr>
                        <td colSpan="10" className="p-8 text-center text-on-surface-variant">Sin datos de posiciones disponibles.</td>
                      </tr>
                    ) : standings.map((team, index) => (
                      <tr key={team.team_id} className="border-b border-outline-variant/5 hover:bg-surface-container-high/50 transition-colors group">
                        <td className="p-4 pl-6 text-center">
                          <div className={`w-6 h-6 rounded-full font-bold flex items-center justify-center text-xs mx-auto group-hover:scale-110 transition-transform ${index === 0 ? 'bg-primary text-black shadow-[0_0_10px_rgba(107,254,156,0.3)]' : 'bg-surface-container-highest text-white'}`}>
                            {index + 1}
                          </div>
                        </td>
                        <td className="p-4 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-surface-container-highest border border-outline-variant/20 flex items-center justify-center overflow-hidden p-0">
                            {team.logo_url ? (
                               <img src={team.logo_url} alt={team.team_name} className="w-full h-full object-cover" />
                            ) : (
                               <span className={`material-symbols-outlined text-sm ${index === 0 ? 'text-primary' : 'text-on-surface-variant'}`}>shield</span>
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className={`font-bold tracking-tight ${team.status === 'disqualified' ? 'text-on-surface-variant line-through opacity-70' : 'text-white'}`}>{team.team_name}</span>
                            {team.status === 'disqualified' && (
                              <span className="text-[9px] uppercase font-bold text-red-500 tracking-widest mt-0.5">Descalificado</span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-center text-on-surface-variant">{team.played}</td>
                        <td className="p-4 text-center text-on-surface-variant">{team.won}</td>
                        <td className="p-4 text-center text-on-surface-variant">{team.drawn}</td>
                        <td className="p-4 text-center text-on-surface-variant">{team.lost}</td>
                        <td className="p-4 text-center text-on-surface-variant">{team.goals_for}</td>
                        <td className="p-4 text-center text-on-surface-variant">{team.goals_against}</td>
                        <td className={`p-4 text-center ${team.goal_diff >= 0 ? 'text-emerald-400' : 'text-error'}`}>
                          {team.goal_diff > 0 ? `+${team.goal_diff}` : team.goal_diff}
                        </td>
                        <td className="p-4 pr-6 text-center font-black text-primary text-base">{team.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <h2 className="text-xl font-bold font-headline tracking-tight flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">local_fire_department</span>
            Goleadores
          </h2>
          
          <div className="space-y-4">
            {loading ? (
              <div className="py-10 text-center">
                 <span className="material-symbols-outlined animate-spin text-primary">sync</span>
              </div>
            ) : scorers.length === 0 ? (
              <p className="text-on-surface-variant text-center py-4">No hay datos de goleadores.</p>
            ) : scorers.map((player, index) => (
              <div key={player.id} className="glass-card rounded-2xl p-4 flex items-center gap-4 relative overflow-hidden group">
                {index === 0 && <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-primary/10 to-transparent"></div>}
                <div className={`w-12 h-12 rounded-full bg-surface-container-highest flex border ${index === 0 ? 'border-primary/30' : 'border-outline-variant/30'} items-center justify-center`}>
                  <span className={`material-symbols-outlined ${index === 0 ? 'text-primary' : 'text-on-surface-variant'}`}>person</span>
                </div>
                <div className="flex-1">
                  <h3 className={`font-bold text-sm tracking-tight transition-colors ${index === 0 ? 'group-hover:text-primary text-white' : 'group-hover:text-white text-on-surface-variant'}`}>
                    {player.name}
                  </h3>
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">{player.team_name || 'Individual'}</p>
                </div>
                <div className="text-right pr-4 relative z-10">
                  <p className={`text-2xl font-black ${index === 0 ? 'text-white' : 'text-on-surface-variant'}`}>{player.goals}</p>
                  <p className={`text-[9px] uppercase font-bold tracking-widest ${index === 0 ? 'text-primary' : 'text-on-surface-variant/60'}`}>Goles</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
