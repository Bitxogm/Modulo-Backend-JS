'use strict';

function Fruta(nombre) {
  this.nombre = nombre;
  // this.saluda = function(){
  //   console.log(`hey soy `, this.nombre)
  // }
  this.saluda = () => {
    console.log(`hey soy `, this.nombre)
  }
};

const limon = new Fruta('limon');
console.log(limon);
limon.saluda();

setInterval(limon.saluda.bind(limon), 4000);

const funcioonSaludar = limon.saluda.bind(limon);
funcioonSaludar();