'use strict'

class Persona {
  constructor(nombre) {
    this.date = new Date();
    this.active = true
    this.nombre = nombre;
  }
  saluda() {
    console.log('Hola soy ', this.nombre)
  }
};

const pepe = new Persona('Pepe');
console.log(pepe);
pepe.saluda();

const maria = new Persona('maria');
console.log(maria);
maria.saluda();

class Estudiante extends Persona {
  constructor(nombre){
    super(nombre)
  }
};

const pedro = new Estudiante('Pedro');
console.log(pedro);
pedro.saluda();

const sofia = new Estudiante('Sofia');
console.log(sofia);
sofia.saluda();
console.log(pedro instanceof Persona);
console.log(sofia instanceof Estudiante);

class Jugador   {
  chuta(){
    console.log(`${this.nombre} chuto con fuerza !!!`)
  }
};

//En js la herecia doble no existe
// class Pedro extends Estudiante, Jugador {}
// TODO: Hay una forma de heredar de varias clases ?????

// / Opción 1 (La más pura para copiar el método):
const chutaMethod = Object.getOwnPropertyDescriptor(Jugador.prototype, 'chuta').value;
pedro.chuta = chutaMethod;

// Opción 2 (La asignación directa de la función, la más sencilla y compatible):
sofia.chuta = function() {
    // Aquí invocamos la lógica del método chuta de la clase Jugador,
    // asegurando que 'this' se refiere a 'sofia'.
    Jugador.prototype.chuta.call(this);
};

console.log('--- Instancia Pedro (Estudiante Mutado) ---');
console.log(pedro);
pedro.saluda();  // Heredado de Persona
pedro.chuta();
sofia.saluda();
sofia.chuta() 

console.log(pedro instanceof Persona); // true
console.log(pedro instanceof Estudiante); // true
console.log(pedro instanceof Jugador); // Esto sigue siendo false.

console.log(sofia instanceof Persona);
console.log(sofia instanceof Estudiante);
console.log(sofia instanceof Jugador);
