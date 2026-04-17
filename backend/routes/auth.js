const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sql } = require("../db");

router.post("/registro", async (req, res) => {
    const { nombre, apellido, fecha_nacimiento, edad, genero, curp, email, password,
            telefono, telefono_alt, calle, num_exterior, num_interior, colonia,
            ciudad, estado, pais, codigo_postal } = req.body;

    try {
        const hash = await bcrypt.hash(password, 10);
        const request = new sql.Request();

        request.input("nombre", sql.NVarChar, nombre);
        request.input("apellido", sql.NVarChar, apellido);
        request.input("fecha_nacimiento", sql.Date, fecha_nacimiento);
        request.input("edad", sql.Int, edad);
        request.input("genero", sql.NVarChar, genero);
        request.input("curp", sql.NVarChar, curp);
        request.input("email", sql.NVarChar, email);
        request.input("password", sql.NVarChar, hash);
        request.input("telefono", sql.NVarChar, telefono);
        request.input("telefono_alt", sql.NVarChar, telefono_alt || null);
        request.input("calle", sql.NVarChar, calle);
        request.input("num_exterior", sql.NVarChar, num_exterior);
        request.input("num_interior", sql.NVarChar, num_interior || null);
        request.input("colonia", sql.NVarChar, colonia);
        request.input("ciudad", sql.NVarChar, ciudad);
        request.input("estado", sql.NVarChar, estado);
        request.input("pais", sql.NVarChar, pais);
        request.input("codigo_postal", sql.NVarChar, codigo_postal);

        await request.query(`
            INSERT INTO usuarios (nombre, apellido, fecha_nacimiento, edad, genero, curp, email, password,
                telefono, telefono_alt, calle, num_exterior, num_interior, colonia, ciudad, estado, pais, codigo_postal)
            VALUES (@nombre, @apellido, @fecha_nacimiento, @edad, @genero, @curp, @email, @password,
                @telefono, @telefono_alt, @calle, @num_exterior, @num_interior, @colonia, @ciudad, @estado, @pais, @codigo_postal)
        `);

        res.json({ mensaje: "Usuario registrado correctamente" });
    } catch (error) {
        console.error("Error registro:", error.message);
        res.status(500).json({ error: error.message });
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