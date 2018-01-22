/* global __dirname */

var path = require("path");
var express = require("express");
var dao = require("./dao");
var bodyParser = require("body-parser");

var app = express();
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", function(request, response) {
    response.redirect("/showPlaylist");
});

//
// Añade más manejadores de ruta, si los necesitas.
//


app.get("/showPlaylist", function(request, response) {
    //
    // Implementa aquí el apartado 1.b
    //
});


app.post("/insertEntry", function(request, response) {
    //
    // Implementa aquí el apartado 1.d
    //
});

app.listen(3000, function(err) {
    if (err) {
        console.log("No se pudo iniciar el servidor: " + err.message);
    } else {
        console.log("Servidor escuchando en el puerto 3000.");
    }
});