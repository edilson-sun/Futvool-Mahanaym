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
        created_at TIMESTAMPTZ DEFAULT now()
    );
  `;
  
  await sql`
    CREATE TABLE IF NOT EXISTS players (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        number INTEGER,
        position VARCHAR(50),
        goals INTEGER DEFAULT 0,
        yellow_cards INTEGER DEFAULT 0,
        red_cards INTEGER DEFAULT 0
    );
  `;

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
  const { name, category, captain_name, captain_phone, user_email } = req.body;
  try {
    const newTeam = await sql`
      INSERT INTO teams (name, category, captain_name, captain_phone, user_email)
      VALUES (${name}, ${category}, ${captain_name}, ${captain_phone}, ${user_email})
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
      players = await sql`SELECT p.*, t.name as team_name FROM players p JOIN teams t ON p.team_id = t.id WHERE p.team_id = ${team_id}`;
    } else {
      players = await sql`SELECT p.*, t.name as team_name FROM players p JOIN teams t ON p.team_id = t.id ORDER BY p.goals DESC`;
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
    const team = await sql`SELECT * FROM teams WHERE user_email = ${email} ORDER BY created_at DESC LIMIT 1`;
    if (team.length === 0) return res.status(404).json({ error: 'No se encontró equipo para este usuario' });
    res.json(team[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener equipo' });
  }
});

// 5. Partidos - Listar
app.get('/api/matches', async (req, res) => {
  try {
    const matches = await sql`
      SELECT m.*, 
             t1.name as home_team_name, 
             t2.name as away_team_name 
      FROM matches m
      JOIN teams t1 ON m.home_team_id = t1.id
      JOIN teams t2 ON m.away_team_id = t2.id
      ORDER BY m.match_date ASC, m.match_time ASC;
    `;
    res.json(matches);
  } catch (error) {
    res.status(500).json({ error: 'Error al cargar partidos' });
  }
});

// 6. Generar Fixture aleatorio (Especial de 2 equipos según requerimiento)
app.post('/api/matches/generate', async (req, res) => {
  try {
    const approvedTeams = await sql`SELECT id, name FROM teams WHERE status = 'approved'`;
    
    if (approvedTeams.length !== 2) {
      return res.status(400).json({ error: 'El torneo solo puede iniciar con exactamente 2 equipos aprobados' });
    }

    // Opcional: Limpiar partidos anteriores para iniciar "nuevo torneo"
    await sql`DELETE FROM matches`;

    const generatedMatches = [];
    const startDate = new Date();
    
    // Generamos un "Clásico" o serie de 3 partidos por ejemplo, o solo 1. 
    // El usuario pidió "Crear Torneo", así que asumo un fixture de ida y vuelta o algo similar.
    // Vamos a generar 2 partidos (Ida y Vuelta).
    
    for (let i = 0; i < 2; i++) {
      const homeIdx = i === 0 ? 0 : 1;
      const awayIdx = i === 0 ? 1 : 0;

      const matchDate = new Date(startDate);
      matchDate.setDate(startDate.getDate() + (i * 7)); // Una semana de diferencia
      const time = '20:00:00';
      
      const newMatch = await sql`
        INSERT INTO matches (home_team_id, away_team_id, match_date, match_time, field)
        VALUES (${approvedTeams[homeIdx].id}, ${approvedTeams[awayIdx].id}, ${matchDate.toISOString().split('T')[0]}, ${time}, 'Cancha 1')
        RETURNING *;
      `;
      generatedMatches.push(newMatch[0]);
    }
    res.json(generatedMatches);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al generar fixture' });
  }
});


// 7. Cargar Resultado / Acta de partido
app.put('/api/matches/:id/result', async (req, res) => {
    const { id } = req.params;
    const { home_goals, away_goals } = req.body;
    try {
        const updatedMatch = await sql`
            UPDATE matches 
            SET home_goals = ${home_goals}, away_goals = ${away_goals}, status = 'finished'
            WHERE id = ${id}
            RETURNING *;
        `;
        res.json(updatedMatch[0]);
    } catch (error) {
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
      SELECT t.name, 
             SUM(pts) as pts, 
             SUM(pj) as pj, 
             SUM(pg) as pg, 
             SUM(pe) as pe, 
             SUM(pp) as pp, 
             SUM(gf) as gf, 
             SUM(gc) as gc, 
             (SUM(gf) - SUM(gc)) as dif
      FROM teams t
      LEFT JOIN MatchStats ms ON t.id = ms.team_id
      WHERE t.status = 'approved'
      GROUP BY t.id, t.name
      ORDER BY pts DESC, dif DESC;
    `;
    res.json(standings);
  } catch (error) {
    res.status(500).json({ error: 'Error al calcular tabla' });
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

const PORT = process.env.PORT || 3001;
app.listen(PORT, async () => {
  try {
    await initDB();
    console.log(`🚀 Servidor backend corriendo y escuchando en el puerto ${PORT}`);
  } catch (error) {
    console.error('❌ Error al inicializar la base de datos:', error);
  }
});

