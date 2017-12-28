"use strict";

/**
 * Proporciona operaciones para la gestión de usuarios
 * en la base de datos.
 */
class DAOUsers {
    /**
     * Inicializa el DAO de usuarios.
     * 
     * @param {Pool} pool Pool de conexiones MySQL. Todas las operaciones
     *                    sobre la BD se realizarán sobre este pool.
     */
    constructor(pool) {
        this.pool = pool;
    }

    /**
     * Determina si un determinado usuario aparece en la BD con la contraseña
     * pasada como parámetro.
     * 
     * Es una operación asíncrona, de modo que se llamará a la función callback
     * pasando, por un lado, el objeto Error (si se produce, o null en caso contrario)
     * y, por otro lado, un booleano indicando el resultado de la operación
     * (true => el usuario existe, false => el usuario no existe o la contraseña es incorrecta)
     * En caso de error error, el segundo parámetro de la función callback será indefinido.
     * 
     * @param {string} email Identificador del usuario a buscar
     * @param {string} password Contraseña a comprobar
     * @param {function} callback Función que recibirá el objeto error y el resultado
     */
    isUserCorrect(email, password, callback) {

        /* Implementar */
        this.pool.getConnection((err,connection) => {
            if(err){
                callback(err);
                return;
            }
            connection.query(
                "Select password from user where email = ?",
                [email],
                (err,row) => {
                    if(err){
                        connection.release();
                        callback(err);
                    }
                    if(row[0]){
                        if(row[0].password === password){
                            callback(null, true);
                        }
                        else{
                            callback(null, false);
                        }
                    }
                    else{
                        callback(null,false);
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
                "Select * from user where email = ?",
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
                }
            );
            connection.release();
        });
    };


    /**
     * Inserta un usuario en la base de datos con los siguientes datos:
     * @param {*} email Email del usuario que va a ser la pk de la tabla de usuarios.
     * @param {*} password Contraseña que va a utilizar para acceder a la aplicacion.
     * @param {*} fullName Nombre del susuario.
     * @param {*} gender Sexo del usuario.
     * @param {*} birthdate Fecha de nacimiento.
     * @param {*} image Imagen de perfil.
     * @param {*} callback Devuelve null si todo ha ido bien y err si se ha producido un error
     */
    insertUser(email, password, fullName, gender, birthdate, image, callback) {
        
        /* Implementar */
        this.pool.getConnection((err,connection) => {
            if(err){
                callback(err);
                return;
            }
            connection.query(
                "insert into user(email,password,fullName,gender,birthdate, image) values (?,?,?,?,?,?)",
                [email,password, fullName, gender, birthdate, image],
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
     * Añade una foto a la galeria del usuario con el email "email".
     * @param {*} email Email del usuario que va a añadir una nueva imagen.
     * @param {*} image La imagen que se añade.
     * @param {*} callback Devuelve null si todo ha ido bien y err en caso contrario.
     */
    insertPhoto(email, image, callback){
        this.pool.getConnection((err,connection) => {
            if(err){
                callback(err);
                return;
            }
            connection.query("insert into galery(email,image) values (?,?)",[email,image],
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
    * Devuelve todos los datos de un usuario incluidas sus fotos.
    * @param {*} email Email del usuario cuyos datos se piden.
    * @param {*} callback Devuelve undefined si no existe el usuario en la base de datos. Si existe devuelve todos sus datos.
    */
    getUserInfo(email, callback){
        
        this.pool.getConnection((err,connection) => {
            if(err){
                callback(err);
                return;
            }
            connection.query(
                "Select email,password,fullName,gender, DATE_FORMAT(birthdate, \"%Y-%m-%d\") as birthdate, image, score from user where email = ?",
                [email],
                (err,rows) => {
                    if(err){
                        connection.release();
                        callback(err);
                    }
                    if(rows[0]){//si es undefined no entra aqui, por lo que solo entra si el user existe 
                        connection.query(
                            "select image from galery where email = ?",
                            [email],
                            (err,galery)=>{
                                if(err){
                                    connection.release();
                                    callback(err);
                                }
                                if(galery[0])
                                    rows[0].galery = galery;
                                callback(null, rows[0]);
                            }
                        );
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
     * Actualiza la info asociada a un usuario.
     * @param {*} currentEmail Usuario a actualizar.
     * @param {*} userInfo Nueva informacion del usuario.
     * @param {*} callback Devuelve null si todo ha ido bien y err en caso contrario.
     */
    updateUser(currentEmail, userInfo, callback) {
       
        this.pool.getConnection((err,connection) => {
            if(err){
                callback(err);
                return;
            }
            let updateQ = "update user set fullName = ?, email = ?, password = ?, gender = ?, birthdate = ? WHERE email = ?";
            let valQ = [userInfo.fullName,userInfo.email, userInfo.password, userInfo.gender, userInfo.birthdate,currentEmail];
            if(userInfo.image){
                updateQ = "update user set fullName = ?, email = ?, password = ?, gender = ?, birthdate = ?, image = ? WHERE email = ?";
                valQ = [userInfo.fullName,userInfo.email, userInfo.password, userInfo.gender, userInfo.birthdate,userInfo.image,currentEmail];
            }
            connection.query(updateQ,
                valQ,
                (err, result) =>{
                    if(err){
                        console.log(err);
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
     * Busca los usuario de la aplicacion cuyo nombre contiene "name" y no sean ya amigos de userEmail.
     * @param {*} name Nombre a buscar.
     * @param {*} userEmail Usuario actual.
     * @param {*} callback Devuelve la informacion de los usuarios que contienen ese nombre o undefined si no hay ninguno.
     */
    getUsersByName(name,userEmail ,callback){
        
        this.pool.getConnection((err,connection) => {
            if(err){
                callback(err);
                return;
            }
            connection.query(
                "Select email,password,fullName,gender, DATE_FORMAT(birthdate, \"%Y-%m-%d\") as birthdate, image from user where fullName like ? and email not in (select userEmail from friends where petitionerEmail = ? and state <> 0) and email not in (select petitionerEmail from friends where userEmail = ? and state <> 0)",
                ["%" + name + "%",userEmail,userEmail],
                (err,rows) => {
                    if(err){
                        connection.release();
                        callback(err);
                    }
                    if(rows){//si es undefined no entra aqui, por lo que solo entra si el user existe  
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
     * Obtiene el nombre de fichero que contiene la imagen de perfil de un usuario.
     * 
     * Es una operación asíncrona, de modo que se llamará a la función callback
     * pasando, por un lado, el objeto Error (si se produce, o null en caso contrario)
     * y, por otro lado, una cadena con el nombre de la imagen de perfil (o undefined
     * en caso de producirse un error).
     * 
     * @param {string} email Identificador del usuario cuya imagen se quiere obtener
     * @param {function} callback Función que recibirá el objeto error y el resultado
     */
    getUserImageName(email, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) { callback(err); return; }
            connection.query("SELECT image FROM user WHERE email = ?",
            [email],
            (err, rows) => {
                if (err) { callback(err); return; }
                connection.release();
                if (rows.length === 0) {
                    callback(null, undefined);
                } else {
                    callback(null, rows[0].image);
                }
            });
        });
    }
    
    /**
     * Actualiza la puntuacion del usuario recibido por parámetro sumandole la cantidad de score.
     * @param {*} userEmail Email del usuario del que se va a actualizar la puntuacion.
     * @param {*} score La puntuacion con la que se va a incrementar. (Puede ser negativa).
     * @param {*} callback Devuelve null si todo ha ido bien y err en caso contrario.
     */
    updateScore(userEmail,score, callback) {
         this.pool.getConnection((err,connection) => {
             if(err){
                 callback(err);
                 return;
             }

             connection.query(
                "update user set score = score + ? WHERE email = ?",
                [score,userEmail],
                 (err, result) =>{
                     if(err){
                         console.log(err);
                         connection.release();
                         callback(err);
                     }
                     callback(null);
                 }
             );
             connection.release();
         });
     }

}

module.exports = {
    DAOUsers: DAOUsers
}