
var dao = require("./dao");
var sprintf = require("sprintf-js").sprintf;

function printPlaylist(playlist) {
    console.log(sprintf("+-----+----------------------+----------------------+----------------------+------+"));
    console.log(sprintf("| %3s | %-20s | %-20s | %-20s | %4s |", "Id", "Title", "Author", "Album", "Year"));
    console.log(sprintf("+-----+----------------------+----------------------+----------------------+------+"));
    playlist.forEach(function(element) {
        console.log(sprintf("| %3s | %-20s | %-20s | %-20s | %4s |",
            element.id,
            element.title,
            element.author,
            element.album,
            element.year
        ));
    });
    console.log(sprintf("+-----+----------------------+----------------------+----------------------+------+"));
}

dao.getPlaylist(function(err, playlist) {
    if (err) {
        console.log("Se ha producido un error: " + err.message);
    } else {
        printPlaylist(playlist);
        dao.insertInPlaylist("Bleeding Love", "Leona Lewis", "Spirit", 2007, function(err) {
            if (err) {
                console.log("Se ha producido un error: " + err.message);
            } else {
                console.log("Elemento insertado correctamente.");        
            }
        });
        
    }
});

