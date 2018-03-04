
const fs = require("fs");
//Nombre del fichero donde se guardan las preguntas. Fichero de texto con el JSON de quizzes.
//Al guardar el array de quizzes en un fichero tenemos persistencia, por lo que los quiz que añadamos/cambiemos
//quedaran guardados aunque salgamos del programa
const DB_FILENAME = "quizzes.json";

//Modelo de datos
exports.quizzes = [ // Array de quiz
    { question: "Capital de Italia",
        answer: "Roma"
    },
    { question: "Capital de Francia",
        answer: "París"
    },
    { question: "Capital de España",
        answer: "Madrid"
    },
    {question: "Capital de Portugal",
        answer: "Lisboa"
    }];

/**
 * Carga el contenido de fichero DB_FILENAME a la variable quizzes (array)
 * la primera vez que se ejecuta el fichero no existe y se produce error EN0ENT. En este caso
 * se salva el contenido inicial almacenado en quizzes
 * Si hay otro tipo de error se lanza una excepcion que aborta el programa
 */
const load = () => {
    fs.readFile(DB_FILENAME, (err, data) => {
        if(err){
            //La primera vez  no existe el fichero
            if(err.code === "ENOENT"){//Codigo de error que indica que no existe el fichero
                save(); //valores iniciales para crear el fichero
                return;
            }
            throw err;
        }
        let json = JSON.parse(data);
        if(json){
            quizzes = json;
        }
    });
};

/**
 * Guarda las preguntas en el fichero
 * Si se produce algun error lanza excepcion que abaorta el programa
 */
const save = () => {
    fs.writeFile(DB_FILENAME,
        JSON.stringify(quizzes), //Guarda el array en fichero en formato JSON
        err => {
            if (err) throw err;
        });
};

/**
 * Devuelve el numero total de preguntas
 * @returns {number}
 */
exports.count = () => quizzes.length;

/**
 * Añade nuevo quiz
 * @param question String pregunta
 * @param answer String respuesta
 */
exports.add = (question, answer) => {
    quizzes.push({
        question: (question || "").trim(), //trim() quita espacios por delante y por detras
        answer: (answer || "").trim()
    });
    save(); //Siempre que modificamos el array hay que guardarlo en el fichero
};

/**
 * Aactualiza el quiz situado en la posicion index del array
 * @param id quiz a actualizar
 * @param question String con la pregunta
 * @param answer string con la respuesta
 */
exports.update = (id, question, answer) => {
    const quiz = quizzes[id];
    if(typeof quiz === "undefined"){
        throw new Error (`El valor del parámetro id no es válido.`);
    }
    quizzes.splice(id, 1, {
        question: (question || "").trim(),
        answer: (answer || "").trim()
    });
    save(); //Siempre que modificamos el array hay que guardarlo en el fichero
};

/**
 * devuelve todos los quizzes existentes. Un clon del array guardado (stringify + parse para clonar)
 * @returns {any}
 */
exports.getAll = () => JSON.parse(JSON.stringify(quizzes)); // Devuelve una copia del array, no el original

/**
 * Devuelve clon del quiz almacenado en la posicion dada
 * @param id Clave pàra identificar el quiz
 * @returns {question, answer}
 */
exports.getByIndex = id => {
    const quiz = quizzes[id];
    if (typeof quiz === "undefined") {
        throw new Error (`El valor del parámetro id no es válido. `);
    }
    return JSON.parse(JSON.stringify(quiz));
};

/**
 * Elimina el quiz situado en la posicion dada
 * @param id Clave del quiz a borrar
 */
exports.deleteByIndex = id => {
    const quiz = quizzes[id];
    if (typeof quiz === "undefined"){
        throw new Error(`El valor del parámetro id no es válido.`);
    }
    quizzes.splice(id,1);
    save(); //Siempre que modificamos el array hay que guardarlo en el fichero
};

//Carga los quizzes almacenados en el fichero
load();
