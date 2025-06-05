//adapted from activity 9
//got help from chatgpt with installing an express friendly version of jimp
const Jimp = require("jimp");
const amqp = require('amqplib');
const rabbitmqHost = process.env.RABBITMQ_HOST || 'localhost';
const rabbitmqUrl = `amqp://${rabbitmqHost}`;
const { getDbReference, getGridFsBucketReference, connectToDb, getUploadReference, getThumbBucket } = require("./lib/mongo")
const { ObjectId } = require('mongodb')
const { Readable } = require('stream');


//from chatgpt on 6/4/25:
async function streamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', chunk => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
}

async function adaptFile(msg){
    const db = getDbReference()
    const gfs_bucket = getGridFsBucketReference()
    const fileRef = await db.collection('uploads.files')
      .findOne({ _id: new ObjectId(msg) });

    if(fileRef){
        const oldbuffer = await streamToBuffer(gfs_bucket.openDownloadStream(fileRef._id));
        const image = await Jimp.read(oldbuffer);
        image.resize(100, 100)
        
        //https://www.npmjs.com/package/jimp/v/0.20.1 for getbufferasync
        const buffer = await image.getBufferAsync(Jimp.MIME_JPEG)
        const bucket = getThumbBucket()
        
        const newmetadata = fileRef.metadata
        newmetadata.photo = fileRef._id.toString()
        //https://www.mongodb.com/docs/php-library/current/reference/method/MongoDBGridFSBucket-openUploadStream/
        const uploadStream = await bucket.openUploadStream(
            fileRef.filename, {
                contentType: Jimp.MIME_JPEG,
                metadata: newmetadata
            }
        )
        
        // adapted from https://www.mongodb.com/community/forums/t/gridfs-openuploadstream-from-buffer/155719
        const readable = Readable.from(buffer)
        const response = await readable.pipe(uploadStream)
        
        const respe = await db.collection('uploads.files').updateOne({ _id: ObjectId(fileRef._id) }, 
            { $set: { metadata: newmetadata}});
        console.log(`adapted ${fileRef._id} to ${response.id.toString()}`)

    }
    // update other code to work with thumb
}

async function main() {
    try {
        const connection = await amqp.connect(rabbitmqUrl);
        const channel = await connection.createChannel();
        await channel.assertQueue('echo');

        channel.consume('echo', (msg) => {
            // msg can be null if something goes awry
            if (msg) {
                // msg.content Buffer converted to String
                adaptFile(msg.content.toString());
            }

            // Tell RabbitMQ it's OK to remove this message from the queue
            channel.ack(msg);
        });
    } catch (err) {
        console.error(err);
    }
}

connectToDb(main);