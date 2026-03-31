import React from 'react';

export default function PublicDashboard() {
  return (
    <div className="animate-in fade-in duration-700">
      <div className="mb-12">
        <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-300 font-headline mb-4 tracking-tighter">
          Liga Mahanaym
        </h1>
        <p className="text-on-surface-variant font-medium text-lg md:text-xl font-manrope">
          Edición de Verano 2024
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-headline tracking-tight flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">leaderboard</span>
              Tabla de Posiciones
            </h2>
            <select className="bg-surface-container-high border-none text-sm text-on-surface rounded-lg px-4 py-2 outline-none focus:ring-1 focus:ring-primary cursor-pointer">
              <option>Fase de Grupos</option>
              <option>Eliminatorias</option>
            </select>
          </div>

          <div className="glass-panel rounded-2xl overflow-hidden border border-outline-variant/10 shadow-2xl relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-tertiary to-primary"></div>
            <div className="overflow-x-auto">
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
                  {/* Row 1 */}
                  <tr className="border-b border-outline-variant/5 hover:bg-surface-container-high/50 transition-colors group">
                    <td className="p-4 pl-6 text-center">
                      <div className="w-6 h-6 rounded-full bg-primary text-black font-bold flex items-center justify-center text-xs mx-auto group-hover:scale-110 transition-transform shadow-[0_0_10px_rgba(107,254,156,0.3)]">1</div>
                    </td>
                    <td className="p-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-surface-container-highest border border-outline-variant/20 flex items-center justify-center p-1">
                        <span className="material-symbols-outlined text-sm text-primary">shield</span>
                      </div>
                      <span className="font-bold text-white tracking-tight">Real Mahanaym</span>
                    </td>
                    <td className="p-4 text-center text-on-surface-variant">10</td>
                    <td className="p-4 text-center text-on-surface-variant">8</td>
                    <td className="p-4 text-center text-on-surface-variant">1</td>
                    <td className="p-4 text-center text-on-surface-variant">1</td>
                    <td className="p-4 text-center text-on-surface-variant">24</td>
                    <td className="p-4 text-center text-on-surface-variant">8</td>
                    <td className="p-4 text-center text-emerald-400">+16</td>
                    <td className="p-4 pr-6 text-center font-black text-primary text-base">25</td>
                  </tr>
                  
                  {/* Row 2 */}
                  <tr className="border-b border-outline-variant/5 hover:bg-surface-container-high/50 transition-colors group">
                    <td className="p-4 pl-6 text-center">
                      <div className="w-6 h-6 rounded-full bg-surface-container-highest text-white font-bold flex items-center justify-center text-xs mx-auto">2</div>
                    </td>
                    <td className="p-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-surface-container-highest border border-outline-variant/20 flex items-center justify-center p-1">
                        <span className="material-symbols-outlined text-sm text-cyan-400">shield</span>
                      </div>
                      <span className="font-bold text-white tracking-tight">Atlético Central</span>
                    </td>
                    <td className="p-4 text-center text-on-surface-variant">10</td>
                    <td className="p-4 text-center text-on-surface-variant">7</td>
                    <td className="p-4 text-center text-on-surface-variant">2</td>
                    <td className="p-4 text-center text-on-surface-variant">1</td>
                    <td className="p-4 text-center text-on-surface-variant">18</td>
                    <td className="p-4 text-center text-on-surface-variant">9</td>
                    <td className="p-4 text-center text-emerald-400">+9</td>
                    <td className="p-4 pr-6 text-center font-black text-primary text-base">23</td>
                  </tr>

                  {/* Row 3 */}
                  <tr className="border-b border-outline-variant/5 hover:bg-surface-container-high/50 transition-colors group">
                     <td className="p-4 pl-6 text-center">
                      <div className="w-6 h-6 rounded-full bg-surface-container-highest text-white font-bold flex items-center justify-center text-xs mx-auto">3</div>
                    </td>
                    <td className="p-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-surface-container-highest border border-outline-variant/20 flex items-center justify-center p-1">
                        <span className="material-symbols-outlined text-sm text-orange-400">shield</span>
                      </div>
                      <span className="font-bold text-white tracking-tight">Los Pibes FC</span>
                    </td>
                    <td className="p-4 text-center text-on-surface-variant">10</td>
                    <td className="p-4 text-center text-on-surface-variant">6</td>
                    <td className="p-4 text-center text-on-surface-variant">1</td>
                    <td className="p-4 text-center text-on-surface-variant">3</td>
                    <td className="p-4 text-center text-on-surface-variant">15</td>
                    <td className="p-4 text-center text-on-surface-variant">12</td>
                    <td className="p-4 text-center text-emerald-400">+3</td>
                    <td className="p-4 pr-6 text-center font-black text-primary text-base">19</td>
                  </tr>
                  
                  {/* Row 4 */}
                  <tr className="border-b border-outline-variant/5 hover:bg-surface-container-high/50 transition-colors group">
                     <td className="p-4 pl-6 text-center">
                      <div className="w-6 h-6 rounded-full bg-surface-container-highest text-error font-bold flex items-center justify-center text-xs mx-auto">4</div>
                    </td>
                    <td className="p-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-surface-container-highest border border-outline-variant/20 flex items-center justify-center p-1">
                        <span className="material-symbols-outlined text-sm text-purple-400">shield</span>
                      </div>
                      <span className="font-bold text-white tracking-tight">Deportivo Norte</span>
                    </td>
                    <td className="p-4 text-center text-on-surface-variant">10</td>
                    <td className="p-4 text-center text-on-surface-variant">2</td>
                    <td className="p-4 text-center text-on-surface-variant">1</td>
                    <td className="p-4 text-center text-on-surface-variant">7</td>
                    <td className="p-4 text-center text-on-surface-variant">8</td>
                    <td className="p-4 text-center text-on-surface-variant">20</td>
                    <td className="p-4 text-center text-error">-12</td>
                    <td className="p-4 pr-6 text-center font-black text-primary text-base">7</td>
                  </tr>

                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <h2 className="text-xl font-bold font-headline tracking-tight flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">local_fire_department</span>
            Top Scorers
          </h2>
          
          <div className="space-y-4">
            {/* Player 1 */}
            <div className="glass-card rounded-2xl p-4 flex items-center gap-4 relative overflow-hidden group">
              <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-primary/10 to-transparent"></div>
              <div className="w-12 h-12 rounded-full bg-surface-container-highest flex border-2 border-primary/30 items-center justify-center">
                <span className="material-symbols-outlined text-primary">person</span>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-sm tracking-tight group-hover:text-primary transition-colors">Carlos Mendoza</h3>
                <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">Real Mahanaym</p>
              </div>
              <div className="text-right pr-4 relative z-10">
                <p className="text-2xl font-black text-white">12</p>
                <p className="text-[9px] text-primary uppercase font-bold tracking-widest">Goles</p>
              </div>
            </div>

            {/* Player 2 */}
            <div className="glass-card rounded-2xl p-4 flex items-center gap-4 relative overflow-hidden group">
              <div className="w-12 h-12 rounded-full bg-surface-container-highest flex border border-outline-variant/30 items-center justify-center">
                <span className="material-symbols-outlined text-on-surface-variant">person</span>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-sm tracking-tight group-hover:text-white text-on-surface-variant transition-colors">Juan Pérez</h3>
                <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">Atlético Central</p>
              </div>
              <div className="text-right pr-4 relative z-10">
                <p className="text-xl font-black text-on-surface-variant">9</p>
                <p className="text-[9px] text-on-surface-variant uppercase font-bold tracking-widest">Goles</p>
              </div>
            </div>

            {/* Player 3 */}
            <div className="glass-card rounded-2xl p-4 flex items-center gap-4 relative overflow-hidden group">
              <div className="w-12 h-12 rounded-full bg-surface-container-highest flex border border-outline-variant/30 items-center justify-center">
                <span className="material-symbols-outlined text-on-surface-variant">person</span>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-sm tracking-tight group-hover:text-white text-on-surface-variant transition-colors">Diego López</h3>
                <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">Los Pibes FC</p>
              </div>
              <div className="text-right pr-4 relative z-10">
                <p className="text-xl font-black text-on-surface-variant">7</p>
                <p className="text-[9px] text-on-surface-variant uppercase font-bold tracking-widest">Goles</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
