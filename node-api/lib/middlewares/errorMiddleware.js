export function serverErrorHandler(error, req, res, next) {
  console.log(error);
  res.status(500);
  res.render('error500.html', {
    title: ' 👊🏻 500 Internal Server Error',
    message: 'Something went wrong on the server.',
  })
};

export function notFoundErrorHandler(req, res, next) {
  res.status(404)
  res.render('error.html',{
    title: ' ⬇️ 404 Not Found',
    message: `The requested URL  was not found on this server. , requested URL: ${req.originalUrl}`,
  })
};

