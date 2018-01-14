
"use strict";
/*
 * Manejador que se ejecuta cuando el DOM se haya cargado.
 */
$(() => {
    $("#pestañas").hide();
    $("#crearUsuario").hide();

});

function iniciarSesion() {

    let user = $("#email").prop("value");
    let password = $("#password").prop("value");

    let datosUsuario = {
        user: user,
        password: password
    };

    $.ajax({
        method: "POST",
        url: "/login",
        contentType: "application/json",
        data: JSON.stringify({datosUsuario}),
        success: function(data, state, jqXHR) {
            if(data.usuarioCorrecto){
                mostrarPanelPrincipal(user);
            }
            else{
                alert("Usuario o contraseña incorrectos!");
            }
        },
        error: function (jqXHR, status, errorThrown){
            alert("Este usuario no existe!");
        }      
    });
};

function mostrarPanelPrincipal(user){
    $("#portada").hide();
    cargarMenu();
    $("#pestañas").show();
    $(".pestañaPartidaEnCurso").hide();
    $("#nombreUsuario").text(user);
};

function nuevoUsuario(event) {
    $("#botones").hide();
    $("#crearUsuario").show();
    $("#subImagenPortada").attr("src","images/crearUsuario.png");
};

function crearNuevoUsuario(){
    let user = $("#email").prop("value");
    let password = $("#password").prop("value");
    
    let newUser = {
        user: user,
        password: password
    };

    $.ajax({
        method: "POST",
        url: "/newUser",
        contentType: "application/json",
        data: JSON.stringify({newUser}),
        success: (data, state, jqXHR)=>{
            alert("usuario creado correctamente");
            iniciarSesion();
        },
        error: (jqXHR, state, errorThrown) =>{
            alert("Se ha producido un error: " + errorThrown);
        }
    });
};

//Cargo las partidas de la base de datos y para cada una hago una pestaña pasandole el nombre y el id
function cargarMenu(){
    //Primero cargo la pestaña mis partidas
    let misPartidas= "<li class=\"active\"><a onClick=pestañaMisPartidas();>Mis partidas</a></li>";
    $("#menu").append(misPartidas);
    
    let user = $("#email").prop("value");
    let password = $("#password").prop("value");
    let cadenaBase64 = btoa(user + ":" + password);

    $.ajax({
        method: "GET",
        url: "/userGames",
        beforeSend: (req)=> {
            // Añadimos la cabecera 'Authorization' con los datos de autenticación.
            req.setRequestHeader("Authorization","Basic " + cadenaBase64);
        },
        success: (data,status,jqXHR)=>{     
            for(let i= 0; i< data.games.length;i++){
                crearPestaña(data.games[i].nombre,data.games[i].id);
            }
        },
        error: (jqXHR,status,errorThrown) =>{
            alert("Ha ocurrido un error" + errorThrown);
        }
    });  
};

function crearPestaña(nombrePartida, gameId){
    $("#menu").append(
        $("<li>").attr("data-game-id",gameId)
    );
    $("[data-game-id=\""+ gameId+"\"]").append(
        $("<a>").attr("onClick","verPartida("+gameId+");")
                .text(nombrePartida)
        );
};

function verPartida(gameId){ //Mostramos la pestaña con la partida de id=gameId
    activarPestañaPulsada();
    $("#pestañaPartidas").hide();
    let estaOcupado = $("#gameId").is(":empty");
    if(!estaOcupado){
        $(".pestañaPartidaEnCurso").show();
        $("#botonActualizar").attr("onClick","actualizarInformacionPartida("+gameId+");");
        actualizarInformacionPartida(gameId);
    }
};

function activarPestañaPulsada(){
    let lista = document.getElementsByClassName("nav-tabs");
    let elems = $(lista).children();
    for (let i = 0; i <elems.length; i++) {
        elems[i].addEventListener("click", function(){
            $(".nav-tabs li").removeClass("active");
            this.className += " active";
        });
    }
};

function actualizarInformacionPartida(gameId){
    let i;
    $("#partidaEnCursoId").text(gameId);

    let user = $("#email").prop("value");
    let password = $("#password").prop("value");
    let cadenaBase64 = btoa(user + ":" + password);

    let nombrePartida = $("[data-game-id=\""+ gameId+"\"]").text();

    $.ajax({ //Busco jugadores y actualizo la tabla
        method: "GET",
        url: "/gameState/" + gameId,

        beforeSend: (req)=> {
            // Añadimos la cabecera 'Authorization' con los datos de autenticación.
            req.setRequestHeader("Authorization","Basic " + cadenaBase64);
        },
        success: (data,status,jqXHR) =>{
            $("#tablaJugadores").empty();
            for(i=0; i<data.gameInfo.infoPartida.length; i++){
                let turno = false;
                let nombre = data.gameInfo.infoPartida[i].login;
                let nrCartas = data.gameInfo.nrCartas;
                let userId = data.gameInfo.infoPartida[i].id;
                if(data.gameInfo.idJugadorActual === userId){
                    turno = true;
                }
                crearFilaTablaJugadores(nombre,i+1,nrCartas,gameId,userId,turno);
            }
            if(i === 4){
                iniciarPartida(gameId);   
            }
        },
        error: (jqXHR, status, errorThrown)=>{
            alert("Se ha producido un error en la pestaña "+nombrePartida+ + errorThrown);
        },
    });
};

function crearFilaTablaJugadores(nombre,numero,nrCartas,gameId,userId, turno){
    let fila = $("<tr>");
    let color = "white";
    if(turno){
        color = "green";
    }
    fila.append($("<th>").attr("scope","row").text(numero).css("background-color",color));
    fila.append($("<td>").attr("id",userId).text(nombre).css("background-color",color));
    if(nrCartas > 0)
        fila.append($("<td>").attr("id","nrCartasJugador"+userId).text(nrCartas).css("background-color",color));
    else
        fila.append($("<td>").attr("id","nrCartasJugador"+userId).text("-"));
   $("#tablaJugadores").append(fila);

};

function pestañaMisPartidas(){
    activarPestañaPulsada();
    $(".pestañaPartidaEnCurso").hide();
    $("#pestañaPartidas").show();
};

function crearPartida(){
    let nombrePartida = $("#cp").prop("value");

    let user = $("#email").prop("value");
    let password = $("#password").prop("value");

    let cadenaBase64 = btoa(user + ":" + password);

    $.ajax({
        method: "POST",
        url: "/newGame",
        contentType: "application/json",
        data: JSON.stringify({nombrePartida}),
        beforeSend: (req)=> {
            // Añadimos la cabecera 'Authorization' con los datos de autenticación.
            req.setRequestHeader("Authorization","Basic " + cadenaBase64);
        },
        success: (data,status,jqXHR)=>{
            $("#gameId").text(data.gameId);
            crearPestaña(nombrePartida,data.gameId);
        },
        error: (jqXHR, status, errorThrown)=>{
            alert("Se ha producido un error al crear partida: " + errorThrown);
        }
    });
};

function unirsePartida(){

    let user = $("#email").prop("value");
    let password = $("#password").prop("value");
    let cadenaBase64 = btoa(user + ":" + password);

    let gameId = $("#up").prop("value");
    
    let nombrePartida;

    $.ajax({//Incorporación a una partida. 
        method: "POST",
        url: "/joinGame",
        contentType: "application/json",
        data: JSON.stringify({gameId: gameId}),
        beforeSend: (req)=> {
            // Añadimos la cabecera 'Authorization' con los datos de autenticación.
            req.setRequestHeader("Authorization","Basic " + cadenaBase64);
        },
        success: (data, status, jqXHR) =>{
            nombrePartida = data.nombrePartida;
            $("#gameId").text(gameId);
            crearPestaña(nombrePartida,gameId);
        },
        error: (jqXHR, status, errorThrown)=>{
            alert("Error en entrar a la partida " + nombrePartida + " " + errorThrown);
        }
    });
};

function iniciarPartida(gameId){
    $("#esperandoJugadores").hide();
    mostrarCartas(gameId);
    $('')
};

function mostrarCartas(gameId){
    
    let user = $("#email").prop("value");
    let password = $("#password").prop("value");
    let cadenaBase64 = btoa(user + ":" + password);

    $.ajax({
        method: "GET",
        url: "/gameState/" + gameId,
        beforeSend: (req)=> {
            // Añadimos la cabecera 'Authorization' con los datos de autenticación.
            req.setRequestHeader("Authorization","Basic " + cadenaBase64);
        },
        success: (data,status,jqXHR) =>{
            mostrarMano(data.gameInfo.cartas);
        },
        error: (jqXHR, status, errorThrown)=>{
            alert("Se ha producido un error al repartir cartas " + errorThrown);
        },
    });
};

function mostrarMano(cartas){
    $("#cartas").empty();//Vaciamos el tablero para no añadir dos veces las mismas cartas
    //Añadimos las cartas
    for(let carta of cartas){
        let imagen = $("<img>");
        imagen.attr("src","images/"+ carta + ".png");
        imagen.css("padding","1rem");
        $("#cartas").prepend(imagen);
    }
    $("#cartas").css("text-align","center");

};


function desconectar(){
    let user = $("#email").prop("value");
    let password = $("#password").prop("value");
    let cadenaBase64 = btoa(user + ":" + password);
    $.ajax({
        method: "GET",
        url: "/logout",
        beforeSend: (req)=> {
            // Añadimos la cabecera 'Authorization' con los datos de autenticación.
            req.setRequestHeader("Authorization","Basic " + cadenaBase64);
        },
        success: (data,status,jqXHR)=>{
            $("#portada").show();~
            $("#menu").empty();
            $("#pestañas").hide();
            
        },
        error: (jqXHR,status,errorThrown) =>{
            alert("Ha ocurrido un error" + errorThrown);
        }
    });
};