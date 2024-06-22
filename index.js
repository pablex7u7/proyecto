const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const csv = require('csv-parser');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const connection = require('./db');

const app = express();
const port = process.env.PORT || 3000;

// Middleware para manejar datos JSON y formularios URL-encoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Configuración de Multer para manejar la carga de archivos CSV
const upload = multer({ dest: 'uploads/' });

// Ruta para cargar archivos CSV desde el formulario o una URL
app.post('/cargar-csv', upload.single('csvFile'), async (req, res) => {
  let csvData;

  if (req.file) {
    // Si se subió un archivo, leerlo desde el sistema de archivos
    csvData = fs.readFileSync(req.file.path, 'utf8');
    fs.unlinkSync(req.file.path); // Eliminar el archivo temporal
  } else {
    // Si no se subió un archivo, descargar desde la URL especificada
    const csvUrl = 'https://datos.cdmx.gob.mx/dataset/cfa343cb-bd82-47af-83a0-bdaeb9da750e/resource/ed0a7cd3-2ed7-4cc6-b318-10471a0796f6/download/censo2020_pob_edades_localidad.csv';
    try {
      const response = await axios.get(csvUrl);
      csvData = response.data;
    } catch (error) {
      console.error('Error al cargar el archivo CSV desde la URL:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  try {
    const results = [];
    await new Promise((resolve, reject) => {
      // Parsear el CSV y almacenar los resultados en un array
      csvData
        .pipe(csv())
        .on('data', (row) => results.push(row))
        .on('end', () => {
          const query = 'INSERT INTO tu_tabla (alcaldia, localidad, sexo, rango_edad, poblacion) VALUES ?';
          connection.query(query, [results.map(obj => Object.values(obj))], (error, results) => {
            if (error) {
              console.error('Error al insertar datos:', error);
              return res.status(500).json({ error: 'Error interno del servidor' });
            }
            res.json({ message: 'Datos cargados correctamente', data: results });
          });
        })
        .on('error', reject);
    });
  } catch (error) {
    console.error('Error al procesar el archivo CSV:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Middleware para servir archivos estáticos desde el directorio 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Ruta para servir la página principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Ruta para servir la página de gestión de datos (crud.html)
app.get('/crud', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'crud.html'));
});

// Ruta para servir la página de gráfica (grafica.html)
app.get('/grafica', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'grafica.html'));
});

// Ruta para obtener datos para la gráfica desde la base de datos
app.get('/api/datos', (req, res) => {
  const query = 'SELECT alcaldia, SUM(poblacion) as poblacion FROM tu_tabla GROUP BY alcaldia';
  connection.query(query, (error, results) => {
    if (error) {
      console.error('Error al obtener datos:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    res.json(results);
  });
});

// Iniciar el servidor Express
app.listen(port, () => {
  console.log(`Servidor Express escuchando en el puerto ${port}`);
});
