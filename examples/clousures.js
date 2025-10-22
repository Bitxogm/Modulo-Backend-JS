'use strict';

function creaVehiculo(marca) {
 var num = 4
 return{
  saluda: function(){
    console.log(`Soy un vehiculo de marca ${marca} y tengo ${num} Ruedas`)
  },
  ponRuedas: function(ruedas){
    num = ruedas;
  } 
 }

}

const fiat = creaVehiculo('fiat');
fiat();