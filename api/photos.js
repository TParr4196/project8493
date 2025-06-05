/*
 * API sub-router for businesses collection endpoints.
 */
require('dotenv').config()

const { Router } = require('express')
const { validateAgainstSchema } = require('../lib/validation')
const {
  PhotoSchema,
} = require('../models/photo')
const { getDbReference, getUploadReference } = require("../lib/mongo")
const { ObjectId } = require('mongodb')

const amqp = require('amqplib');
const rabbitmqHost = process.env.RABBITMQ_HOST;
const rabbitmqUrl = `amqp://${rabbitmqHost}`;

const router = Router()

//adapted from challenge 8-2
// https://forum.freecodecamp.org/t/how-to-upload-image-to-mongodb-and-string-data-simultaneously-using-gridfs/248610 used to help with caption

const upload = getUploadReference()

/*
 * POST /photos - Route to create a new photo.
 */
router.post('/', upload.single('photodata'), async (req, res) => {
  if (validateAgainstSchema(req.body, PhotoSchema)) {
    //adapted from 5-1
    const response = await getDbReference().collection('uploads.files')
      .updateOne({ _id: req.file.id }, { $set: { metadata: {
        businessId: req.body.businessId,
        caption: req.body.caption
      }}});
    try {
      const id = req.file.id.toString()

      //adapted from challenge 9
      const connection = await amqp.connect(rabbitmqUrl);
      const channel = await connection.createChannel();
      await channel.assertQueue('echo');
      channel.sendToQueue('echo', Buffer.from(id))
      await channel.close();
      await connection.close();

      //adapted from 8-2
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
      .findOne({ _id: new ObjectId(req.params.id) });
    
    if (!file) {
      return res.status(404).send('Not found');
    }
    let response = file.metadata
    const filetype = file.contentType.split("/")[1]
    response.download = `/media/photos/${req.params.id}.${filetype}`
    res.status(200).send(response)
  } catch (err) {
    console.error(err)
    res.status(500).send({
      error: "Unable to fetch photo.  Please try again later."
    })
  }
})

module.exports = router
