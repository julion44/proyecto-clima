const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sql } = require("../db");

// Registro
router.post("/registro", async (req, res) => {
    const { nombre, email, password } = req.body;

    try {
        const hash = await bcrypt.hash(password, 10);
        const request = new sql.Request();
        const { nombre, curp, email, password } = req.body;
        request.input("nombre", sql.NVarChar, nombre);
        request.input("curp", sql.NVarChar, curp);
        request.input("email", sql.NVarChar, email);
        request.input("password", sql.NVarChar, hash);
        
        await request.query(
            "INSERT INTO usuarios (nombre, curp, email, password) VALUES (@nombre, @curp, @email, @password)"
        );
        res.json({ mensaje: "Usuario registrado correctamente" });
    } catch (error) {
        res.status(500).json({ error: "El email ya está registrado o hubo un error" });
    }
});

// Login
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const request = new sql.Request();
        request.input("email", sql.NVarChar, email);
        const resultado = await request.query(
            "SELECT * FROM usuarios WHERE email = @email"
        );

        if (resultado.recordset.length === 0) {
            return res.status(401).json({ error: "Usuario no encontrado" });
        }

        const usuario = resultado.recordset[0];
        const passwordValido = await bcrypt.compare(password, usuario.password);

        if (!passwordValido) {
            return res.status(401).json({ error: "Contraseña incorrecta" });
        }

        const token = jwt.sign(
            { id: usuario.id, nombre: usuario.nombre },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        );

        res.json({ token, nombre: usuario.nombre, id: usuario.id });
    }  catch (error) {
        console.error("Error login:", error.message);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;