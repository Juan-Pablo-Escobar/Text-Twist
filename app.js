process.on("message", function (message) {
  console.log(`Message from main.js: ${message}`);
});
process.send("Nathan");
process.exit();