import React, { useState } from 'react';
import axios from 'axios';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import ProgressBar from './ProgressBar';

const UploadForm = () => {
  const [videos, setVideos] = useState([]);
  const [effects, setEffects] = useState([]);
  const [widths, setWidths] = useState([]);
  const [heights, setHeights] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progressMap, setProgressMap] = useState({});
  const [downloadLinks, setDownloadLinks] = useState([]);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedVideos = e.target.files;
    const videoArray = Array.from(selectedVideos).map((video) => ({
      file: video,
      name: video.name,
      duration: 0 // Initialize duration to 0
    }));

    // Validate each selected video
    videoArray.forEach((video) => {
      const videoObjectURL = URL.createObjectURL(video.file);
      const videoElement = document.createElement('video');

      videoElement.onloadedmetadata = () => {
        // Get the duration of the video in seconds
        const duration = Math.round(videoElement.duration);
        URL.revokeObjectURL(videoObjectURL);

        if (duration > 30) {
          // Video duration exceeds 30 seconds, display an error message or take appropriate action
          setError(`Video ${video.name} is longer than 30 seconds.`);
          setTimeout(() => {
            setError(null);
            // Remove the video from the state after 5 seconds
            setVideos((prevVideos) => prevVideos.filter((v) => v.name !== video.name));
          }, 5000);
        } else {
          // Video duration is within the limit, proceed with adding it to the state
          setVideos((prevVideos) => [...prevVideos, video]);
          setEffects((prevEffects) => [...prevEffects, '']);
          setWidths((prevWidths) => [...prevWidths, '']);
          setHeights((prevHeights) => [...prevHeights, '']);
        }
      };

      videoElement.src = videoObjectURL;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    videos.forEach((video, index) => {
      formData.append('videos', video.file);
      formData.append(`effects[${index}]`, effects[index]);
      formData.append(`widths[${index}]`, widths[index]);
      formData.append(`heights[${index}]`, heights[index]);
    });

    setUploading(true);

    try {
      const response = await axios.post('http://localhost:5001/upload', formData, {
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgressMap((prevProgressMap) => ({
            ...prevProgressMap,
            total: progress,
          }));
        },
      });

      const downloadLinksWithNames = response.data.downloadUrls.map((url, index) => ({
        name: videos[index].name,
        url,
      }));

      setDownloadLinks(downloadLinksWithNames);
    } catch (error) {
      console.error('Error uploading videos:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Form style={{ padding: '20px' }} onSubmit={handleSubmit}>
      <Form.Group>
        <Form.Label style={{ fontWeight: 'bold' }}>Upload Videos</Form.Label>
        <Form.Control style={{ display: 'block', marginTop: '10px', marginBottom: '10px' }} type="file" onChange={handleFileChange} multiple required />
      </Form.Group>

      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

      {videos.map((video, index) => (
        <div key={index}>
          <h4 style={{ marginTop: '35px' }}>{video.name}</h4>
          <Form.Group>
            <Form.Label>Effect</Form.Label>
            <Form.Control
              style={{ marginLeft: '10px', marginBottom: '10px' }}
              as="select"
              value={effects[index]}
              onChange={(e) => {
                const newEffects = [...effects];
                newEffects[index] = e.target.value;
                setEffects(newEffects);
              }}
            >
              <option value="">None</option>
              <option value="grayscale">Grayscale</option>
              <option value="negate">Negate</option>
              <option value="sepia">Sepia</option>
              <option value="blur">Blur</option>
              <option value="sharpen">Sharpen</option>
            </Form.Control>
          </Form.Group>

          <Form.Group>
            <Form.Label>Width</Form.Label>
            <Form.Control
              style={{ marginLeft: '10px', marginBottom: '10px' }}
              type="number"
              value={widths[index]}
              onChange={(e) => {
                const newWidths = [...widths];
                newWidths[index] = e.target.value;
                setWidths(newWidths);
              }}
            />
          </Form.Group>

          <Form.Group>
            <Form.Label>Height</Form.Label>
            <Form.Control
              style={{ marginLeft: '10px', marginBottom: '10px' }}
              type="number"
              value={heights[index]}
              onChange={(e) => {
                const newHeights = [...heights];
                newHeights[index] = e.target.value;
                setHeights(newHeights);
              }}
            />
          </Form.Group>

          {uploading && (
            <ProgressBar now={progressMap.total || 0} label={`${progressMap.total || 0}%`} />
          )}
        </div>
      ))}

      <Button variant="primary" type="submit" disabled={uploading}>
        {uploading ? 'Uploading...' : 'Upload'}
      </Button>

      {downloadLinks.length > 0 && (
        <div style={{ marginTop: '50px' }}>
          {downloadLinks.map((link, index) => (
            <div key={index}>
              <p>{link.name}</p>
              <a href={link.url} download>
                Download Processed Video
              </a>
            </div>
          ))}
        </div>
      )}
    </Form>
  );
};

export default UploadForm;