const express = require('express');
const { fork } = require("child_process");
const { use } = require('express/lib/application');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
let users = []
let sesiones = []
let salas = []
let sockets = []

var data = require("fs").readFileSync("./private/Palabras Español.csv", "utf8")
data = data.split("\r\n")

function randomn() {
    max = 9999
    min = 1000
    return Math.round( Math.random() * (max - min) + min)
}


function newidsala() {
    max = 9999
    min = 1000
    if(salas.length==0){
        return Math.round( Math.random() * (max - min) + min)
    }else{
        salasid = []
        for (let i = 0; i < salas.length; i++) {
            salasid.push(salas[i]["id"])
        }
        salaid = Math.round( Math.random() * (max - min) + min)
        while(salasid.indexOf(salaid) != -1){
            salaid = Math.round( Math.random() * (max - min) + min)
        }
        return salaid
    }
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

app.get('/sala', (req, res) => {
    res.sendFile(__dirname + '/public/html/sala.html');
});

io.on('connection', (socket) => {
    sockets.push(socket)
    if(socket.handshake.headers.referer.split("/")[3].indexOf("sala")==0 && socket.handshake.headers.referer.split("sala=")[1] != undefined){
        for (let i = 0; i < salas.length; i++) {
            if(salas[i]["id"] == socket.handshake.headers.referer.split("sala=")[1]){
                if(salas[i]["player1"]["socket"] == ""){
                    console.log(salas)
                    salas[i]["player1"]["socket"] = socket
                    socket.emit("registrado en sala",{"posicion":1,"nombre":salas[i]["player1"]["id"],"sala":salas[i]["id"]})
                }else if(salas[i]["player2"]["socket"] == ""){
                    salas[i]["player2"]["socket"] = socket
                    socket.emit("registrado en sala",{"posicion":2,"nombre":salas[i]["player2"]["id"],"sala":salas[i]["id"]})
                    salas[i]["player1"]["socket"].emit("partida comenzada",{"partida":{"letras":salas[i]["juego"]["letras"],"conteo":salas[i]["juego"]["conteo"]},"oponente":salas[i]["player2"]["id"],"posicion":2})
                    socket.emit("partida comenzada",{"partida":{"letras":salas[i]["juego"]["letras"],"conteo":salas[i]["juego"]["conteo"]},"oponente":salas[i]["player1"]["id"],"posicion":1})
                }else{

                }
            }
        }
    }
});

io.on('connection', (socket) => {
    socket.on('adivinar palabra sala', (msg) => {
        for (let i = 0; i < salas.length; i++) {
            if (salas[i]["player1"]["socket"] == socket || salas[i]["player2"]["socket"] == socket) {
                if (salas[i]["juego"]["palabras"].includes(msg.toLowerCase()) ) {
                    indice = salas[i]["juego"]["palabras"].indexOf(msg.toLowerCase())
                    palabratmp = salas[i]["juego"]["palabras"][indice]
                    if(salas[i]["player1"]["socket"] == socket){
                        console.log(salas[i]["player1"]["adivinadas"])
                        if(salas[i]["player1"]["adivinadas"][indice]["adivinado"] == false){
                            salas[i]["player1"]["puntaje"] = salas[i]["player1"]["puntaje"] + palabratmp.length
                            salas[i]["player1"]["adivinadas"][indice]["adivinado"] = true
                            p1 = salas[i]["player1"]["puntaje"]
                            p2 = salas[i]["player2"]["puntaje"]
                            p100 = p1+p2
                            socket.emit("respuesta adivinar palabra sala", { "indice": indice, "palabra": palabratmp,"puntajep1":(p1/p100)*100,"puntajep2":(p2/p100)*100})
                            salas[i]["player2"]["socket"].emit("actualizar score sala",{"puntajep1":(p1/p100)*100,"puntajep2":(p2/p100)*100})
                        }
                    }else if(salas[i]["player2"]["socket"] == socket){
                        console.log(salas[i]["player2"]["adivinadas"])
                        if(salas[i]["player2"]["adivinadas"][indice]["adivinado"] == false){
                            salas[i]["player2"]["puntaje"] = salas[i]["player2"]["puntaje"] + palabratmp.length
                            salas[i]["player2"]["adivinadas"][indice]["adivinado"] = true
                            p1 = salas[i]["player1"]["puntaje"]
                            p2 = salas[i]["player2"]["puntaje"]
                            p100 = p1+p2
                            socket.emit("respuesta adivinar palabra sala", { "indice": indice, "palabra": palabratmp,"puntajep1":(p1/p100)*100,"puntajep2":(p2/p100)*100})
                            salas[i]["player1"]["socket"].emit("actualizar score sala",{"puntajep1":(p1/p100)*100,"puntajep2":(p2/p100)*100})
                        }
                        
                    }
                    return
                }
            }
        }
        socket.emit("respuesta adivinar palabra solo", -1)
    });
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
            if (sesiones[i]["socket"] == socket) {
                if (sesiones[i]["juego"]["palabras"].includes(msg.toLowerCase())) {
                    indice = sesiones[i]["juego"]["palabras"].indexOf(msg.toLowerCase())
                    palabratmp = sesiones[i]["juego"]["palabras"][indice]
                    sesiones[i]["puntaje"] = sesiones[i]["puntaje"] + palabratmp.length
                    sesiones[i]["adivinadas"][indice]["adivinado"] = true
                    console.log((sesiones[i]["puntaje"]/sesiones[i]["total"])*100)
                    socket.emit("respuesta adivinar palabra solo", { "indice": sesiones[i]["juego"]["palabras"].indexOf(msg.toLowerCase()), "palabra": sesiones[i]["juego"]["palabras"][sesiones[i]["juego"]["palabras"].indexOf(msg.toLowerCase())],"puntaje":(sesiones[i]["puntaje"]/sesiones[i]["total"])*100})
                    return
                }
            }
        }
        socket.emit("respuesta adivinar palabra solo", -1)
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

        copy = []
        while (sesiones.length != 0) {
            userstmp = sesiones.pop()
            if (userstmp["socket"] != socket.id) {
                copy.push(userstmp)
            }
        }
        sesiones = copy

        while (sockets.indexOf(socket) != -1) {
            sockets.splice(sockets.indexOf(socket), 1)
        }
    });
});

io.on('connection', (socket) => {
    socket.on('crear partida solo', () => {
        const child = fork("encontrar juego.js");
        child.on("message", function (message) {
            adivinadas = []
            for (let i = 0; i < message["palabras"].length; i++) {
                adivinadas.push({"palabra":message["palabras"][i],"adivinado":false})
            }
            total = message["conteo"].reduce((partialSum, a) => partialSum + a, 0)
            console.log(total)
            sesiones.push({"socket":socket,"juego":message,"tipo":"solo","adivinadas":adivinadas,"puntaje":0,"total":total})
            console.log(adivinadas)
            socket.emit('partida solo configurada', ({"letras":message["letras"],"conteo":message["conteo"]}));
        });
    });
});

io.on('connection', (socket) => {
    socket.on('crear partida sala', () => {
        const child = fork("encontrar juego.js");
        child.on("message", function (message) {
            adivinadasp1 = []
            for (let i = 0; i < message["palabras"].length; i++) {
                adivinadasp1.push({"palabra":message["palabras"][i],"adivinado":false})
            }

            adivinadasp2 = []
            for (let i = 0; i < message["palabras"].length; i++) {
                adivinadasp2.push({"palabra":message["palabras"][i],"adivinado":false})
            }
            total = message["conteo"].reduce((partialSum, a) => partialSum + a, 0)
            console.log(total)
            idsala = newidsala()
            salas.push({"id":idsala,"juego":message,"tipo":"sala","player1":{"id":randomn(),"socket":"","adivinadas":adivinadasp1,"puntaje":0},"player2":{"id":randomn(),"socket":"","adivinadas":adivinadasp2,"puntaje":0},"total":total})
            socket.emit('partida sala configurada', (idsala));
        });
    });
});


server.listen(80, () => {
    console.log('listening on *:80');
});
