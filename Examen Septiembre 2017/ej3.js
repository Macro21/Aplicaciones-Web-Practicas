/* global __dirname */

var path = require("path");
var express = require("express");

var app = express();

var stock = ["Aceite", "Galletas", "Pan", "Cebolla", "Cereales", "Huevos", "Tomate", "Mantequilla", "Leche", "Café"];

app.use(express.static(path.join(__dirname, "public")));

app.get("/stock", function(request, response) {
    //
    // Apartado 3.b
    //
});

app.get("/", function(request, response) {
    response.redirect("/ej3.html");
});

app.listen(3000, function(err) {
    if (err) {
        console.log("No se pudo iniciar el servidor: " + err.message);
    } else {
        console.log("Servidor escuchando en el puerto 3000.");
    }
});