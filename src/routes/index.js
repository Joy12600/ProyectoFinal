import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

router.get("/", (req, res) => {
  res.render("index", { title: "Home" });
});

router.get("/gestion", async (req, res) => {
  try {
    // Ejecuta todas las consultas en paralelo
    const [habitacionesRes, huespedesRes, pagosRes, reservasRes] = await Promise.all([
      pool.query('SELECT * FROM "Habitaciones"'),
      pool.query('SELECT * FROM "Huespedes"'),
      pool.query('SELECT * FROM "Pago"'),
      pool.query('SELECT * FROM "Reserva"'),
    ]);

    // Envía los resultados a la vista
    res.render("gestion", {
      title: "Gestión General",
      habitaciones: habitacionesRes.rows,
      huespedes: huespedesRes.rows,
      pagos: pagosRes.rows,
      reservas: reservasRes.rows,
    });

  } catch (error) {
    console.error("Error al obtener datos de gestión:", error);
    res.status(500).send("Error al obtener datos");
  }
});

export default router;