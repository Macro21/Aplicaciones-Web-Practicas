
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

function mostrarPanelPrincipal(user){
    $("#portada").hide();
    $("#pestañas").show();
    $("#pestañaAmiguetes").hide();
    $("#nombreUsuario").text(user);
};

function pestañaMisPartidas(){
    activarPestañaPulsada();
    $("#pestañaAmiguetes").hide();
    //$("#pestañaFamilia").hide();
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
        },
        error: (jqXHR, status, errorThrown)=>{
            alert("Se ha producido un error al crear partida: " + errorThrown);
        }
    });

  /*  $.ajax({//Acceso a las partidas en las que participa un usuario.
        method: "GET",
        url: "/gameState/" + 1,
        success: (data,status,jqXHR)=>{
            alert(data);
        },
        error: (jqXHR,status,errorThrown)=>{
            alert("Se ha producido un error l: " + errorThrown);
        }
    });*/

    /*$.ajax({//Estado de una partida.
        method: "GET",
        url: "/games/" + 14,
        success: (data,status,jqXHR)=>{
            alert(data);
        },
        error: (jqXHR,status,errorThrown)=>{
            alert("Se ha producido un error l: " + errorThrown);
        }
    });*/
};

function unirsePartida(){

    let user = $("#email").prop("value");
    let password = $("#password").prop("value");
    let cadenaBase64 = btoa(user + ":" + password);
    let gameId = $("#up").prop("value"); 

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
        },
        error: (jqXHR, status, errorThrown)=>{
            alert("Error en entrar a la partida" + errorThrown);
        }
    });
};

function pestañaAmiguetes(){
    activarPestañaPulsada();
    $("#pestañaPartidas").hide();
    let estaOcupado = $("#gameId").is(":empty");
    if(!estaOcupado){
        $("#pestañaAmiguetes").show();
        actualizarInformacionPartida();
    }

};

function crearFilaTablaJugadores(nombre,numero,cartas){
    let fila = $("<tr>");
    fila.append($("<th>").attr("scope","row").text(numero));
    fila.append($("<td>").attr("id","idJugador").text(nombre));
    fila.append($("<td>").attr("id","nrCartasJugador1").text(cartas));
    $("#tablaJugadores").append(fila);
};

function actualizarInformacionPartida(){
    let i;
    let gameId = $("#gameId").text();
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
            $("#tablaJugadores").empty();
            for(i=0; i<data.length; i++){
                crearFilaTablaJugadores(data[i].login,i+1,"-");
            }
            iniciarPartida();
          /*  $.ajax({
                method: "GET",
                url: "/gameState/"+ gameId,
                beforeSend: (req)=> {
                    // Añadimos la cabecera 'Authorization' con los datos de autenticación.
                    req.setRequestHeader("Authorization","Basic " + cadenaBase64);
                },
                success: (data,status,jqXHR) =>{
                    if(data.length == 4){
                        iniciarPartida();
                    }
                },
                error: (jqXHR, status, errorThrown)=>{
                    alert("Se ha producido un error PA " + errorThrown);
                },
            });*/
        },
        error: (jqXHR, status, errorThrown)=>{
            alert("Se ha producido un error en la pestaña amiguetes " + errorThrown);
        },
        
    });
};


function iniciarPartida(){
    $("#esperandoJugadores").hide();
    repartirCartas();


};

function repartirCartas(){+0
    //¿Lo hace el servidor o el cliente?
    

};

function pestañaFamiliar(){
    activarPestañaPulsada();
    $("#pestañaPartidas").hide();
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

