import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import path from 'path';

const app = express();
const server = createServer(app);
const io = new Server(server);

// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('Un usuario se ha conectado');

    socket.on('disconnect', () => {
        console.log('Usuario desconectado');
    });

    // Escuchar el evento 'message' enviado por un cliente
    socket.on('message', (msg) => {
        console.log('Mensaje recibido: ' + msg);
        // Retransmitir el mensaje a TODOS los usuarios conectados
        io.emit('message', msg);
    });
});

server.listen(3000, () => {
    console.log('Servidor corriendo en http://localhost:3000');
});