// main.js
const { fork } = require("child_process");

console.log("Running main.js");
console.log("Forking a new subprocess....");

const child = fork("app.js");
funcion()
setTimeout(() => {
    child.send(29);
}, 2000);


function funcion() {
    child.on("message", function (message) {
        console.log(`Message from child.js: ${message}`);
    });
}


child.on("close", function (code) {
    console.log("child process exited with code " + code);
});