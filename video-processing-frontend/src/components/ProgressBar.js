import React from 'react';
import ProgressBar from 'react-bootstrap/ProgressBar';

const CustomProgressBar = ({ now, label }) => {
  return <ProgressBar now={now} label={label} />;
};

export default CustomProgressBar;
