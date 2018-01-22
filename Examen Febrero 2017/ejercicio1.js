/**
 * Aplicaciones Web - Examen de febrero - Ejercicio 1
 */

var mysql = require("mysql");

var connection = mysql.createConnection({
  host     : "localhost",
  user     : "root",
  password : "PEPE",
  database : "examenfebrero"
});


function busqueda(resultado, buscado){
    let p = 0;
    let salir = false;
    while(p<resultado.length && !salir){
        if(resultado[p].id === buscado){
            salir = true;
        }
        p++;
    }
    return salir;
}



function leerArticulos(callback) {
    connection.connect(function(err) {
        if (err) {
            callback(err);
        } else {
            // La siguiente variable contendrá la sentencia SQL a realizar
            var sql = "select * from articulos left join palabrasclave on articulos.Id = palabrasclave.IdArticulo order by articulos.id";
            
            // Realizamos consulta
            connection.query(sql, 
                (err, rows) =>{
                // Construir el objeto dado a partir de los resultados
                // de la consulta.
                if(err){
                    connection.end();
                    console.log(err);
                    callback(err);
                }
                let resultado = [];
                let objRes = {
                    id: -1,
                    Titulo: "",
                    Fecha: new Date(),
                    palabrasclave: []
                };
                if(rows[0]){
                    for(let row of rows){
                        if(!busqueda(resultado,row.Id)){
                            for(let r of rows){
                                if(r.Id === row.Id){
                                    if(r.PalabraClave)
                                        objRes.palabrasclave.push(r.PalabraClave);
                                }
                            }
                            objRes.id = row.Id;
                            objRes.Titulo = row.Titulo;
                            objRes.Fecha = row.Fecha;
                            resultado.push(objRes);
                            objRes = {
                                id: -1,
                                Titulo: "",
                                Fecha: "",
                                palabrasclave: []
                            };
                        }
                    }
                    callback(null, resultado);
                } 
                // ¡¡ No olvides llamar a connection.end() !!
                
            });
            connection.end()
        }
    });
}

leerArticulos(function(err, result) {
    if (err) {
        console.log("Error de acceso a la BD: " + err);
    } else {
        console.log(result);
    }
});

// La ejecución de este programa debe imprimir:

//[ { id: 1,
//    titulo: 'An inference algorithm for guaranteeing Safe destruction',
//    fecha: Sun Jul 20 2008 00:00:00 GMT+0200 (CEST),
//    palabrasClave: [ 'memory', 'formal', 'inference' ] },
//  { id: 2,
//    titulo: 'A type system for region management and its proof of correctness',
//    fecha: Wed Jul 21 2010 00:00:00 GMT+0200 (CEST),
//    palabrasClave: [ 'type system', 'memory' ] },
//  { id: 3,
//    titulo: 'Shape analysis by regular languages',
//    fecha: Sat May 30 2009 00:00:00 GMT+0200 (CEST),
//    palabrasClave: [] },
//  { id: 4,
//    titulo: 'Polymorphic type specifications',
//    fecha: Tue Mar 01 2016 00:00:00 GMT+0100 (CET),
//    palabrasClave: [ 'type system', 'success types' ] },
//  { id: 5,
//    titulo: 'Yet to be written',
//    fecha: Wed Feb 01 2017 00:00:00 GMT+0100 (CET),
//    palabrasClave: [] } ]
    
    