const jwt = require('jsonwebtoken');

const HttpError = require('../models/http-error');

module.exports = (req, res, next) => {
  // check if still in OPTION request     // ana ma7tgthas hena bas momken te7tgha fe youm mn el ayam
  // if(req.method === 'OPTIONS'){
  //   return next();
  // }

  try {
    // get token from header
    const token = req.headers.authorization.split(' ')[1]; // Authorization: 'Bearer TOKEN'
    if (!token) {
      // if no token
      throw new Error('Authentication failed!');
    }
    // check token --> return a decoded token
    const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET_KEY);

    // insert userId in the request payload
    req.userData = { userId: decodedToken.userId };

    // call the next middleware in stack
    next();

  } catch (err) {
    const error = new HttpError('Authentication failed!', 401);
    return next(error);
  }
};
