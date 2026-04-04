import React, { useState, useEffect } from 'react';

const CATEGORIES = ['Todas', 'sub-8', 'sub-10', 'sub-12', 'sub-13', 'sub-14', 'sub-15', 'sub-16', 'sub-17', 'sub-18'];
const API_URL = import.meta.env.VITE_API_URL || '';

// ─── Utility ─────────────────────────────────────────────────────────────────
function fmtDate(d) {
  if (!d) return 'TBD';
  return new Date(d).toLocaleDateString('es', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
function fmtTime(t) {
  if (!t) return '--:--';
  return String(t).substring(0, 5);
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  if (status === 'finished')
    return <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest border border-emerald-400/20 px-2 py-1 rounded">Finalizado</span>;
  return <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest border border-blue-400/20 px-2 py-1 rounded">Programado</span>;
}

// ─── Team Logo ────────────────────────────────────────────────────────────────
function TeamLogo({ logo, name }) {
  return (
    <div className="w-9 h-9 rounded-full bg-surface-container-highest shrink-0 border border-outline-variant/20 overflow-hidden flex items-center justify-center">
      {logo
        ? <img src={logo} alt={name} className="w-full h-full object-cover" />
        : <span className="material-symbols-outlined text-on-surface-variant text-base">shield</span>
      }
    </div>
  );
}

// ─── Match Card ───────────────────────────────────────────────────────────────
function MatchCard({ match, onEdit, onLoadResult }) {
  return (
    <div className={`bg-surface-container-low border border-outline-variant/10 rounded-2xl p-5 hover:border-primary/20 transition-all ${match.status === 'finished' ? 'opacity-75' : ''}`}>
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">

        {/* Date / Field */}
        <div className="text-center w-28 shrink-0">
          <p className="text-[9px] text-on-surface-variant uppercase tracking-widest font-bold">{match.field || 'TBD'}</p>
          <p className="font-black text-white font-manrope text-lg">{fmtTime(match.match_time)}</p>
          <p className="text-[10px] text-primary font-bold">{fmtDate(match.match_date)}</p>
          {match.home_team_category && (
            <span className="text-[9px] bg-primary/10 text-primary px-2 py-0.5 rounded font-bold uppercase">
              {match.home_team_category}
            </span>
          )}
        </div>

        <div className="hidden md:block h-12 w-px bg-outline-variant/20" />

        {/* Teams */}
        <div className="flex items-center gap-3 flex-1 justify-center">
          <div className="flex items-center gap-2 justify-end w-36 text-right">
            <div>
              <p className="font-bold text-white text-sm leading-tight">{match.home_team_name}</p>
            </div>
            <TeamLogo logo={match.home_team_logo} name={match.home_team_name} />
          </div>

          {match.status === 'finished' ? (
            <div className="px-5 py-2 rounded-xl bg-surface-container-highest border border-outline-variant/10 text-2xl font-black text-white tracking-widest">
              {match.home_goals} <span className="text-on-surface-variant">-</span> {match.away_goals}
            </div>
          ) : (
            <div className="px-4 py-2 rounded-lg bg-surface-container border border-outline-variant/10 text-xs font-black text-on-surface-variant tracking-widest">VS</div>
          )}

          <div className="flex items-center gap-2 justify-start w-36">
            <TeamLogo logo={match.away_team_logo} name={match.away_team_name} />
            <p className="font-bold text-white text-sm leading-tight">{match.away_team_name}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <StatusBadge status={match.status} />
          {match.status !== 'finished' && (
            <>
              <button
                onClick={() => onEdit(match)}
                className="px-3 py-2 bg-surface-container text-white border border-outline-variant/20 font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-surface-container-highest transition-colors"
              >
                Editar
              </button>
              <button
                onClick={() => onLoadResult(match)}
                className="px-3 py-2 bg-primary/10 text-primary font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-primary/20 transition-colors"
              >
                Acta
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminMatches() {
  const [matches, setMatches] = useState([]);
  const [requests, setRequests] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('matches');
  const [filterCategory, setFilterCategory] = useState('Todas');

  // Modals
  const [showResultModal, setShowResultModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  const [selectedMatch, setSelectedMatch] = useState(null);
  const [scores, setScores] = useState({ home: 0, away: 0 });
  const [homePlayers, setHomePlayers] = useState([]);
  const [awayPlayers, setAwayPlayers] = useState([]);
  const [matchStats, setMatchStats] = useState({});

  const [editData, setEditData] = useState({ match_date: '', match_time: '', field: '' });
  const [addData, setAddData] = useState({ category: '', home_team_id: '', away_team_id: '', match_date: '', match_time: '', field: 'Cancha 1' });
  const [generateCategory, setGenerateCategory] = useState('');
  const [generating, setGenerating] = useState(false);

  // ── Fetches ────────────────────────────────────────────────────────────────
  const fetchMatches = async () => {
    try {
      const res = await fetch(`${API_URL}/api/matches`);
      const data = await res.json();
      setMatches(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('fetchMatches:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await fetch(`${API_URL}/api/matches/change-requests/all`);
      const data = await res.json();
      setRequests(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('fetchRequests:', e);
    }
  };

  const fetchTeams = async () => {
    try {
      const res = await fetch(`${API_URL}/api/teams`);
      const data = await res.json();
      setTeams(Array.isArray(data) ? data.filter(t => t.status === 'approved') : []);
    } catch (e) {
      console.error('fetchTeams:', e);
    }
  };

  useEffect(() => {
    fetchMatches();
    fetchRequests();
    fetchTeams();
  }, []);

  // ── Filtered matches ───────────────────────────────────────────────────────
  const filteredMatches = matches.filter(m =>
    filterCategory === 'Todas' || m.home_team_category?.toLowerCase() === filterCategory.toLowerCase()
  );

  // ── Generate Fixture ───────────────────────────────────────────────────────
  const handleGenerateFixture = async () => {
    if (!generateCategory) { alert('Selecciona una categoría.'); return; }
    try {
      setGenerating(true);
      const res = await fetch(`${API_URL}/api/matches/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: generateCategory }),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error); }
      await fetchMatches();
      setShowGenerateModal(false);
      setFilterCategory(generateCategory);
      alert(`Fixture para ${generateCategory.toUpperCase()} generado correctamente.`);
    } catch (e) {
      alert(e.message);
    } finally {
      setGenerating(false);
    }
  };

  // ── Add Match ──────────────────────────────────────────────────────────────
  const handleSaveAdd = async () => {
    const { home_team_id, away_team_id, match_date, match_time } = addData;
    if (!home_team_id || !away_team_id || !match_date || !match_time) {
      alert('Completa todos los campos obligatorios.'); return;
    }
    if (home_team_id === away_team_id) {
      alert('Un equipo no puede jugar contra sí mismo.'); return;
    }
    try {
      const res = await fetch(`${API_URL}/api/matches`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addData),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error); }
      setShowAddModal(false);
      setAddData({ category: '', home_team_id: '', away_team_id: '', match_date: '', match_time: '', field: 'Cancha 1' });
      await fetchMatches();
    } catch (e) {
      alert(e.message);
    }
  };

  // ── Edit Match ─────────────────────────────────────────────────────────────
  const openEdit = (match) => {
    setSelectedMatch(match);
    setEditData({
      match_date: match.match_date ? match.match_date.split('T')[0] : '',
      match_time: match.match_time || '',
      field: match.field || '',
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    try {
      const res = await fetch(`${API_URL}/api/matches/${selectedMatch.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      });
      if (res.ok) { setShowEditModal(false); await fetchMatches(); }
    } catch (e) {
      console.error('saveEdit:', e);
    }
  };

  // ── Load Result ────────────────────────────────────────────────────────────
  const openResult = async (match) => {
    setSelectedMatch(match);
    setScores({ home: 0, away: 0 });
    setLoading(true);
    try {
      const [r1, r2] = await Promise.all([
        fetch(`${API_URL}/api/players?team_id=${match.home_team_id}`),
        fetch(`${API_URL}/api/players?team_id=${match.away_team_id}`),
      ]);
      const hp = r1.ok ? await r1.json() : [];
      const ap = r2.ok ? await r2.json() : [];
      setHomePlayers(hp);
      setAwayPlayers(ap);
      const init = {};
      [...hp, ...ap].forEach(p => {
        init[p.id] = { player_id: p.id, played: false, goals: 0, yellow_cards: 0, red_cards: 0 };
      });
      setMatchStats(init);
    } catch (e) {
      console.error('openResult:', e);
    } finally {
      setLoading(false);
    }
    setShowResultModal(true);
  };

  const handleSaveResult = async () => {
    const hpGoals = homePlayers.reduce((a, p) => a + (matchStats[p.id]?.goals || 0), 0);
    const apGoals = awayPlayers.reduce((a, p) => a + (matchStats[p.id]?.goals || 0), 0);
    if (hpGoals !== scores.home) {
      alert(`Goles del equipo local no coinciden: jugadores = ${hpGoals}, marcador = ${scores.home}.`); return;
    }
    if (apGoals !== scores.away) {
      alert(`Goles del equipo visitante no coinciden: jugadores = ${apGoals}, marcador = ${scores.away}.`); return;
    }
    try {
      const res = await fetch(`${API_URL}/api/matches/${selectedMatch.id}/result`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ home_goals: scores.home, away_goals: scores.away, players_stats: Object.values(matchStats) }),
      });
      if (res.ok) { setShowResultModal(false); await fetchMatches(); }
    } catch (e) {
      console.error('saveResult:', e);
    }
  };

  // ── Handle Request ─────────────────────────────────────────────────────────
  const handleRequestStatus = async (reqId, status, req) => {
    try {
      const body = { status };
      if (status === 'approved') {
        body.match_id = req.match_id;
        body.new_date = req.requested_date;
        body.new_time = req.requested_time;
        body.new_field = req.field || 'Cancha 1';
      }
      const res = await fetch(`${API_URL}/api/matches/change-requests/${reqId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        await fetchRequests();
        if (status === 'approved') await fetchMatches();
      }
    } catch (e) {
      console.error('requestStatus:', e);
    }
  };

  // ── Stat input helper ──────────────────────────────────────────────────────
  const setStat = (playerId, field, value) => {
    setMatchStats(prev => ({ ...prev, [playerId]: { ...prev[playerId], [field]: value } }));
  };

  const pendingRequests = requests.filter(r => r.status === 'pending').length;

  // ──────────────────────────────────────────────────────────────────────────
  // RENDER
  // ──────────────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto animate-in fade-in duration-500">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-outline-variant/10 pb-6">
        <div>
          <h1 className="text-3xl font-black font-headline tracking-tight text-white mb-1">Fixture y Resultados</h1>
          <p className="text-sm text-on-surface-variant font-manrope">Gestión de jornadas, horarios y resultados oficiales</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={fetchMatches} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container border border-outline-variant/20 hover:bg-surface-container-high transition-colors text-sm font-bold text-white">
            <span className="material-symbols-outlined text-sm">refresh</span>
            Actualizar
          </button>
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container-highest border border-primary/30 hover:border-primary/60 transition-all text-sm font-bold text-white">
            <span className="material-symbols-outlined text-sm text-primary">add_circle</span>
            Crear Partido
          </button>
          <button onClick={() => setShowGenerateModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-black font-bold uppercase tracking-widest text-xs hover:bg-emerald-400 transition-colors shadow-[0_0_15px_rgba(107,254,156,0.15)]">
            <span className="material-symbols-outlined text-sm">auto_fix_high</span>
            Generar Fixture
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">

        {/* Sidebar */}
        <div className="lg:w-56 shrink-0 space-y-4">
          <div className="bg-surface-container-high rounded-2xl p-4 border border-outline-variant/10 space-y-1">
            <p className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant px-2 mb-3">Vistas</p>
            <button
              onClick={() => setActiveTab('matches')}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'matches' ? 'bg-surface-container-highest text-white' : 'text-on-surface-variant hover:bg-surface-container'}`}
            >
              <span className="material-symbols-outlined text-sm align-middle mr-2">calendar_month</span>
              Fixture
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex justify-between items-center ${activeTab === 'requests' ? 'bg-surface-container-highest text-white' : 'text-on-surface-variant hover:bg-surface-container'}`}
            >
              <span><span className="material-symbols-outlined text-sm align-middle mr-2">swap_horiz</span>Solicitudes</span>
              {pendingRequests > 0 && <span className="bg-orange-400 text-black px-2 py-0.5 rounded text-xs font-black">{pendingRequests}</span>}
            </button>
          </div>

          {/* Category Filter */}
          <div className="bg-surface-container-high rounded-2xl p-4 border border-outline-variant/10">
            <p className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-3 px-2">Categoría</p>
            <div className="flex flex-col gap-1">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                    filterCategory === cat
                      ? 'bg-primary text-black'
                      : 'text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  {cat === 'Todas' ? 'Todas las categorías' : cat.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0 space-y-4">

          {activeTab === 'matches' && (
            <>
              <div className="flex items-center justify-between bg-surface-container px-5 py-3 rounded-2xl border border-outline-variant/10">
                <span className="font-bold text-white text-sm">
                  Partidos {filterCategory !== 'Todas' && <span className="text-primary">— {filterCategory.toUpperCase()}</span>}
                </span>
                <span className="text-on-surface-variant text-sm">{filteredMatches.length} encuentros</span>
              </div>

              {loading ? (
                <div className="py-24 text-center">
                  <span className="material-symbols-outlined animate-spin text-primary text-4xl">sync</span>
                </div>
              ) : filteredMatches.length === 0 ? (
                <div className="bg-surface-container-low rounded-2xl p-16 text-center border border-dashed border-outline-variant/20">
                  <span className="material-symbols-outlined text-on-surface-variant text-5xl mb-4 block">sports_soccer</span>
                  <p className="text-on-surface-variant font-medium">No hay partidos programados{filterCategory !== 'Todas' ? ` en ${filterCategory.toUpperCase()}` : ''}.</p>
                  <p className="text-xs text-on-surface-variant/60 mt-1">Usa "Generar Fixture" o "Crear Partido" para comenzar.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredMatches.map(match => (
                    <MatchCard key={match.id} match={match} onEdit={openEdit} onLoadResult={openResult} />
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'requests' && (
            <>
              <div className="flex items-center justify-between bg-surface-container px-5 py-3 rounded-2xl border border-outline-variant/10">
                <span className="font-bold text-white text-sm">Solicitudes de Cambio</span>
                <span className="text-on-surface-variant text-sm">{pendingRequests} pendientes</span>
              </div>

              {requests.length === 0 ? (
                <div className="bg-surface-container-low rounded-2xl p-16 text-center border border-dashed border-outline-variant/20">
                  <p className="text-on-surface-variant">No hay solicitudes recientes.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {requests.map(req => (
                    <div key={req.id} className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-5 hover:border-outline-variant/30 transition-all">
                      <div className="flex flex-col lg:flex-row gap-5 justify-between">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white text-sm">{req.requesting_team_name}</span>
                              <span className="text-xs text-on-surface-variant">solicitó cambio</span>
                            </div>
                            {req.status === 'pending' && <span className="px-2 py-1 text-[10px] uppercase font-black bg-orange-400/10 text-orange-400 rounded">Pendiente</span>}
                            {req.status === 'approved' && <span className="px-2 py-1 text-[10px] uppercase font-black bg-emerald-400/10 text-emerald-400 rounded">Aprobado</span>}
                            {req.status === 'rejected' && <span className="px-2 py-1 text-[10px] uppercase font-black bg-red-500/10 text-red-400 rounded">Rechazado</span>}
                          </div>

                          <div className="grid grid-cols-2 gap-4 bg-surface-container-highest p-4 rounded-xl border border-outline-variant/5">
                            <div>
                              <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">Partido original</p>
                              <p className="text-sm text-white">{req.home_team_name} vs {req.away_team_name}</p>
                              <p className="text-xs text-on-surface-variant">{fmtDate(req.original_date)} · {fmtTime(req.original_time)}</p>
                            </div>
                            <div>
                              <p className="text-[10px] uppercase tracking-widest text-primary font-bold mb-1">Nueva fecha / hora</p>
                              <p className="text-sm text-white font-bold">{fmtDate(req.requested_date)}</p>
                              <p className="text-xs text-primary">{fmtTime(req.requested_time)}</p>
                            </div>
                          </div>

                          <div>
                            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">Justificación</p>
                            <p className="text-sm text-white bg-surface-container p-3 rounded-lg italic">"{req.reason}"</p>
                          </div>
                        </div>

                        {req.status === 'pending' && (
                          <div className="flex lg:flex-col gap-2 shrink-0">
                            <button onClick={() => handleRequestStatus(req.id, 'approved', req)} className="px-4 py-2 bg-emerald-400/10 text-emerald-400 font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-emerald-400/20 w-full">Aprobar</button>
                            <button onClick={() => handleRequestStatus(req.id, 'rejected', req)} className="px-4 py-2 bg-red-500/10 text-red-400 font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-red-500/20 w-full">Denegar</button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Generate Fixture Modal ─────────────────────────────────────────── */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-highest rounded-3xl p-8 w-full max-w-md border border-outline-variant/20 shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-black text-white mb-2 font-headline tracking-tight text-center">Generar Fixture</h2>
            <p className="text-sm text-center text-on-surface-variant mb-6">Selecciona la categoría. Se eliminarán los partidos programados existentes de esa categoría.</p>

            <div className="space-y-4 mb-8">
              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold text-primary mb-2 block">Categoría</label>
                <select
                  value={generateCategory}
                  onChange={e => setGenerateCategory(e.target.value)}
                  className="w-full bg-surface-container border border-outline-variant/10 text-white text-sm rounded-xl px-4 py-3 outline-none focus:border-primary"
                >
                  <option value="">Seleccionar categoría</option>
                  {CATEGORIES.filter(c => c !== 'Todas').map(cat => (
                    <option key={cat} value={cat}>{cat.toUpperCase()}</option>
                  ))}
                  <option value="Todas">Todas las categorías</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4">
              <button onClick={() => setShowGenerateModal(false)} className="flex-1 py-3 font-bold text-on-surface-variant hover:text-white transition-colors">Cancelar</button>
              <button
                onClick={handleGenerateFixture}
                disabled={generating || !generateCategory}
                className="flex-1 py-3 bg-primary text-black font-black uppercase tracking-widest text-xs rounded-xl hover:bg-emerald-400 transition-all disabled:opacity-50"
              >
                {generating ? 'Generando...' : 'Generar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Match Modal ────────────────────────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-highest rounded-3xl p-8 w-full max-w-lg border border-outline-variant/20 shadow-2xl animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
            <h2 className="text-2xl font-black text-white mb-2 font-headline tracking-tight text-center">Crear Partido Manual</h2>
            <p className="text-sm text-center text-on-surface-variant font-bold uppercase tracking-widest mb-6">Programa un nuevo encuentro</p>

            <div className="space-y-4 mb-8">
              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold text-primary mb-2 block">Categoría</label>
                <select
                  value={addData.category}
                  onChange={e => setAddData({ ...addData, category: e.target.value, home_team_id: '', away_team_id: '' })}
                  className="w-full bg-surface-container border border-outline-variant/10 text-white text-sm rounded-xl px-4 py-3 outline-none focus:border-primary"
                >
                  <option value="">Seleccionar categoría</option>
                  {CATEGORIES.filter(c => c !== 'Todas').map(cat => (
                    <option key={cat} value={cat}>{cat.toUpperCase()}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-2 block">Equipo Local</label>
                <select
                  value={addData.home_team_id}
                  onChange={e => setAddData({ ...addData, home_team_id: e.target.value })}
                  disabled={!addData.category}
                  className="w-full bg-surface-container border border-outline-variant/10 text-white text-sm rounded-xl px-4 py-3 outline-none focus:border-primary disabled:opacity-40"
                >
                  <option value="">Seleccionar equipo local</option>
                  {teams.filter(t => t.category === addData.category).map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-2 block">Equipo Visitante</label>
                <select
                  value={addData.away_team_id}
                  onChange={e => setAddData({ ...addData, away_team_id: e.target.value })}
                  disabled={!addData.category || !addData.home_team_id}
                  className="w-full bg-surface-container border border-outline-variant/10 text-white text-sm rounded-xl px-4 py-3 outline-none focus:border-primary disabled:opacity-40"
                >
                  <option value="">Seleccionar equipo visitante</option>
                  {teams.filter(t => t.category === addData.category && t.id !== addData.home_team_id).map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-2 block">Fecha</label>
                  <input type="date" value={addData.match_date} onChange={e => setAddData({ ...addData, match_date: e.target.value })}
                    className="w-full bg-surface-container border border-outline-variant/10 text-white text-sm rounded-xl px-4 py-3 outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-2 block">Hora</label>
                  <input type="time" value={addData.match_time} onChange={e => setAddData({ ...addData, match_time: e.target.value })}
                    className="w-full bg-surface-container border border-outline-variant/10 text-white text-sm rounded-xl px-4 py-3 outline-none focus:border-primary" />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-2 block">Cancha / Sede</label>
                <input type="text" value={addData.field} onChange={e => setAddData({ ...addData, field: e.target.value })}
                  placeholder="Ej. Cancha Principal"
                  className="w-full bg-surface-container border border-outline-variant/10 text-white text-sm rounded-xl px-4 py-3 outline-none focus:border-primary" />
              </div>
            </div>

            <div className="flex gap-4">
              <button onClick={() => { setShowAddModal(false); setAddData({ category: '', home_team_id: '', away_team_id: '', match_date: '', match_time: '', field: 'Cancha 1' }); }}
                className="flex-1 py-3 font-bold text-on-surface-variant hover:text-white transition-colors">Cancelar</button>
              <button onClick={handleSaveAdd}
                className="flex-[2] py-3 bg-primary text-black font-black uppercase tracking-widest text-xs rounded-xl hover:bg-emerald-400 transition-all shadow-[0_0_15px_rgba(107,254,156,0.2)]">
                Crear Encuentro
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Match Modal ───────────────────────────────────────────────── */}
      {showEditModal && selectedMatch && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-highest rounded-3xl p-8 w-full max-w-md border border-outline-variant/20 shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-black text-white mb-1 font-headline tracking-tight text-center">Editar Partido</h2>
            <p className="text-sm text-center text-on-surface-variant font-bold uppercase tracking-widest mb-6">
              {selectedMatch.home_team_name} vs {selectedMatch.away_team_name}
            </p>

            <div className="space-y-4 mb-8">
              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-2 block">Fecha</label>
                <input type="date" value={editData.match_date} onChange={e => setEditData({ ...editData, match_date: e.target.value })}
                  className="w-full bg-surface-container border border-outline-variant/10 text-white text-sm rounded-xl px-4 py-3 outline-none focus:border-primary" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-2 block">Hora</label>
                <input type="time" value={editData.match_time} onChange={e => setEditData({ ...editData, match_time: e.target.value })}
                  className="w-full bg-surface-container border border-outline-variant/10 text-white text-sm rounded-xl px-4 py-3 outline-none focus:border-primary" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-2 block">Cancha</label>
                <input type="text" value={editData.field} onChange={e => setEditData({ ...editData, field: e.target.value })}
                  placeholder="Ej. Cancha 1"
                  className="w-full bg-surface-container border border-outline-variant/10 text-white text-sm rounded-xl px-4 py-3 outline-none focus:border-primary" />
              </div>
            </div>

            <div className="flex gap-4">
              <button onClick={() => setShowEditModal(false)} className="flex-1 py-3 font-bold text-on-surface-variant hover:text-white transition-colors">Cancelar</button>
              <button onClick={handleSaveEdit} className="flex-1 py-3 bg-primary text-black font-black uppercase tracking-widest text-xs rounded-xl hover:bg-emerald-400 transition-all">
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Result Modal ───────────────────────────────────────────────────── */}
      {showResultModal && selectedMatch && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-surface-container-highest rounded-3xl p-6 md:p-8 w-full max-w-4xl border border-outline-variant/20 shadow-2xl animate-in zoom-in-95 duration-200 my-8">
            <h2 className="text-2xl font-black text-white mb-6 font-headline tracking-tight text-center">Acta de Partido Oficial</h2>

            {/* Scoreboard */}
            <div className="grid grid-cols-3 gap-2 items-center mb-8 max-w-sm mx-auto bg-surface-container p-6 rounded-3xl border border-outline-variant/10">
              <div className="text-center">
                <p className="text-xs font-bold text-on-surface-variant uppercase mb-2 truncate">{selectedMatch.home_team_name}</p>
                <input type="number" min="0" value={scores.home}
                  onChange={e => setScores({ ...scores, home: parseInt(e.target.value) || 0 })}
                  className="w-20 mx-auto bg-surface-container-highest p-4 rounded-2xl text-4xl font-black text-center text-white border border-outline-variant/20 focus:border-primary outline-none transition-all" />
              </div>
              <div className="text-center text-on-surface-variant font-black text-2xl">VS</div>
              <div className="text-center">
                <p className="text-xs font-bold text-on-surface-variant uppercase mb-2 truncate">{selectedMatch.away_team_name}</p>
                <input type="number" min="0" value={scores.away}
                  onChange={e => setScores({ ...scores, away: parseInt(e.target.value) || 0 })}
                  className="w-20 mx-auto bg-surface-container-highest p-4 rounded-2xl text-4xl font-black text-center text-white border border-outline-variant/20 focus:border-primary outline-none transition-all" />
              </div>
            </div>

            {/* Players */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {[{ players: homePlayers, label: selectedMatch.home_team_name, color: 'text-primary' },
                { players: awayPlayers, label: selectedMatch.away_team_name, color: 'text-white' }].map(({ players, label, color }) => (
                <div key={label}>
                  <h3 className={`${color} font-black uppercase tracking-widest text-sm mb-4 border-b border-outline-variant/20 pb-2`}>{label}</h3>
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {players.length === 0
                      ? <p className="text-xs text-on-surface-variant italic">No hay jugadores registrados</p>
                      : players.map(p => (
                        <div key={p.id} className="bg-surface-container p-3 rounded-xl border border-outline-variant/5">
                          <label className="flex items-center gap-2 cursor-pointer mb-2">
                            <input type="checkbox" className="w-4 h-4 accent-primary rounded"
                              checked={matchStats[p.id]?.played || false}
                              onChange={e => setStat(p.id, 'played', e.target.checked)} />
                            <span className={`text-sm font-bold ${matchStats[p.id]?.played ? 'text-white' : 'text-on-surface-variant'}`}>
                              {p.name} <span className="text-[10px]">#{p.number}</span>
                            </span>
                          </label>
                          {matchStats[p.id]?.played && (
                            <div className="flex gap-2 pl-6">
                              <div className="flex items-center gap-1 bg-surface-container-highest rounded px-2 py-1">
                                <span className="material-symbols-outlined text-[13px] text-emerald-400">sports_soccer</span>
                                <input type="number" min="0" value={matchStats[p.id]?.goals || 0}
                                  onChange={e => setStat(p.id, 'goals', parseInt(e.target.value) || 0)}
                                  className="w-8 text-xs bg-transparent text-white outline-none text-center" />
                              </div>
                              <div className="flex items-center gap-1 bg-surface-container-highest rounded px-2 py-1">
                                <div className="w-3 h-4 bg-yellow-400 rounded-sm" />
                                <input type="number" min="0" max="2" value={matchStats[p.id]?.yellow_cards || 0}
                                  onChange={e => setStat(p.id, 'yellow_cards', parseInt(e.target.value) || 0)}
                                  className="w-8 text-xs bg-transparent text-white outline-none text-center" />
                              </div>
                              <div className="flex items-center gap-1 bg-surface-container-highest rounded px-2 py-1">
                                <div className="w-3 h-4 bg-red-500 rounded-sm" />
                                <input type="number" min="0" max="1" value={matchStats[p.id]?.red_cards || 0}
                                  onChange={e => setStat(p.id, 'red_cards', parseInt(e.target.value) || 0)}
                                  className="w-8 text-xs bg-transparent text-white outline-none text-center" />
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    }
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-4">
              <button onClick={() => setShowResultModal(false)} className="flex-1 py-3 font-bold text-on-surface-variant hover:text-white transition-colors">Cancelar</button>
              <button onClick={handleSaveResult}
                className="flex-[2] py-4 bg-primary text-black font-black uppercase tracking-widest text-sm rounded-xl hover:bg-emerald-400 transition-all shadow-[0_0_15px_rgba(107,254,156,0.2)]">
                Guardar Acta Oficial
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
