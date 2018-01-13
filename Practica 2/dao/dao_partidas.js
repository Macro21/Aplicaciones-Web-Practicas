"use strict";

/**
 * Proporciona operaciones para la gestión de partidas
 * en la base de datos.
 */
class DAOPartidas {
    /**
     * Inicializa el DAO de partidas.
     * 
     * @param {Pool} pool Pool de conexiones MySQL. Todas las operaciones
     *                    sobre la BD se realizarán sobre este pool.
     */
    constructor(pool) {
        this.pool = pool;
    }

    /*Estado de una partida. El servidor recibirá un identi1cador de partida y responderá con el nombre
    de los jugadores actualmente inscritos en la misma.*/
    getPlayersInGame(gameId,callback){
        this.pool.getConnection((err,connection)=>{
            if(err){
                console.log(err);
                callback(err);
                return;
            }
            connection.query(
                "select login,id from usuarios where id in (Select idUsuario from juega_en where idPartida = ?)",
                [gameId],
                (err,rows) => {
                    if(err){
                        connection.release();
                        callback(err);
                    }
                    callback(null, rows);
                    connection.release();
                }
            );
        });
    };

    insertGame(nombrePartida, callback){
        this.pool.getConnection((err,connection) => {
            if(err){
                callback(err);
                connection.release();
                return;
            }
            connection.query(
                "insert into partidas(nombre) values (?)",
                [nombrePartida],
                (err,row) => {
                    if(err){
                        connection.release();
                        callback(err);
                    }
                    else{
                        callback(null,row.insertId);
                    }
                }
            );
            connection.release();
        });
    };

    getGame(gameId,callback){
        this.pool.getConnection((err,connection)=>{
            if(err){
                console.log(err);
                callback(err);
                return;
            }
            connection.query(
                "select * from partidas where id = ?",
                [gameId],
                (err,rows) => {
                    if(err){
                        connection.release();
                        callback(err);
                    }
                    callback(null, rows);
                    connection.release();
                }
            );
        });
    };

    stateUpdate(gameId, playersInfo ,callback){
        this.pool.getConnection((err,connection) => {
            if(err){
                callback(err);
                connection.release();
                return;
            }
            connection.query(
                "update partidas set estado = ? where id = ?",
                [playersInfo, gameId],
                (err) => {
                    if(err){
                        connection.release();
                        callback(err);
                        console.log(err);
                    }
                    callback(null);
                }
            );
            connection.release();
        });
    };

}

module.exports = {
    DAOPartidas: DAOPartidas
}