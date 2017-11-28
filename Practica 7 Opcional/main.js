

const express = require("express");
const mysql = require("mysql");
const path = require("path");
const bodyParser = require("body-parser");
const config = require("./config");
const daoTasks = require("./dao_tasks");
const taskUtils = require("./task_utils");
const daoUsers = require("./dao_users");

const session = require("express-session");
const sessionMSQL = require("express-mysql-session");

const MySQLStore = sessionMSQL(session);

const app = express();

const ficherosEstaticos = path.join(__dirname,"public");

const pool = mysql.createPool({
    host: config.mysqlConfig.host,
    user: config.mysqlConfig.user,
    password: config.mysqlConfig.password,
    database: config.mysqlConfig.database
});

const sessionStore = new MySQLStore({
    host: config.mysqlConfig.host,
    user: config.mysqlConfig.user,
    password: config.mysqlConfig.password,
    database: config.mysqlConfig.database
});

const middlewareSession = session ({
    saveUninitialized: false,
    secret: "foobar34",
    resave: false,
    store: sessionStore    
});

const daoTask = new daoTasks.DAOTasks(pool);
const daoUser = new daoUsers.DAOUsers(pool);

app.use(express.static(ficherosEstaticos));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(middlewareSession);

function middlewareAcessControl(request, response, next){
    
    if (request.session.currentUser) {
        response.locals.userEmail = request.session.currentUser;
        next();
    }
    else {
        response.redirect("/login.html");
        response.end();
    }
};

app.get("/login.html", (request,response)=>{
    response.status(200);
    response.render("login" , {errorMsg: null});
    response.end();

});

app.post("/login",(request,response)=>{
    
    daoUser.isUserCorrect(request.body.mail, request.body.pass, (err,result)=>{
        if(err){
            response.status(500);
            console.log(err);
        }
        if(result){
            response.status(200);
            request.session['currentUser'] = request.body.mail;
            response.redirect("/tasks.html");
        }
        else{
            response.render("login" , {errorMsg: "Dirección de correo y/o contraseña no válidos"});
        }
        response.end();
    });
})
app.use(middlewareAcessControl);

app.get("/tasks.html",(request,response)=>{
    response.status(200);
    let taskList = [];
    let newTask = {
        id: -1,
        text: "",
        done: false,
        tags: []
    };  
    daoTask.getAllTasks(response.locals.userEmail, (err, tasks) => {
        if (err) {
            response.status(500);
            console.error(err);
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
        response.status(200);
        response.render("tasks",{userEmail: response.locals.userEmail, listaTareas: taskList});
        response.end();
    }); 
});

app.post("/addTask",(request,response)=>{
   
    let addNewTask = taskUtils.createTask(request.body.taskText);
    addNewTask.done = false;
    daoTask.insertTask(response.locals.userEmail, addNewTask, (err)=>{
        if (err) {
            response.status(500);
            console.error(err);
        }
        response.status(200);
        response.redirect("/tasks.html");
        response.end();
    });
});

app.post("/finish",(request,response)=>{ 
    daoTask.markTaskDone(request.body.taskId, (err)=>{
        if(err){
            response.status(500);
            console.log(err);
        }
        response.status(200);
        response.redirect("/tasks.html");
        response.end();
    });
});

app.get("/deleteCompleted",(request,response)=>{
    daoTask.deleteCompleted(response.locals.userEmail, (err)=>{
        if(err){
            response.status(500);
            console.log(err);
        }
        response.redirect("/tasks.html");
        response.end();
    });
});

app.get("/imagenUsuario",(request,response)=>{

    daoUser.getUserImageName(response.locals.userEmail, (err,result)=>{
        if(err){
            response.status(500);
            console.log(err);
        }
        response.status(200);
        if(result){
            response.sendFile(path.join(__dirname,"/profile_imgs/" + result));
        }
        else{
            response.sendFile(ficherosEstaticos + "/img/NoPerfil.png");
        }
        response.end();
    });
});

app.get("/logout", (request,response)=>{
    response.status(200);
    request.session.destroy();
    response.redirect("/login.html");
    response.end();
});

app.listen(config.port, function (err) {
    if (err) {
        console.log("No se ha podido iniciar el servidor.")
        console.log(err);
    } else {
        console.log(`Servidor escuchando en puerto ${config.port}.`);
    }
});