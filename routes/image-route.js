'use strict';

const Image = require('../model/image.js');
const express = require('express');
const multer = require('multer');
const httpErrors = require('http-errors');
const s3 = require('../lib/s3.js');
const bodyParser = require('body-parser').json();
const multers3 = require('multer-s3');
const imageRouter = module.exports = require('express').Router();

const upload = multer({dest: `${__dirname}/../temp`})


let accessKeyId = process.env.AWS_ACCESS_KEY_ID;
let secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

AWS.config.update({
  accessKeyId : accessKeyId,
  secretAccessKey: secretAccessKey,
});


let upload = multer({
  storage: multerS3({
    s3:s3,
    bucket: process.env.AWS_BUCKET;
    key: function(req,file,cb){
      console.log(file);
      cb(null, file.originalname);
    }
  })
})

imageRouter.post('/image', bodyParser, (req,res,next) => {
  new Image(req.body).save()
  .then( img => res.send({statusCode:200, message: img._id}))
  .catch( err => next(err));
});

imageRouter.post('/image/:id/new-image', upload.array('upl', 1), (req,res,next) => {
  if(req.params.id === null){
    res.send({statusCode: 404, message: 'id not found'});
  }
  Image.findOne({_id: req.params.id})
  .then( img =>
    let params = { Key: img.name, Body: img.path};
    s3.putObject(params, function(err,data){
      if(err) console.log(err);
      else res.send('success');
    })
  )
  .catch(err => next(err));
});
