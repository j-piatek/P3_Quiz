const figlet = require('figlet'); //Require de los paquetes que necesito
const chalk = require('chalk');


/**
 * Dar color a un string
 * @param msg String que queremos colorear
 * @param color
 * @returns {*} Devuelve el String msg con color indicado
 */
const colorize = (msg, color) => {

    if (typeof color !== "undefined"){
        msg = chalk[color].bold(msg);
    }
    return msg;
};

/**
 * Escribe un mensaje de log
 * @param msg setring a escribir
 * @param color
 */
const log = (msg,color) => {
    console.log(colorize(msg,color));
};

/**
 * Escribe un mensaje en log grande (letras grandes)
 * @param msg
 * @param color
 */
const biglog = (msg,color) => {
    log(figlet.textSync(msg, {horizontalLayout: 'full'}), color);
};

/**
 * Escribe el mensaje de error
 * @param emsg Texto del mensaje de error
 */
const errorlog = (emsg) => {
    console.log(`${colorize("Error", "red")}: ${colorize(colorize(emsg, "red"), "bgYellowBright")}`);
};

exports = module.exports = { //Exportamos funciones
    colorize,
    log,
    biglog,
    errorlog
};
