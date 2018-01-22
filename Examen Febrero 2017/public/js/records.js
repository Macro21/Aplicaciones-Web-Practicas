function actualizarTabla() {
    // Hacer petición AJAX a /highestRecords
    $.ajax({
        type: "GET",
        url: "/highestRecords",
        success: (data, status, jqXHR) =>{
            $("#records > tbody").empty();
            for(let fila of data.records){
                let result = $("<tr>");
                let nombre = $("<td>").text(fila.nombre);
                let puntuacion = $("<td>").text(fila.puntos);
                result.prepend(puntuacion);
                result.prepend(nombre);
                $("#records").append(result);
            }
        },
        error: (jqXHR, status, errorThrown) =>{
            alert("se ha producido un error " + errorThrown);
        }
    });
    
};


$(document).ready(function() {
    actualizarTabla();
    
    // Esta función será llamada cada vez que se pulse
    // el botón 'Enviar':
    $("#enviar").on("click", function() {
        //Realizar petición AJAX a /newRecord y llamar a
        let nueva = $("#nueva").prop("value");
        $.ajax({
            type: "POST",
            url: "/newRecord",
            contentType: "application/json",
            data: JSON.stringify({nombre: nueva}),
            success: (data, status, jqXHR)=>{
                alert("Correcto");
            },
            error: (jqXHR, status, errorThrown) =>{
                alert("error " + errorThrown);
            }
        });
         actualizarTabla();// cuando esta petición finalice
        // con éxito
    });
});