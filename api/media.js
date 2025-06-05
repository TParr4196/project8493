/*
 * API sub-router for businesses collection endpoints.
 */

const { Router } = require('express')
// const multer = require('multer');
// const { validateAgainstSchema } = require('../lib/validation')
// const {
//   PhotoSchema,
//   insertNewPhoto,
//   getPhotoById
// } = require('../models/photo')

const router = Router()

const { getDbReference, getGridFsBucketReference, getThumbBucket } = require("../lib/mongo")
const { ObjectId } = require('mongodb')

/*
 * adapted from GET /photos/{id} - Route to fetch info about a specific photo.
 */
router.get('/photos/:id', async (req, res, next) => {
  try {
    const file = await getDbReference().collection('uploads.files')
      .findOne({ _id: new ObjectId(req.params.id.split(".")[0]) });
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

router.get('/thumbs/:id', async (req, res, next) => {
  try {
    const thumb = await getDbReference().collection('thumbs.files').findOne({'metadata.photo': req.params.id.split(".")[0]})
    res.type(thumb.contentType);
    const download_stream = getThumbBucket().
      openDownloadStreamByName(thumb.filename);
    download_stream.pipe(res);
  } catch (err) {
    console.error(err)
    res.status(500).send({
      error: "Unable to fetch photo.  Please try again later."
    })
  }
})

module.exports = router
