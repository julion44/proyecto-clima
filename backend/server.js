const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { conectar } = require("./db");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const authRoutes = require("./routes/auth");
const climaRoutes = require("./routes/clima");
const historialRoutes = require("./routes/historial");
const eventosRoutes = require("./routes/eventos");

app.use("/api/auth", authRoutes);
app.use("/api/clima", climaRoutes);
app.use("/api/historial", historialRoutes);
app.use("/api/eventos", eventosRoutes);


const PORT = process.env.PORT || 3000;

conectar().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
});