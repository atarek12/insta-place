const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const fs = require('fs')

const HttpError = require('../models/http-error');
const getCoordsForAddress = require('../util/location');
const Place = require('../models/place-model');
const User = require('../models/user-model');


/*
 * @route     GET api/places/pid
 * @desc      get place by id
 * @access    public
 */


const getPlaceById = async (req, res, next) => {
  // extract our place id
  const placeId = req.params.pid;

  // get the place
  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not find a place.',
      500
    );
    return next(error);
  }

  // if not found
  if (!place) {
    const error = new HttpError(
      'Could not find a place for the provided id.',
      404
    );
    return next(error);
  }

  // else -> send it back to the frontend
  res.json({ place: place.toObject({ getters: true }) });
};


/*
 * @route     GET api/places/user/uid
 * @desc      get all places by user id
 * @access    public
 */


const getPlacesByUserId = async (req, res, next) => {
  // extract user id
  const userId = req.params.uid;

  // let places;        // two methods
  let userWithPlaces;
  try {
    // places = await Place.find({creator: userId});                    // return all places that has the same creator:userId
    userWithPlaces = await User.findById(userId).populate('places');    // return that user with populated places 
  } catch (err) {
    const error = new HttpError(
      'Fetching places failed, please try again later',
      500
    );
    return next(error);
  }

  // if (!places || places.length === 0) {
  if (!userWithPlaces || userWithPlaces.places.length === 0) {
    return next(
      new HttpError('Could not find places for the provided user id.', 404)
    );
  }

  // send them back to the backend --> use map as it is an array
  res.json({
    places: userWithPlaces.places.map(place =>
      place.toObject({ getters: true })
    )
  });
};


/*
 * @route     POST api/places/
 * @desc      create new place
 * @access    private
 */


const createPlace = async (req, res, next) => {
  // input validation
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );
  }

  // extract data
  const { title, description, address } = req.body;

  // get address coordinates
  let coordinates;
  try {
    coordinates = await getCoordsForAddress(address);
  } catch (error) {
    return next(error);
  }

  // select the proper host
  // let host;
  // if (process.env.NODE_ENV === 'production') {
  //   host = 'https://insta-places-t.herokuapp.com/';    // old host
  // } else {
  //   host = 'http://localhost:5000/';
  // }

  // create the place
  const createdPlace = new Place({
    title,
    description,
    address,
    location: coordinates,
    image: req.file.location,                       // image: host + req.file.path,  --> localhost
    imagePath: req.file.location,                   // req.file.path,  --> localhost
    creator: req.userData.userId
  });

  // get the user who creating this place
  let user;
  try {
    user = await User.findById(req.userData.userId);
  } catch (err) {
    const error = new HttpError('Creating place failed, please try again', 500);
    return next(error);
  }

  // if not found
  if (!user) {
    const error = new HttpError('Could not find user for provided id', 404);
    return next(error);
  }

  //else
  try {
    // start seesion and transaction
    const sess = await mongoose.startSession();
    sess.startTransaction();

    // add the place to database
    await createdPlace.save({ session: sess });

    // add place id to this user places
    user.places.push(createdPlace);     // mongoose automatically add the id not the all object

    // update the user in database
    await user.save({ session: sess });

    // commit the transaction
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      'Creating place failed, please try again.',
      500
    );
    return next(error);
  }

  // send it back to frontend
  res.status(201).json({ place: createdPlace });
};


/*
 * @route     PATCH api/places/pid
 * @desc      updatae user specific place
 * @access    private
 */


const updatePlace = async (req, res, next) => {
  // input validation
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );
  }

  // extract data
  const { title, description } = req.body;
  const placeId = req.params.pid;

  // get that place
  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError('Something went wrong, could not update place.', 500);
    return next(error);
  }

  // check that if the user who updating the place, he own it
  if (req.userData.userId !== place.creator.toString()) {     // note here creator is mongoose object
    const error = new HttpError('Not allowed to Edit this place.', 401);
    return next(error);
  }

  // update it with the new data
  place.title = title;
  place.description = description;

  // add it to database
  try {
    await place.save();
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not update place.',
      500
    );
    return next(error);
  }

  // send it back to frontend
  res.status(200).json({ place: place.toObject({ getters: true }) });
};


/*
 * @route     DELETE api/places/pid
 * @desc      delete user's specific place
 * @access    private
 */


const deletePlace = async (req, res, next) => {
  // extract data
  const placeId = req.params.pid;

  // get that place
  let place;
  try {
    place = await Place.findById(placeId).populate('creator');
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not delete place.',
      500
    );
    return next(error);
  }

  // if not exist
  if (!place) {
    const error = new HttpError('Could not find place for this id.', 404);
    return next(error);
  }

  // check that if the user who updating the place, he own it
  if (req.userData.userId !== place.creator.id) {     // note here creator populated with all user data
    const error = new HttpError('Not allowed to Delete this place.', 401);
    return next(error);
  }

  // select the place image so we can delete it too
  const imagePath = place.imagePath;

  // update database
  try {
    // start a sesion and transaction
    const sess = await mongoose.startSession();
    sess.startTransaction();

    // remove the place from database
    await place.remove({ session: sess });

    // update user places 
    place.creator.places.pull(place);

    // update  database
    await place.creator.save({ session: sess });

    // commit 
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not delete place.',
      500
    );
    return next(error);
  }

  // delete the place image
  //fs.unlink(imagePath, err => { });  // not interested in the error // in case of local host

  // send it back to frontend
  res.status(200).json({ message: 'Deleted place.' });
};


exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
