const { someLimit } = require('async');
const express = require('express');
const { use } = require('express/lib/application');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
let users = []
let sesiones = []
let sockets = []

var data = require("fs").readFileSync("./private/Palabras Español.csv", "utf8")
data = data.split("\r\n")
var abecedario = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "ñ", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"]

async function calcularjuego() { 
    cumple = true
    while (cumple) {
        var palabras = []
        var palabras_usuario = []
        var letras = []
        for (let i = 0; i < 6; i++) {
            var random = (Math.random() * (26 - 0) + 0).toFixed()
            letras.push(abecedario[random])
        }
        var data = require("fs").readFileSync("./private/Palabras Español.csv", "utf8")
        data = data.split("\r\n")
        for (let i = 0; i < data.length; i++) {
            palabra = data[i].slice()
            accepted = false
            for (let j = 0; j < letras.length; j++) {
                if (palabra.length > 0) {
                    palabra = palabra.replace(letras[j], "")
                } else {
                    accepted == true
                }
            }
            if (palabra.length == 0 && data[i].length >= 3) {
                palabras.push(data[i])
            }
        }

        contador = 0
        for (let f = 0; f < palabras.length; f++) {
            if (palabras[f].length == 6) {
                contador = contador + 1
            }
        }
        if (contador > 0 && palabras.length > 20) {
            console.log(palabras)
            cumple = false
        }
    }
    palabras = palabras.sort(function (a, b) {
        if (a.length < b.length) {
            return -1;
        }
        if (a.length > b.length) {
            return 1;
        }
        if (a < b){
            return -1
        }
        if (a > b){
            return 1
        }
        return 0;
    });

    for (let i = 0; i < palabras.length; i++) {
        palabras_usuario.push(palabras[i].length)
    }

    return {"palabras":palabras,"letras":letras,"palabras usuario":palabras_usuario}
}

let https;
try {
    https = require('node:https');
} catch (err) {
    console.log('https support is disabled!');
}

// app.use(express.static("public"));
app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/html/index.html');
});

app.get('/chat', (req, res) => {
    res.sendFile(__dirname + '/public/html/chat.html');
});

app.get('/registro', (req, res) => {
    res.sendFile(__dirname + '/public/html/registrar.html');
});

app.get('/solo', (req, res) => {
    res.sendFile(__dirname + '/public/html/alone.html');
});

io.on('connection', (socket) => {
    sockets.push(socket)
});

io.on('connection', (socket) => {
    socket.on('chat message', (msg) => {
        io.emit('chat message', msg);
    });
});

io.on('connection', (socket) => {
    socket.on('definir usuario', (msg) => {
        users.push({ "socket": socket.id, "usuario": msg })
        socket.emit('usuario definido', 1)
        console.log(users)
    });
});

io.on('connection', (socket) => {
    socket.on('adivinar palabra solo', (msg) => {
        for (let i = 0; i < sesiones.length; i++) {
            if(sesiones[i]["socket"] = socket){
                if(sesiones[i]["juego"]["palabras"].includes(msg.toLowerCase())){
                    console.log(msg)
                    socket.emit("respuesta adivinar palabra solo",{"indice":sesiones[i]["juego"]["palabras"].indexOf(msg.toLowerCase()),"palabra":sesiones[i]["juego"]["palabras"][sesiones[i]["juego"]["palabras"].indexOf(msg.toLowerCase())]})
                    return
                }
            }
        }
        socket.emit("respuesta adivinar palabra solo",-1)
    });
});


io.on('connection', (socket) => {
    socket.on('disconnect', () => {
        copy = []
        while (users.length != 0) {
            userstmp = users.pop()
            if (userstmp["socket"] != socket.id) {
                copy.push(userstmp)
            }
        }
        users = copy

        while (sockets.indexOf(socket) != -1) {
            sockets.splice(sockets.indexOf(socket), 1)
        }
    });
});

io.on('connection', (socket) => {
    socket.on('crear partida solo', (msg) => {
        juego = calcularjuego()
        console.log(juego)
        sesiones.push({"socket":socket,"juego":juego})
        socket.emit('partida solo configurada', {"letras":juego["letras"],"palabras usuario":juego["palabras usuario"]});
    });
});

server.listen(3000, () => {
    console.log('listening on *:3000');
});
