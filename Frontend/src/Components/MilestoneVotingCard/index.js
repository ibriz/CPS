import React from 'react';
import { FaAngleDown } from 'react-icons/fa';
import styles from './MilestoneVotingCard.module.scss';
import { MdStars } from 'react-icons/md';
import { ButtonGroup, Button } from 'react-bootstrap';

const MilestoneVoteCard = ({ id, name, description, duration, button }) => {
  return (
    <div
      className='accordion pb-1 pt-1'
      id='accordionComponent'
     
    >
      <div className='card'  style={{
        backgroundColor: 'var(--proposal-card-color)',
        color: 'var(--proposal-text-color)',
        border:'1px solid var(--table-border-color)'
      }}>
        <div
          className='card-header w-100 d-flex justify-content-between'
          id={`heading${id}`}
          style={{
            borderBottom:'1px solid var(--table-border-color)'
          }}
        >
          <h2 className='mb-0 d-flex'>
            <div
              className='btn d-flex btn-block text-left w-100 align-items-center '
              type='button'
              data-toggle='collapse'
              data-target={`#collapse${id}`}
              aria-expanded='true'
              aria-controls={`collapse${id}`}
            >
              <div className='d-flex'>
                <div className='p-2'>
                  <MdStars className={styles.icon} />
                </div>
                <div className='d-flex flex-column pl-2 pr-4'>
                  <h6 style={{   fontSize: '18', fontWeight:'600',lineHeight: '1.2', marginBottom: '0',color:'var(--font-color)' }}>
                    {name}
                  </h6>
                  <div className='d-flex pt-2'>
                    <p
                      style={{
                        marginBottom: '0',
                        fontSize: '16',
                        color: 'grey',
                      }}
                    >
                      {' '}
                      {`${duration} days`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </h2>
          {/* <ButtonGroup aria-label='Basic example'>
            <Button variant='dark' onClick={() => {}}>
              Accept
            </Button>
            <Button variant='dark' onClick={() => {}}>
              Reject
            </Button>
          </ButtonGroup> */}
          {button}
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
