//MINUTO 41:30

const {log, biglog, errorlog, colorize} = require("./out"); //Importamos funcione desde out.js
const model = require('./model'); //Importamos model.js para poder usar las funciones alli declaradas

const quizzes = require('./model');
/**
 * Muestra la ayuda
 */
exports.helpCmd = rl => {
    log("Comandos:");
    log(" h|help - Muestra esta ayuda.");
    log(" list - Listar los quizzies existentes.");
    log(" show <id> - Muestra la pregunta y la respueste del quiz indicado.");
    log(" add - Añadir un nuevo quiz interactivamente.");
    log(" delete <id> - Borrar el quiz indicado.");
    log(" edit <id> - Editar el quiz indicado.");
    log(" test <id> - Probar el quiz indicado.");
    log(" p|play - Jugar a preguntar aleatoriamente todos los quizzies.");
    log(" credits - Créditos.");
    log(" q|quit - Salir del programa.");
    rl.prompt();
};


exports.listCmd = rl => {
    model.getAll().forEach((quiz,id) =>{
        log(` [${colorize(id, 'magenta')}]: ${quiz.question}`);//log sirve para imprimir por pantalla
    });                                                     //forEach() recorre el array
                                                            //Para cada pregunta imprime id y la pregunta
   rl.prompt();
};

exports.showCmd = (rl,id) => {
    if (typeof id === "undefined"){ //Si no pasan id --> mensaje de error
        errorlog(`Falta el parámetro id.`);
    }else{
        try{
            const quiz = model.getByIndex(id);
            log(` [${colorize(id, `magenta`)}]: ${quiz.question} ${colorize('=>','magenta')} ${quiz.answer}`);
        }catch(error){
            errorlog(error.message);
        }
    }

    rl.prompt();

};

//Minuto 53
exports.addCmd = rl => {
    rl.question(colorize(' Introduzca una pregunta: ', 'red'), question => { //Espera a que se teclee la respuesta y luego llama a question
        rl.question(colorize(' Introduzca la respuesta ', 'red'), answer => {
            model.add(question,answer);
            log(` ${colorize('Se ha añadido','magenta')}: ${question} ${colorize('=>','magenta')} ${answer}`);
            rl.prompt(); //IMPORTANTE meter la llamada a prompt() aqui en lugar de fuera
        });
    });
};

exports.deleteCmd = (rl, id) => {
    if (typeof id === "undefined"){ //Si no pasan id --> mensaje de error
        errorlog(`Falta el parámetro id.`);
    }else{
        try{
            model.deleteByIndex(id);
        }catch(error){ //Si el try da algun problema se captura aqui
            errorlog(error.message);
        }
    }
    rl.prompt();
};

/**
 * Edita un quiz cambiando la pregunta y la respuesta
 * @param rl
 * @param id
 */
exports.editCmd = (rl,id) => {
    if (typeof id === "undefined"){
        errorlog('Falta el parámetro id.');
        rl.prompt();
    }else{
        try{
            const quiz = model.getByIndex(id);
            process.stdout.isTTY && setTimeout(() => {rl.write(quiz.question)}, 0); //Deja escrita la pregunta para poder editarla
            rl.question(colorize(' Introduzca una pregunta: ', 'red'), question => {
                process.stdout.isTTY && setTimeout(() => {rl.write(quiz.answer)},0); //Deja escrita la respuesta para poder editarla
                rl.question(colorize(' Introduzca la respuesta ', 'red'), answer => {
                    model.update(id, question, answer); //actualiza el array con nueva pregunta y respuesta
                    log(` Se ha cambiado el quiz ${colorize(id, 'magenta')} por: ${question} ${colorize(`=>`, 'magenta')} ${answer}`);
                    rl.prompt();
                });
            });
        } catch (error){
        errorlog(error.message);
        rl.prompt();
        }
    rl.prompt();
    };
};

/**MINUTO 1:20:00 (a completar por el alumno)
 * Hace una pregunta para saber si el usuario sabe la respuesta
 * @param rl
 * @param id
 *
 * Esqueleto de la funcion
 * resp => {
 *  resp === quiz.answer
 *  CORRECTO
 *  INCORRECTO
 *  prompt
 */
exports.testCmd = (rl, id) => {
    if (typeof id === "undefined"){
        errorlog('Falta el parámetro id.');
        rl.prompt();
    }
    else{
        try {
            const quiz = model.getByIndex(id);

            rl.question(colorize(` ${quiz.question}? `, 'red'), resp => {
                    const respuesta = resp.toLowerCase().trim();
                    if (respuesta === quiz.answer.toLowerCase()){
                        log("Correcta", 'green');
                    } else {
                        log("Incorrecta", 'red');
                    }
                    rl.prompt(); //Hace que aparezca el prompt >quiz automaticamente
            });
        }
        catch (error){
         errorlog(error.message);
         rl.prompt();
         }
    //rl._prompt
    };

};

/** exports.playCmd = rl => {
    let score = 0 //cuenta aciertos
    let toBeResolved = []; //array con ids de las preguntas que existen
    for meter ids existentes

    bucle escoge preguntas
    const playOne = () =>
    if (vacio array toBeresolved){ mesnaje de que no hay preguntas, puntos obtenidos; prompt
    }else{
        let id = pregunta al azar del array Math.random() entre 0 y 1 y multiplico por tamaño de array; quitarla del array

        let quiz = model saco pregunta asociada al id

        rl.question (hace pregunta) (quiz.question, resp => {
            ver si la resp === quiz.answer.toLowerCase
            bien -> mensaje bien! y score +1 y volver a preguntar llamar a playOne() de forma recursiva

            si esta mal (else) mal ->mensaje y sale el prompt (fin del examen)
        })
    }
   */
/**exports.playCmd= rl => {
    let score = 0; //Contador de aciertos
    let toBeResolved = [];
    let nQuestions = model.getAll();

    for (i = 0; i < nQuestions ; i++) {
        toBeResolved.push(i);//array con los indices de las preguntas
        //log(`${toBeResolved[i]}`, `magenta`);
    }


    const playOne = () => {
        if (nQuestions.length = 0) {
                log(' No hay más preguntas. Fin del examen. Aciertos:', 'yellow');
                biglog(` ${score}`, `magenta`);
                rl.prompt();
        } else {
            let id = Math.floor(Math.random() * toBeResolved.length); //Devuelve numero id aleatorio del array
            toBeResolved.splice(id, 1); //splice(y,x) elimina x elementos de la posicion y del array

            let quiz = model.getByIndex(id);
            rl.question(colorize(` ${quiz.question}? `, 'red'), resp => {
                const respuesta = resp.toLowerCase().trim();
                if (respuesta === quiz.answer.toLowerCase().trim()) {
                    score++;
                    biglog('Correcta', `green`);
                    playOne();
                } else {
                    biglog(`Incorrecta. Fin del examen. Aciertos:`, `red`);
                    biglog(` ${score}`, `magenta`);
                    rl.prompt();
                }

        });
        }

        playOne(); //Llamada a la funcion playOne() para que empiece el proceso de preguntar
        rl.prompt();
    };
};*/

exports.playCmd = rl => {
    let score = 0; //Contador de aciertos
    let toBeResolved = []; //array con ids de los quiz existentes
    let quizzes = model.getAll();


    for (let i = 0; i < quizzes.length; i++) {
        toBeResolved.push(i);
    }

    const playOne = () => {


        if (quizzes.length === 0) {
            console.log("No hay nada más preguntas.");
            console.log(`Fin del examen. Aciertos: ${score}`);
            rl.prompt();
        } else {
            let id = Math.floor(Math.random() * quizzes.length); //Math.floor() devuelve el máximo entero menor o igual a un numero

            let quiz = quizzes[id];
            colorize(` ${quiz.question}? `, 'red')

            rl.question(colorize(` ${quiz.question} ?`, 'red'), respuesta => {

                if (respuesta.trim().toLowerCase() === quiz.answer.toLowerCase()) {
                    score++;
                    console.log("Su respuesta es:");
                    log('CORRECTA', 'green');
                    console.log(`Llevas ${score} aciertos.`);
                    quizzes.splice(id, 1); // Eliminar el quiz del array de preguntas restantes
                    playOne();

                } else {
                    console.log("Su respuesta es:");
                    log('INCORRECTA', 'red');
                    console.log(`Fin del examen. Has conseguido: ${score} puntos`);
                    rl.prompt();
                }

            });
        }
    }
    playOne(); //Llamada a la funcion playOne() para que empiece el proceso de preguntar
};


exports.creditsCmd = rl => {
    log('Autores de la práctica:');
    log('Jakub Piatek', 'green');
    rl.prompt();
};

exports.quitCmd = rl => {
    rl.close();
};










