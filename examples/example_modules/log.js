'use strict';
console.log(`Funcion log iniciada`)
module.exports.log = function (text) {
  console.log(`[MY APP] - ${text}`);
}

module.exports.error = function (text) {
  console.error(`[MY APP] -ERROR --- ${text}`);
}
