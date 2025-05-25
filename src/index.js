import express from 'express';
import { pool } from './db.js';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 3000;

const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

app.post('/buscar', async (req, res) => {
  const { fechaInicio, fechaFin } = req.body;

  try {
    const query = `
      SELECT 
        h."TipoHabitacion",
        h."ValorPorDia",
        COUNT(*) AS "CantidadDisponible"
      FROM "Habitaciones" h
      WHERE h."ID_Habitacion" NOT IN (
        SELECT r."ID_Habitacion"
        FROM "Reservas" r
        WHERE 
          r."FechaInicio" <= $2 AND
          r."FechaFin" >= $1
      )
      GROUP BY h."TipoHabitacion", h."ValorPorDia"
      ORDER BY h."TipoHabitacion";
    `;
    const values = [fechaInicio, fechaFin];
    const result = await pool.query(query, values);

    let html = `
      <a href="/">⬅ Volver</a>
      <h2>Habitaciones disponibles del ${fechaInicio} al ${fechaFin}</h2>
      <table border="1">
        <tr><th>Tipo</th><th>Tarifa</th><th>Disponibles</th></tr>
        ${result.rows.map(row =>
          `<tr><td>${row.TipoHabitacion}</td><td>${row.ValorPorDia}</td><td>${row.CantidadDisponible}</td></tr>`
        ).join('')}
      </table>
    `;
    res.send(html);

  } catch (error) {
    console.error(error);
    res.status(500).send('Error al consultar habitaciones.');
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
