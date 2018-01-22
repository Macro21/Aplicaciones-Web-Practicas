var mysql = require("mysql");


/**
 * Función para crear un objeto Connection a la BD indicada.
 */
function createConnection() {
    return mysql.createConnection({
        host: "localhost",
        database: "examen_septiembre",
        user: "root",
        password: ""
    });
}

/**
 * Devuelve todas las entradas de la lista de reproducción.
 */
function getPlaylist(callback) {
    var connection = createConnection();

    //
    // Completa aquí el apartado 1.a
    //
}

/**
 * Inserta un elemento nuevo en la lista de reproducción.
 */
function insertInPlaylist(title, author, album, year, callback) {
    var connection = createConnection();

    //
    // Completa aquí el apartado 1.b
    //
}

module.exports = {
    getPlaylist: getPlaylist,
    insertInPlaylist: insertInPlaylist
};