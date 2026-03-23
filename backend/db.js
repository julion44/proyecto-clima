const sql = require('mssql');

const config = {
  server: 'localhost',
  database: 'clima_app',
  user: 'climauser',
  password: 'Clima123!',
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

const conectar = async () => {
  try {
    await sql.connect(config);
    console.log("✅ Conectado a SQL Server");
  } catch (error) {
    console.error("❌ Error al conectar:", error.message);
    process.exit(1);
  }
};

module.exports = { sql, conectar };