'use strict';

const process = require('process');

process.on('exit', (code ) => {
  console.log('process exit event with code :' , code)
})


setTimeout(() => {
  console.log('Exit cal...')
  // process.exit(0); // Si el coidgo es 0 todo va bien
  process.exit(10); // Si es !== 0  es un error
}, 1000);