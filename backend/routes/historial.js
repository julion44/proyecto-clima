const express = require("express");
const router = express.Router();
const { sql } = require("../db");

// Obtener historial del usuario
router.get("/:usuario_id", async (req, res) => {
    const { usuario_id } = req.params;

    try {
        const request = new sql.Request();
        request.input("usuario_id", sql.Int, usuario_id);
        const resultado = await request.query(
            "SELECT * FROM historial WHERE usuario_id = @usuario_id ORDER BY fecha DESC"
        );

        res.json(resultado.recordset);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener el historial" });
    }
});

// Eliminar registro del historial
router.delete("/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const request = new sql.Request();
        request.input("id", sql.Int, id);
        await request.query("DELETE FROM historial WHERE id = @id");

        res.json({ mensaje: "Registro eliminado correctamente" });
    } catch (error) {
        res.status(500).json({ error: "Error al eliminar el registro" });
    }
});

module.exports = router;