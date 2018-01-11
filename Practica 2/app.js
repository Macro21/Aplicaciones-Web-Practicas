
"use strict";

const express = require("express");
const path = require("path");
const config = require("./config");
const bodyParser = require("body-parser");
const mysql = require("mysql");
const passport = require("passport");
const passportHTTP = require("passport-http");

const app = express();

const daoUsuarios = require("./dao/dao_usuarios");
const daoPartidas = require("./dao/dao_partidas");

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

const daoUsuario = new daoUsuarios.DAOUsuarios(pool);
const daoPartida = new daoPartidas.DAOPartidas(pool);


passport.use(new passportHTTP.BasicStrategy({ realm: 'Autenticacion requerida' },
    function (user, pass, callback) {
        daoUsuario.isUserCorrect(user,(err,userInfo)=>{
            if(err){
                callback(err);
                console.log(err);
            }
            if(userInfo.password === pass && user === userInfo.login){//comprueba que el usuario exista y que tenga esa contraseña
                callback(null, {id: userInfo.id });
            }
            else{
                callback(null, false);
            }
        });
    }
));

app.get("/protegido",passport.authenticate('basic', {session: false}), (request, response)=> {
    response.json({permitido: true});
});

app.post("/login", (request, response)=>{
    let password = request.body.datosUsuario.password;
    let name = request.body.datosUsuario.user;
    daoUsuario.isUserCorrect(name,(err,userInfo)=>{
        if(err){
            response.status(500);//internal server error
            response.end(err.message);
            console.log(err);
        }
        if(userInfo){// comprueba que el usuario exista y que tenga esa contraseña
            
            if(userInfo.password === password){
                response.status(200);
                response.json({usuarioCorrecto:true});
                request.user = name;
                request.pass = passport;
            }
            else{
                response.json({usuarioCorrecto: false});
            }
        }
        else{
            response.status(401);
            response.json({usuarioCorrecto: false});
        }
    });
});

app.post("/newUser", (request, response) => {
    let login = request.body.newUser.user;
    let pass = request.body.newUser.password;

    daoUsuario.existsUser(login, (err,exist)=>{
        if(err){
            response.status(500);
            console.log(err);
        }
        if(exist){
            response.status(400);//bad request
            response.json({});
        }
        else{
            daoUsuario.insertUser(login,pass, (err)=>{
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

app.get("/games/:id",passport.authenticate('basic', {session: false}),(request,response)=>{
    
    daoUsuario.getGamesByUser(request.params.id, (err,result)=>{
        if(err){
            response.status(500);
        }
        response.status(200);
        response.json({result});
    });
});

/**
 * Estado de una partida. El servidor recibe el identi1cador de una partida y devuelve los nombres
    de los jugadores actualmente inscritos en la misma, o el código 404 en caso de no existir una
    partida con el identi1cador dado.
 */
app.get("/gameState/:gameId",passport.authenticate('basic', {session: false}),(request,response)=>{
    
    daoPartida.getPlayersInGame(request.params.gameId,(err,result)=>{
        if(err){
            response.status(500);
            console.log(err);
        }
        if(result.length === 0){
            response.status(404);//Not found
        }
        else{
            response.status(200);
            response.json(result);
        }
    });
});

app.post("/newGame", passport.authenticate('basic', {session: false}), (request,response)=>{
    let nombrePartida = request.body.nombrePartida;
    daoPartida.insertGame(nombrePartida,(err,gameId)=>{
        if(err){
            console.log(err);
            response.status(500);
        }
        daoUsuario.insertPlayerInGame(request.user.id, gameId, (err)=>{
            if(err){
                console.log(err);
                response.status(500);
            }
            response.status(201);
            response.json({gameId: gameId});
        });
    });
});

//Incorporación a una partida.
app.post("/joinGame",passport.authenticate('basic', {session: false}),(request,response)=>{

    daoPartida.getGame(request.body.gameId,(err,result)=>{
        if(err){
            console.log(err);
            response.status(500);
        }
        if(result.length === 0){//si no existe la partida
            response.status(404);
        }
        else{
            daoPartida.getPlayersInGame(request.body.gameId, (err,resultPlayersInGame)=>{
                if(err){
                    response.status(500);
                    console.log(err);
                }
                if(resultPlayersInGame.length === 4){
                    response.status(400);
                }
                else{
                    //si existe la partida y no se ha completado
                    daoUsuario.insertPlayerInGame(request.user.id,request.body.gameId,(err)=>{
                        if(err){
                            response.status(500);
                            console.log(err);
                        }
                        response.status(200);
                        response.json({});
                    });
                }
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

/* PRUEBAS RICARDO */
app.get("/dataGame/:gameId",passport.authenticate('basic', {session: false}),(request,response)=>{
    
    daoPartida.getGame(request.params.gameId,(err,result)=>{
        if(err){
            response.status(500);
            console.log(err);
        }
        if(result.length === 0){
            response.status(404);//Not found
        }
        else{
            response.status(200);
            response.json({result});
        }
    });
});