
"use strict";

const path = require("path");
const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const config = require("./config");
const session = require("express-session");
const sessionMSQL = require("express-mysql-session");
const daoUsers = require("./dao/dao_users");
const daoFriends = require("./dao/dao_friends");
const daoQuestions = require("./dao/dao_questions");
const multer = require("multer");
const multerFactory = multer({ dest: path.join(__dirname,"uploads") });
const expressValidator = require("express-validator");

const app = express();
const ficherosEstaticos = path.join(__dirname,"public");

const middlewareUser = require("./module/middlewares");
const userFunction = require("./module/user");
const friendFunction = require("./module/friend");
const questionFunction = require("./module/question");


app.use(express.static(ficherosEstaticos));
app.use(bodyParser.urlencoded({ extended: false }));
app.set("view engine", "ejs");
app.set("views",path.join(__dirname, "views"));

const pool = mysql.createPool({
    host: config.mysqlConfig.host,
    user: config.mysqlConfig.user,
    password: config.mysqlConfig.password,
    database: config.mysqlConfig.database
});

const daoUser = new daoUsers.DAOUsers(pool);
const daoFriend = new daoFriends.DAOFriends(pool);
const daoQuestion = new daoQuestions.DAOQuestions(pool);
const MySQLStore = sessionMSQL(session);

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

app.use(middlewareSession);
app.use(expressValidator());

//Permite al fichero user.js acceder al dao
app.use(function (request,response,next){
    if(daoUser || daoFriend || daoQuestion){
        request.daoUser = daoUser;
        request.daoFriend = daoFriend;
        request.daoQuestion = daoQuestion;
        next();
    }
    else{
        response.status(500);
        response.end("Error, al conectar con la base de datos!");
        console.log("Error, al conectar con la base de datos!");
    }
});

//inicializa el flashMsg
app.use(middlewareUser.defaultFlash);

//permite cambiar el mensaje y ademas, despues de hacer un get lo borra
app.use(middlewareUser.flash);

app.use(middlewareUser.startedSession);

//muestra la vista del login.
app.get("/login", userFunction.getLogin);

//Comprueba que los datos introducidos, email y contraseña, existen en la base de datos y establece el currentUser si existe
app.post("/login", userFunction.postLogin);

//Muestra la pantalla de registro
app.get("/nuevo_usuario",userFunction.getNewUser);

//Introduce nuevos usuarios en la base de datos, comprobando que no haya campos vacios o usuarios repetidos
app.post("/nuevo_usuario",multerFactory.single("image"),userFunction.postNewUser);

//Permite el acceso al perfil y demas cosas de la app solo al usuario que ya ha iniciado sesion
app.use(middlewareUser.accessControl);

//Muestra la pantalla del perfil principal
app.get("/perfil_principal", userFunction.getProfile);

//Envia la imagen de perfil
app.get("/image/:id", (request,response)=>{
    let pathImg = path.join(__dirname,"uploads", request.params.id);
        response.sendFile(pathImg);
});

//Muestra el formulario
app.get("/perfil_modificar", userFunction.getModifyUser);

////Añade una foto a la galeria de fotos de un usuario
app.post("/upload_image",multerFactory.single("image"), userFunction.postAddPhoto);

//Envia los datos a la base de datos para que se cambien
app.post("/perfil_modificar",multerFactory.single("image"),userFunction.postModifyUser);

//Muestra el perfil de los amigos
app.get("/perfil_amigos",friendFunction.getFriendsProfile);

//Busca y muestra los amigos que contienen el nombre intorducido
app.get("/friends_by_name", friendFunction.searchFriendsByName);

//Envia una solicitud de amistad
app.post("/friend_request", friendFunction.friendRequest);

//Acepta peticiones de amistad actualizando la base de datos
app.post("/aceptRequest", friendFunction.aceptRequest);

//Rechaza peticiones de amistad actualizando la base de datos
app.post("/refuseRequest", friendFunction.refuseRequest);

//Muestra la informacion al pinchar en un amigo
app.get("/friendProfile", friendFunction.friendProfile)

//Muestra la pantalla con una lista de preguntas seleccionadas aleatoriamente
app.get("/perfil_preguntas", questionFunction.getQuestions);

//Muestra la pantalla con la opcion de crear una pregunta y meterle las respuestras en un textarea
app.get("/addQuestion", questionFunction.getAddQuestion);

//¿Igual que el de arriba?
//app.get("/getFormAnswer", questionFunction.getFormAnswer);

//Añade una pregunta a la base de datos
app.post("/addQuestion", questionFunction.addQuestion);

//Muestra las respuestas a una pregunta
app.get("/showAnswers", questionFunction.showAnswers);

//Muestra los detalles de una pregunta, es decir, una vez hayas elegido la pregunta te sale la opcion de adivinar y la de contestar
app.get("/showQuestion", questionFunction.showQuestion);

//Añade una respuesta a una pregunta en la base de datos
app.post("/responseQuestion", questionFunction.responseQuestion);

//Ofrece la posibilidad de adivinar una respuesta, basicamente es el boton de adivinar
app.get("/guessAnswer", questionFunction.guessAnswer);

//Guarda en la base de datos si has acertado o fallado la pregunta
app.post("/checkAnswer", questionFunction.checkAnswer);

//Te lleva al login, y borra los archivos de la sesion
app.get("/logout",userFunction.logout);

app.listen(config.port, (err) => {
    if (err) {
        console.error("No se pudo inicializar el servidor: "+ err.message);
    } 
    else {
        console.log("Servidor arrancado en el puerto 3000");
    }
});