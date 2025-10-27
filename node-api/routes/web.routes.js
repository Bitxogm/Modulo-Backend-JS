import express from 'express';

export const router = express.Router();

router.get('/welcome', (req, res, next) => {
  const now = (new Date()).toLocaleString();
  const lang = process.env.LANG;
  const env = process.env.NODE_ENV;
  const system  = process.platform
  console.log(process.env)
  res.status(200).send(`
    <h1>Welcome Bitxo to your server</h1>
    <p>Write with Nodejs</p>
    <p>Actual Date : ${now}</p>
    <p>This page is in ${lang}</p>
    <p>Running on environment: ${env}</p>
    <p>Running on system: ${system}</p>
    `);
});

router.get('/about', (req, res, next) => {
  res.status(200).send('Welcome to Keepcoding!');
});

router.get('/', (req, res, next) => {
  console.table(req.headers)
  res.render('home.html', {
    title: 'Otaku & KeepCoding Web Bootcamp XIX',
    message: 'We\ re comigng soon..',
    
  });
});

router.get('/test', (req, res, next) => {
  const now = (new Date()).toLocaleString();
  const lang = process.env.LANG;
  const env = process.env.NODE_ENV;
  const system  = process.platform
  res.render('test.html', {
    title: 'Test Page',
    message: 'Welcome to the Home Page',
    env: env,
    now: now,
    lang: lang,
    system: system,
    
  });
});

router.get('/comming-soon', (req, res, next) => {
  res.render('home.html', {
    title: 'KeepCoding Comming sonn...',
    message: 'We\'re Coming Soon...',
  });
});

router.get('error_1', (req, res, next) => {
  res.render('error_1.html', {
    title: 'Página de Error 1',
    message: 'Esta es una página de error de ejemplo.',
  });
});

router.get('/error500', (req, res, next) => {
  const err = new Error('Error forzado para probar el middleware de errores');
  err.status = 500;
  next(err);
});


