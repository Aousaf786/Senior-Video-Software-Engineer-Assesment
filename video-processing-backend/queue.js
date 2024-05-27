const Queue = require('bull');
const { processVideo } = require('./processVideo');
const EventEmitter = require('events');

const videoQueue = new Queue('video processing', {
  redis: { host: '127.0.0.1', port: 6379 }
});

const eventEmitter = new EventEmitter();

videoQueue.process(async (job, done) => {
  try {
    console.log("Processing video...");
    await processVideo(job.data);
    console.log("Video processing completed successfully");
    
    const downloadUrl = `http://localhost:5001/download/${job.data.videoId}.mp4`;
    eventEmitter.emit('videoProcessed', { requestId: job.data.requestId, downloadUrl });
    done();
  } catch (error) {
    console.error("Error processing video:", error);
    done(new Error('Video processing failed'));
  }
});

videoQueue.on('failed', (job, err) => {
  console.log(`Job ${job.id} failed: ${err.message}`);
});

module.exports = { videoQueue, eventEmitter };
