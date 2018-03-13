const Sequelize = require('sequelize');

const {log, biglog, errorlog, colorize} = require("./out"); //Importamos funcione desde out.js

const {models} = require('./model'); //Importamos model.js para poder usar las funciones alli declaradas

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

   models.quiz.findAll() //promesa que cuando se cumple devuelve los quizzes existentes
       .each(quiz => { //toma cada elemento del array que se pasa. Tambien se podria hacer con bucle for
               log(` [${colorize(quiz.id, 'magenta')}]: ${quiz.question}`);
       })
       .catch(error => {
           errorlog(error.message);
       })
       .then(() => { //then final, pase lo que pase saca el prompt
           rl.prompt();
       });
};

/**
 * Funcion que devuelve una promesa que valida si se ha pasado
 * un parametro y convierte este en un numero entero. Devuelve
 * el valor id a usar
 *
 * Se usa en showCmd()
 */
const validateId = id => {
    return new Sequelize.Promise ((resolve, reject) => {
        if (typeof id === "undefined"){
            reject(new Error (`Falta el parametro <id>. `));
        } else {
            id = parseInt(id); //coge parte entera
            if (Number.isNaN(id)) {
                reject(new Error (`El valor del parámetro <id> no es un número`));
            }else{
                resolve(id);
            }
        }
    });
};



exports.showCmd = (rl,id) => {
    validateId(id) //si se cumple la promesa pasa a hacer lo que está en el then
        .then(id => models.quiz.findById(id)) //busco quiz por su id
        .then(quiz => {
            if (!quiz){
                throw new Error(`No existe un quiz asociado al id=${id}.`);
            }
            log(`[${colorize(quiz.id, 'magenta')}]: ${quiz.question} ${colorize('=>','magenta')} ${quiz.answer}`);
        })
        .catch(error => { //si se produce error en alguna de las promesas anteriores se captura aquí
            errorlog(error.message);
        })
        .then(() => {
            rl.prompt();
        });
};


/**
 * Funcion que convierte la llamada rl.question (callback) en una funcion basada en promesas
 * Devuelve una promesa que cuando se cumple proporciona el texto intoducido
 *
 * En vez de utilizar rl.question utilizaremos makeQuestion que lo hace en plan promesa
 * @param rl
 * @param text
 * @returns {Promise<any>}
 */
const makeQuestion = (rl, text) => {
    return new Sequelize.Promise((resolve,reject) => {
        rl.question(colorize(text, 'red'), answer => {
            resolve(answer.trim());
        });
    });
};

//MINUTO 26.50
exports.addCmd = rl => {
    makeQuestion(rl, 'Introduzca una pregunta: ')
        .then(q => {
            return makeQuestion(rl, 'Introduzca la respuesta')
            .then (a => {
                return {question: q, answer: a}; //construyo un objeto de tipo quiz
            });
        })
        .then(quiz => {
            return models.quiz.create(quiz);
        })
        .then((quiz) => {
            log(` ${colorize('Se ha añadido', 'magenta')}: ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`);
        })
        .catch(Sequelize.ValidationError, error => { //captura error de validacion
            errorlog('El quiz es erroneo:');
            error.errors.forEach(({message}) => errorlog(message));
        })
        .catch(error => {
            errorlog(error.message);
        })
        .then(() => {
            rl.prompt();
        });
};

exports.deleteCmd = (rl, id) => {
   validateId(id)
   .then(id => models.quiz.destroy({where: {id}}))//models accede a la base de datos, al modelo quiz y destroy el elemento con id pasado
   .catch(error => {
       errorlog(error.message);
   })
   .then(() => {    //sitodo va bien vuelve a sacar el prompt
       rl.prompt();
   });
};

/**MINUTO 29.20
 * Edita un quiz cambiando la pregunta y la respuesta
 * @param rl
 * @param id
 */
exports.editCmd = (rl,id) => {
    validateId(id)
    .then(id => models.quiz.findById(id))
    .then(quiz => {
        if (!quiz){
            throw new Error(`No existe un quiz asociado al id = ${id}.`);
        }

        process.stdout.isTTY && setTimeout(() => {rl.write(quiz.question)}, 0);
        return makeQuestion(rl, 'Introduzca la pregunta: ')
        .then(q => {
            process.stdout.isTTY && setTimeout(() => {rl.write(quiz.answer)}, 0);
            return makeQuestion(rl, 'Introduzca la respuesta')
            .then(a => {
                quiz.question = q;
                quiz.answer = a;
                return quiz;
            });
        });
    })
    .then(quiz => {
        return quiz.save();
    })
    .then(quiz => {
        log(` Se ha cambiado el quiz ${colorize(quiz.id,'magenta')} por: ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`);
    })
    .catch(Sequelize.ValidationError, error => { //en error pasa un array con todos los errores de validacion
        errorlog('El quiz es erroneo:');
        error.errors.forEach(({message}) => errorlog(message));
    })
    .catch(error => {
        errorlog(error.message);
    })
    .then(() => {
        rl.prompt()
    });
};

/**(a completar por el alumno)
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
    validateId(id)
        /**.then(id => models.quiz.findById(id)) //busco quiz por su id
        .then(quiz => {
            if (!quiz) {
                throw new Error(`No existe un quiz asociado al id ${id}. `);
            }
            rl.question(` ${quiz.question} `, resp => {
                if (resp.toLowerCase().trim() === quiz.answer.toLowerCase().trim()) {
                    log("CORRECTO", 'green');
                    rl.prompt();
                } else {
                    log("INCORRECTO", 'red');
                    rl.prompt();
                }
            })
        })*/


        .then(id => models.quiz.findById(id)) //busco quiz por su id
        .then(quiz => {
            if (!quiz) {
                throw new Error(`No existe un quiz asociado al id ${id}. `);
            }
            return makeQuestion(rl, ` ${quiz.question} : `)
            .then(answer => {
                    if(answer.toLowerCase().trim() === quiz.answer.toLowerCase().trim()){
                        log("CORRECTO", 'green');
                    }else{
                        log("INCORRECTO", 'red');
                    }
            })
        })


        /*.then(quiz => {
            if (!quiz) {
                throw new Error(`No hay quiz con id ${id}`);
            }

            .then(preg => {
            return makeQuestion(rl,`${preg.question}`)
                .then(resp => {
                    respuesta = resp.toLowerCase().trim();
                    if (respuesta === preg.answer.toLowerCase().trim()) {
                        return log("Correcta", 'green');
                        //rl.prompt();
                    } else {
                        return log("Incorrecta", 'red');
                        //rl.prompt();
                    }
                })
            })
        })*/

        .catch(Sequelize.ValidationError, error => { //en error pasa un array con todos los errores de validacion
            //errorlog('El quiz es erroneo: ');
            error.errors.forEach(({message}) => errorlog(message));
        })
        .catch(error => {
            errorlog(error.message);
        })
        .then(() => { //por qué no vuelve el prompt???
            rl.prompt()
        });
}



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
    let score = 0;
    var indices = [];



    const playOne = () => {
        return Sequelize.Promise.resolve()
            .then(() => {
                if (indices.length === 0) {
                    log(` No hay más preguntas.`, 'red');
                    log(` Fin del examen. Has conseguido ${score} aciertos.`);
                    return;
                } else {
                    let idr = Math.floor(Math.random() * indices.length);
                    let id = indices[idr];
                    indices.splice(idr,1);

                    return makeQuestion(rl, `${id.question} : `)
                        .then(resp => {
                            respuesta = resp.toLowerCase().trim();
                            if (respuesta === id.answer.toLowerCase().trim()) {
                                score++;
                                //console.log("Su respuesta es");
                                log('Su respuesta es CORRECTA', 'green');
                                console.log(`Llevas ${score} aciertos.`);
                                return playOne();
                            } else {
                                console.log("Su respuesta es:");
                                log('Su respuesta es: INCORRECTA', 'red');
                                console.log(`Fin del examen. Has conseguido: ${score} puntos`);
                                return;
                            }
                        })
                }
            })
    };

            models.quiz.findAll()
            .then(quiz => {
                indices = quiz;
            })

            .then(() => {
                return playOne();
            })
            .catch(error => {
                errorlog(error.message);
            })
            .then(() => {
                rl.prompt();
            });


};

    /**let score = 0; //Contador de aciertos
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
    playOne(); //Llamada a la funcion playOne() para que empiece el proceso de preguntar*/





exports.creditsCmd = rl => {
    log('Autores de la práctica:');
    log('Jakub Piatek', 'green');
    rl.prompt();
};

exports.quitCmd = rl => {
    rl.close();
};










