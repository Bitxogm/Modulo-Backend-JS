'use strict';



//
function escribeTras2segundos(texto, callback) {
  setTimeout(() => {
    console.log(texto);
    callback()
  }, 2000);
}

// escribeTras2segundos(`hola`, function () {
//   escribeTras2segundos(`hola tras 2 segundos`, function () {
//     console.log(`fingdfdf`);
//   });
// }); 



// TODO:
//Repetir llamada a la funcion varias veces un total de n veces
//Es posible con callbacks??
function repiteNveces(times) {
  for (let i = 0; i < times; i++) {
    escribeTras2segundos(`hola `, function () {
      escribeTras2segundos(`hola tras 2 segundos`, function () {
      });
    });
  }
};
repiteNveces(5);


function repiteNvecesSecuencial(numVeces, actual = 1) {
  if (actual > numVeces) {
    console.log("¡Todas las repeticiones han terminado!");
    return;
  }

  escribeTras2segundos(`Repetición numero: ${actual} (aparece a los ${actual * 2} segundos)`, function () {
    repiteNvecesSecuencial(numVeces, actual + 1);
  });
};

console.log("Iniciando la secuencia...");
repiteNvecesSecuencial(3); 
        
