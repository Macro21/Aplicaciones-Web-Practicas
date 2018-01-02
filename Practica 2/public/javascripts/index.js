
"use strict";
/*
 * Manejador que se ejecuta cuando el DOM se haya cargado.
 */
$(() => {
    mostrarIniciarSesion();
});

function mostrarIniciarSesion(){
    let inicioSesion = 
    '<div class="text-center">'+
        '<img id = "subImagenPortada" src="images/iniciarSesion.png" alt="foto iniciar sesion o registro">'+
        '<div class="centrar">'+
            '<div class="input-group">'+
                '<div class="input-group-addon" style="width: 2.6rem"><i class="fa fa-at"></i></div>'+
                '<input type="text" name="email" class="form-control" id="email" placeholder="Introduce tu correo" required autofocus>'+
            '</div>'+
            '<div class="input-group" >'+
                '<div class="input-group-addon" style="width: 2.6rem"><i class="fa fa-key"></i></div>'+
                '<input type="password" name="password" class="form-control" id="password" placeholder="Introduce la contraseña" required>'+
            '</div>'+
            '<div id = "botones" style="padding-top: 1rem" >'+
                '<button type="submit" class="btn btn-success"><i class="fa fa-sign-in"></i> Conectar</button>'+
                '<button type="submit" class="btn btn-primary"><i class="fa fa-user-plus"></i> Registrarse</button>'+
            '</div>'+
        '</div>  '+
    '</div>';
    $(".container").append(inicioSesion);
    $(".container").css("paddingTop","3rem");
    // Cuando se pulse el boton de 'Conectar' se llama a la función iniciarSesion
    $("#botones").on("click", "button.btn.btn-success", iniciarSesion);
     // Cuando se pulse el botón de 'Registrarse', se llamará a la función nuevoUsuario
     $("#botones").on("click", "button.btn.btn-primary", nuevoUsuario);
}

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
    $(".container").remove();
    $("body").append(cabecera);
    $(".container").css("paddingTop","3rem");
    $("#nombreUsuario").text(user);
    $("#nombreUsuario").css("paddingRight","1rem");
    $("#nombreUsuario").css("color","orange");
    $("button.btn.btn-danger").on("click", desconectar);
};

function pestañas(){
    let menuPestañas = 
    '<div class="row"><div class = "col-sm-12">'+ 
        '<ul class="nav nav-tabs">'+
            '<li class="active"><a onClick="pestañaMisPartidas();">Mis partidas</a></li>'+
            '<li ><a onClick="pestañaAmiguetes();">Partida amiguetes</a></li>'+
            '<li ><a onClick="pestañaFamiliar();">Familiar</a></li>'+
        '</ul>'+
    '</div></div>';
    $(".container").append(menuPestañas);
    $(".nav-tabs li a").css("color","orange");
    let pestañaAct = $("<div>").attr("id","pestañaAct");
    $(".container").append(pestañaAct);
    pestañaMisPartidas();
};

function pestañaMisPartidas(){
    activarPestañaPulsada();
    let pestañaActVacia = $('#pestañaAct').is(':empty');
    if(pestañaActVacia){
        let crearPartida =   
            '<div class="panel panel-info">'+
                '<div class="panel-heading">Crear una nueva partida</div>'+
                '<div class="panel-body centrar">'+
                    '<div class="input-group">'+
                        '<input id="cp" type="text" class="form-control" value = \'Introduce aquí el nombre\'  onfocus="if (this.value == \'Introduce aquí el nombre\') this.value=\'\';" onblur="if (this.value==\'\') this.value=\'Introduce aquí el nombre\';" >'+
                        '<span class="input-group-btn">'+
                            '<button class="btn btn-default" type="button" onClick="crearPartida()";>Crear</button>'+
                        '</span>'+
                    '</div>'+
                '</div>';
        let unirsePartida = 
        '<div class="panel panel-info">'+
            '<div class="panel-heading">Unirse a una partida existente</div>'+
            '<div class="panel-body centrar">'+
                '<div class="input-group">'+
                    '<input id = "up" type="text" class="form-control" value = \'Introduce el identificador de la partida\'  onfocus="if (this.value == \'Introduce el identificador de la partida\') this.value=\'\';" onblur="if (this.value==\'\') this.value=\'Introduce el identificador de la partida\';" >'+
                    '<span class="input-group-btn">'+
                        '<button class="btn btn-default" type="button" onClick="unirsePartida()";>Unirse</button>'+
                    '</span>'+
                '</div>'+
            '</div>'+
        '</div>';
        $("#pestañaAct").append(crearPartida);
        $("#pestañaAct").append(unirsePartida);
        $(".input-group").css("width","60%");
        $("#pestañaAct").css("paddingTop","2rem");
        $("#botones").on("click", "button.btn.btn-success", iniciarSesion);
    }
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
            $(".container").empty();
            mostrarIniciarSesion();
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

