
var data = require("fs").readFileSync("./private/Palabras Español.csv", "utf8")
data = data.split("\r\n")
var abecedario = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "ñ", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"]
var palabras_usuario = []

cumple = true
while (cumple) {
    var palabras = []
    var letras = []
    contador = 0
    for (let i = 0; i < 6; i++) {
        var random = (Math.random() * (26 - 0) + 0).toFixed()
        letras.push(abecedario[random])
    }
    for (let i = 0; i < data.length; i++) {
        palabra = data[i].slice()
        if(palabra.length>= 3 && palabra.length<=6 ){
            for (let j = 0; j < letras.length; j++) {
                if (palabra.length > 0) {
                    palabra = palabra.replace(letras[j], "")
                }
            }
            if (palabra.length == 0) {
                palabras.push(data[i])
                if(data[i].length ==6){
                    contador = contador +1
                }
            }
        }
    }
    if (contador > 0 && palabras.length > 20) {
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
    if (a < b) {
        return -1
    }
    if (a > b) {
        return 1
    }
    return 0;
});

for (let i = 0; i < palabras.length; i++) {
    palabras_usuario.push(palabras[i].length)
}
juego = { "palabras": palabras, "letras": letras, "conteo": palabras_usuario }
process.send(juego);
process.exit();
