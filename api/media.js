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

/*
 * GET /photos/{id} - Route to fetch info about a specific photo.
 */
router.get('/photos', async (req, res, next) => {
  try {
    res.status(200).send("helloworld")
  } catch (err) {
    console.error(err)
    res.status(500).send({
      error: "Unable to fetch photo.  Please try again later."
    })
  }
})

module.exports = router
