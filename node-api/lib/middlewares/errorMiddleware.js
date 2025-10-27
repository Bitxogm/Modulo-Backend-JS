export function serverErrorHandler(error, req, res, next) {
  console.log("[ERROR]", error.message);
  console.error(error.stack);
  if (req.headers['accept']?.includes('text/html')) {
  res.status(500).render(
    'error500.html', {
    title: ' 👊🏻 500 Internal Server Error',
    message: 'Something went wrong on the server.',
  });
 } else {
   res.status(500).json( {Error: ' ⛔ Internal Server Error'} );
 }
};

export function notFoundErrorHandler(req, res, next) {
  if (req.headers['accept']?.includes('text/html')) {
    res.status(404).render('error.html', {
      title: ' ⬇️ 404 Resource Not Found',
      message: `The requested URL  was not found on this server. , requested URL: ${req.originalUrl}`,
    });
  }else
   res.status(404).json({ Error: ' ⛔ Resource Not Found'} );
};



