import React from 'react';

export default function AdminMatches() {
  return (
    <div className="p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10 border-b border-outline-variant/10 pb-6">
        <div>
          <h1 className="text-3xl font-black font-headline tracking-tight text-white mb-2">Fixture y Resultados</h1>
          <p className="text-sm text-on-surface-variant font-manrope">Gestión de jornadas, horarios y resultados oficiales</p>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-surface-container border border-outline-variant/20 hover:bg-surface-container-high transition-colors text-sm font-bold">
            <span className="material-symbols-outlined text-sm">calendar_month</span>
            Filtrar
          </button>
          <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-black font-bold uppercase tracking-widest text-xs hover:bg-emerald-400 transition-colors shadow-[0_0_15px_rgba(107,254,156,0.2)]">
            <span className="material-symbols-outlined text-sm">add</span>
            Generar Fixture
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Col - Filters & Matchdays */}
        <div className="lg:w-1/3 xl:w-1/4 space-y-4">
          <div className="bg-surface-container-high rounded-2xl p-4 border border-outline-variant/10">
             <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4 px-2">Jornadas</h3>
             <ul className="space-y-1">
               <li>
                 <button className="w-full text-left px-4 py-3 rounded-xl bg-primary/10 text-primary font-bold border-l-4 border-primary transition-all text-sm flex items-center justify-between">
                   Fecha 11
                   <span className="w-2 h-2 rounded-full bg-error active-pulse"></span>
                 </button>
               </li>
               <li>
                 <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-surface-container text-on-surface-variant hover:text-white transition-all text-sm">
                   Fecha 10
                 </button>
               </li>
               <li>
                 <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-surface-container text-on-surface-variant hover:text-white transition-all text-sm">
                   Fecha 9
                 </button>
               </li>
               <li>
                 <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-surface-container text-on-surface-variant hover:text-white transition-all text-sm flex items-center justify-between">
                   Fecha 8 <span className="material-symbols-outlined text-xs">done</span>
                 </button>
               </li>
             </ul>
          </div>
        </div>

        {/* Right Col - Matches List */}
        <div className="flex-1 space-y-4">
          
          <div className="flex items-center justify-between bg-surface-container p-4 rounded-2xl border border-outline-variant/10 text-sm mb-6">
            <span className="font-bold text-white tracking-tight">Mostrando <span className="text-primary">Fecha 11</span></span>
            <span className="text-on-surface-variant">4 Partidos</span>
          </div>

          <div className="grid gap-4">
            {/* Match Item - Scheduled */}
            <div className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between hover:border-outline-variant/30 transition-all gap-6">
              <div className="flex items-center gap-6 w-full md:w-auto">
                 <div className="text-center w-24">
                   <p className="text-xs text-on-surface-variant uppercase tracking-widest font-bold mb-1">Cancha 1</p>
                   <p className="font-bold text-white font-manrope">19:00</p>
                 </div>
                 <div className="h-10 w-px bg-outline-variant/20 hidden md:block"></div>
                 <div className="flex items-center gap-4 flex-1">
                   <div className="flex items-center gap-3 w-32 justify-end">
                     <span className="font-bold text-white text-sm">Real Mahanaym</span>
                     <div className="w-8 h-8 rounded-full bg-surface-container-highest shrink-0 border border-outline-variant/20"></div>
                   </div>
                   <div className="px-4 py-1 rounded bg-surface-container border border-outline-variant/10 text-xs font-bold text-on-surface-variant">VS</div>
                   <div className="flex items-center gap-3 w-32 justify-start">
                     <div className="w-8 h-8 rounded-full bg-surface-container-highest shrink-0 border border-outline-variant/20"></div>
                     <span className="font-bold text-white text-sm">Atl. Central</span>
                   </div>
                 </div>
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t border-outline-variant/10 md:border-t-0 justify-center">
                <button className="px-4 py-2 bg-primary/10 text-primary font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-primary/20 transition-colors">
                  Cargar Resultado
                </button>
                <button className="p-2 text-on-surface-variant hover:text-white transition-colors bg-surface-container-highest rounded-lg">
                  <span className="material-symbols-outlined text-sm">more_vert</span>
                </button>
              </div>
            </div>

            {/* Match Item - In Progress (Simulation) */}
            <div className="bg-surface border border-primary/30 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between relative overflow-hidden shadow-[0_0_20px_rgba(107,254,156,0.05)] gap-6">
               <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
               <div className="flex items-center gap-6 w-full md:w-auto">
                 <div className="text-center w-24">
                   <p className="text-[10px] text-error uppercase tracking-widest font-bold mb-1 active-pulse">EN VIVO</p>
                   <p className="font-bold text-primary font-manrope">2do Tiempo</p>
                 </div>
                 <div className="h-10 w-px bg-outline-variant/20 hidden md:block"></div>
                 <div className="flex items-center gap-4 flex-1">
                   <div className="flex items-center gap-3 w-32 justify-end">
                     <span className="font-bold text-white text-sm">Pibes FC</span>
                     <div className="w-8 h-8 rounded-full bg-surface-container-highest shrink-0 border border-outline-variant/20"></div>
                   </div>
                   <div className="px-5 py-2 rounded-lg bg-surface-container-highest border border-primary/20 text-xl font-black text-white font-manrope tracking-widest">
                     1 - 0
                   </div>
                   <div className="flex items-center gap-3 w-32 justify-start">
                     <div className="w-8 h-8 rounded-full bg-surface-container-highest shrink-0 border border-outline-variant/20"></div>
                     <span className="font-bold text-white text-sm">La 12</span>
                   </div>
                 </div>
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t border-outline-variant/10 md:border-t-0 justify-center">
                 <button className="px-4 py-2 bg-surface-container-highest text-white font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-surface-container transition-colors border border-outline-variant/20">
                  Transmisión
                </button>
                <button className="p-2 text-on-surface-variant hover:text-white transition-colors bg-surface-container-highest rounded-lg">
                  <span className="material-symbols-outlined text-sm">more_vert</span>
                </button>
              </div>
            </div>

             {/* Match Item - Finished */}
             <div className="bg-surface-container-low border border-outline-variant/5 hover:border-outline-variant/20 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between transition-all gap-6 opacity-80">
              <div className="flex items-center gap-6 w-full md:w-auto">
                 <div className="text-center w-24">
                   <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold mb-1">Finalizado</p>
                   <p className="font-bold text-on-surface-variant font-manrope text-sm">Ayer</p>
                 </div>
                 <div className="h-10 w-px bg-outline-variant/20 hidden md:block"></div>
                 <div className="flex items-center gap-4 flex-1">
                   <div className="flex items-center gap-3 w-32 justify-end opacity-50">
                     <span className="font-bold text-white text-sm">Unión</span>
                     <div className="w-8 h-8 rounded-full bg-surface-container-highest shrink-0 border border-outline-variant/20"></div>
                   </div>
                   <div className="px-5 py-2 rounded-lg bg-surface-container-highest border border-outline-variant/10 text-xl font-black text-white font-manrope tracking-widest">
                     0 - 3
                   </div>
                   <div className="flex items-center gap-3 w-32 justify-start font-bold">
                     <div className="w-8 h-8 rounded-full bg-surface-container-highest shrink-0 border border-primary"></div>
                     <span className="font-bold text-primary text-sm">Dep. Norte</span>
                   </div>
                 </div>
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t border-outline-variant/10 md:border-t-0 justify-center">
                <button className="px-4 py-2 bg-transparent text-on-surface-variant hover:text-white font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-surface-container-highest transition-colors">
                  Ver Detalles
                </button>
                 <button className="p-2 text-on-surface-variant hover:text-white transition-colors bg-surface-container-highest rounded-lg">
                  <span className="material-symbols-outlined text-sm">more_vert</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
