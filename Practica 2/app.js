
"use strict";

const express = require("express");
const path = require("path");
const config = require("./config");
const bodyParser = require("body-parser");
const mysql = require("mysql");
const passport = require("passport");
const passportHTTP = require("passport-http");
const underscore = require("underscore");

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

app.get("/games/:idUser",passport.authenticate('basic', {session: false}),(request,response)=>{
    
    daoUsuario.getGamesByUser(request.params.idUser, (err,result)=>{
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

app.get("/idUser/:user",passport.authenticate('basic', {session: false}),(request,response)=>{
    
    daoUsuario.getIdUser(request.params.user,(err,result)=>{
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
app.get("/dealCards/:gameId",passport.authenticate('basic', {session: false}),(request,response)=>{
    let baraja=["A_P","2_P","3_P","4_P","5_P","6_P","7_P","8_P","9_P","10_P","J_P","Q_P","K_P",
                "A_H","2_H","3_H","4_H","5_H","6_H","7_H","8_H","9_H","10_H","J_H","Q_H","K_H",
                "A_D","2_D","3_D","4_D","5_D","6_D","7_D","8_D","9_D","10_D","J_D","Q_D","K_D",
                "A_S","2_S","3_S","4_S","5_S","6_S","7_S","8_S","9_S","10_S","J_S","Q_S","K_S"];
    barajar(baraja);
    //Repartir cartas entre los jugadores

    //PARA QUE NO PETE
    let result= "OK";
    response.json({result});
});
function barajar(baraja){
    baraja= underscore.shuffle(baraja);
}