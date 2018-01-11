
"use strict";
/*
 * Manejador que se ejecuta cuando el DOM se haya cargado.
 */
$(() => {
    $("#pestañas").hide();
    $("#crearUsuario").hide();

});

/*function iniciarSesion() {

    let user = $("#email").prop("value");
    let password = $("#password").prop("value");
    let cadenaBase64 = btoa(user + ":" + password);

    $.ajax({
        method: "GET",
        url: "/protegido",
        beforeSend: (req)=> {//quitar no hace falta aqui
            // Añadimos la cabecera 'Authorization' con los datos de autenticación.
            req.setRequestHeader("Authorization","Basic " + cadenaBase64);
        },
        success: function(data, state, jqXHR) {
            if (data.permitido) {
                console.log("¡Acceso permitido!");
                //redirigir a inicio del juego
                mostrarPanelPrincipal(user);
            }   
        }      
    });
};
*/
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
    $("#pestañas").show();
    $(".pestañaPartidaEnCurso").hide();
    $("#nombreUsuario").text(user);
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
            // alert("Correcto!");
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
    
    $.ajax({ //Busco nombre y lo guardo
        method: "GET",
        url: "/dataGame/" + gameId,
        beforeSend: (req)=> {
            // Añadimos la cabecera 'Authorization' con los datos de autenticación.
            req.setRequestHeader("Authorization","Basic " + cadenaBase64);
        },
        success: (data,status,jqXHR) =>{
            nombrePartida= data.result[0].nombre;
        },
        error: (jqXHR, status, errorThrown)=>{
            alert("Se ha producido un error" + errorThrown);
        },
        
    });
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
            alert("ENTRADA EN PARTIDA CORRECTO");
            $("#gameId").text(gameId);
            crearPestaña(nombrePartida,gameId);
        },
        error: (jqXHR, status, errorThrown)=>{
            alert("Error en entrar a la partida" + errorThrown);
        }
    });
};

function crearFilaTablaJugadores(nombre,numero,cartas){
    let fila = $("<tr>");
    fila.append($("<th>").attr("scope","row").text(numero));
    fila.append($("<td>").attr("id","idJugador").text(nombre));
    fila.append($("<td>").attr("id","nrCartasJugador1").text(cartas));
    $("#tablaJugadores").append(fila);
};

function iniciarPartida(){
    $("#esperandoJugadores").hide();
    repartirCartas();


};

function repartirCartas(){+0
    //¿Lo hace el servidor o el cliente?
    

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
            $("#portada").show();
            $("#pestañas").hide();
            //
        },
        error: (jqXHR,status,errorThrown) =>{
            alert("Ha ocurrido un error" + errorThrown);
        }
    });
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

function actualizarInformacionPartida(gameId){
    let i;
    $("#partidaEnCursoId").text(gameId);

    let user = $("#email").prop("value");
    let password = $("#password").prop("value");

    let cadenaBase64 = btoa(user + ":" + password);

    $.ajax({ //Busco nombre y lo introduzco
        method: "GET",
        url: "/dataGame/" + gameId,
        beforeSend: (req)=> {
            // Añadimos la cabecera 'Authorization' con los datos de autenticación.
            req.setRequestHeader("Authorization","Basic " + cadenaBase64);
        },
        success: (data,status,jqXHR) =>{
            $("#nombrePartida").text(data.result[0].nombre);
        },
        error: (jqXHR, status, errorThrown)=>{
            alert("Se ha producido un error" + errorThrown);
        },
        
    });

    $.ajax({ //Busco jugadores y relleno la tabla
        method: "GET",
        url: "/gameState/" + gameId,

        beforeSend: (req)=> {
            // Añadimos la cabecera 'Authorization' con los datos de autenticación.
            req.setRequestHeader("Authorization","Basic " + cadenaBase64);
        },
        success: (data,status,jqXHR) =>{
            $("#tablaJugadores").empty();
            console.log(data);
            for(i=0; i<data.length; i++){
                crearFilaTablaJugadores(data[i].login,i+1,"-");
            }
            //If num jugadores == 4 entonces iniciar partida
            //iniciarPartida();
        },
        error: (jqXHR, status, errorThrown)=>{
            alert("Se ha producido un error en la pestaña amiguetes " + errorThrown);
        },
    });
};
