import StatsCard from 'Components/StatsCard';
import React from 'react';
import { Container } from 'react-bootstrap';
import useTimer from 'Hooks/useTimer';

const StatsPage = () => {
  const { period } = useTimer();

  const votingTabs = ['Validator stats', 'Platform stats'];
  const applicationTabs = ['Platform stats'];

  return (
    <Container fluid style={{minHeight:'50vh'}}>
      {period === 'VOTING' && (
        <StatsCard stateList={votingTabs} initialState={votingTabs[0]} />
      )}

      {period === 'APPLICATION' && (
        <StatsCard
          stateList={applicationTabs}
          initialState={applicationTabs[0]}
        />
        // <StatsCard stateList={votingTabs} initialState={votingTabs[0]} />
      )}
    </Container>
  );
};

export default StatsPage;
