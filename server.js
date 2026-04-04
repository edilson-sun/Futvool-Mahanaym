import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { neon } from '@neondatabase/serverless';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Servir archivos estáticos del frontend (Vite build)
app.use(express.static(path.join(__dirname, 'dist')));

// Leer la base de datos segura desde el .env
const sql = neon(process.env.DATABASE_URL);

// Función para inicializar la DB con las tablas necesarias
async function initDB() {
  await sql`
    CREATE TABLE IF NOT EXISTS teams (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        category VARCHAR(50) NOT NULL,
        captain_name VARCHAR(255) NOT NULL,
        captain_phone VARCHAR(50) NOT NULL,
        user_email VARCHAR(255) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending' NOT NULL,
        logo_url TEXT,
        created_at TIMESTAMPTZ DEFAULT now()
    );
  `;
  
  try {
    await sql`ALTER TABLE teams ADD COLUMN IF NOT EXISTS logo_url TEXT;`;
  } catch(e) {
    console.log("logo_url ya existe o error alterando:", e);
  }
  
  await sql`
    CREATE TABLE IF NOT EXISTS players (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        number INTEGER,
        position VARCHAR(50),
        goals INTEGER DEFAULT 0,
        yellow_cards INTEGER DEFAULT 0,
        red_cards INTEGER DEFAULT 0,
        matches_played INTEGER DEFAULT 0
    );
  `;

  try {
    await sql`ALTER TABLE players ADD COLUMN IF NOT EXISTS matches_played INTEGER DEFAULT 0;`;
  } catch(e) {
    console.log("matches_played ya existe o error alterando:", e);
  }

  await sql`
    CREATE TABLE IF NOT EXISTS matches (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        home_team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
        away_team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
        home_goals INTEGER DEFAULT 0,
        away_goals INTEGER DEFAULT 0,
        match_date DATE NOT NULL,
        match_time TIME NOT NULL,
        field VARCHAR(50),
        status VARCHAR(50) DEFAULT 'scheduled' NOT NULL, -- scheduled, in_progress, finished
        created_at TIMESTAMPTZ DEFAULT now()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        type VARCHAR(50) NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT now()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS match_change_requests (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
        team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
        requested_date DATE,
        requested_time TIME,
        reason TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'pending' NOT NULL, -- pending, approved, rejected
        created_at TIMESTAMPTZ DEFAULT now()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS settings (
        id SERIAL PRIMARY KEY,
        key VARCHAR(50) UNIQUE NOT NULL,
        value JSONB NOT NULL
    );
  `;

  // Inicializar sedes si no existen
  await sql`
    INSERT INTO settings (key, value)
    VALUES ('venues', '{"total": 2, "active": 2}')
    ON CONFLICT (key) DO NOTHING;
  `;

  console.log('✅ Base de datos inicializada correctamente');
}

// Inicializamos base de datos al arrancar
initDB().catch(console.error);

// 1. Obtener todos los equipos
app.get('/api/teams', async (req, res) => {
  try {
    const teams = await sql`SELECT * FROM teams ORDER BY created_at DESC`;
    res.json(teams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// 2. Registrar un nuevo equipo
app.post('/api/teams', async (req, res) => {
  const { name, category, captain_name, captain_phone, user_email, logo_url } = req.body;
  try {
    // Verify user hasn't registered a team in the same category
    const existingTeam = await sql`SELECT id FROM teams WHERE user_email = ${user_email} AND category = ${category}`;
    if (existingTeam.length > 0) {
      return res.status(400).json({ error: 'Ya tienes un equipo registrado en la categoría ' + category });
    }

    const newTeam = await sql`
      INSERT INTO teams (name, category, captain_name, captain_phone, user_email, logo_url)
      VALUES (${name}, ${category}, ${captain_name}, ${captain_phone}, ${user_email}, ${logo_url || null})
      RETURNING *;
    `;
    
    // Crear notificación para el admin
    await sql`
      INSERT INTO notifications (type, message)
      VALUES ('team_registration', ${`Nuevo equipo registrado: ${name}`});
    `;

    res.status(201).json(newTeam[0]);
  } catch (error) {
    console.error('Error inserting team:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// 2.1 Eliminar un equipo
app.delete('/api/teams/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await sql`DELETE FROM teams WHERE id = ${id}`;
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting team:', error);
    res.status(500).json({ error: 'Error al eliminar el equipo' });
  }
});


// 3. Modificar el estado de un equipo
app.put('/api/teams/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const updatedTeam = await sql`
      UPDATE teams SET status = ${status} WHERE id = ${id} RETURNING *;
    `;
    res.json(updatedTeam[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el estado' });
  }
});

// 4. Obtener jugadores (general o por equipo)
app.get('/api/players', async (req, res) => {
  const { team_id } = req.query;
  try {
    let players;
    if (team_id) {
      players = await sql`SELECT p.*, t.name as team_name, t.category as team_category FROM players p JOIN teams t ON p.team_id = t.id WHERE p.team_id = ${team_id}`;
    } else {
      players = await sql`SELECT p.*, t.name as team_name, t.category as team_category FROM players p JOIN teams t ON p.team_id = t.id ORDER BY p.goals DESC`;
    }
    res.json(players);
  } catch (error) {
    res.status(500).json({ error: 'Error al cargar jugadores' });
  }
});

// 4.1 Registrar jugador
app.post('/api/players', async (req, res) => {
  const { team_id, name, number, position } = req.body;
  try {
    const newPlayer = await sql`
      INSERT INTO players (team_id, name, number, position)
      VALUES (${team_id}, ${name}, ${number}, ${position})
      RETURNING *;
    `;
    res.status(201).json(newPlayer[0]);
  } catch (error) {
    console.error('Error inserting player:', error);
    res.status(500).json({ error: 'Error al registrar jugador' });
  }
});

// 4.2 Eliminar jugador
app.delete('/api/players/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await sql`DELETE FROM players WHERE id = ${id}`;
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar jugador' });
  }
});

// 4.3 Obtener mi equipo por email
app.get('/api/teams/my-team', async (req, res) => {
  const { email } = req.query;
  try {
    const teams = await sql`SELECT * FROM teams WHERE user_email = ${email} ORDER BY created_at DESC`;
    if (teams.length === 0) return res.status(404).json({ error: 'No se encontraron equipos para este usuario' });
    res.json(teams); // now returns an array of teams
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener equipos' });
  }
});

// 5. Partidos - Listar (con filtro por equipo)
app.get('/api/matches', async (req, res) => {
  const { team_id } = req.query;
  try {
    let matches;
    if (team_id) {
      matches = await sql`
        SELECT m.*, 
               t1.name as home_team_name, 
               t1.logo_url as home_team_logo,
               t1.category as home_team_category,
               t2.name as away_team_name,
               t2.logo_url as away_team_logo,
               t2.category as away_team_category
        FROM matches m
        JOIN teams t1 ON m.home_team_id = t1.id
        JOIN teams t2 ON m.away_team_id = t2.id
        WHERE m.home_team_id = ${team_id} OR m.away_team_id = ${team_id}
        ORDER BY m.match_date ASC, m.match_time ASC;
      `;
    } else {
      matches = await sql`
        SELECT m.*, 
               t1.name as home_team_name, 
               t1.logo_url as home_team_logo,
               t1.category as home_team_category,
               t2.name as away_team_name,
               t2.logo_url as away_team_logo,
               t2.category as away_team_category
        FROM matches m
        JOIN teams t1 ON m.home_team_id = t1.id
        JOIN teams t2 ON m.away_team_id = t2.id
        ORDER BY m.match_date ASC, m.match_time ASC;
      `;
    }
    res.json(matches);
  } catch (error) {
    res.status(500).json({ error: 'Error al cargar partidos' });
  }
});

// 5.1 Registrar un nuevo partido manualmente
app.post('/api/matches', async (req, res) => {
  const { home_team_id, away_team_id, match_date, match_time, field } = req.body;
  try {
    const newMatch = await sql`
      INSERT INTO matches (home_team_id, away_team_id, match_date, match_time, field)
      VALUES (${home_team_id}, ${away_team_id}, ${match_date}, ${match_time}, ${field || 'Cancha 1'})
      RETURNING *;
    `;
    res.status(201).json(newMatch[0]);
  } catch (error) {
    console.error('Error manual match registration:', error);
    res.status(500).json({ error: 'Error al registrar el partido manualmente' });
  }
});

// 6. Generar Fixture aleatorio (Especial de 2 equipos según requerimiento)
app.post('/api/matches/generate', async (req, res) => {
  try {
    const approvedTeams = await sql`SELECT id, name, category FROM teams WHERE status = 'approved' ORDER BY category`;
    
    if (approvedTeams.length < 2) {
      return res.status(400).json({ error: 'Se necesitan al menos 2 equipos aprobados en total para iniciar un torneo.' });
    }

    // Opcional: Limpiar partidos anteriores para iniciar "nuevo torneo"
    await sql`DELETE FROM matches`;

    const generatedMatches = [];
    const startDate = new Date();
    
    // Group teams by category
    const categories = {};
    for (const t of approvedTeams) {
        if (!categories[t.category]) categories[t.category] = [];
        categories[t.category].push(t);
    }
    
    for (const [category, teams] of Object.entries(categories)) {
        if (teams.length < 2) continue; // Skip categories with less than 2 teams
        
        // Empareja aleatoriamente los equipos en esta categoría
        const shuffled = teams.sort(() => 0.5 - Math.random());
        // Simple round-robin, cada 2 hacen un partido, si sobra 1 se queda libre
        for (let i = 0; i < shuffled.length - 1; i += 2) {
            const home = shuffled[i];
            const away = shuffled[i+1];
            
            const matchDate = new Date(startDate);
            matchDate.setDate(startDate.getDate() + 7); // La proxima semana
            const time = '20:00:00';
            
            const newMatch = await sql`
              INSERT INTO matches (home_team_id, away_team_id, match_date, match_time, field)
              VALUES (${home.id}, ${away.id}, ${matchDate.toISOString().split('T')[0]}, ${time}, 'Cancha 1')
              RETURNING *;
            `;
            generatedMatches.push(newMatch[0]);
        }
    }

    res.json(generatedMatches);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al generar fixture' });
  }
});

// 6.1 Generar Gran Final automáticamente
app.post('/api/matches/generate-final', async (req, res) => {
  try {
    const lastMatches = await sql`SELECT * FROM matches WHERE status = 'finished' ORDER BY match_date DESC, match_time DESC LIMIT 2`;
    if (lastMatches.length < 2) {
      return res.status(400).json({ error: 'Se necesitan al menos 2 partidos finalizados para generar una final.' });
    }
    
    // Determine winners. In case of draw, defaults to away team or could be error. We assume no draws in semis strictly.
    const winner1 = lastMatches[0].home_goals > lastMatches[0].away_goals ? lastMatches[0].home_team_id : lastMatches[0].away_team_id;
    const winner2 = lastMatches[1].home_goals > lastMatches[1].away_goals ? lastMatches[1].home_team_id : lastMatches[1].away_team_id;

    if (winner1 === winner2) {
      return res.status(400).json({ error: 'Los equipos ganadores son el mismo. Revisa las actas previas.' });
    }

    const matchDate = new Date();
    matchDate.setDate(matchDate.getDate() + 7);
    const time = '20:00:00';
    
    const newMatch = await sql`
      INSERT INTO matches (home_team_id, away_team_id, match_date, match_time, field, status)
      VALUES (${winner1}, ${winner2}, ${matchDate.toISOString().split('T')[0]}, ${time}, 'Cancha Principal (GRAN FINAL)', 'scheduled')
      RETURNING *;
    `;
    
    // Crear notificación para todos
    await sql`
      INSERT INTO notifications (type, message)
      VALUES ('final_match', '¡La Gran Final ha sido programada!');
    `;

    res.json(newMatch[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al generar la final' });
  }
});


// 7. Cargar Resultado / Acta de partido
app.put('/api/matches/:id/result', async (req, res) => {
    const { id } = req.params;
    const { home_goals, away_goals, players_stats } = req.body;
    try {
        const updatedMatch = await sql`
            UPDATE matches 
            SET home_goals = ${home_goals}, away_goals = ${away_goals}, status = 'finished'
            WHERE id = ${id}
            RETURNING *;
        `;
        
        // Actualizar estadísticas de jugadores si se proporcionan
        if (players_stats && Array.isArray(players_stats) && players_stats.length > 0) {
            for (const pStat of players_stats) {
                // pStat: { player_id, played: boolean, goals: number, yellow_cards: number, red_cards: number }
                await sql`
                    UPDATE players 
                    SET 
                        goals = goals + ${pStat.goals || 0},
                        yellow_cards = yellow_cards + ${pStat.yellow_cards || 0},
                        red_cards = red_cards + ${pStat.red_cards || 0},
                        matches_played = matches_played + ${pStat.played ? 1 : 0}
                    WHERE id = ${pStat.player_id}
                `;
            }
        }
        res.json(updatedMatch[0]);
    } catch (error) {
        console.error('Error saving result stats', error);
        res.status(500).json({ error: 'Error al cargar resultado' });
    }
});

// 8. Estadísticas (Tabla de posiciones dinámica)
app.get('/api/standings', async (req, res) => {
  try {
    const standings = await sql`
      WITH MatchStats AS (
        SELECT home_team_id as team_id,
               CASE WHEN home_goals > away_goals THEN 3 WHEN home_goals = away_goals THEN 1 ELSE 0 END as pts,
               home_goals as gf, away_goals as gc, 1 as pj,
               CASE WHEN home_goals > away_goals THEN 1 ELSE 0 END as pg,
               CASE WHEN home_goals = away_goals THEN 1 ELSE 0 END as pe,
               CASE WHEN home_goals < away_goals THEN 1 ELSE 0 END as pp
        FROM matches WHERE status = 'finished'
        UNION ALL
        SELECT away_team_id as team_id,
               CASE WHEN away_goals > home_goals THEN 3 WHEN away_goals = home_goals THEN 1 ELSE 0 END as pts,
               away_goals as gf, home_goals as gc, 1 as pj,
               CASE WHEN away_goals > home_goals THEN 1 ELSE 0 END as pg,
               CASE WHEN away_goals = home_goals THEN 1 ELSE 0 END as pe,
               CASE WHEN away_goals < home_goals THEN 1 ELSE 0 END as pp
        FROM matches WHERE status = 'finished'
      )
      SELECT t.id as team_id,
             t.name as team_name, 
             t.category as category,
             t.status as status,
             t.logo_url as logo_url,
             COALESCE(SUM(pts), 0) as points, 
             COALESCE(SUM(pj), 0) as played, 
             COALESCE(SUM(pg), 0) as won, 
             COALESCE(SUM(pe), 0) as drawn, 
             COALESCE(SUM(pp), 0) as lost, 
             COALESCE(SUM(gf), 0) as goals_for, 
             COALESCE(SUM(gc), 0) as goals_against, 
             COALESCE(SUM(gf) - SUM(gc), 0) as goal_diff
      FROM teams t
      LEFT JOIN MatchStats ms ON t.id = ms.team_id
      WHERE t.status IN ('approved', 'disqualified')
      GROUP BY t.id, t.name, t.category, t.status, t.logo_url
      ORDER BY points DESC, goal_diff DESC;
    `;
    res.json(standings);
  } catch (error) {
    console.error('Error calculando tabla', error);
    res.status(500).json({ error: 'Error al calcular tabla' });
  }
});

// 8.1 Editar detalles del partido (Admin)
app.put('/api/matches/:id', async (req, res) => {
  const { id } = req.params;
  const { match_date, match_time, field } = req.body;
  try {
    const updatedMatch = await sql`
      UPDATE matches 
      SET match_date = ${match_date}, match_time = ${match_time}, field = ${field}
      WHERE id = ${id}
      RETURNING *;
    `;
    res.json(updatedMatch[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el partido' });
  }
});

// 8.2 Solicitar Cambio de Horario (Usuario)
app.post('/api/matches/:id/request-change', async (req, res) => {
  const { id } = req.params;
  const { team_id, requested_date, requested_time, reason, current_date, current_time } = req.body;
  try {
    const newRequest = await sql`
      INSERT INTO match_change_requests (match_id, team_id, requested_date, requested_time, reason)
      VALUES (${id}, ${team_id}, ${requested_date || null}, ${requested_time || null}, ${reason})
      RETURNING *;
    `;
    
    // Notificación al admin
    await sql`
      INSERT INTO notifications (type, message)
      VALUES ('match_change_request', ${`Nueva solicitud de cambio de horario para un partido.`});
    `;

    res.status(201).json(newRequest[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al solicitar el cambio' });
  }
});

// 8.3 Obtener solicitudes de cambio (Admin)
app.get('/api/matches/change-requests/all', async (req, res) => {
  try {
    const requests = await sql`
      SELECT r.*,
             m.match_date as original_date,
             m.match_time as original_time,
             m.field as field,
             t1.name as home_team_name,
             t2.name as away_team_name,
             reqTeam.name as requesting_team_name
      FROM match_change_requests r
      JOIN matches m ON r.match_id = m.id
      JOIN teams reqTeam ON r.team_id = reqTeam.id
      JOIN teams t1 ON m.home_team_id = t1.id
      JOIN teams t2 ON m.away_team_id = t2.id
      ORDER BY r.created_at DESC;
    `;
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo solicitudes' });
  }
});

// 8.4 Responder a solicitud de cambio (Admin)
app.put('/api/matches/change-requests/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status, match_id, new_date, new_time, new_field } = req.body; // status: 'approved' | 'rejected'
  
  try {
    const reqUpdate = await sql`
      UPDATE match_change_requests 
      SET status = ${status} 
      WHERE id = ${id} 
      RETURNING *;
    `;

    if (status === 'approved' && match_id) {
      // Actualizar el partido original
      await sql`
        UPDATE matches
        SET match_date = ${new_date}, match_time = ${new_time}, field = ${new_field}
        WHERE id = ${match_id}
      `;
    }

    res.json(reqUpdate[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error respondiendo solicitud' });
  }
});

// 9. Notificaciones
app.get('/api/notifications', async (req, res) => {
  try {
    const notifications = await sql`SELECT * FROM notifications WHERE is_read = FALSE ORDER BY created_at DESC`;
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener notificaciones' });
  }
});

app.put('/api/notifications/read-all', async (req, res) => {
  try {
    await sql`UPDATE notifications SET is_read = TRUE WHERE is_read = FALSE`;
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Error al marcar notificaciones como leídas' });
  }
});

// 10. Configuración (Sedes/Canchas)
app.get('/api/settings/venues', async (req, res) => {
  try {
    const setting = await sql`SELECT value FROM settings WHERE key = 'venues'`;
    res.json(setting[0]?.value || { total: 2, active: 2 });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener configuración de sedes' });
  }
});

app.put('/api/settings/venues', async (req, res) => {
  const { total, active } = req.body;
  try {
    const updatedSetting = await sql`
      UPDATE settings SET value = ${JSON.stringify({ total, active })} WHERE key = 'venues' RETURNING value;
    `;
    res.json(updatedSetting[0].value);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar configuración de sedes' });
  }
});


// 11. Manejo de rutas SPA (debe ir después de las API)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Para Firebase Functions no llamamos a app.listen
// Solo para local
if (process.env.NODE_ENV !== 'production' || !process.env.FUNCTION_NAME) {
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, async () => {
      try {
        await initDB();
        console.log(`🚀 Servidor backend corriendo y escuchando en el puerto ${PORT}`);
      } catch (error) {
        console.error('❌ Error al inicializar la base de datos:', error);
      }
    });
}

export default app;

