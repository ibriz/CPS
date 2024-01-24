import React from 'react';
import { ProgressBar } from 'react-bootstrap';

const ProgressBarCombined = ({
  approvedPercentage = 0,
  rejectedPercentage = 0,
  abstainedPercentage = 0,
}) => {
  return (
    <ProgressBar
      style={{
        height: '10px',
        width: '100%',
        maxWidth: '250px',
        border: '1px solid darkgray',
      }}
    >
      <ProgressBar striped variant='success' now={approvedPercentage} key={1} />
      <ProgressBar striped variant='danger' now={rejectedPercentage} key={2} />
      <ProgressBar variant='info' striped now={abstainedPercentage} key={3} />
    </ProgressBar>
  );
};

export default ProgressBarCombined;
