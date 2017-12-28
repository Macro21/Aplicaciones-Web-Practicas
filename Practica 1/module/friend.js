
function getFriendsProfile(request, response){

    request.daoFriend.getFriendReq(response.locals.userEmail, 2,(err,resultReq) =>{
        if(err){
            response.status(500);
            console.log(err);
            response.end(err.message);
        }
        else{
            request.daoFriend.getFriends(response.locals.userEmail,(err,resultFriends)=>{
                if(err){
                    response.status(500);
                    console.log(err);
                    response.end(err.message);
                }
                response.render("./friends/perfil_amigos",{result: resultReq, resultFriends: resultFriends, score: request.session.score, image: request.session.image});
            });
        }
    });
};

function searchFriendsByName(request, response){
    
    request.daoUser.getUsersByName(request.query.friendName,response.locals.userEmail, (err,result)=>{
        if(err){
            response.status(500);
            console.log(err);
            response.end(err.message);
        }
        if(result.length<=0){
            result = null;
        }
        response.render("./friends/found_friends", {result: result, score: request.session.score,image: request.session.image});
    });
};

function friendRequest (request, response) {
   
    if(response.locals.userEmail === request.body.friendEmail){
        response.redirect("/perfil_principal");
    }
    else{
        request.daoFriend.getFriendState(response.locals.userEmail, request.body.friendEmail, (err,result)=>{
            if(result){ 
                request.daoFriend.updateState(request.body.friendEmail, response.locals.userEmail, 2 , (err)=>{
                    if(err){
                        response.status(500);
                        console.log(err);
                        response.end(err.message);
                    }
                });
            }
            else{
                request.daoFriend.insertFriend(response.locals.userEmail, request.body.friendEmail, 2,(err)=>{
                    if(err){
                        response.status(500);
                        console.log(err);
                        response.end(err.message);
                    }
                });
            }
            response.redirect("/perfil_amigos");
        });
    }
};

function aceptRequest (request, response){
    request.daoFriend.updateState(response.locals.userEmail, request.body.petitionerEmail,1,(err)=>{
        if(err){
            response.status(500);
            console.log(err);
            response.end(err.message);
        }
        response.redirect("/perfil_amigos");
    });
};

function refuseRequest (request, response) {

    request.daoFriend.deleteFriendReq(response.locals.userEmail, request.body.petitionerEmail,2,(err)=>{
        if(err){
            response.status(500);
            console.log(err);
            response.end(err.message);
        }
        request.daoFriend.deleteFriendReq(request.body.petitionerEmail,response.locals.userEmail,2,(err)=>{
            if(err){
                response.status(500);
                console.log(err);
                response.end(err.message);
            }
            response.redirect("/perfil_amigos");
        });
    });
};

//para ver un perfil que no es del usuario registrado
function friendProfile(request, response){
    request.daoUser.getUserInfo(request.query.email, (err,result)=>{
        if(err){
            response.status(500);
            console.log(err);
            response.end(err.message);
        }
        else{
            let hoy = new Date();
            let fechaNacimiento = new Date(result.birthdate);
            let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
            response.render("./friends/friend_profile",{nombreUsuario: result.fullName, edad: edad, sexo: result.gender, imageF: result.image,score: request.session.score, scoreF: result.score, galery: result.galery,image: request.session.image});
        }
    });
};


module.exports = {
    searchFriendsByName: searchFriendsByName,
    getFriendsProfile: getFriendsProfile,
    friendRequest: friendRequest,
    aceptRequest: aceptRequest,
    refuseRequest: refuseRequest,
    friendProfile: friendProfile
};