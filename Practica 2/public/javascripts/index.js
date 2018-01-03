
"use strict";
/*
 * Manejador que se ejecuta cuando el DOM se haya cargado.
 */
$(() => {
    $("#pestañas").hide();
    $("#crearUsuario").hide();
});


function iniciarSesion(event) {
    let user = $("#email").prop("value");
    let password = $("#password").prop("value");

    let cadenaBase64 = btoa(user + ":" + password);
    $.ajax({
        method: "GET",
        url: "/login",
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
    $("#nombreUsuario").text(user);
};

function pestañaMisPartidas(){
    activarPestañaPulsada();
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
            alert("Correcto!");
            //redirigir
        },
        error: (jqXHR, status, errorThrown)=>{
            alert("Se ha producido un error al crear partida: " + errorThrown);
        }
    });

  /*  let user = $("#email").prop("value");
    let password = $("#password").prop("value");

    $.ajax({//Incorporación a una partida. 
        method: "POST",
        url: "/joinGame",
        contentType: "application/json",
        data: JSON.stringify({gameId: 9}),
        beforeSend: (req)=> {
            // Añadimos la cabecera 'Authorization' con los datos de autenticación.
            req.setRequestHeader("Authorization","Basic " + cadenaBase64);
        },
        success: (data, status, jqXHR) =>{
            alert("ENTRADA EN PARTIDA CORRECTO");
        },
        error: (jqXHR, status, errorThrown)=>{
            alert("Error en entrar a la partida" + errorThrown);
        }
    });*/

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
    alert("unirse");
};

function pestañaAmiguetes(){
    activarPestañaPulsada();
    $("#pestañaPartidas").hide();
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

function desconectar(event){
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

function crearNuevoUsuario(event){
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
        },
        error: (jqXHR, state, errorThrown) =>{
            alert("Se ha producido un error: " + errorThrown);
        }
    });
};

