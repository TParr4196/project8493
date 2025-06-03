/*
 * API sub-router for businesses collection endpoints.
 */
require('dotenv').config()

const { Router } = require('express')
const multer = require('multer');
const { validateAgainstSchema } = require('../lib/validation')
const {
  PhotoSchema,
  insertNewPhoto,
  getPhotoById
} = require('../models/photo')

const router = Router()
const { GridFsStorage } = require('multer-gridfs-storage');


//adapted from challenge 8-2
const storage = new GridFsStorage({
    //adapted from /lib/mongo.js
    url: `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST || 'localhost'}:${process.env.MONGO_PORT || 27017}/${process.env.MONGO_AUTH_DB_NAME || process.env.MONGO_DB_NAME}`,
    file: (req, file) => {
        return {
            filename: file.originalname,
            bucketName: 'uploads'
        };
    },
});

const upload = multer({ storage });

/*
 * POST /photos - Route to create a new photo.
 */
router.post('/', async (req, res) => {
  if (validateAgainstSchema(req.body, PhotoSchema)) {
    try {
      const id = await insertNewPhoto(req.body)
      res.status(201).send({
        id: id,
        links: {
          photo: `/photos/${id}`,
          business: `/businesses/${req.body.businessId}`
        }
      })
    } catch (err) {
      console.error(err)
      res.status(500).send({
        error: "Error inserting photo into DB.  Please try again later."
      })
    }
  } else {
    res.status(400).send({
      error: "Request body is not a valid photo object"
    })
  }
})

/*
 * GET /photos/{id} - Route to fetch info about a specific photo.
 */
router.get('/:id', async (req, res, next) => {
  try {
    const photo = await getPhotoById(req.params.id)
    if (photo) {
      res.status(200).send(photo)
    } else {
      next()
    }
  } catch (err) {
    console.error(err)
    res.status(500).send({
      error: "Unable to fetch photo.  Please try again later."
    })
  }
})

module.exports = router
