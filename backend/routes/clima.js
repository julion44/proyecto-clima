const express = require("express");
const router = express.Router();
const fetch = require("node-fetch");
const { sql } = require("../db");

const API_KEY = "6f6a2a006379599f216bea1275203dbc";

router.get("/buscar", async (req, res) => {
    const { ciudad, usuario_id } = req.query;

    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${ciudad}&appid=${API_KEY}&units=metric&lang=es`;
        const respuesta = await fetch(url);
        const datos = await respuesta.json();

        if (datos.cod === "404") {
            return res.status(404).json({ error: "Ciudad no encontrada" });
        }

        // Guardar en historial
        const request = new sql.Request();
        request.input("usuario_id", sql.Int, usuario_id);
        request.input("ciudad", sql.NVarChar, datos.name);
        request.input("temperatura", sql.Float, datos.main.temp);
        request.input("descripcion", sql.NVarChar, datos.weather[0].description);
        request.input("humedad", sql.Int, datos.main.humidity);
        request.input("viento", sql.Float, datos.wind.speed);

        await request.query(
            "INSERT INTO historial (usuario_id, ciudad, temperatura, descripcion, humedad, viento) VALUES (@usuario_id, @ciudad, @temperatura, @descripcion, @humedad, @viento)"
        );

        res.json(datos);
    } catch (error) {
        res.status(500).json({ error: "Error al buscar el clima" });
    }
});

module.exports = router;