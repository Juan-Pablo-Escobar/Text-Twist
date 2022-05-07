const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
let users = []
let sesiones = []

app.use(express.static("public"));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/html/index.html');
});

app.get('/registro', (req, res) => {
    res.sendFile(__dirname + '/public/html/registrar.html');
});

io.on('connection', (socket) => {
    socket.on('chat message', (msg) => {
        io.emit('chat message', msg);
    });
});

io.on('connection', (socket) => {
    socket.on('definir usuario', (msg) => {
        users.push({"socket":socket.id,"usuario":msg})
        socket.emit('usuario definido',1)
        console.log(users)
    });
});

io.on('connection', (socket) => {
    socket.on('disconnect', () => {
        for(i = 0;i<users.length;i++){
            if(socket.id == users[i]["socket"]){
                users.splice(i,1)
            }
        }
    });
});

server.listen(3000, () => {
    console.log('listening on *:3000');
});