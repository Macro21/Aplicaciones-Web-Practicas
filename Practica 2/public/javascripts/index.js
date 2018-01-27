
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
    $("#pestañaPartidas").show();
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
    $("#partidaFinalizada").hide();
    $("#esperandoJugadores").show();
    $("#partidaEnCursoId").text(gameId);
    $("#cartas").hide();
    $("#botonesAccion").hide();
    $("#noTurno").hide();
    $("#mesa").hide();

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
            for(i=0;i<data.gameInfo.jugadoresInfo.length; i++){
                let turno = false;  
                let ganador = false;     
                let nombre = data.gameInfo.jugadoresInfo[i].nombre;
                let userId = data.gameInfo.jugadoresInfo[i].idJugador;
                let nrCartas = data.gameInfo.jugadoresInfo[i].nrCartas;
                if(data.gameInfo.idTurno === userId){
                    turno=true;
                }
                crearFilaTablaJugadores(nombre,i+1,nrCartas,gameId,userId,turno);
            }
            if(i === 4){
                if(data.gameInfo.partidaFinalizada===true){
                    partidaFinalizada(gameId, data.gameInfo.ganador);
                }
                else{
                    ejecutarPartida(gameId);    
                }
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
        color = "#75EED8";
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
        data: JSON.stringify({nombrePartida,user}),
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
        data: JSON.stringify({gameId: gameId, user}),
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

function ejecutarPartida(gameId){
    $("#esperandoJugadores").hide();
    mostrarCartas(gameId);  
};

function mostrarCartas(gameId){ 
    $("#cartas").show(); 
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
            mostrarMesa(data.gameInfo.mesaInfo);
            mostrarMano(data.gameInfo.jugadoresCartas.cartas,data.gameInfo.turno);
            if(!data.gameInfo.turno){
                $('#botonesAccion').hide();
                $("#noTurno").show();
            }
            else{
                $("#noTurno").hide();
                $('#botonesAccion').show();
                if(data.gameInfo.mesaInfo.nrCartas === 0){//Es el primer turno, por tanto muestro el text para introducir valor
                    $("#cartasInicio").show();
                    $("#mentiroso").hide();
                }
                else{
                    $("#cartasInicio").hide();
                    $("#mentiroso").show();
                }
            }
        },
        error: (jqXHR, status, errorThrown)=>{
            alert("Se ha producido un error al repartir cartas " + errorThrown);
        },
    });
};
function mostrarMesa(mesaInfo){
    let string = "";
    for(let i=0;i<mesaInfo.nrCartas;i++){
        string+= mesaInfo.supuestoValor+"  ";
    }
    if(mesaInfo.nrCartas>0){
        $("#mesa").show();
        $("#mesa").text("Hay "+mesaInfo.nrCartas+" "+mesaInfo.supuestoValor+"´s:  " +"\n\r"+string);
    }
    else{
        $("#mesa").hide();
    }
}
function mostrarMano(cartas, turno){
    $("#cartas").empty();//Vaciamos el tablero para no añadir dos veces las mismas cartas
    //Añadimos las cartas
    for(let carta of cartas){
        let imagen = $("<img>");
        imagen.attr("src","images/"+ carta + ".png");
        imagen.css("padding","0.3rem");
        imagen.css("margin","0.2rem");
        if(turno){
            imagen.css("opacity","0.5")
        }
        imagen.attr("carta", carta);
        $("#cartas").prepend(imagen);
    }
    let lista = document.getElementById("cartas");
    let elems = $(lista).children();

    if(turno){
        for (let i = 0; i <elems.length; i++) {
            elems[i].addEventListener("click", function(){
                if(this.className === "selected"){
                    this.className = "";
                    $( this ).css("border","none");
                    $( this ).css("opacity","0.5");
                }
                else{
                    $( this ).css("border","solid");
                    $(this).css("border-radius","8%");
                    $( this ).css("opacity","1");
                    this.className = "selected";
                }
            });
        }
    }
};

function seleccionar(){
    let seleccionadas = document.getElementsByClassName("selected");
    let cartas =[];
    for (let i = 0; i <seleccionadas.length; i++) {   
        cartas[i] =seleccionadas[i].getAttribute("carta");
    }
    realizarAccion("jugar", cartas);
};
// Si la accion es jugar, entonces el usuario ha elegido echar cartas,
// Si la accion es mentiroso, el usuario ha decidido levantar las cartas del anterior.
function realizarAccion(accion, cartas){ 
    let user = $("#email").prop("value");
    let password = $("#password").prop("value");
    let cadenaBase64 = btoa(user + ":" + password);
    let gameId = $("#menu > li.active").attr("data-game-id");
    let cartasInicio= $("#cartasInicio").prop("value");
    if(cartasInicio ==="Introduce el supuesto valor de las cartas"){
        cartasInicio=undefined;
    }
    let datos = {
        gameId: gameId,
        accion: accion,
        cartas:cartas,
        cartasInicio:cartasInicio
    };
    $.ajax({
        method: "POST",
        url: "/accion",
        contentType: "application/json",
        data: JSON.stringify({datos}),
        beforeSend: (req)=> {
            // Añadimos la cabecera 'Authorization' con los datos de autenticación.
            req.setRequestHeader("Authorization","Basic " + cadenaBase64);
        },
        success: function(data, state, jqXHR) {
            if(accion==="mentiroso"){ //Mostrar mensaje con resultado de si ha mentido o no
                if(data.mentiroso){
                    alert(user+" tenía razón, el jugador anterior había mentido y se lleva las cartas de la mesa.");
                }
                else{
                    alert("El jugador anterior decía la verdad, "+user +" se lleva las cartas de la mesa.");
                }
            }
            if(!data.nrCartasJugadas){
                alert("Tienes que escoger entre 1 y 3 cartas");
                //data.gameInfo.nrCartasJugadas = true;
            }
            actualizarInformacionPartida(gameId);
        },
        error: function (jqXHR, status, errorThrown){
            alert("Ha ocurrido un error" + errorThrown);
        }      
    });
}

function partidaFinalizada(gameId,ganador){
    $("#partidaFinalizada").show();
    $("#partidaFinalizada").text("PARTIDA FINALIZADA. Ha ganado la partida: " +ganador.nombre);
    $("#botonesAccion").hide();
    $("#noTurno").hide();
    $("#cartas").hide();
    $("#esperandoJugadores").hide();
}

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
            $("#menu").children().empty();
            $("#menu").empty();
            $("#pestañas").hide();
            
        },
        error: (jqXHR,status,errorThrown) =>{
            alert("Ha ocurrido un error" + errorThrown);
        }
    });
};