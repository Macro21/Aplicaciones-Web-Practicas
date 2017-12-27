const express = require("express");
const path = require("path");
const config = require("./config");
const bodyParser = require("body-parser");

const app = express();

let idCounter = 5;

let tasks = [
    {
        id: 1,
        text: "Preparar práctica PDAP",
    },
    {
        id: 2,
        text: "Mirar fechas congreso",
    },
    {
        id: 3,
        text: "Ir al supermercado",
    },
    {
        id: 4,
        text: "Mudanza",
    }
];


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));


app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());

app.get("/", (request, response) => {
    response.redirect("/tasks.html");
});

app.get("/tasks", (request, response) => {//Implementado
    response.status(200);
    response.json(tasks);
});

app.post("/tasks", (request, response) => {
    let texto = request.body.text;
    let newTask = {
        id: idCounter++,
        text: texto,
    };
    tasks.push(newTask);
    response.status(200);
    response.json(newTask);
});

function taskDelete(id){
    let i = 0;
    let enc = false;
    while(i < tasks.length && enc === false){
        if(Number(tasks[i].id) === Number(id)){
            tasks.splice(i,1);
            enc = true;
        }
        i++;
    }
};

app.delete("/tasks/:id", (request, response) => {
    // Implementar
    let id = request.params.id;
    if(!isNaN(id)){
        taskDelete(id);
        response.status(200);
    }
    else{
        response.status(400);
    }
    response.end();
});

app.listen(config.port, function(err) {
    if (err) {
        console.log("No se ha podido iniciar el servidor.")
        console.log(err);
    } else {
        console.log(`Servidor escuchando en puerto ${config.port}.`);
    }
});