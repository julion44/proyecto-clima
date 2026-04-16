const express = require('express');
const router = express.Router();
const { sql, conectar } = require('../db');


// Obtener eventos de un usuario
router.get('/:usuario_id', autenticar, async (req, res) => {
    try {
        const { usuario_id } = req.params;
        const pool = await sql.connect(conectar);
        const result = await pool.request()
            .input('usuario_id', sql.Int, usuario_id)
            .query(`SELECT id, nombre, ciudad, fecha, temperatura, descripcion 
                    FROM eventos WHERE usuario_id = @usuario_id ORDER BY fecha DESC`);
        res.json(result.recordset);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener eventos' });
    }
});

// Crear nuevo evento
router.post('/', autenticar, async (req, res) => {
    try {
        const { usuario_id, nombre, ciudad, fecha } = req.body;

        if (!usuario_id || !nombre || !ciudad || !fecha) {
            return res.status(400).json({ error: 'Todos los campos son obligatorios' });
        }

        const fechaEvento = new Date(fecha);
        if (isNaN(fechaEvento.getTime())) {
            return res.status(400).json({ error: 'Fecha inválida' });
        }

        const pool = await sql.connect(conectar);
        const result = await pool.request()
            .input('usuario_id', sql.Int, usuario_id)
            .input('nombre', sql.VarChar, nombre)
            .input('ciudad', sql.VarChar, ciudad)
            .input('fecha', sql.Date, fechaEvento)
            .query(`INSERT INTO eventos (usuario_id, nombre, ciudad, fecha) 
                    VALUES (@usuario_id, @nombre, @ciudad, @fecha);
                    SELECT SCOPE_IDENTITY() AS id;`);

        res.status(201).json({ mensaje: 'Evento creado', id: result.recordset[0].id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear evento' });
    }
});

// Eliminar evento
router.delete('/:id', autenticar, async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await sql.connect(conectar);
        await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM eventos WHERE id = @id');
        res.json({ mensaje: 'Evento eliminado' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar' });
    }
});

module.exports = router;