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
    getPlayersInGame(userId, gameId,callback){
        this.pool.getConnection((err,connection)=>{
            if(err){
                console.log(err);
                callback(err);
                return;
            }
            connection.query(
                "select id, login, estado from " + 
                "(select id, login from usuarios join juega_en on juega_en.idUsuario = usuarios.id) t1,"+
                "(select estado from partidas where id = ?) t2",
                [gameId],
                (err,rows) => {
                    if(err){
                        connection.release();
                        callback(err);
                        console.log(err);
                    }
                    let resultado = {
                        cartas: [],
                        valorCartasEnMesa: [],
                        infoPartida: [],
                    };
                    
                    if(rows[0].estado){//si no es undefined entra
                        let gameInfo = JSON.parse(rows[0].estado);
                        for(let player of gameInfo.playerInfo){
                            if(player.idJugador === userId){
                                resultado.nrCartas = player.nrCartas;
                                resultado.cartas = player.cartas;
                            }
                        }
                        resultado.nrCartasEnMesa = gameInfo.nrCartasEnMesa;
                        resultado.valorCartasEnMesa = gameInfo.valorCartasEnMesa;
                        resultado.idJugadorActual = gameInfo.idJugadorActual;
                        resultado.idJugadorAnterior = gameInfo.idJugadorAnterior;
                        if(gameInfo.idJugadorActual === userId){
                            resultado.turno = true;
                        }
                       

                        let infoPartida= [];
                        for(let row of rows){
                            let aux = {
                                id: row.id,
                                login: row.login
                            };
                            infoPartida.push(aux);
                        }
                        resultado.infoPartida = infoPartida;
                        callback(null, resultado);
                    }
                    else{
                        let infoPartida= [];
                        for(let row of rows){
                            let aux = {
                                id: row.id,
                                login: row.login
                            };
                            infoPartida.push(aux);
                        }
                        resultado.infoPartida = infoPartida;
                        callback(null, resultado);
                    }
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