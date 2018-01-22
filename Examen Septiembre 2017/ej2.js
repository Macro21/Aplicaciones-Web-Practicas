/* global __dirname */

var path = require("path");
var express = require("express");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");

var app = express();
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

//
// Implementa aquí el middleware pedido en el apartado 2.b
//


app.get("/", function(request, response) {
    //
    // Implementa aquí el apartado 2.a
    //
});

app.post("/login", function(request, response) {
    //
    // Implementa aquí el apartado 2.b
    //
});

app.get("/logout", function(request, response) {
    //
    // Implementa aquí el apartado 2.c
    //
});


app.listen(3000, function(err) {
    if (err) {
        console.log("No se pudo iniciar el servidor: " + err.message);
    } else {
        console.log("Servidor escuchando en el puerto 3000.");
    }
});