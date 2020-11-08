const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const HttpError = require('../models/http-error');
const User = require('../models/user-model');
require('dotenv/config');


/*
 * @route     GET api/users/
 * @desc      get all users
 * @access    public
 */


const getUsers = async (req, res, next) => {
  // get the user
  let users;
  try {
    users = await User.find({}, '-password');   // get everything except password
  } catch (err) {
    const error = new HttpError(
      'Fetching users failed, please try again later.',
      500
    );
    return next(error);
  }

  // send it back to frontend
  res.json({ users: users.map(user => user.toObject({ getters: true })) });
};


/*
 * @route     POST api/users/signup
 * @desc      add a new user
 * @access    public
 */


const signup = async (req, res, next) => {
  // input validation
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );
  }
  // after applying fileupload middleware, we still have our data in req.body --> thanks to multer
  // data extract
  const { name, email, password } = req.body;

  // check if alreay exist
  let existingUser
  try {
    existingUser = await User.findOne({ email: email })
  } catch (err) {
    const error = new HttpError(
      'Signing up failed, please try again later.',
      500
    );
    return next(error);
  }

  // if already exist
  if (existingUser) {
    const error = new HttpError(
      'User exists already, please login instead.',
      422
    );
    return next(error);
  }

  // hash the password
  let hashPassword;
  try {
    hashPassword = await bcrypt.hash(password, 10);
  } catch (err) {
    const error = new HttpError('Could not create user, please try again.', 500);
    return next(error);
  }

  // select the proper host
  // let host;
  // if (process.env.NODE_ENV === 'production') {
  //   host = 'https://insta-places-t.herokuapp.com/';
  // } else {
  //   host = 'http://localhost:5000/';
  // }

  // else --> create new user
  const createdUser = new User({
    name,
    email,
    image: req.file.location,                       // image: host + req.file.path,
    password: hashPassword,
    places: []    // initially user has no places
  });
  // add it to database
  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError(
      'Signing up failed, please try again.',
      500
    );
    return next(error);
  }

  // generate web token
  let token;
  try {
    token = jwt.sign(
      { userId: createdUser.id, email: createdUser.email },   // store user id & email in token
      process.env.TOKEN_SECRET_KEY,                           // secret key
      { expiresIn: '1h' }                                     // best practice to have expiration date
    );
  } catch (err) {
    const error = new HttpError('Signing up failed, please try again later.', 500);
    return next(error);
  }

  // send it back
  res.status(201).json({ user: createdUser.toObject({ getters: true }), token: token });
};


/*
 * @route     POST api/users/login
 * @desc      login
 * @access    public
 */


const login = async (req, res, next) => {
  // extact data
  const { email, password } = req.body;

  // check if exist
  let existingUser;
  try {
    existingUser = await User.findOne({ email: email })
  } catch (err) {
    const error = new HttpError(
      'Logging in failed, please try again later.',
      500
    );
    return next(error);
  }

  // check if user exist
  if (!existingUser) {
    const error = new HttpError(
      'Invalid credentials, could not log you in.',
      401
    );
    return next(error);
  }

  // check if password matched
  let isValidPassword;
  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password)
  } catch (err) { // error due to comparing
    const error = new HttpError(
      'Logging in failed, please try again later.', 500);
    return next(error);
  }

  // if wrong password
  if (!isValidPassword) {
    const error = new HttpError(
      'Invalid credentials, could not log you in.', 500);
    return next(error);
  }

  // generate web token
  let token;
  try {
    token = jwt.sign(
      { userId: existingUser.id, email: existingUser.email }, // store user id & email in token
      process.env.TOKEN_SECRET_KEY,                           // secret key
      { expiresIn: '1h' }                                     // best practice to have expiration date
    );
  } catch (err) {
    const error = new HttpError('Logging in failed, please try again later.', 500);
    return next(error);
  }

  // send it back to frontend
  res.json({ user: existingUser.toObject({ getters: true }), token: token });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
