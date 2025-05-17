const jwt = require('jsonwebtoken');

// Middleware checking the request has correct authentication for the route
function requireAuthentication(req, res, next) {
  const token = req.get('Authorization');
  if (!token) {
    return res.status(403).send({ "error": "missing Authorization" });
  } else {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET_KEY);
      // if we get here, success
      req.user = payload.sub;
      next();
    } catch (err) {
      // this means we failed
      return res.status(403).send({ "error": "incorrect token" });
    }
  }
}
exports.requireAuthentication = requireAuthentication;
