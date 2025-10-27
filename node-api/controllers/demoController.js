import path from 'path';

export function getDemo(req, res, next) {
  // Envia un Content_type application/json
  res.status(200).send({ message: 'This is a demo API endpoint', });

  //Envia Content-Type application/octet-stream(bianrio ?)
  res.status(200).send(new Buffer('This is a demo API endpoint'));

  //Envia Conten:Type text/html
  res.status(200).send('<p>Hi bitxo</p>');
};

export function getDownload(req, res, next) {
  res.status(200).download('../doc/BackendJS.pdf', 'BackendJS_Keepcoding.pdf');
};

export function getFile(req, res, next) {
  const dirname = import.meta.dirname;  // Si estamos en CommonJS usar __dirname
  const filePath = path.join(dirname, '../../doc/BackendJS.pdf');
  console.log(dirname);
  res.status(200).sendFile(filePath);
};

export function getRedirection(req, res, next) {
  res.redirect('/api/health');
};

export function getEnd(req, res, next) {
  res.end();
};

export function getParams(req, res, next) {
  console.log(req.params);
  const id = req.params.id;
  res.status(200).json({ id });
};

export function getOneParamOptional(req, res, next) {
  console.log(req.params);
  const id = req.params.id;
  res.status(200).json({
    statusbar: 'ok',
    params: req.params.id || null,
  });
};

export function getMultipleParams(req, res, next) {
  console.log(req.params);
  res.status(200).json(req.params);
};
