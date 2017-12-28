
function getQuestions(request, response){
    request.daoQuestion.getRandomQuestions((err, questions) => {
        if (err) {
            response.status(500);
            console.error(err);
            response.end(err.message);
        } 
        else {
            response.render("./question/perfil_preguntas",{questions: questions, score: request.session.score,image: request.session.image});
        }
    }); 
};

function getAddQuestion (request, response){
    response.render("./question/add_question",{nAnswer: 0, score: request.session.score,errors:null,image: request.session.image});
};

/*function getFormAnswer (request, response){
    response.render("./question/add_question",{nAnswer: request.query.nAnswer, score: request.session.score,image: request.session.image});
};*/

function addQuestion (request, response){
    request.checkBody("question","Formato de pregunta incorrecto (Asegurate de usar los signos de interrogación)").matches(/¿([^}]*)\?/gi);
    request.checkBody("respuestas", "Introduce respuestas").notEmpty();
    request.getValidationResult().then(result => {
        // El método isEmpty() devuelve true si las comprobaciones
        // no han detectado ningún error
        if (result.isEmpty()) {
            let newQuestion = {
                question: request.body.question,
                answer: []
            };
            let fullQuestion = request.body.respuestas;
            let lineas = fullQuestion.split(/\n+/).length;
            let dato = fullQuestion.split("\r\n");
            for(let i = 0; i < lineas; i++){
                if(dato[i] != ""){
                    newQuestion.answer.push(dato[i]);
                }
            }
            request.daoQuestion.insertQuestion(newQuestion,(err,result)=>{
                if(err){
                    response.status(500);
                    console.log(err);
                    response.end(err.message);
                }
                response.setFlash("Se ha creado la pregunta correctamente!");
                response.redirect("/addQuestion");
            });
        }
        else{
            response.render("./question/add_question",{image: request.session.image,score: request.session.score,errors: result.array()});
        }
    });
};

function showQuestion (request, response){
    request.daoQuestion.getQuestion(request.query.id, (err,resultQ)=>{
        if(err){
            response.status(500);
            console.log(err);
            response.end(err.message);
        }
        request.daoQuestion.getIfUserAnswerQuestion(request.query.id,response.locals.userEmail, (err,result)=>{
            if(err){
                response.status(500);
                console.log(err);
                response.end(err.message);
            }

            request.daoQuestion.getFriendAnswers(request.query.id, response.locals.userEmail, (err,resultF)=>{
                if(err){
                    response.status(500);
                    console.log(err);
                    response.end(err.message);
                }
                request.daoQuestion.getGuessAnswer(response.locals.userEmail,request.query.id, (err,guessAnsResult)=>{
                    if(err){
                        response.status(500);
                        console.log(err);
                        response.end(err.message);
                    }
                    if(resultF && guessAnsResult){
                        for(let i = 0; i<resultF.length; i++){
                            for(let j = 0; j<guessAnsResult.length; j++){
                                if(resultF[i].email === guessAnsResult[j].friendEmail){
                                    resultF[i].guessed = guessAnsResult[j].guessed;
                                }
                            }
                        }
                    }
                    response.render("./question/show_question", {resultFriends: resultF, question: resultQ,
                         score: request.session.score,answered:result,image: request.session.image });
                });
            });
        });
    });
};

function showAnswers (request, response){

    request.daoQuestion.getQuestion(request.query.id, (err,result)=>{
        if(err){
            response.status(500);
            console.log(err);
            response.end(err.message);
        }
        if(result.length > 0){//como el enunciado no avisa
            response.render("./question/show_answers", {question: result, score: request.session.score,image: request.session.image});
        }
    });
};

function responseQuestion(request, response){
    request.checkBody("answer", "No has seleccionado una opción").notEmpty();
    if(request.body.answer < 0 ){
        request.checkBody("answerUser", "No has escrito una respuesta").notEmpty();
    }
    request.getValidationResult().then(result => {
        // El método isEmpty() devuelve true si las comprobaciones
        // no han detectado ningún error
        if (result.isEmpty()) {
            if(request.body.answer < 0  ){
                request.daoQuestion.insertAnswer(request.body.idQuestion, request.body.answerUser, (err,resultId)=>{
                    if(err){
                        response.status(500);
                        console.log(err);
                        response.end(err.message);
                    }
                    request.daoQuestion.insertUserAnswer(response.locals.userEmail, resultId, (err)=>{
                        if(err){
                            response.status(500);
                            console.log(err);
                            response.end(err.message);
                        }
                        response.redirect("/perfil_preguntas");
                    });
                });
            }
            else{
                request.daoQuestion.insertUserAnswer(response.locals.userEmail, request.body.answer, (err)=>{
                    if(err){
                        response.status(500);
                        response.end(err.message);
                        console.log(err);
                    }
                    response.redirect("/perfil_preguntas");
                });
            }
        }
        else{
            let v = result.array();
            response.setFlash(v[0].msg);
            request.daoQuestion.getQuestion(request.body.idQuestion, (err,result)=>{
                if(err){
                    response.status(500);
                    console.log(err);
                    response.end(err.message);
                }
                if(result.length > 0){//como el enunciado no avisa
                    response.render("./question/show_answers", {question: result, score: request.session.score,image: request.session.image});
                }
            });

        }
    });
};

function guessAnswer(request, response){
    
    request.daoQuestion.getAnswerFriend(request.query.idQuestion, request.query.friendEmail, (err,resultAnswer) =>{
        if(err){
            response.status(500);
            console.log(err);
            response.end(err.message);
        }
        request.daoQuestion.getRandomAnswer(resultAnswer[0].id, request.query.idQuestion, (err,resultRandomAnswers)=>{
            if(err){
                response.status(500);
                console.log(err);
                response.end(err.message);
            }
            response.render("./question/show_guessAnswers",{answers: resultRandomAnswers, question: request.query.txtQuestion,
                name: request.query.friendName,friendEmail: request.query.friendEmail,score: request.session.score,image: request.session.image});
        });    
    });
};

function checkAnswer(request, response){
    if(!request.body.idAnswer){
        response.setFlash("No seleccionaste opción al adivinar");
        response.redirect("/showQuestion?id=" + request.body.idQuestion);
    }
    else{
        request.daoQuestion.getAnswerFriend(request.body.idQuestion, request.body.friendEmail,(err,result)=>{
            if(err){
                response.status(500);
                console.log(err);
                response.end(err.message);
            }
            if(request.body.idAnswer == result[0].id){
                request.daoUser.updateScore(response.locals.userEmail,50, (err)=>{
                    if(err){
                        response.status(500);
                        console.log(err);
                        response.end(err.message);
                    } 
                    request.daoQuestion.insertGuessAnswer(response.locals.userEmail,request.body.friendEmail,request.body.idQuestion,1, (err)=>{
                        if(err){
                            response.status(500);
                            console.log(err);
                            response.end(err.message);
                        }
                    });
                });
                request.session.score += 50;  
            }
            else{ 
                request.daoQuestion.insertGuessAnswer(response.locals.userEmail,request.body.friendEmail,request.body.idQuestion,0, (err)=>{
                    if(err){
                        response.status(500);
                        console.log(err);
                        response.end(err.message);
                    }
                });
            }
            response.redirect("/showQuestion?id=" + request.body.idQuestion);
        });
    }
};

module.exports = {
    getQuestions: getQuestions,
    getAddQuestion: getAddQuestion,
   // getFormAnswer: getFormAnswer,
    addQuestion: addQuestion,
    showQuestion: showQuestion,
    showAnswers: showAnswers,
    responseQuestion: responseQuestion,
    guessAnswer: guessAnswer,
    checkAnswer: checkAnswer
}