const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
require('dotenv/config');

const placesRoutes = require('./routes/places-routes');
const usersRoutes = require('./routes/users-routes');
const HttpError = require('./models/http-error');

const app = express();

// body parser middleware
app.use(bodyParser.json());

// CORS middleware
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');                    // all origins could handle this server
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization, Application'     // we can make it all too 
  );
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');  // which methods

  next();
});

// use cors middleware
app.use(cors());

// initiates routes
app.use('/api/places', placesRoutes);
app.use('/api/users', usersRoutes);

// Set static folder  --> this folder could be accessed anywhere
app.use('/uploads/images', express.static(path.join('uploads', 'images')));

// handling wrong routes  --> if not catched route --> it goes here --> throw error
app.use((req, res, next) => {
  const error = new HttpError('Could not find this route.', 404);
  throw error;
});

// handling our thrown errors --> special middleware 
app.use((error, req, res, next) => {

  // if we had a file and error occured --> delete the uploaded image // in case local host
  // if (req.file) {
  //   fs.unlink(req.file.path, err => {
  //     console.log(err);
  //   });
  // }

  // if already we sent a response --> send a new response as we cannot send two responses
  if (res.headerSent) {
    return next(error);
  }

  // else, we will send a new response  
  res.status(error.code || 500);
  res.json({ message: error.message || 'An unknown error occurred!' });
});

// launch our server and connect to database
const PORT = process.env.PORT || 5000;
const mongodb_uri = process.env.MONGODB_URI;
mongoose
  .connect(
    mongodb_uri,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    })
  .then(() => console.log('Database connected'))
  .then(() => {
    app.listen(PORT, () => console.log('Server is running'));
  })
  .catch(err => {
    console.log(err);
  });
