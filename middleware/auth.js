const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function(request, response, next) {
  // Get token from header
  const token = request.header('x-auth-token');

  // Check if no token
  if (!token) {
    return response.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, config.get('jwtSecret'));

    request.user = decoded.user;

    next();
  } catch (error) {
    response.status(401).json({ msg: 'Token not valid' });
  }
};
