
function getLogin(request, response){
    response.status(200);
    response.render("./login/login",{errors:null,lastInfo:null});
};

function postLogin(request, response){
    
    request.checkBody("userEmail", "Formato email incorrecto").isEmail();
    request.checkBody("password","La contraseña no es válida").isLength({ min: 4, max: 10 });

    request.getValidationResult().then(result => {
        // El método isEmpty() devuelve true si las comprobaciones
        // no han detectado ningún error
        if (result.isEmpty()) {
            request.daoUser.isUserCorrect(request.body.userEmail, request.body.password, (err,userExits)=>{

                if(err){
                    response.status(500);
                    console.log(err);
                    response.end(err.message);
                }
                if(userExits){
                    request.session.currentUser = request.body.userEmail;
                    response.redirect("/perfil_principal");
                }
                else{
                    response.setFlash("Dirección de correo y/o contraseña no válidos");
                    response.redirect("/login");
                }
            });
        } else {
            response.render("./login/login",{errors: result.array(),lastInfo:request.body});
        }
    });
};

function getNewUser(request, response){
    response.render("./login/nuevo_usuario",{errors:null,lastInfo:null});
};

function postNewUser(request, response){

    request.checkBody("userEmail", "Formato email incorrecto").isEmail();
    request.checkBody("password","La contraseña no es válida").isLength({ min: 4, max: 10 });
    request.checkBody("fullName", "Nombre no introducido").notEmpty();
    request.checkBody("fullName","Nombre de usuario no válido").matches(/[A-Z0-9]\s?/i);
    request.checkBody("birthdate", "Fecha de nacimiento debe ser anterior a la actual").isBefore();
    request.checkBody("gender","Debes seleccioar un sexo").notEmpty();
    request.getValidationResult().then(result => {
        // El método isEmpty() devuelve true si las comprobaciones
        // no han detectado ningún error
        if (result.isEmpty()) {
            request.daoUser.existsUser(request.body.userEmail, (err,userExists)=>{
                if(err){
                    response.status(500);
                    console.log(err);
                    response.end(err.message);
                }
                else if (!userExists){
                    let fileN = null;
                    if(request.file){
                        fileN = request.file.filename;
                    }
                    else{
                        if(request.body.gender === "M"){
                            fileN = "noPerfilHombre.jpg";
                        }
                        else if( request.body.gender === "F"){
                            fileN = "noPerfilMujer.jpg"
                        }
                        else{
                            fileN = "noPerfilOtro.jpg"
                        }
                    }
                    request.daoUser.insertUser(request.body.userEmail, request.body.password,
                        request.body.fullName, request.body.gender, request.body.birthdate,fileN, (err)=>{
                            if(err){
                                response.status(500);
                                console.log(err);
                                response.end(err.message);
                            }
                        });
                    request.session.currentUser = request.body.userEmail;
                    response.redirect("/perfil_principal");          
                }
                else{
                    response.setFlash("Ya hay una cuenta con ese correo!");
                    response.redirect("/nuevo_usuario");
                }
            }); 
        }
        else{
            response.render("./login/nuevo_usuario",{errors: result.array(),lastInfo:request.body});
        }
    });
};

function getProfile(request,response){
    
    request.daoUser.getUserInfo(response.locals.userEmail,(err,infoUser)=>{
        if(err || infoUser === undefined){
            response.status(500);
            console.log(err);
            response.end(err.message);            
        }
        else{
            request.session.fullName = infoUser.fullName;
            request.session.birthdate = infoUser.birthdate;
            request.session.gender = infoUser.gender;
            request.session.password = infoUser.password;
            request.session.image = infoUser.image;
            request.session.score = infoUser.score;
            let hoy = new Date();
            let fechaNacimiento = new Date(infoUser.birthdate);
            let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
            response.render("./profile/perfil_principal",{nombreUsuario: infoUser.fullName, edad: edad, sexo: infoUser.gender,
                image: infoUser.image,score: infoUser.score,scoreF: infoUser.score, galery: infoUser.galery, imageF: null }); 
        }
    });
};

function getModifyUser(request, response){
    response.render("./profile/perfil_modificar",{currentEmail: response.locals.userEmail, currentPassword: request.session.password ,
        currentName:request.session.fullName,currentBirthdate:request.session.birthdate,currentGender: request.session.gender,score: request.session.score,errors:null, image: request.session.image});
};

function postModifyUser(request, response){
    request.checkBody("userEmail", "Formato email incorrecto").isEmail();
    request.checkBody("password","La contraseña no es válida").isLength({ min: 4, max: 10 });
    request.checkBody("fullName", "Nombre no introducido").notEmpty();
    request.checkBody("fullName","Nombre de usuario no válido").matches(/[A-Z0-9]\s?/i);
    request.checkBody("birthdate", "Fecha de nacimiento debe ser anterior a la actual").isBefore();
    request.getValidationResult().then(result => {
        // El método isEmpty() devuelve true si las comprobaciones
        // no han detectado ningún error
        if (result.isEmpty()) {

            request.daoUser.existsUser(request.body.userEmail, (err,userExists)=>{
            if(err){
                response.status(500);
                console.log(err);
                response.end(err.message);
            }
            else if (request.body.userEmail === response.locals.userEmail || !userExists){
                let newInfo = {
                    fullName : request.body.fullName,
                    email : request.body.userEmail,
                    password : request.body.password,
                    birthdate : request.body.birthdate,
                    gender : request.body.gender
                };
                request.daoUser.getUserImageName(response.locals.userEmail,(err,image)=>{
                    if(request.file){
                        newInfo.image = request.file.filename;
                    }
                    else{
                        if(newInfo.gender === "M" && image === "noPerfilMujer.jpg" || image === "noPerfilOtro.jpg" ){
                            newInfo.image = "noPerfilHombre.jpg";
                        }
                        else if(newInfo.gender === "F" && image === "noPerfilHombre.jpg" || image === "noPerfilOtro.jpg"){
                            newInfo.image = "noPerfilMujer.jpg"
                        }
                        else if(image === "noPerfilHombre.jpg" || image === "noPerfilMujer.jpg"){
                            newInfo.image = "noPerfilOtro.jpg"
                        }
                    }
                    request.daoUser.updateUser(response.locals.userEmail, newInfo, (err)=>{
                        if(err){
                            response.status(500);
                            console.log(err);
                            response.end(err.message);
                        }
                        request.session.currentUser = newInfo.email;
                        request.session.image = newInfo.image;
                        response.redirect("/perfil_principal");
                    });   
                });
            }
            else{
                response.setFlash("Ya hay una cuenta con ese correo!");
                response.redirect("/perfil_modificar");
            }    
            });
        }
        else{
            response.render("./profile/perfil_modificar",{currentEmail: request.body.userEmail, currentPassword: request.body.password ,
                currentName:request.body.fullName,currentBirthdate:request.body.birthdate,currentGender: request.body.gender,score: request.session.score,errors: result.array(),image: request.session.image});
        }
    });
};

function postAddPhoto(request,response){
    if((request.session.score - 100) < 0){
        response.setFlash("No dispones de puntos suficientes");
        response.redirect("/perfil_principal");
    }
    else{
        if (request.file){
            request.daoUser.updateScore(response.locals.userEmail, -100,(err)=>{
                if(err){
                    response.status(500);
                    console.log(err);
                    response.end(err.message);
                }
                request.daoUser.insertPhoto(response.locals.userEmail, request.file.filename, (err)=>{
                    if(err){
                        response.status(500);
                        console.log(err);
                        response.end(err.message);
                    }
                    request.session.score -= 100;
                    response.setFlash("Imagen añadida correctamente");
                    response.redirect("/perfil_principal");   
                });
            });
        }
        else{
            response.setFlash("Selecciona una imagen");
            response.redirect("/perfil_principal");
        }
    }
};

function logout (request, response){
    request.session.destroy();
    response.redirect("/login");
};

module.exports = {
    getLogin : getLogin,
    postLogin : postLogin,
    getNewUser: getNewUser,
    postNewUser: postNewUser,
    getProfile: getProfile,
    getModifyUser: getModifyUser,
    postModifyUser: postModifyUser,
    postAddPhoto:postAddPhoto,
    logout: logout
}