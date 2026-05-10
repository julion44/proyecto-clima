const express = require("express");
const router = express.Router();
const fetch = require("node-fetch");
const { sql } = require("../db");

const API_KEY = "6f6a2a006379599f216bea1275203dbc";

// Obtener eventos del usuario
router.get("/:usuario_id", async (req, res) => {
    const { usuario_id } = req.params;
    try {
        const request = new sql.Request();
        request.input("usuario_id", sql.Int, usuario_id);
        const resultado = await request.query(
            "SELECT * FROM eventos WHERE usuario_id = @usuario_id ORDER BY fecha ASC"
        );
        res.json(resultado.recordset);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener eventos" });
    }
});

// Crear evento
router.post("/", async (req, res) => {
    const { usuario_id, nombre, ciudad, fecha } = req.body;
    try {
        const url = `https://api.openweathermap.org/data/2.5/forecast?q=${ciudad}&appid=${API_KEY}&units=metric&lang=es`;
        const respuesta = await fetch(url);
        const datos = await respuesta.json();

        if (datos.cod === "404") {
            return res.status(404).json({ error: "Ciudad no encontrada" });
        }

        const pronostico = datos.list.find(item => item.dt_txt.startsWith(fecha));
        const temperatura = pronostico ? pronostico.main.temp : null;
        const descripcion = pronostico ? pronostico.weather[0].description : "Sin pronóstico disponible";

        const request = new sql.Request();
        request.input("usuario_id", sql.Int, usuario_id);
        request.input("nombre", sql.NVarChar, nombre);
        request.input("ciudad", sql.NVarChar, ciudad);
        request.input("fecha", sql.Date, fecha);
        request.input("temperatura", sql.Float, temperatura);
        request.input("descripcion", sql.NVarChar, descripcion);

        await request.query(
            "INSERT INTO eventos (usuario_id, nombre, ciudad, fecha, temperatura, descripcion) VALUES (@usuario_id, @nombre, @ciudad, @fecha, @temperatura, @descripcion)"
        );

        res.json({ mensaje: "Evento registrado correctamente", temperatura, descripcion });
    } catch (error) {
        console.error("Error eventos:", error.message);
        res.status(500).json({ error: error.message });
    }
});

// Eliminar evento
router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const request = new sql.Request();
        request.input("id", sql.Int, id);
        await request.query("DELETE FROM eventos WHERE id = @id");
        res.json({ mensaje: "Evento eliminado correctamente" });
    } catch (error) {
        res.status(500).json({ error: "Error al eliminar evento" });
    }
});

// Actualizar pronóstico de eventos futuros
router.put("/actualizar/:usuario_id", async (req, res) => {
    const { usuario_id } = req.params;
    try {
        const request = new sql.Request();
        request.input("usuario_id", sql.Int, usuario_id);
        const resultado = await request.query(
            "SELECT * FROM eventos WHERE usuario_id = @usuario_id AND fecha >= CAST(GETDATE() AS DATE)"
        );

        const eventos = resultado.recordset;

        for (const evento of eventos) {
            const url = `https://api.openweathermap.org/data/2.5/forecast?q=${evento.ciudad}&appid=${API_KEY}&units=metric&lang=es`;
            const respuesta = await fetch(url);
            const datos = await respuesta.json();

            if (datos.cod === "404") continue;

            const fechaStr = new Date(evento.fecha).toISOString().split("T")[0];
            const pronostico = datos.list.find(item => item.dt_txt.startsWith(fechaStr));

            if (pronostico) {
                console.log(`✅ Actualizando ${evento.nombre} en ${evento.ciudad}: ${pronostico.main.temp}°C - ${pronostico.weather[0].description}`);
                const req2 = new sql.Request();
                req2.input("id", sql.Int, evento.id);
                req2.input("temperatura", sql.Float, pronostico.main.temp);
                req2.input("descripcion", sql.NVarChar, pronostico.weather[0].description);
                await req2.query(
                    "UPDATE eventos SET temperatura = @temperatura, descripcion = @descripcion WHERE id = @id"
                );
            }
        }

        res.json({ mensaje: "Pronósticos actualizados" });
    } catch (error) {
        console.error("Error actualizando pronósticos:", error.message);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;