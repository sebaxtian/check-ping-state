const ping = require('ping');
const nodemailer = require('nodemailer');
const moment = require('moment');
const gmail = require("./credenciales/gmail.js");

// Lista de servidores objetivo para realizar peticiones
let targetServers = ['164.132.176.183', '164.132.176.179'];

// Funcion que consulta el estado de una solicitud de PING a un servidor
function checkState(server) {
    ping.promise.probe(server).then(response => {
        //console.log('response: ' + Object.keys(response));
        console.log('----------------------------------------------------');
        console.log('response.host: ' + response.host);
        console.log('response.alive: ' + response.alive);
        console.log('response.numeric_host: ' + response.numeric_host);
        console.log('----------------------------------------------------');
        // Valida si el servidor responde, esta vivo
        if(!response.alive) {
            console.log('El servidor no responde, no esta vivo.');
            // Configurar mensaje para notificar mediante un Email
            let para = 'sebaxtianrioss@gmail.com';
            let asunto = 'Check PING State';
            let mensaje = 'La peticion al servidor no responde, no esta vivo:\n\n';
            mensaje += 'Hora Local: ' + moment().format('MMMM Do YYYY, h:mm:ss a') + '\n\n';
            mensaje += 'response.host: ' + response.host + '\n';
            mensaje += 'response.alive: ' + response.alive + '\n';
            mensaje += 'response.output: ' + response.output + '\n';
            mensaje += 'response.time: ' + response.time + '\n';
            mensaje += 'response.min: ' + response.min + '\n';
            mensaje += 'response.max: ' + response.max + '\n';
            mensaje += 'response.avg: ' + response.avg + '\n';
            mensaje += 'response.stddev: ' + response.stddev + '\n';
            mensaje += 'response.numeric_host: ' + response.numeric_host + '\n';
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
