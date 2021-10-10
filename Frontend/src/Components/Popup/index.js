import React from 'react';
import { OverlayTrigger, Popover } from 'react-bootstrap';

const Popup = ({ component, popOverText, placement = 'right' }) => {
  return (
    <OverlayTrigger
      trigger={['hover', 'focus']}
      placement={placement}
      overlay={
        <Popover id='popover-basic'>
          <Popover.Content>
            <span style={{ textAlign: 'center' }}>{popOverText}</span>
          </Popover.Content>
        </Popover>
      }
    >
      <span className='d-inline-block'>{component}</span>
    </OverlayTrigger>
  );
};

export default Popup;
