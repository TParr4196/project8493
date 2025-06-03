/*
 * Module for working with a MongoDB connection.
 */
require('dotenv').config()
const multer = require('multer');
const { MongoClient, GridFSBucket } = require('mongodb')
const { GridFsStorage } = require('multer-gridfs-storage');

const mongoHost = process.env.MONGO_HOST || 'localhost'
const mongoPort = process.env.MONGO_PORT || 27017
const mongoUser = process.env.MONGO_USER
const mongoPassword = process.env.MONGO_PASSWORD
const mongoDbName = process.env.MONGO_DB_NAME
const mongoAuthDbName = process.env.MONGO_AUTH_DB_NAME || mongoDbName

const mongoUrl = `mongodb://${mongoUser}:${mongoPassword}@${mongoHost}:${mongoPort}/${mongoAuthDbName}`

let db = null
let gfs_bucket = null
let _closeDbConnection = null
const storage = new GridFsStorage({
    //adapted from /lib/mongo.js
    url: `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST || 'localhost'}:${process.env.MONGO_PORT || 27017}/${process.env.MONGO_AUTH_DB_NAME || process.env.MONGO_DB_NAME}`,
    file: (req, file) => {
        console.log(req.body)
        return {
            filename: file.originalname,
            bucketName: 'uploads',
            metadata: {
              caption: req.body.caption,
              businessId: req.body.businessId,
            }
        };
    },
});
const upload = multer({ storage });

exports.connectToDb = function (callback) {
  MongoClient.connect(mongoUrl, function (err, client) {
    if (err) {
      throw err
    }
    db = client.db(mongoDbName)
    gfs_bucket = new GridFSBucket(db, { bucketName: 'uploads' });
    _closeDbConnection = function () {
      client.close()
    }
    callback()
  })
}

exports.getDbReference = function () {
  return db
}

exports.getGridFsBucketReference = function () {
  return gfs_bucket
}

exports.closeDbConnection = function (callback) {
  _closeDbConnection(callback)
}

exports.getStorageReference = function () {
  return storage
}

exports.getUploadReference = function () {
  return upload
}
