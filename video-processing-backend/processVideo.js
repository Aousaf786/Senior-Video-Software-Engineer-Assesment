const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');

const effects = {
  grayscale: 'hue=s=0',
  negate: 'negate',
  sepia: 'colorchannelmixer=.393:.769:.189:.349:.686:.168:.272:.534:.131',
  blur: 'boxblur=10:10',
  sharpen: 'unsharp=5:5:1.0:5:5:0.0'
};

const processVideo = ({ videoId, videoPath, effect, width, height }) => {
  return new Promise((resolve, reject) => {

    console.log("Starting video processing...");
    const outputPath = path.join(__dirname, 'processed', `${videoId}.mp4`);

    let command = ffmpeg(videoPath)
      .output(outputPath)
      .videoCodec('libx264')
      .on('end', () => {
        console.log("Video processing completed");
        resolve();
      })
      .on('error', (err) => {
        console.error("Error processing video:", err);
        reject(err);
      });

    if (effect && effects[effect]) {
      command = command.videoFilter(effects[effect]);
    }

    if (width && height) {
      command = command.size(`${width}x${height}`);
    }

    console.log("Executing ffmpeg command...");
    command.run();
  });
};

module.exports = { processVideo };
