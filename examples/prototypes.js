'use strict';


function Persona(nombre) {
  this.date = new Date();
  this.active = true
  this.nombre = nombre;
};

Persona.prototype.saluda =  function(){
    console.log('Hola soy ', this.nombre)
  }

const peepe = new Persona('Peepe');
console.log(peepe);
peepe.saluda()

const maria = new Persona('maria');
console.log(maria)
maria.saluda();

// Crear un tipo Estudiante , qu eherede depersona,
// class Estudiante extends Persona

function Estudiante(nombre) {
  Persona.call(this, nombre)
};

Object.setPrototypeOf(Estudiante.prototype, Persona.prototype)

setTimeout(() => {
  const perdro = new Estudiante('Pedro');
console.log(perdro)
perdro.saluda()

const sonia = new Estudiante('Sofia');
console.log(sonia)
sonia.saluda();
  
}, 2000);


// Class Estudiante extends jugador,persona
function Jugador() {
  this.chuta = function(){
    console.log('e chutado')
  }
}

Object.assign(Estudiante.prototype, new Jugador());

// console.log(Estudiante.prototype);
// console.log(perdro instanceof Estudiante);
// console.log(perdro instanceof Jugador);
// console.log(perdro instanceof Persona);