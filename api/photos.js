/*
 * API sub-router for businesses collection endpoints.
 */
require('dotenv').config()

const { Router } = require('express')
const { validateAgainstSchema } = require('../lib/validation')
const {
  PhotoSchema,
} = require('../models/photo')
const { getDbReference, getGridFsBucketReference, getUploadReference } = require("../lib/mongo")

const router = Router()

//adapted from challenge 8-2
// https://forum.freecodecamp.org/t/how-to-upload-image-to-mongodb-and-string-data-simultaneously-using-gridfs/248610 used to help with caption

const upload = getUploadReference()

/*
 * POST /photos - Route to create a new photo.
 */
router.post('/', upload.single('photodata'), async (req, res) => {
  if (validateAgainstSchema(req.body, PhotoSchema)) {
    try {
      //adapted from 8-2
      const id = req.file.id.toString()
      res.status(201).send({
        id: id,
        links: {
          photo: `/photos/${id}`,
          business: `/businesses/${req.body.businessId}`,
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
    //adapted from 8-2
    const file = await getDbReference().collection('uploads.files')
      .findOne({ filename: "pizza.png" });

    if (!file) {
      return res.status(404).send('Not found');
    }
    console.log(file)

    res.type(file.contentType);
    const download_stream = getGridFsBucketReference().
      openDownloadStreamByName(file.filename);
    download_stream.pipe(res);
  } catch (err) {
    console.error(err)
    res.status(500).send({
      error: "Unable to fetch photo.  Please try again later."
    })
  }
})

module.exports = router
