const fs = require('fs');
const path = 'c:/Users/Usuario-PC/Desktop/Futbol-Mahanaym/src/pages/AdminDashboard.jsx';
let content = fs.readFileSync(path, 'utf8');

const oldBlock = `                       <div className="w-8 h-8 rounded-lg bg-surface-container-highest flex items-center justify-center shrink-0">
                         <span className="material-symbols-outlined text-xs text-primary">shield</span>
                       </div>`;

const newBlock = `                       <div className="w-8 h-8 rounded-lg bg-surface-container-highest flex items-center justify-center shrink-0 overflow-hidden">
                         {team.logo_url ? (
                           <img src={team.logo_url} alt={team.name} className="w-full h-full object-cover" />
                         ) : (
                           <span className="material-symbols-outlined text-xs text-primary">shield</span>
                         )}
                       </div>`;

// Try finding by a part of the string that is likely to be stable
const searchStr = 'material-symbols-outlined text-xs text-primary">shield</span>';
if (content.includes(searchStr)) {
    console.log('Found search string');
    // Find the encompassing div
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(searchStr) && lines[i-1].includes('rounded-lg bg-surface-container-highest')) {
            console.log('Found match at line', i);
            lines[i-1] = lines[i-1].replace('shrink-0">', 'shrink-0 overflow-hidden">');
            lines[i] = `                         {team.logo_url ? (
                           <img src={team.logo_url} alt={team.name} className="w-full h-full object-cover" />
                         ) : (
                           <span className="material-symbols-outlined text-xs text-primary">shield</span>
                         )}`;
            lines[i+1] = ''; // remove closing div since we'll add it in the block above or just handle it carefully
            // Wait, let's just replace the 3 lines
            lines.splice(i-1, 3, newBlock);
            break;
        }
    }
    fs.writeFileSync(path, lines.join('\n'));
    console.log('Success');
} else {
    console.log('Not found');
}
