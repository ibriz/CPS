import React from 'react';
import { Container } from 'react-bootstrap';
import { connect } from 'react-redux';
import ProposalCard from '../../Components/ProposalCard';
import Header from '../../Components/Header';
import ProposalHistoryCard from 'Components/ProposalHistoryCard';

const ProposalHistoryPage = ({ numberOfSubmittedProposals }) => {
  return (
    <Container>
      {/* <Header title='Proposals' /> */}

      <ProposalHistoryCard
        proposalStatesList={[
          'Voting',
          'Pending',
          'Active',
          'Paused',
          'Completed',
          'Rejected',
          'Disqualified',
          'Draft',
        ]}
        initialState={'Voting'}
      />
    </Container>
  );
};

const mapStateToProps = () => state => {
  return {
    numberOfSubmittedProposals: state.proposals.numberOfSubmittedProposals,
  };
};

export default connect(mapStateToProps)(ProposalHistoryPage);
