
/* global __dirname */

var express = require("express");
var path = require("path");
var session = require("express-session");
var bodyParser = require("body-parser");

var app = express();

var staticPath = path.join(__dirname, "public");
app.use(express.static(staticPath));

var viewsPath = path.join(__dirname, "views");
app.set("view engine", "ejs");
app.set("views", viewsPath);

app.use(bodyParser.urlencoded({ extended: false }));

app.use(session({
    secret: 'clave de sesion',
    resave: false,
    saveUninitialized: true
}));

app.get("/", function(request, response) {
    response.redirect("/index.html");
});
let tarea = {
    id: -1,
    texto: "",
    finalizada: false
};
tarea.id = 1;
tarea.texto = "Hacer la compra";
let datos = [tarea,{ id: 2, texto: 'Poner la colada', finalizada: false } ,{ id: 3, texto: 'Estudiar AW', finalizada: true } ,{ id: 3, texto: 'Reentregar la practica de AW', finalizada: false } ];

function contador(request, response, next){
    let cont = 0;
    if(request.session.datos === undefined){  
        request.session.datos = datos;
    }
    for(let tarea of request.session.datos){
        if(!tarea.finalizada){
            cont++;
        }
    }
    response.locals.numPendientes = cont;
    next();
};
app.use(contador);
/*
 * Manejador que muestra la página con la lista de tareas
 */
app.get("/index.html", function(request, response) {
    response.render("_tareas",{datos: request.session.datos, numTareas: response.locals.numPendientes});
});

/*
 * Manejador al que se llama cuando se añade una tarea
 */
app.post("/anyadirTarea", function(request, response) {    
    let texto = request.body.nuevaTarea;
    let id = request.session.datos[datos.length -1] + 1;
    tarea.id = id;
    tarea.texto = texto;
    request.session.datos.push(tarea);  
    response.redirect("/index.html");
});

/*
 * Manejador que marca una determinada tarea como finalizada
 */
app.get("/finalizarTarea", function(request, response) {
    let id = request.query.nuevaTarea;

    for(let t of request.session.datos){
        if(t.id == id)
            t.finalizada = true;
    }       
    response.redirect("/index.html");
});

app.listen(3000, function(err) {
    if (err) {
        console.log("No se ha podido arrancar el servidor: " + err.message);
    } else {
        console.log("Servidor escuchando en puerto 3000");
    }
});