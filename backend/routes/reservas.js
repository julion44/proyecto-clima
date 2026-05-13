const express = require("express");
const router = express.Router();
const { sql } = require("../db");

// Obtener todos los eventos disponibles
router.get("/disponibles/todos", async (req, res) => {
    try {
        const request = new sql.Request();
        const resultado = await request.query(
            "SELECT e.*, u.nombre as organizador FROM eventos e JOIN usuarios u ON e.usuario_id = u.id WHERE e.fecha >= CAST(GETDATE() AS DATE) ORDER BY e.fecha ASC"
        );
        res.json(resultado.recordset);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener eventos" });
    }
});

// Reservar evento
router.post("/", async (req, res) => {
    const { usuario_id, evento_id } = req.body;
    try {
        // Verificar que no haya reservado ya ese evento
        const check = new sql.Request();
        check.input("usuario_id", sql.Int, usuario_id);
        check.input("evento_id", sql.Int, evento_id);
        const existe = await check.query(
            "SELECT * FROM reservas WHERE usuario_id = @usuario_id AND evento_id = @evento_id"
        );

        if (existe.recordset.length > 0) {
            return res.status(400).json({ error: "Ya tienes una reserva para este evento" });
        }

        const request = new sql.Request();
        request.input("usuario_id", sql.Int, usuario_id);
        request.input("evento_id", sql.Int, evento_id);
        await request.query(
            "INSERT INTO reservas (usuario_id, evento_id) VALUES (@usuario_id, @evento_id)"
        );

        res.json({ mensaje: "Reserva realizada correctamente" });
    } catch (error) {
        res.status(500).json({ error: "Error al realizar la reserva" });
    }
});

// Obtener reservas del usuario
router.get("/:usuario_id", async (req, res) => {
    const { usuario_id } = req.params;
    try {
        const request = new sql.Request();
        request.input("usuario_id", sql.Int, usuario_id);
        const resultado = await request.query(
            `SELECT r.id, e.nombre, e.ciudad, e.fecha, e.temperatura, e.descripcion, 
             u.nombre as organizador, r.fecha_reserva
             FROM reservas r 
             JOIN eventos e ON r.evento_id = e.id 
             JOIN usuarios u ON e.usuario_id = u.id
             WHERE r.usuario_id = @usuario_id 
             ORDER BY e.fecha ASC`
        );
        res.json(resultado.recordset);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener reservas" });
    }
});

// Cancelar reserva
router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const request = new sql.Request();
        request.input("id", sql.Int, id);
        await request.query("DELETE FROM reservas WHERE id = @id");
        res.json({ mensaje: "Reserva cancelada correctamente" });
    } catch (error) {
        res.status(500).json({ error: "Error al cancelar la reserva" });
    }
});

module.exports = router;