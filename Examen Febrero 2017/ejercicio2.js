
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

app.get("/", function(request, response) {
    response.redirect("/index.html");
});


/*
 * Al teclear la URL /index.html
 */
app.get("/index.html", function(request, response) {
    response.render("_calculoE", {error: null});
});

/*
 * Al teclear la URL /calcular.html
 */

function factorial(n){
    let res = 1;
    for(let i = 1; i <= n; i++){
        res = res * i;
    }
    return res;
};

app.get("/calcular.html", function(request, response) {
    let i = request.query.n;
    let result = 1;
    if(isNaN(i)){
        response.render("_calculoE", {error: "¡Se ha producido un error!"});
    }
    else{
        for(let k = 1; k <= i; k++){
            result += 1/factorial(k);
        }
        response.render("_result", {resultado: result});
    }
});


app.listen(3000, function(err) {
    if (err) {
        console.log("No se ha podido arrancar el servidor: " + err.message);
    } else {
        console.log("Servidor escuchando en puerto 3000");
    }
});