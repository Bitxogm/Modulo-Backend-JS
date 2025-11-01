
const saluda = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve('hola despues de un segundo')
    reject('error despues de un segundo')
  }, 2000);
})

saluda.then(res => console.log(res))
  .catch(err => console.log(`Error`, err));

//TODO: crear una promeasa de azar con un 20% de posibilidades de fallar devolver valor tras 2 segundos

const azar = new Promise((resolve, reject) => {
  const numRandom = Math.random()
  console.log(numRandom)
  setTimeout(() => {
    if (numRandom > 0.1) {
      resolve(`Felicidades has ganado ${numRandom.toFixed(2)}$`)
    } else {
      reject(`Lo siento has perdido ${numRandom.toFixed(2)}$`)
    }
  }, 2000);
})
azar.then(res => console.log(res))
  .catch(err => console.log(`Error : ${err}`))

// Encadenar promesas
function paso1() {
  return new Promise((res, rej) => {
    res('paso 1 ok')
  })
}

function paso2() {
  return Promise.resolve('paso 2 resuelto')
}

function paso3() {
  return Promise.reject('paso 3 rechazado')
}
paso1()
  .then(res => {
    console.log(res);
    return paso2()
  })
  .then(res => {
    console.log(res);
    return paso3()
  })
  .then(res => {
    console.log(res)
  })
  .catch(err => {
    console.log(err)
  })
  .finally(() => {
    console.log('final promesas anidadas')
  })

Promise.all([
  paso1(),
  paso2(),
  saluda,
  azar.then(),
  saluda.then(),
  // paso3()
])
  .then(result => {
    console.log(result)
  })
  .catch(err => {
    console.log('Error fatal', err)
  })

Promise.race([
  saluda,
  azar
])
  .then(res => console.log(res))
  .catch(err => console.log(err))

// async function paso1() {
//   return `Paso1 resolved`
// }
// async function paso1() {
//   return `Paso1 resolved`
// }
// async function paso1() {
//   return `Paso2 resolved`
// }
// async function paso1() {
//   return `Paso3 resolved`
// }
// async function paso1() {
//   return `Paso3 resolved`
// }

async function ejecutaPasos() {
  try {
    console.log(await paso1())
    console.log(await paso2())
    console.log(await paso3())
  } catch (err) {
    console.log(err)
  }
}
ejecutaPasos();

//Saluda tres veces

async function saluda3Veces() {
  //! No se puede hacer un .map() con un await ,pero si con un for loop
  try {
    for (let i = 0; i < 3; i++) {
      const mss = await saluda;
      console.log(mss)
    }
  } catch (err) {
    console.log(err)
  }
}
setTimeout(() => {
  saluda3Veces()
}, 2000)

saluda3Veces();