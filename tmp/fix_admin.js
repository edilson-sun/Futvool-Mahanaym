const fs = require('fs');
const path = 'c:\\Users\\Usuario-PC\\Desktop\\Futbol-Mahanaym\\src\\pages\\AdminDashboard.jsx';
let content = fs.readFileSync(path, 'utf8');

const target = `                      <div className="w-8 h-8 rounded-lg bg-surface-container-highest flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-xs text-primary">shield</span>
                      </div>`;

const replacement = `                      <div className="w-8 h-8 rounded-lg bg-surface-container-highest flex items-center justify-center shrink-0 overflow-hidden">
                        {team.logo_url ? (
                          <img src={team.logo_url} alt={team.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="material-symbols-outlined text-xs text-primary">shield</span>
                        )}
                      </div>`;

// Use regex to handle whitespace variability if needed, but let's try direct first with more flexible matching
const newContent = content.replace(/<span className="material-symbols-outlined text-xs text-primary">shield<\/span>/g, (match, offset) => {
    // Check if it's within the right context (Equipos en Juego section)
    const context = content.substring(offset - 200, offset + 200);
    if (context.includes('metrics.approvedTeams.slice(0, 6)')) {
         return `{team.logo_url ? (
                           <img src={team.logo_url} alt={team.name} className="w-full h-full object-cover" />
                         ) : (
                           <span className="material-symbols-outlined text-xs text-primary">shield</span>
                         )}`;
    }
    return match;
});

// Also need to add overflow-hidden to the parent div
const finalContent = newContent.replace(/rounded-lg bg-surface-container-highest flex items-center justify-center shrink-0">/g, (match, offset) => {
    const context = content.substring(offset - 100, offset + 100);
    if (context.includes('metrics.approvedTeams.slice(0, 6)')) {
        return 'rounded-lg bg-surface-container-highest flex items-center justify-center shrink-0 overflow-hidden">';
    }
    return match;
});

fs.writeFileSync(path, finalContent);
console.log('Fixed AdminDashboard.jsx');
