"use strict";

/**
 * Proporciona operaciones para la gestión de usuarios
 * en la base de datos.
 */
class DAOUsuarios {
    /**
     * Inicializa el DAO de usuarios.
     * 
     * @param {Pool} pool Pool de conexiones MySQL. Todas las operaciones
     *                    sobre la BD se realizarán sobre este pool.
     */
    constructor(pool) {
        this.pool = pool;
    }

    isUserCorrect(email, callback) {

        this.pool.getConnection((err,connection) => {
            if(err){
                callback(err);
                return;
            }
            connection.query(
                "Select * from usuarios where login = ?",
                [email],
                (err,row) => {
                    if(err){
                        connection.release();
                        callback(err);
                    }
                    if(row[0]){
                        callback(null, row[0]);
                    }
                    else{
                        callback(null,false);
                    }
                }
            );
            connection.release();
        });
    };

    insertUser(login,password,callback){
        this.pool.getConnection((err,connection) => {
            if(err){
                callback(err);
                return;
            }
            connection.query(
                "insert into usuarios(login,password) values (?,?)",
                [login,password],
                (err) => {
                    if(err){
                        connection.release();
                        callback(err);
                    }
                    else{
                        callback(null);
                    }
                }
            );
            connection.release();
        });
    };

    /**
    * Devuelve true si el usuario con el email "email" existe en la base de datos.
    * @param {*} email Usuario a buscar
    * @param {*} callback True si existe, false en caso contrario
    */
    existsUser(email, callback){

        this.pool.getConnection((err,connection) => {
            if(err){
                callback(err);
                return;
            }
            connection.query(
                "Select * from usuarios where login = ?",
                [email],
                (err,row) => {
                    if(err){
                        connection.release();
                        callback(err);
                    }
                    if(row[0]){//si es undefined no entra aqui, por lo que solo entra si el user existe 
                        callback(null, true);
                    }
                    else{
                        callback(null,false);
                    }
                    connection.release();
                }
            );
        });
    };

    getGamesByUser(userId, callback){
        this.pool.getConnection((err,connection)=>{
            if(err){
                callback(err);
                return;
            }
            connection.query(
                "select id, nombre from partidas where id in (Select idPartida from juega_en where idUsuario = ?)",
                [userId],
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

    insertPlayerInGame(userId,gameId,callback){
        this.pool.getConnection((err,connection) => {
            if(err){
                callback(err);
                connection.release();
                return;
            }
            connection.query(
                "insert into juega_en(idUsuario,idPartida) values (?,?)",
                [userId,gameId],
                (err,row) => {
                    if(err){
                        connection.release();
                        callback(err);
                    }
                    else{
                        callback(null);
                    }
                }
            );
            connection.release();
        });
    };


}

module.exports = {
    DAOUsuarios: DAOUsuarios
}