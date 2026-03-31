import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { neon } from '@neondatabase/serverless';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Leer la base de datos segura desde el .env
const sql = neon(process.env.DATABASE_URL);

// Función para inicializar la DB con las tablas necesarias
async function initDB() {
  // Aseguramos que la tabla exista (ejecuta de forma segura directamente contra tu db conectada)
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
  console.log('✅ Base de datos inicializada correctamente');
}

// Inicializamos base de datos al arrancar
initDB().catch(console.error);

// ----------------------------------------------------
// RUTAS DE LA API (ACCESIBLES SÓLO A TRAVÉS DE ESTE SERVER)
// ----------------------------------------------------

// 1. Obtener todos los equipos (Principalmente para el panel de ADMIN)
app.get('/api/teams', async (req, res) => {
  try {
    const teams = await sql`SELECT * FROM teams ORDER BY created_at DESC`;
    res.json(teams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({ error: 'Error del servidor al cargar los equipos' });
  }
});

// 2. Registrar un nuevo equipo (Llamado desde el Formulario Público)
app.post('/api/teams', async (req, res) => {
  const { name, category, captain_name, captain_phone, user_email } = req.body;
  try {
    const newTeam = await sql`
      INSERT INTO teams (name, category, captain_name, captain_phone, user_email)
      VALUES (${name}, ${category}, ${captain_name}, ${captain_phone}, ${user_email})
      RETURNING *;
    `;
    res.status(201).json(newTeam[0]); // Devolvemos el registro ya insertado en la base de datos
  } catch (error) {
    console.error('Error inserting team:', error);
    res.status(500).json({ error: 'Error del servidor al insertar equipo. Confirme los datos.' });
  }
});

// 3. Modificar el estado de un equipo (Aceptar/Rechazar desde panel ADMIN)
app.put('/api/teams/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const updatedTeam = await sql`
      UPDATE teams
      SET status = ${status}
      WHERE id = ${id}
      RETURNING *;
    `;
    if (updatedTeam.length === 0) {
      return res.status(404).json({ error: 'Equipo no encontrado' });
    }
    res.json(updatedTeam[0]);
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ error: 'Error crítico al actualizar el estado en Postgres' });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor backend corriendo y escuchando en http://localhost:${PORT}`);
});
