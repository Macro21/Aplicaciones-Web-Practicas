
"use strict";
/*
 * Manejador que se ejecuta cuando el DOM se haya cargado.
 */
$(() => {
    $("#pestañas").hide();
    // Cuando se pulse el boton de 'Conectar' se llama a la función iniciarSesion
    $("#botones").on("click", "button.btn.btn-success", iniciarSesion);
     // Cuando se pulse el botón de 'Registrarse', se llamará a la función nuevoUsuario
     $("#botones").on("click", "button.btn.btn-primary", nuevoUsuario);
});


function iniciarSesion(event) {
    let user = $("#email").prop("value");
    let password = $("#password").prop("value");

    let cadenaBase64 = btoa(user + ":" + password);
    $.ajax({
        method: "GET",
        url: "/login",
        beforeSend: (req)=> {
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
    header(user);
    $(".nav-tabs li a").css("color","orange");
};

function header(user){
    $("#nombreUsuario").text(user);
    $("#nombreUsuario").css("paddingRight","1rem");
    $("#nombreUsuario").css("color","orange");
    $("button.btn.btn-danger").on("click", desconectar);
};

function pestañaMisPartidas(){
    activarPestañaPulsada();
};

function crearPartida(){
    let nombrePartida = $("#cp").prop("value")
    $.ajax({
        method: "POST",
        url: "/newGame",
        contentType: "application/json",
        data: JSON.stringify({nombrePartida}),
        success: (data,status,jqXHR)=>{
            alert("Correcto!");
            //redirigir
        },
        error: (jqXHR, status, errorThrown)=>{
            alert("Se ha producido un error al crear partida: " + errorThrown);
        }
    });
    $.ajax({
        method: "GET",
        url: "/games",
        contentType: "application/json",
        data: JSON.stringify({id : 14}),
        success: (data,status,jqXHR)=>{
            alert(data);
        },
        error: (jqXHR,status,errorThrown)=>{
            alert("Se ha producido un error l: " + errorThrown);
        }
    });
};

function unirsePartida(){
    alert("unirse");
};

function pestañaAmiguetes(){
    activarPestañaPulsada();
    $("#pestañaAct").empty();
};

function pestañaFamiliar(){
    activarPestañaPulsada();
    $("#pestañaAct").empty();
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
    $.ajax({
        method: "GET",
        url: "/logout",
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
    let botonCrearUsuario = '<button type="submit" class="btn btn-default"><i class="fa fa-user-plus"></i> Crear Usuario</button>';
    $("#botones").empty();
    $("#botones").append(botonCrearUsuario);
    $("#subImagenPortada").attr("src","images/crearUsuario.png");
    $("#botones").on("click", "button.btn.btn-default", crearNuevoUsuario);
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

