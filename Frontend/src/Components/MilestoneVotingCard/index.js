import React from 'react';
import { FaAngleDown } from 'react-icons/fa';
import { AiFillStar } from 'react-icons/ai';
import { ButtonGroup, Button } from 'react-bootstrap';

const MilestoneVoteCard = ({ id, name, description }) => {
  return (
    <div class='accordion pb-1 pt-1' id='accordionComponent'>
      <div class='card'>
        <div
          class='card-header w-100 d-flex justify-content-between'
          id={`heading${id}`}
        >
          <h2 class='mb-0 d-flex'>
            <div
              class='btn d-flex btn-block text-left w-100 align-items-center '
              type='button'
              data-toggle='collapse'
              data-target={`#collapse${id}`}
              aria-expanded='true'
              aria-controls={`collapse${id}`}
            >
              <div className='d-flex'>
                <div className='p-2'>
                  <AiFillStar />
                </div>
                <div className='d-flex flex-column pl-2 pr-4'>
                  <h6 style={{ lineHeight: '1.2', marginBottom: '0' }}>
                    {name}
                  </h6>
                  <p
                    style={{ marginBottom: '0', fontSize: '14', color: 'grey' }}
                  >
                    {' '}
                    {`Milestone ${id}`}
                  </p>
                </div>
              </div>
            </div>
          </h2>
          <ButtonGroup aria-label='Basic example'>
            <Button variant='dark' onClick={() => {}}>
              Accept
            </Button>
            <Button variant='dark' onClick={() => {}}>
              Reject
            </Button>
          </ButtonGroup>
        </div>

        <div
          id={`collapse${id}`}
          class='collapse show'
          aria-labelledby='headingOne'
          data-parent='#accordionComponent'
        >
          <div class='card-body'>
            <div className='d-flex flex-column'>
              <p style={{ fontWeight: '600', marginBottom: '4px' }}>
                Milestone Description
              </p>
              <p>{description}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MilestoneVoteCard;
