function defaultFlash(request,response,next){
    if(request.session.flashMsg === undefined){
        request.session.flashMsg = null;
    }
  /*  if(request.session.currentUser === undefined){
        request.session.currentUser = "";
    }*/
    next();
};

function flash(request, response, next){
    response.setFlash = (msg) => {
        request.session.flashMsg = msg;
    };
    response.locals.getAndClearFlash = () => {
        let msg = request.session.flashMsg;
        delete request.session.flashMsg;
        return msg;
    };
    next();
};

function accessControl(request, response, next){
    
    if (request.session.currentUser) {
        response.locals.userEmail = request.session.currentUser;
        next();
    }
    else {
        response.redirect("/login");
        response.end();
    }
};

function startedSession(request,response, next){
    if(request.session.currentUser && request.url === "/login"){
        response.redirect("/perfil_principal");
        response.end();
    }
    else{
        next();
    }
};


module.exports = {
    defaultFlash: defaultFlash,
    flash:flash,
    accessControl: accessControl,
    startedSession: startedSession
}