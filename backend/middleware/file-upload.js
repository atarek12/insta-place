const multer = require('multer');
const { v1: uuidv1 } = require('uuid');

const aws = require('aws-sdk');
const multerS3 = require('multer-s3');
const path = require('path');


// define allowable files extention
const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpg'
};

// create aws s3 object
const s3Config = new aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  Bucket: process.env.AWS_BUCKET_NAME
});


// Init Upload
const fileUpload = multer({
  storage: multerS3({
    s3: s3Config,
    bucket: 'instaplacesbucket',
    acl: 'public-read',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      const ext = MIME_TYPE_MAP[file.mimetype];                    // get file extension, png, jpeg, jpg
      cb(null, path.basename(file.originalname, path.extname(file.originalname)) + '-' + Date.now() + '.' + ext)
    }
  }),

  fileFilter: (req, file, cb) => {                                  // specify file type
    const isValid = !!MIME_TYPE_MAP[file.mimetype];                 // if not png, jpg, jpeg
    let error = isValid ? null : new Error('Invalid file type!');
    cb(error, isValid);                                             // this callback take an error , and a bool state that if it is valid or not
  },

  limits: {
    fileSize: 1024 * 1024 * 5                                       // we are allowing only 5 MB files
  }

});

module.exports = fileUpload;


/*

  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/images');                                  // store files in this folder
    },
    filename: (req, file, cb) => {
      const ext = MIME_TYPE_MAP[file.mimetype];                    // get file extension, png, jpeg, jpg
      cb(null, file.originalname + '-' + uuidv1() + '.' + ext);    // filename-rondom.png
    }
  }),


  */