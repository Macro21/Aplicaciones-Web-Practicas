
/* global __dirname */

var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");
var _ = require("underscore");
var app = express();

var staticPath = path.join(__dirname, "public");
app.use(express.static(staticPath));


app.use(bodyParser.json());

/*
 * Tabla inicial de puntuaciones
 */
var records = [
    { nombre: "Fran", puntos: 955 },
    { nombre: "Rafael", puntos: 865 },
    { nombre: "Carmen", puntos: 563 },
    { nombre: "Rosario", puntos: 534 },
    { nombre: "Juan", puntos: 234 },
    { nombre: "Estela", puntos: 107 }
];

/*
 * Mostrar las puntuaciones más altas
 */
app.get("/highestRecords", function(request, response) {
    if(records.length < 5){
        response.json({records: records});
    }
    else{
        response.json({records: records.slice(0,5)});
    }
});

/*
 * Nueva entrada en la tabla de puntuaciones 
 */
app.post("/newRecord", function(request, response) {
    var nombreNuevo = request.body.nombre;

    // Asignamos aleatoriamente una puntuación entre 1 y 1000
    var puntuacionNueva = Math.floor(Math.random() * 1000 + 1);
    
    // Creamos el nuevo objeto y lo insertamos en su posición correspondiente
    // de modo que la lista esté ordenada
    var nuevaEntrada = { nombre: nombreNuevo, puntos: puntuacionNueva };
    
    var i = records.length;
    while (i > 0 && nuevaEntrada.puntos > records[i - 1].puntos) {
        records[i] = records[i-1];
        i--;
    }
    records[i] = nuevaEntrada;
    
    response.status(201);
    response.end();
});

app.listen(3000, function(err) {
    if (err) {
        console.log("No se ha podido arrancar el servidor: " + err.message);
    } else {
        console.log("Servidor escuchando en puerto 3000");
    }
});