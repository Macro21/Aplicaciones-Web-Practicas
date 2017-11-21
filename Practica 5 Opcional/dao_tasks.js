"use strict";


/**
 * Proporciona operaciones para la gestión de tareas
 * en la base de datos.
 */
class DAOTasks {
    /**
     * Inicializa el DAO de tareas.
     * 
     * @param {Pool} pool Pool de conexiones MySQL. Todas las operaciones
     *                    sobre la BD se realizarán sobre este pool.
     */
    constructor(pool) {
        this.pool = pool;
    }


    /**
     * Devuelve todas las tareas de un determinado usuario.
     * 
     * Este método devolverá (de manera asíncrona) un array
     * con las tareas de dicho usuario. Cada tarea debe tener cuatro
     * atributos: id, text, done y tags. El primero es numérico, el segundo
     * una cadena, el tercero un booleano, y el cuarto un array de cadenas.
     * 
     * La función callback ha de tener dos parámetros: un objeto
     * de tipo Error (si se produce, o null en caso contrario), y
     * la lista de tareas (o undefined, en caso de error).
     * 
     * @param {string} email Identificador del usuario.
     * @param {function} callback Función callback.
     */
    getAllTasks(email, callback) {
        /* Implementar */
        this.pool.getConnection((err,connection) => {
            if(err){
                callback(err);
                return;
            }
            connection.query(
                "SELECT * FROM task left join tag on task.id = tag.taskId where user = ? order by id" ,
                [email],
                (err,rows) => {
                    if(err){
                        connection.release();
                        callback(err);
                    }
                    let taskAux = {
                        id: -1,
                        text: "",
                        done: false,
                        tags: []
                    };
                    var resultado = [];
                    for(let row of rows){
                        if(taskAux.id === -1 || row.id != taskAux.id){
                            if(taskAux.id != -1){
                                resultado.push(taskAux);
                                taskAux = new Object();
                                /*Solo haria falta el taskAux.tags = [], pero he puesto el resto para que cuando se muestre el resultado,
                                se siga la misma estructura, porque sino saldria la primera con id,text,done,tags y las siguientes tags,id,text,done*/
                                taskAux.id = -1;
                                taskAux.text = "";
                                taskAux.done = false;
                                taskAux.tags = [];
                            }
                            taskAux.id = row.id;
                            taskAux.text = row.text;
                            taskAux.done = row.done;
                            if(taskAux.tags.indexOf(row.tag) == -1){
                                taskAux.tags.push(row.tag);
                            }
                        }
                        else if (taskAux.id === row.id && taskAux.tags.indexOf(row.tag) === -1){
                                taskAux.tags.push(row.tag);
                            }
                    }
                    resultado.push(taskAux);
                    callback(null,resultado);
                }
            );
			connection.release();
        });
    }

    /**
     * Inserta una tarea asociada a un usuario.
     * 
     * Se supone que la tarea a insertar es un objeto con, al menos,
     * dos atributos: text y tags. El primero de ellos es un string con
     * el texto de la tarea, y el segundo de ellos es un array de cadenas.
     * 
     * Tras la inserción se llamará a la función callback, pasándole el objeto
     * Error, si se produjo alguno durante la inserción, o null en caso contrario.
     * 
     * @param {string} email Identificador del usuario
     * @param {object} task Tarea a insertar
     * @param {function} callback Función callback que será llamada tras la inserción
     */
    insertTask(email, task, callback) {

        /* Implementar */
        this.pool.getConnection((err,connection) => {
            if(err){
                callback(err);
                return;
            }
            connection.query(
                "insert into task(user,text,done) values (?,?,?)",
                [email,task.text, task.done],
                (err, result) =>{
                    if(err){
                        connection.release();
                        callback(err);
                    }
                    var values = [];
                    for(let tag of task.tags){
                        values.push([result.insertId,tag]);
                    }
                   connection.query(
                        "insert into tag (taskId, tag) values ?",
                        [values],
                        (err) => {
                            if(err){
                                callback(err);
                                connection.release();
                            }
                            connection.release();
                        }
                    );
                    callback(null);
                }
            );
            connection.release();
        });
    }

    /**
     * Marca la tarea indicada como realizada, estableciendo
     * la columna 'done' a 'true'.
     * 
     * Tras la actualización se llamará a la función callback, pasándole el objeto
     * Error, si se produjo alguno durante la actualización, o null en caso contrario.
     * 
     * @param {object} idTask Identificador de la tarea a modificar
     * @param {function} callback Función callback que será llamada tras la actualización
     */
    markTaskDone(idTask, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) { callback(err); return; }
            connection.query(
                "UPDATE task SET done = 1 WHERE id = ?",
                [idTask],
                (err) => {
                    connection.release();
                    callback(err);
                }
            );
        });
    }

    /**
     * Elimina todas las tareas asociadas a un usuario dado que tengan
     * el valor 'true' en la columna 'done'.
     * 
     * Tras el borrado se llamará a la función callback, pasándole el objeto
     * Error, si se produjo alguno durante la actualización, o null en caso contrario.
     * 
     * @param {string} email Identificador del usuario
     * @param {function} callback Función llamada tras el borrado
     */
    deleteCompleted(email, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) { callback(err); return; }
            connection.query(
                "DELETE FROM task WHERE user = ? AND done = 1",
                [email],
                (err) => {
                    connection.release();
                    callback(err);
                }
            );
        });
    }
}

module.exports = {
    DAOTasks: DAOTasks
}