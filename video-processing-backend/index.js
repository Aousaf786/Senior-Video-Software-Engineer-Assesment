const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const cors = require('cors');
const { videoQueue, eventEmitter } = require('./queue');

const app = express();
const port = 5001;

app.use(express.json());
app.use(cors());

const upload = multer({ dest: 'uploads/' });

const requestDetails = {};

eventEmitter.on('videoProcessed', ({ requestId, downloadUrl }) => {
  if (requestDetails[requestId]) {
    requestDetails[requestId].downloadUrls.push(downloadUrl);
    requestDetails[requestId].processedCount++;
    if (requestDetails[requestId].processedCount === requestDetails[requestId].total) {
      requestDetails[requestId].res.json({ downloadUrls: requestDetails[requestId].downloadUrls });
      delete requestDetails[requestId];
    }
  }
});

app.post('/upload', upload.array('videos', 10), (req, res) => {
  const files = req.files;
  const requestId = uuidv4();

  requestDetails[requestId] = {
    res,
    processedCount: 0,
    total: files.length,
    downloadUrls: []
  };

  files.forEach((file, index) => {
    const videoId = uuidv4();
    const videoPath = file.path;
    const effect = req.body["effects"][index];
    const width = req.body["widths"][index];
    const height = req.body["heights"][index];

    videoQueue.add({
      videoId,
      videoPath,
      effect,
      width,
      height,
      requestId
    });
  });
});

app.get('/download/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'processed', filename);
  const expirationTime = new Date(Date.now() + 8 * 60 * 60 * 1000);
  res.setHeader('Expires', expirationTime.toUTCString());
  
  res.download(filePath);
});

app.listen(port, () => {
  console.log(`Backend server is running on port ${port}`);
});
