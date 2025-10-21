'use strict';

function Fruta(nombre) {
  this.nombre = nombre;
  this.saluda = function(){
    console.log(`hey soy `, this.nombre)
  }
};

const limon = new Fruta('limon');
console.log(limon);
limon.saluda();