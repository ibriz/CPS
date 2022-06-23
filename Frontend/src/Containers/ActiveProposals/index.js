import React from 'react';
import Header from '../../Components/Header';
import { Container } from 'react-bootstrap';
import ActiveProposalsCard from 'Components/ActiveProposalsCard';
import UpperCard from '../Proposals/UpperCard';

const ActiveProposals = () => {
  return (
    <Container>
      {/* <Header title='Voting' /> */}
      {/* <UpperCard voting /> */}

      <ActiveProposalsCard
        proposalStatesList={['Active', 'Paused']}
        initialState={'Active'}
      />
    </Container>
  );
};

export default ActiveProposals;
