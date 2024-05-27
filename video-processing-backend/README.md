# Video Processing Backend

This project provides the backend of a video processing service that allows users to upload videos, apply effects, resize them, and download the processed videos.

## Setup

1. Ensure you have Xcode Command Line Tools, Node.js and Redis installed.

2. Navigate to the project directory.

```sh
cd video-processing-backend
```

3. Install ffmpeg:
```sh
brew install ffmpeg
```

4. Run "npm install" to install the required packages.

5. Ensure that the redis server is running:
```sh
redis-server &
```

6. Run the Node.js server:
```sh
node index.js
