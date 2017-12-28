"use strict";

/**
 * Proporciona operaciones para la gestión de usuarios
 * en la base de datos.
 */
class DAOQuestions {
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
     * Permite añadir una nueva pregunta en la base de datos.
     * @param {*} newQuestion Objeto con los datos de la pregunta a insertar, es decir, su texto, el numero de respuestas on el que se creó y cada respuesta
     * @param {*} callback Devuelve null si todo ha ido bien y err si se ha producido algun error.
     */
    insertQuestion(newQuestion, callback) {
        /* Implementar */
        this.pool.getConnection((err,connection) => {
            if(err){
                callback(err);
                return;
            }
            connection.query(
                "insert into question(question,nAnswer) values (?,?)",
                [newQuestion.question,newQuestion.answer.length],
                (err, result) =>{
                    if(err){
                        connection.release();
                        callback(err);
                    }
                    var values = [];
                    for(let answer of newQuestion.answer){
                        values.push([result.insertId,answer]);
                    }
                   connection.query(
                        "insert into answer (idQuestion, answer) values ?",
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
        });
    }

    /**
     * Permite insertar una ueva respuesta a una pregunta ya existente en la base de datos
     * @param {*} idQuestion Identificador de la pregunta a la que se asigna la nueva respuesta
     * @param {*} answer Texto de la respuesta
     * @param {*} callback Devuelve el id asignado a la nueva respuesta si todo ha ido bien y err si se ha producido algun error.
     */
    insertAnswer(idQuestion, answer, callback) {
        /* Implementar */
        this.pool.getConnection((err,connection) => {
            if(err){
                callback(err);
                return;
            }
            connection.query(
                "insert into answer(idQuestion,answer) values (?,?)",
                [idQuestion,answer],
                (err, result) =>{
                    if(err){
                        connection.release();
                        callback(err);
                    }
                    callback(null,result.insertId);
                }
            );
            connection.release();
        });
    }
    /**
     * Obtiene de la base de datos una lista de 5 preguntas aleatorias.
     * @param {*} callback Devuelve la lista de preguntas aleatorias.
     */
    getRandomQuestions(callback){
        this.pool.getConnection((err,connection) => {
            if(err){
                callback(err);
                return;
            }
            connection.query(
                "SELECT * FROM question ORDER BY rand() limit 5",
                (err, result) =>{
                    if(err){
                        connection.release();
                        callback(err);
                    }
                    callback(null,result);
                }
            );
            connection.release();
        });
    }

    /**
     * Permite obtener una lista de las respuestas a la pregunta indicada
     * @param {*} idQuestion Identificador de la pregunta a buscar
     * @param {*} callback Devuelve la lista con las respuestas asociadas al idQuestion y null en caso de no encontrarlas.
     */
    getQuestion(idQuestion, callback){
        this.pool.getConnection((err,connection) => {
            if(err){
                callback(err);
                return;
            }
            connection.query(
                "SELECT * FROM question join answer on question.id = answer.idQuestion where idQuestion = ?",
                [idQuestion],
                (err, result) =>{
                    if(err){
                        connection.release();
                        callback(err);
                    }
                    if(result[0]){
                        callback(null,result);
                    }
                    else{
                        callback(null,undefined);
                    }
                }
            );
            connection.release();
        });
    }
    /**
     * Permite insertar en la base de datos la respuest escogida por un usuario
     * @param {*} userEmail Email del usuario que responde a la pregunta    
     * @param {*} idAnswer Identificador de la respuesta elegida por el usuario
     * @param {*} callback Devuelve err en caso de error y null en caso contrario.
     */
    insertUserAnswer(userEmail,idAnswer, callback) {
        /* Implementar */
        this.pool.getConnection((err,connection) => {
            if(err){
                callback(err);
                return;
            }
            connection.query(
                "insert into useranswer(userEmail,idAnswer) values (?,?)",
                [userEmail,idAnswer],
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
     * Permite obtener la respuesta del usuario con email = email a la pregunta con identificador idQuestion
     * @param {*} idQuestion Identificador de la pregunta
     * @param {*} email Email del usuario
     * @param {*} callback Devuelve true si el usuario ha respondido a la pregunta y false en caso contrario.
     */
    getIfUserAnswerQuestion(idQuestion, email,callback){
        this.pool.getConnection((err,connection) => {
            if(err){
                callback(err);
                return;
            }
            connection.query(
                "select id from answer WHERE idQuestion = ? and id in (select idAnswer FROM useranswer where userEmail = ?)",
                [idQuestion, email],
                (err, rows) =>{
                    if(err){
                        connection.release();
                        callback(err);
                    }
                    if(rows[0]){
                        callback(null,true);
                    }
                    else{
                        callback(null,false);
                    }
                }
            );
            connection.release();
        });
    }
    /**
     * Permite obtener una lista de amigos que han respondido a una pregunta
     * @param {*} idQuestion Identificador de la pregunta   
     * @param {*} email Email del usuario del cual hay que buscar los amigos
     * @param {*} callback Devuelve una lista con los amigos que han respondido a una pregunta o undefined si no habia amigos que la hubieran contestado
     */
    getFriendAnswers(idQuestion,email, callback){
        this.pool.getConnection((err,connection) => {
            if(err){
                callback(err);
                return;
            }
            connection.query(
                "select * from user where email in (select userEmail from useranswer WHERE idAnswer in (select id from answer where idQuestion = ?) and userEmail in (select userEmail from friends where petitionerEmail = ? and state = 1 union select petitionerEmail from friends WHERE userEmail = ? and state = 1))",
                [idQuestion,email,email],
                (err, rows) =>{
                    if(err){
                        connection.release();
                        callback(err);
                    }
                    if(rows[0]){
                        callback(null,rows);
                    }
                    else{
                        callback(null,undefined);
                    }
                }
            );
            connection.release();
        });
    }
    /**
     * Permite obtener la respuesta de un usuario a una pregunta
     * @param {*} idQuestion Identificador de la pregunta   
     * @param {*} emailFriend Email del usuario del cual hay que buscar la respuesta
     * @param {*} callback DEvuelve la informacion de la respuesta que el usuario eligió de la pregunta o undefined si no se encuentra dicha información
     */
    getAnswerFriend(idQuestion, emailFriend, callback){
        
        this.pool.getConnection((err,connection) => {
            if(err){
                callback(err);
                return;
            }
            connection.query(
                "select * from answer where id = (select idAnswer from useranswer where userEmail = ? and idAnswer in (SELECT id from answer where idQuestion = ?))",
                [emailFriend,idQuestion],
                (err, rows) =>{
                    if(err){
                        connection.release();
                        callback(err);
                    }
                    if(rows[0]){
                        callback(null,rows);
                    }
                    else{
                        callback(null,undefined);
                    }
                }
            );
            connection.release();
        });
    }
    /**
     * Permite obtener una lista (de tamaño igual al numero de respuestas itroducidas al crear la pregunta) de  respuestas aletorias que no contenga la respuesta con id = idAnswer
     * @param {*} idAnswer Identificador de la respuesta que no queremos en la lista resultante de la consulta  
     * @param {*} idQuestion Identificador de la pregunta sobre la que buscamos las respuestas
     * @param {*} callback Devuelve una lista con las respuestas si se encuentran los resultados requeridos o undefined en caso contrario.
     */
    getRandomAnswer(idAnswer, idQuestion, callback){
        
        this.pool.getConnection((err,connection) => {
            if(err){
                callback(err);
                return;
            }
            let lim = null;
            connection.query(
                "SELECT nAnswer from question where id = ?",
                [idQuestion],
                (err, rows) =>{
                    if(err){
                        connection.release();
                        callback(err);
                    }
                    if(rows[0]){       
                        connection.query(
                            "SELECT * FROM answer where id = ? and idQuestion = ? union (SELECT * FROM answer where id <> ? and idQuestion = ?  order by rand() limit ?) order by rand()",
                            [idAnswer,idQuestion,idAnswer,idQuestion,rows[0].nAnswer-1],
                            (err, result) =>{
                                if(err){
                                    connection.release();
                                    callback(err);
                                }
                                if(result[0]){
                                    callback(null,result);
                                }
                                else{
                                    callback(null,undefined);
                                }
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
    }
    /**
     * Permite insertar en la tabla guessedAnswer si el usuario userEmail adivinó o no la respuesta del usuario friendEmail a la pregunta con id=idQuestion.
     * @param {*} userEmail Email del usuario que intenta adivinar  
     * @param {*} friendEmail Email del usuario al que se intenta adivinar la respuesta
     * @param {*} idQuestion Identificador de la respuesta a adivinar
     * @param {*} guessed Int que indica si se adivinó o no la respuesta (1-acierto,2-fallo)
     * @param {*} callback Devuelve err en caso de error y null en caso contrario
     */
    insertGuessAnswer(userEmail,friendEmail,idQuestion, guessed, callback){
        this.pool.getConnection((err,connection) => {
            if(err){
                callback(err);
                return;
            }
            connection.query(
                "insert into guessedAnswer(userEmail,friendEmail,idQuestion,guessed) values (?,?,?,?)",
                [userEmail,friendEmail,idQuestion,guessed],
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
     * Permite obtener si el usuario con email = email adivinó o no la pregunta con identificador= idQuestion.
     * @param {*} email Email del usuario   
     * @param {*} idQuestion Identificador de la pregunta
     * @param {*} callback Devuelve la información obtenida en la base de datos sobre la adivinanza del usuario a la pregunta o null si no se encuentra dicha información.
     */
    getGuessAnswer(email, idQuestion, callback){
        
        this.pool.getConnection((err,connection) => {
            if(err){
                callback(err);
                return;
            }
            connection.query(
                "select * from guessedanswer where userEmail = ? and idQuestion = ?",
                [email,idQuestion],
                (err, rows) =>{
                    if(err){
                        connection.release();
                        callback(err);
                    }
                    if(rows[0]){
                        callback(null,rows);
                    }
                    else{
                        callback(null,undefined);
                    }
                }
            );
            connection.release();
        });
    }


};

module.exports = {
    DAOQuestions: DAOQuestions
}