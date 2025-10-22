'use strict';



//
function escribeTras2segundos(texto, callback) {
  setTimeout(() => {
    console.log(texto);
    callback()
  }, 500);
};

function repeatNumTimes(times, count= 1) {
  if(count > times){
    console.log(`Finish counting!!!!!`)
    return;
  }
  escribeTras2segundos(`Total loops : ${count } --- Total time: ${count * 2} seconds`, function(){
    repeatNumTimes(times, count + 1);
  })
};

console.log(`for loops......`)
repeatNumTimes(10);

// escribeTras2segundos(`hola`, function () {
//   escribeTras2segundos(`hola tras 2 segundos`, function () {
//     console.log(`fingdfdf`);
//   });
// }); 

function serie(n, funcionCB){
  
}

// TODO:
//Repetir llamada a la funcion varias veces un total de n veces
//Es posible con callbacks??

function loopTime(texto, tiempoMS, callback){
  setTimeout(() => {
    console.log(texto);
    callback()
  }, tiempoMS);
}

function repiteNveces(times,tiempoMS,  count= 1) {
  while(count > times){
    console.log(`Finish counting!!!!!`)
    return;
    }   
    loopTime(`Total loops : ${count } --- Total time: ${count * 2} seconds`, tiempoMS, function(){
      repiteNveces(times,tiempoMS, count + 1);
    })
  }

console.log(`While looops.....`)
repiteNveces(5, 2000);



        
