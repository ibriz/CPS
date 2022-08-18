import React from 'react';
import useTimer from 'Hooks/useTimer';

const GrantTimeline = props => {
  const { remainingTime, remainingTimeSecond, period } = useTimer();

  return (
    <div className='landingPage__GrantTimeline'>
      <div className='grantTimelineContainer'>
        <h1>Grants Timeline</h1>
        <div className='votingPeriod'>
          <h6>
            <span>{period === 'APPLICATION' ? 'Application' : 'Voting'}</span>{' '}
            period ends in
          </h6>
          <div style={{ textAlign: 'center' }}>
            <p>
              <span>{remainingTime.day}</span> Days
            </p>
            <p>
              <span>{remainingTime.hour}</span> Hours
            </p>
            <p>
              <span>{remainingTime.minute}</span> Minutes
            </p>
            <p>
              <span>{remainingTime.second}</span> Seconds
            </p>
          </div>
        </div>
        <div className='description'>
          <div className='descriptionItem'>
            <div>Submit new Proposals and Progress Reports</div>
            <p>Application Period</p>
          </div>
          <div className='descriptionItem'>
            <div>
              P-Reps either accept or reject the submitted proposals and
              progress reports
            </div>
            <p>Voting Period</p>
          </div>
          <div className='descriptionItem'>
            <div>
              Grants are received if the proposal and/or progress report are
              accepted and pass Priority Voting
            </div>
            <p>Grant Decision</p>
          </div>
        </div>
        {/* <p style={{ textDecoration: 'underline' }}> */}
        <p>*Grants are issued monthly</p>
        <p style={{ marginTop: '10px' }}>
          For more details, please visit{' '}
          <a
            href='https://github.com/icon-community/CPS/wiki/Funding-Cycle-Explanation'
            target='_blank'
          >
            Funding Cycle Explanation
          </a>{' '}
          and{' '}
          <a
            href='https://github.com/icon-community/CPS/wiki/Priority-Voting-Explanation'
            target='_blank'
          >
            Priority Voting Explanation{' '}
          </a>
        </p>
      </div>
    </div>
  );
};

export default GrantTimeline;
