import express from 'express';
import { WebSocketServer } from 'ws';


const app = express();
const PORT = 3000;
app.use(express.static('public'));


app.listen(PORT, () => {
    console.log(`Servidor Express funcionando en http://localhost:${PORT}`);
});


const wss = new WebSocketServer({ port: 3333 });
wss.on('connection', ws => {
    ws.send('Conexión establecida');
    ws.on('message', message => console.log(`Mensaje recibido: ${message}`));
});
