const express = require('express');
const { check } = require('express-validator');

const usersController = require('../controllers/users-controllers');
const fileUpload = require('../middleware/file-upload');

const router = express.Router();

/*
 * @route     GET api/users/
 * @desc      get all users
 * @access    public
 */
router.get('/', usersController.getUsers);

/*
 * @route     POST api/users/signup
 * @desc      add a new user
 * @access    public
 */
router.post(
  '/signup',
  fileUpload.single('image'),
  [
    check('name')
      .not()
      .isEmpty(),
    check('email')      //.normalizeEmail() // Test@test.com => test@test.com
      .isEmail(),
    check('password').isLength({ min: 6 })
  ],
  usersController.signup
);

/*
 * @route     POST api/users/login
 * @desc      login
 * @access    public
 */
router.post('/login', usersController.login);

module.exports = router;
