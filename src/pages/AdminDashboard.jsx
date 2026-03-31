import React from 'react';

export default function AdminDashboard() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-black font-headline tracking-tight text-white mb-2">Resumen General</h1>
          <p className="text-sm font-medium text-on-surface-variant/80 font-manrope">Actividad reciente y métricas del torneo</p>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-outline-variant/10 text-sm font-bold text-white hover:bg-outline-variant/20 transition-all border border-outline-variant/20">
            <span className="material-symbols-outlined text-[20px]">download</span>
            Reporte
          </button>
          <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-black text-sm font-bold hover:bg-emerald-400 transition-all shadow-[0_0_15px_rgba(107,254,156,0.2)]">
            <span className="material-symbols-outlined text-[20px]">add</span>
            Nuevo Partido
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1 */}
        <div className="p-6 rounded-2xl bg-surface-container-high border border-outline-variant/10 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors"></div>
          <div className="flex items-between w-full mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
              <span className="material-symbols-outlined">groups</span>
            </div>
            <span className="material-symbols-outlined ml-auto text-outline-variant">more_horiz</span>
          </div>
          <h3 className="text-3xl font-black text-white font-manrope tracking-tighter mb-1">24</h3>
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Equipos Activos</p>
        </div>

        {/* Card 2 */}
        <div className="p-6 rounded-2xl bg-surface-container-high border border-outline-variant/10 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-400/5 rounded-full blur-2xl group-hover:bg-cyan-400/10 transition-colors"></div>
          <div className="flex items-between w-full mb-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-400/10 text-cyan-400 flex items-center justify-center border border-cyan-400/20">
              <span className="material-symbols-outlined">sports_soccer</span>
            </div>
          </div>
          <h3 className="text-3xl font-black text-white font-manrope tracking-tighter mb-1">142</h3>
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Partidos Jugados</p>
        </div>

        {/* Card 3 */}
        <div className="p-6 rounded-2xl bg-surface-container-high border border-outline-variant/10 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-400/5 rounded-full blur-2xl group-hover:bg-orange-400/10 transition-colors"></div>
          <div className="flex items-between w-full mb-4">
            <div className="w-12 h-12 rounded-xl bg-orange-400/10 text-orange-400 flex items-center justify-center border border-orange-400/20">
              <span className="material-symbols-outlined">sports</span>
            </div>
          </div>
          <h3 className="text-3xl font-black text-white font-manrope tracking-tighter mb-1">456</h3>
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Goles Totales</p>
        </div>

        {/* Card 4 */}
        <div className="p-6 rounded-2xl bg-surface-container-high border border-outline-variant/10 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-400/5 rounded-full blur-2xl group-hover:bg-purple-400/10 transition-colors"></div>
          <div className="flex items-between w-full mb-4">
            <div className="w-12 h-12 rounded-xl bg-purple-400/10 text-purple-400 flex items-center justify-center border border-purple-400/20">
              <span className="material-symbols-outlined">style</span>
            </div>
          </div>
          <h3 className="text-3xl font-black text-white font-manrope tracking-tighter mb-1">38</h3>
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Amonestados</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
        {/* Matchday Panel */}
        <div className="rounded-3xl bg-surface-container-highest border border-outline-variant/20 overflow-hidden flex flex-col">
          <div className="px-8 py-6 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container-low/50">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-error active-pulse"></span>
              <h2 className="font-bold text-white tracking-tight">Jornada Actual</h2>
            </div>
            <span className="text-xs font-bold text-primary px-3 py-1 bg-primary/10 rounded-full">Fecha 11</span>
          </div>
          
          <div className="p-8 flex-1 flex flex-col gap-4">
            {/* Match 1 */}
             <div className="bg-surface-container-low p-4 rounded-2xl flex items-center justify-between border border-outline-variant/5 hover:border-outline-variant/20 transition-colors">
              <div className="flex flex-col items-center gap-2 flex-1">
                <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-sm font-bold border border-outline-variant/10">RM</div>
                <span className="text-[10px] uppercase font-bold text-on-surface-variant">Real Mahanaym</span>
              </div>
              <div className="flex flex-col items-center gap-1 mx-4">
                 <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">HOY 19:00</span>
                 <span className="text-2xl font-black font-manrope text-white tracking-widest">VS</span>
              </div>
              <div className="flex flex-col items-center gap-2 flex-1">
                <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-sm font-bold border border-outline-variant/10">AC</div>
                <span className="text-[10px] uppercase font-bold text-on-surface-variant">Atl. Central</span>
              </div>
            </div>
            
            {/* Match 2 */}
            <div className="bg-surface-container-low p-4 rounded-2xl flex items-center justify-between border border-outline-variant/5 hover:border-outline-variant/20 transition-colors">
              <div className="flex flex-col items-center gap-2 flex-1">
                <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-sm font-bold border border-outline-variant/10">PF</div>
                <span className="text-[10px] uppercase font-bold text-on-surface-variant">Los Pibes FC</span>
              </div>
              <div className="flex flex-col items-center gap-1 mx-4">
                 <span className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">Finalizado</span>
                 <span className="text-2xl font-black font-manrope text-white tracking-widest">2 - 1</span>
              </div>
              <div className="flex flex-col items-center gap-2 flex-1">
                <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-sm font-bold border border-outline-variant/10">DN</div>
                <span className="text-[10px] uppercase font-bold text-on-surface-variant">Dep. Norte</span>
              </div>
            </div>

          </div>
        </div>

        {/* Quick Actions & Approvals */}
        <div className="space-y-6">
          <div className="bg-surface-container border border-outline-variant/10 rounded-3xl p-6 shadow-xl">
             <h3 className="font-bold text-white mb-6 tracking-tight flex items-center gap-2">
               <span className="material-symbols-outlined text-orange-400">notifications_active</span>
               Acciones Pendientes
             </h3>
             
             <div className="space-y-4">
                <div className="flex gap-4 p-4 rounded-xl bg-surface-container-highest border border-outline-variant/10 items-center">
                  <div className="w-10 h-10 rounded-full bg-orange-400/10 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-orange-400 text-sm">person_add</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-white mb-0.5">3 Nuevas Inscripciones</p>
                    <p className="text-xs text-on-surface-variant">Revisar solicitudes de registro de equipos</p>
                  </div>
                  <button className="text-xs font-bold text-primary hover:underline uppercase tracking-widest">Ver</button>
                </div>
                
                <div className="flex gap-4 p-4 rounded-xl bg-surface-container-highest border border-outline-variant/10 items-center">
                  <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-error text-sm">edit_document</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-white mb-0.5">1 Acta de partido pendiente</p>
                    <p className="text-xs text-on-surface-variant">Completar datos del partido Pibes vs Norte</p>
                  </div>
                  <button className="text-xs font-bold text-primary hover:underline uppercase tracking-widest">Ver</button>
                </div>
             </div>
          </div>
          
          <div className="h-40 rounded-3xl bg-surface-container-high border border-outline-variant/10 flex items-center justify-center font-bold text-on-surface-variant">
            [Gráfico de Rendimiento]
          </div>
        </div>
      </div>
    </div>
  );
}
