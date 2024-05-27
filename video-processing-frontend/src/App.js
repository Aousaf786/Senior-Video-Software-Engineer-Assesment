import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import UploadForm from './components/UploadForm';

function App() {
  return (
    <Container>
      <Row className="justify-content-md-center mt-5">
        <Col md={8}>
          <h1 className="text-center">Video Processing Service</h1>
          <UploadForm />
        </Col>
      </Row>
    </Container>
  );
}

export default App;
