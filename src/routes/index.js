import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

router.get("/", (req, res) => {
  res.render("index", { title: "Home" });
});

router.get("/gestion", async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM "Habitaciones"');
    res.render("gestion", {
      title: "Gestión de Habitaciones",
      habitaciones: result.rows
    });
  } catch (error) {
    console.error("Error al obtener habitaciones:", error);
    res.status(500).send("Error al obtener habitaciones");
  }
});

export default router;
