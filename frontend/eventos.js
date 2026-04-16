router.post('/', autenticar, async (req, res) => {
    try {
        const { usuario_id, nombre, ciudad, fecha } = req.body;  // ✅ ahora incluye 'fecha'

        // Validaciones básicas
        if (!usuario_id || !nombre || !ciudad || !fecha) {
            return res.status(400).json({ error: 'Todos los campos son obligatorios' });
        }

        const fechaEvento = new Date(fecha);
        if (isNaN(fechaEvento.getTime())) {
            return res.status(400).json({ error: 'Fecha inválida' });
        }

        // Validación de máximo 5 días futuros (opcional, ya se hace en frontend)
        const hoy = new Date();
        hoy.setHours(0,0,0,0);
        const diffDays = Math.ceil((fechaEvento - hoy) / (1000*60*60*24));
        if (diffDays < 0) {
            return res.status(400).json({ error: 'La fecha no puede ser pasada' });
        }
        if (diffDays > 5) {
            return res.status(400).json({ error: 'Solo se pueden registrar eventos con hasta 5 días de anticipación' });
        }

        // Insertar en base de datos (ejemplo con mssql)
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('usuario_id', sql.Int, usuario_id)
            .input('nombre', sql.VarChar, nombre)
            .input('ciudad', sql.VarChar, ciudad)
            .input('fecha', sql.Date, fechaEvento)
            .query(`INSERT INTO eventos (usuario_id, nombre, ciudad, fecha) 
                    VALUES (@usuario_id, @nombre, @ciudad, @fecha);
                    SELECT SCOPE_IDENTITY() AS id;`);

        res.status(201).json({ 
            mensaje: 'Evento creado', 
            id: result.recordset[0].id 
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});