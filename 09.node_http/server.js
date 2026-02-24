const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

const server = http.createServer((req, res) => {
    console.log(`${req.method} ${req.url}`);

    // 1. Normalización de la ruta: evitar que el usuario acceda a archivos fuera de la carpeta 'public'
    let filePath = path.join(__dirname, 'public', req.url === '/' ? 'index.html' : req.url);

    // 2. Gestión manual de Tipos MIME (Content-Type)
    const extname = String(path.extname(filePath)).toLowerCase();
    const mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.gif': 'image/gif',
        '.wav': 'audio/wav'
    };

    const contentType = mimeTypes[extname];

    // 3. Lectura del sistema de archivos y gestión de errores manual
    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                // El archivo no existe (404)
                fs.readFile(path.join(__dirname, 'public', '404.html'), (err, data) => {
                    res.writeHead(404, { 'Content-Type': 'text/html' });
                    res.end(data || '<h1>404 Not Found</h1>', 'utf-8');
                });
            } else {
                // Error del servidor (500)
                res.writeHead(500);
                res.end(`Error interno: ${error.code}`);
            }
        } else {
            // Éxito (200)
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    console.log('Intenta acceder a un archivo que no exista para ver el manejo de errores.');
});