const express = require('express');
const { check } = require('express-validator');

const fileUpload = require('../middleware/file-upload');
const placesControllers = require('../controllers/places-controllers');
const checkAuth = require('../middleware/check-auth');

const router = express.Router();


/*
 * @route     GET api/places/pid
 * @desc      get place by id
 * @access    public
 */
router.get('/:pid', placesControllers.getPlaceById);

/*
 * @route     GET api/places/user/uid
 * @desc      get all places by user id
 * @access    public
 */
router.get('/user/:uid', placesControllers.getPlacesByUserId);

/*
 * @route     POST api/places/
 * @desc      create new place
 * @access    private
 */
router.post(
  '/',
  fileUpload.single('image'),
  checkAuth,
  [
    check('title')
      .not()
      .isEmpty(),
    check('description').isLength({ min: 5 }),
    check('address')
      .not()
      .isEmpty()
  ],
  placesControllers.createPlace
);

/*
 * @route     PATCH api/places/pid
 * @desc      updatae user specific place
 * @access    private
 */
router.patch(
  '/:pid',
  checkAuth,
  [
    check('title')
      .not()
      .isEmpty(),
    check('description').isLength({ min: 5 })
  ],
  placesControllers.updatePlace
);

/*
 * @route     DELETE api/places/pid
 * @desc      delete user's specific place
 * @access    private
 */
router.delete('/:pid', checkAuth, placesControllers.deletePlace);

module.exports = router;
