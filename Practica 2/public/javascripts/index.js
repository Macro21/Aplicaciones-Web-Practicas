
"use strict";
/*
 * Manejador que se ejecuta cuando el DOM se haya cargado.
 */
$(() => {
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
        url: "/protegido",
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
    $("#portada").remove();
    header(user);
    pestañas();
};

function header(user){
    let cabecera = 
    '<div class = "container">'+
        '<header class="page-header">'+
            '<div class="row" >'+
                '<div class = "col-md-7">' + 
                    '<img src="images/cabecera.png" class="pull-left" alt="imagen con nombre de la cabecera"  />' +
                '</div>'+ 
                '<div class = "col-md-3" >' + 
                    '<h2 id = "nombreUsuario"></h2>' +
                '</div>'+
                '<div class = "col-md-2" style="padding-top: 2rem">' + 
                    '<button type="submit" class="btn btn-danger"><i class="fa fa-sign-out"></i> Desconectar</button>'+
                '</div>'+
            '</div>'+
        '</header>'+
    '</div>';
    $("body").append(cabecera);
    $("#nombreUsuario").text(user);
    $("#nombreUsuario").css("paddingRight","1rem");
    $("button.btn.btn-danger").on("click", desconectar);
};

function pestañas(){
    let menuPestañas = 
    '<div class="row"><div class = "col-sm-12">'+ 
        '<ul class="nav nav-tabs">'+
            '<li class="active"><a href="#">Mis partidas</a></li>'+
            '<li><a href="#">Partida amiguetes</a></li>'+
            '<li><a href="#">Familiar</a></li>'+
        '</ul>'+
    '</div></div>';
    $(".container").append(menuPestañas);
};

function desconectar(event){
    console.log("desconectar");
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
}

