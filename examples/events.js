'use strict';

const EventEmitter = require('node:events');
const eventEmitter = new EventEmitter();

// eventEmitter.on('customEvent', () => {
//   console.log(Math.random())
//   console.log('--> custom event dispached');
// });

// eventEmitter.emit('customEvent');

// TODO: Crea uan funcion que cada segundo genere en numero ramdom (0, 1) si es mayor que 0.5 debe lanzar evento Mayoria
// TODO: Crea un liostener para la mayoria
// TODO: Elñ bucle debe ejecutarse 10 veces


let numero = 0;
const interval = setInterval(() => {
  const random = Math.random();
  if (random > 0.5) {
    numero ++;
    console.log(random)
    eventEmitter.emit('Mayoria');
  }
  if(numero === 2){
    // clearInterval(interval);
    process.exit(0);
  }

},1000);

eventEmitter.on('Mayoria', () => {
  console.log('Es mayoria!!!')
})
