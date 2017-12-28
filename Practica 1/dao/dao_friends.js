"use strict";

/**
 * Proporciona operaciones para la gestión de amigos
 * en la base de datos.
 */
class DAOFriends {
    /**
     * Inicializa el DAO de amigos.
     * 
     * @param {Pool} pool Pool de conexiones MySQL. Todas las operaciones
     *                    sobre la BD se realizarán sobre este pool.
     */
    constructor(pool) {
        this.pool = pool;
    }
    /**
     * Permite añadir amigos en la base de datos guardando su relacion en la tabla "friends".
     * @param {*} email Email del usuario que recibe la peticion de amistad;
     * @param {*} emailFriend Email del usuario que envia la pericion de amistad;
     * @param {*} state Estado de la relacion de los amigos, 1 aceptada la peticion de amistad, es decir son amigos.
     *                  0 rechazada, es decir  no son amigos, (este caso se ha cambiado y ya no se da porque no se guarda)
     *                  pero lo hemos dejado por si en un futuro se amplia la app.
     *                  2 en espera, es decir el usuario actual no ha aceptado ni rechazado la peticion de amistad.
     * @param {*} callback Devuelve null si todo ha ido bien y err si se ha producido algun error.
     */
    insertFriend(email, emailFriend, state, callback) {
        /* Implementar */
        this.pool.getConnection((err,connection) => {
            if(err){
                callback(err);
                return;
            }
            connection.query(
                "insert into friends(userEmail, petitionerEmail, state) values (?,?,?)",
                [emailFriend,email,state],
                (err, result) =>{
                    if(err){
                        connection.release();
                        callback(err);
                    }
                    callback(null);
                }
            );
            connection.release();
        });
    }

    /**
     * Devuelve el estado en el que se encuentra un usuario con sus amigos. Es decir, devuelve los amigos que tiene en funcion del estado
     * @param {*} email //Email de la persona que quiere ver los amigos en funcion del estado.
     * @param {*} state //Estado de la amistad, 0 no muestra nada, 1 mustra a los amigos y 2 a las personas que quieren ser amigos.
     * @param {*} callback //Devuelve las tuplas que cumplen la condicion o undefined si no hay ninguna tupla en la base de datos con esas caracteristicas.
     */
    getFriendReq(email,state ,callback){
        this.pool.getConnection((err,connection) => {
            if(err){
                callback(err);
                return;
            }
            connection.query(
                "select * from user where email in (select petitionerEmail from friends where state = ? and userEmail = ?)",
                [state,email],
                (err,rows) => {
                    if(err){
                        connection.release();
                        callback(err);
                    }
                    if(rows[0]){//si es undefined no entra aqui, por lo que solo entra si el user existe 
                        callback(null, rows);
                    }
                    else{
                        callback(null,undefined);
                    }
                }
            );
            connection.release();
        });
    };

    /**
     * Devuelve la informacion de los amigos del usuario con ese email.
     * @param {*} email Email del usuario que quiere ver info de sus amigos
     * @param {*} callback Undefined si no hay ninguno, y las tuplas si hay uno o mas
     */
    getFriends(email,callback){
        this.pool.getConnection((err,connection) => {
            if(err){
                callback(err);
                return;
            }
            connection.query(
                "select * from user where email in (select petitionerEmail as em from friends where state = 1 and userEmail = ? union select userEmail  as em from friends where state = 1 and petitionerEmail = ?) ",
                [email,email],
                (err,rows) => {
                    if(err){
                        connection.release();
                        callback(err);
                    }
                    if(rows[0]){//si es undefined no entra aqui, por lo que solo entra si el user existe 
                        callback(null, rows);
                    }
                    else{
                        callback(null,undefined);
                    }
                }
            );
            connection.release();
        });
    };

    /**
     * Permite actualizar el estado de dos personas en la aplicacion.
     * @param {*} currentEmail Email del usuario logueado actualmente en la app.
     * @param {*} petitionerEmail Email de la persona que cambia el estado
     * @param {*} state Estado al que se va a actualizar.Lo mas probable es que se use para pasar de state 2, es decir amistad pendiente,
     *                  a amistad.
     * @param {*} callback Devuelve null si todo correcto, y err en caso contrario
     */
    updateState(currentEmail, petitionerEmail, state ,callback) {

        this.pool.getConnection((err,connection) => {
            if(err){
                callback(err);
                return;
            }
            connection.query("update friends set state = ? WHERE userEmail = ? and petitionerEmail = ?",
            [state,currentEmail,petitionerEmail],
                (err, result) =>{
                    if(err){
                        connection.release();
                        callback(err);
                    }
                    callback(null);
                }
            );
            connection.release();
        });
    };

    /**
     * Permite obtener el estado en el que se encuentran dos amigos en concreto.
     * @param {*} userEmail Email del amigo 1, usuario logueado.
     * @param {*} petitionerEmail Email del amigo 2.
     * @param {*} callback Deuvuelve undefined si no hay tuplas y el estado si hay una relacion entre ellos.
     */
    getFriendState(userEmail,petitionerEmail,callback){
        this.pool.getConnection((err,connection) => {
            if(err){
                callback(err);
                return;
            }
            connection.query(
                "select state from friends where userEmail = ? and petitionerEmail = ? union select state from friends where userEmail = ? and petitionerEmail = ?",
                [userEmail,petitionerEmail,petitionerEmail,userEmail],
                (err,rows) => {
                    if(err){
                        connection.release();
                        callback(err);
                    }
                    if(rows[0]){//si es undefined no entra aqui, por lo que solo entra si el user existe 
                        callback(null, rows);
                    }
                    else{
                        callback(null,undefined);
                    }
                }
            );
            connection.release();
        });
    };

    /**
     * Borra el amigo que coincide ocn petitionerEmail y cuyo estado sea el indicado. Se utiliza para rechazar peticiones de amistad.
     * @param {*} currentEmail Email del usuario logueado.
     * @param {*} petitionerEmail  Email del usuario a cambiar el estado.
     * @param {*} state Estado de la relacion actual, 1 amigos, 2 amistad pendiente.
     * @param {*} callback Devuelve null si todo correcto y err si algo ha ido mal.
     */
    deleteFriendReq(currentEmail, petitionerEmail, state ,callback) {
        
        this.pool.getConnection((err,connection) => {
            if(err){
                callback(err);
                return;
            }
            connection.query("delete from friends where userEmail = ? and petitionerEmail = ? and state = ?",
            [currentEmail,petitionerEmail, state],
                (err, result) =>{
                    if(err){
                        connection.release();
                        callback(err);
                    }
                    callback(null);
                }
            );
            connection.release();
        });
    };
};

module.exports = {
    DAOFriends: DAOFriends
}