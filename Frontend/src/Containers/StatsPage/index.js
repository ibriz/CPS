import StatsCard from 'Components/StatsCard';
import React from 'react';
import { Container } from 'react-bootstrap';

export default function StatsPage() {
  return (
    <Container fluid>
      {' '}
      <StatsCard
        stateList={['Validator stats', 'Platform stats']}
        initialState={'Validator stats'}
      />
    </Container>
  );
}
