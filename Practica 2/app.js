
"use strict";

const express = require("express");
const path = require("path");
const config = require("./config");
const bodyParser = require("body-parser");
const mysql = require("mysql");
const passport = require("passport");
const passportHTTP = require("passport-http");

const app = express();

const daoUsers = require("./dao/dao_users");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(passport.initialize());

const pool = mysql.createPool({
    host: config.mysqlConfig.host,
    user: config.mysqlConfig.user,
    password: config.mysqlConfig.password,
    database: config.mysqlConfig.database
});

const daoUser = new daoUsers.DAOUsers(pool);

function funCallback(user, pass, callback) {

    daoUser.isUserCorrect(user,pass,(err,correctPassword)=>{
        if(err){
           // response.status(500);//internal server error
           // response.end(err.message);
            console.log(err);
        }
        if(correctPassword){//en realidad comprueba que el usuario exista y que tenga esa contraseña
            callback(null, { userId: correctPassword.id });
        }
        else{
            callback(null, false);
        }
    });
}

var miEstrategia =new passportHTTP.BasicStrategy({ realm: 'Autenticacion requerida' }, funCallback);
passport.use(miEstrategia);

app.get("/protegido",passport.authenticate('basic', {session: false}), (request, response)=> {
    response.json({permitido: true});
});

app.post("/newUser", (request, response) => {
    let login = request.body.newUser.user;
    let pass = request.body.newUser.password;

    daoUser.existsUser(login, (err,exist)=>{
        if(err){
            response.status(500);
            console.log(err);
        }
        if(exist){
            response.status(400);//bad request
            response.json({});
        }
        else{
            daoUser.insertUser(login,pass, (err)=>{
                if(err){
                    response.status(500);//internal server error
                    response.json({});
                }
                response.status(201);//created
                response.json({});
            });
        }
    });
});

app.get("/logout",(request,response)=>{
    request.logout();
    response.json({});
});


app.listen(config.port, function(err) {
    if (err) {
        console.log("No se ha podido iniciar el servidor.")
        console.log(err);
    } else {
        console.log(`Servidor escuchando en puerto ${config.port}.`);
    }
});