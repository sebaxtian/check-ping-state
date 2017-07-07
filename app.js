const ping = require('ping');
const nodemailer = require('nodemailer');
const moment = require('moment');
const gmail = require("./credenciales/gmail.js");
const fs = require('fs');


// Path del directorio de archivos Log
let pathDirLogs = './logs/';
// Archivo de Log
let logFile = 'check-0.log';
// Configuracion de archivo Log
loadFileLog();


// Lista de servidores objetivo para realizar peticiones
let targetServers = ['164.132.176.183', '164.132.176.179'];

// Funcion que consulta el estado de una solicitud de PING a un servidor
function checkState(server) {
    ping.promise.probe(server, {timeout: 10}).then(response => {
        //console.log('response: ' + Object.keys(response));
        // Configura mensaje para Log
        let mensaje = '----------------------------------------------------\n';
        mensaje += 'Hora Local: ' + moment().format('MMMM Do YYYY, h:mm:ss a') + '\n';
        mensaje += 'response.host: ' + response.host + '\n';
        mensaje += 'response.alive: ' + response.alive + '\n';
        mensaje += 'response.numeric_host: ' + response.numeric_host + '\n';
        mensaje += '----------------------------------------------------\n\n';
        console.log(mensaje);
        // Escribe sobre archivo de Log
        saveLog(mensaje);
        // Valida si el servidor responde, esta vivo
        if(!response.alive) {
            console.log('El servidor no responde, no esta vivo.');
            // Configurar mensaje para notificar mediante un Email
            let para = 'sebaxtianrioss@gmail.com';
            let asunto = 'Check PING State';
            mensaje += '\n\nPor favor valide si el servidor esta activo.\n\n';
            // Envia el mensaje
            sendEmail(para, asunto, mensaje);
        }
    });
}

// Funcion que envia un email usando el API de Gmail
function sendEmail(para, asunto, mensaje) {
    // Nodemailer
    let transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            type: 'OAuth2',
            user: gmail.auth.user,
            clientId: gmail.auth.clientId,
            clientSecret: gmail.auth.clientSecret,
            refreshToken: gmail.auth.refreshToken
        }
    });
    let mailsolicitante = {
        from: gmail.auth.name + ' <' + gmail.auth.user + '>',
        bcc: para,
        subject: asunto,
        text: mensaje
    };
    transporter.sendMail(mailsolicitante, function (error, success) {
        if(error) {
            console.log("Error al enviar Email [ERROR::Nodemailer]");
        } else {
            console.log("Exito al enviar Email");
        }
    });
}

// Funcion que configura el archivo de Log que sera escrito
function loadFileLog() {
    // Archivos del directorio de Logs ordenados por fecha de modificacion
    let logFiles = fs.readdirSync(pathDirLogs);
    logFiles.sort(function(a, b) {
        return fs.statSync(pathDirLogs + a).mtime.getTime() - fs.statSync(pathDirLogs + b).mtime.getTime();
    });
    // Obtiene el ultimo archivo modificado
    logFile = logFiles[logFiles.length - 1]
    // Valida si existe el archivo
    if(logFile != null) {
        console.log('Ultimo archivo modificado: ' + logFile);
        // Validar el tamanio del archivo
        let stats = fs.statSync(pathDirLogs + logFile);
        let fileSizeInBytes = stats.size;
        console.log('File Size: ' + fileSizeInBytes + ' Bytes');
        // 524288 == 0.5 MB
        if(fileSizeInBytes > 524288) {
            // El archivo es demasiado grande, se crea un nuevo archivo de log
            var res = logFile.split("-")[1].split(".")[0];
            res++;
            logFile = 'check-' + res + '.log';
        }
    } else {
        logFile = 'check-0.log';
    }
}

// Funcion que escribe un mensaje sobre un archivo de Log
function saveLog(mensaje) {
    // Escribe el mensaje sobre el archivo de Log
    fs.appendFile(pathDirLogs + logFile, mensaje, function (err) {
        if (err) console.log('Error al escribir mensaje sobre archivo de Log ' + logFile);
        console.log('Exito al escribir mensaje sobre archivo de Log ' + logFile);
    });
}

// Funcion que ejecuta el programa
function init() {
    console.log('');
    console.log('check-ping-state');
    console.log(moment().format('MMMM Do YYYY, h:mm:ss a'));
    console.log('Inicia la consulta de todos los servidores:');
    console.log('');
    // Consulta el estado de todos los sitios web
    for(let i = 0; i < targetServers.length; i++) {
        // Procesos asincronos
        checkState(targetServers[i]);
    }
}

// Inicia la ejecucion del programa
init();


// Pruebas
/*
checkState(targetServers[0]);
checkState(targetServers[1]);
checkState('www.google.com.co');
checkState('192.168.0.129');
*/
