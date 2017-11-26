

const express = require("express");
const mysql = require("mysql");
const path = require("path");
const bodyParser = require("body-parser");
const config = require("./config");
const daoTasks = require("./dao_tasks");
const taskUtils = require("./task_utils");

const app = express();

const ficherosEstaticos = path.join(__dirname,"public");

const pool = mysql.createPool({
    host: config.mysqlConfig.host,
    user: config.mysqlConfig.user,
    password: config.mysqlConfig.password,
    database: config.mysqlConfig.database
});

const daoTask = new daoTasks.DAOTasks(pool);

app.use(express.static(ficherosEstaticos));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/tasks.html",(request,response)=>{
    response.status(200);
    let taskList = [];
    let newTask = {
        id: -1,
        text: "",
        done: false,
        tags: []
    };
    daoTask.getAllTasks("usuario@ucm.es", (err, tasks) => {
        if (err) {
            console.error(err);
            response.end();
        } 
        else {
            for(t of tasks){
                newTask.id = t.id;
                newTask.text = t.text;
                newTask.done = t.done;
                newTask.tags = t.tags;
                taskList.push(newTask);
                newTask = new Object();
                newTask.tags = [];
            }
        }
        response.render("tasks",{email: "usuario@ucm.es", listaTareas: taskList});
        response.end();
    }); 
});

app.post("/addTask",(request,response)=>{
   
    let addNewTask = taskUtils.createTask(request.body.taskText);
    addNewTask.done = false;
    daoTask.insertTask("usuario@ucm.es", addNewTask, (err)=>{
        if (err) {
            console.error(err);
        }
        response.redirect("/tasks.html");
        response.end();
    });
});

app.post("/finish",(request,response)=>{
    daoTask.markTaskDone(request.body.taskId, (err)=>{
        if(err){
            console.log(err);
        }
        response.redirect("/tasks.html");
        response.end();
    });
});

app.get("/deleteCompleted",(request,response)=>{
    daoTask.deleteCompleted("usuario@ucm.es", (err)=>{
        if(err){
            console.log(err);
        }
        response.redirect("/tasks.html");
        response.end();
    });
});

app.listen(config.port, function (err) {
    if (err) {
        console.log("No se ha podido iniciar el servidor.")
        console.log(err);
    } else {
        console.log(`Servidor escuchando en puerto ${config.port}.`);
    }
});



