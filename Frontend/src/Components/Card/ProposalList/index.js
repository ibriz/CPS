import React from 'react';
import styles from './ProposalList.module.scss';
import { Container } from 'react-bootstrap';
import Proposal from './Proposal';

const ProposalList = ({
  proposals,
  selectedTab,
  onClickProposal,
  emptyListMessage,
  proposalPendingPR = false,
  proposalPendingPRSameList = false,
  sponsorRequest = false,
  minHeight = '100px',
  minLayout = false,
  showBadge = true,
}) => {
  return (
    <Container
      fluid
      style={
        proposals.length
          ? {}
          : {
              minHeight: minHeight,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }
      }
    >
      {proposals.length ? (
        proposals.map(proposal => (
          <Proposal
            proposal={proposal}
            selectedTab={selectedTab}
            proposalPendingPR={proposalPendingPR}
            proposalPendingPRSameList={proposal.pendingPR}
            sponsorRequest={sponsorRequest}
            onClick={() => onClickProposal(proposal)}
            minLayout={minLayout}
           showBadge={showBadge}
          />
        ))
      ) : (
        <span className={styles.noProposals}>
          {emptyListMessage || `No ${selectedTab} Proposals`}
        </span>
      )}
    </Container>
  );
};

export default ProposalList;
