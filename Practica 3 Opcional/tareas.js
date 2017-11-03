/**
 * ============================
 * Ejercicio entregable 3.
 * Funciones de orden superior.
 * ============================
 * 
 * Puedes ejecutar los tests ejecutando `mocha` desde el directorio en el que se encuentra
 * el fichero `tareas.js`.
 */
"use strict";

let listaTareas = [
  { text: "Preparar práctica PDAP", tags: ["pdap", "practica"] },
  { text: "Mirar fechas congreso", done: true, tags: [] },
  { text: "Ir al supermercado", tags: ["personal"] },
  { text: "Mudanza", done: false, tags: ["personal"] },
];

/**
 * Devuelve las tareas de la lista de entrada que no hayan sido finalizadas.
 */
function getToDoTasks(tasks) {
  /* Implementar */
    return tasks.filter(n=>n.done === undefined || n.done===false );
}
//console.log(getToDoTasks(listaTareas));

/**
 * Devuelve las tareas que contengan el tag especificado
 */
function findByTag(tasks, tag) {
    //Preguntar si solo tiene que devolver si tiene un solo tag
  /* Implementar */
    return tasks.filter(n=>n.tags.indexOf(tag) !== -1);
}
//console.log(findByTag(listaTareas,"pdap"));

/**
 * Devuelve las tareas que contengan alguno de los tags especificados
 */
function findByTags(tasks, tags) {
  /* Implementar */
    return tasks.filter(n=>n.tags.some(n=>tags.indexOf(n) !== -1) === true);
}
//let prueba = ["pdap", "personal"];
//console.log(findByTags(listaTareas,prueba));

/*Devuelve las tareas acabadas*/
function getDoneTasks(tasks) {
  /* Implementar */
    return tasks.filter(n=>n.done === true );
}

/**
 * Devuelve el número de tareas finalizadas
 */
function countDone(tasks) {
  /* Implementar */
    return getDoneTasks(tasks).reduce((acum,n) => acum+1,0);
}

//console.log(countDone(listaTareas));

/**
 * Construye una tarea a partir de un texto con tags de la forma "@tag"
 */
function createTask(text) {
  /* Implementar */
    let elem = {
        text:"",
       tags: []
    };
    let patron = /@+[a-z]+/gi;
    let dato = patron.exec(text);
    let i = 0;
    while(dato != null){
        elem.tags.push(dato[0].replace(/@/gi,''));  //lo añado al objeto
        text.replace(/@+[a-z]+/i,''); // recorto la cadena
        dato = patron.exec(text); // me llevo el siguiente tag
        i++;
    }
    elem.text = text.replace(/@+[a-z]+/gi,'').trim();
    return elem;
}
console.log(createTask("Esto es una cadena @de @texto"));

/*
  NO MODIFICAR A PARTIR DE AQUI
  Es necesario para la ejecución de tests
*/
module.exports = {
  getToDoTasks: getToDoTasks,
  findByTag: findByTag,
  findByTags: findByTags,
  countDone: countDone,
  createTask: createTask
}