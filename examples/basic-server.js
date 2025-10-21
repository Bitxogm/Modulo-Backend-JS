'use strict';

//  let http = require('http'); //ComonJS
 import http, { request } from 'http'; // ESModules

 let server = http.createServer(function(request, response) { // el serviodr se añade al eventloop
  response.writeHead(200, {'content-type': 'text/plain'}); //peticion ,,es el evento
  response.end(`Servidor HTTP basico funcionando ,,,!!!`) // se ejcuta despues de la peticion
 });

 server.listen(3000, function(){
  console.log(`✅ Server Ready on http://localhost:3000`);
 });