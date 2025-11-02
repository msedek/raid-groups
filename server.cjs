const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = 3001;

// Servir archivos estáticos desde la carpeta dist
app.use(express.static(path.join(__dirname, 'dist')));

// Manejar todas las rutas y servir index.html (para SPA)
// Este middleware se ejecuta solo si express.static no encontró el archivo
app.use((req, res) => {
  // Si es un archivo estático (con extensión), no hacer nada más
  if (path.extname(req.path)) {
    return res.status(404).send('Not found');
  }
  
  // Para todas las demás rutas, servir index.html para SPA routing
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Not found');
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Raid Groups server running on port ${PORT}`);
});