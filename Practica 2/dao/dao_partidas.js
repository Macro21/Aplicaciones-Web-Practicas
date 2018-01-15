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

    /*Estado de una partida*/
    getState(userId,gameId,callback){
        this.pool.getConnection((err,connection)=>{
            if(err){
                console.log(err);
                callback(err);
                return;
            }
            connection.query(
                "select estado from partidas where id = ?",
                [gameId],
                (err,rows) => {
                    if(err){
                        callback(err,null);
                        console.log(err);
                        connection.release();
                    }
                    let estado = JSON.parse(rows[0].estado);
                    let infoJugadorActual=estado.jugadoresCartas;
                    for(let player of infoJugadorActual){
                        let id=player.idJugador;
                        if(id===userId){
                            estado.jugadoresCartas=player;
                        }
                    }
                    if(estado.idTurno===userId)
                        estado.turno=true;
                    callback(null,estado);
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

    stateUpdate(gameId, estado ,callback){
        this.pool.getConnection((err,connection) => {
            if(err){
                callback(err);
                connection.release();
                return;
            }
            connection.query(
                "update partidas set estado = ? where id = ?",
                [estado, gameId],
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