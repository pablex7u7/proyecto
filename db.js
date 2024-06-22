const mysql = require('mysql2');
require('dotenv').config();

// Configurar la conexión a MySQL
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
});

// Conectar a MySQL
connection.connect(error => {
  if (error) {
    console.error('Error de conexión a la base de datos:', error);
    return;
  }
  console.log('Conexión establecida con la base de datos MySQL');
});

module.exports = connection;
