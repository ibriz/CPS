import React, { useState } from 'react';
import { Container, Button } from 'react-bootstrap';
import { connect } from 'react-redux';
import { submitPriorityVotingRequest } from 'Redux/Reducers/proposalSlice';
import styles from './PriorityVoteList.module.scss';
import Proposal from './Proposal';
const PriorityVoteCard = ({
  proposals,
  selectedTab,
  emptyListMessage,
  submitPriorityVoting,
  minHeight = '100px',
}) => {
  const [priorityVoteList, setPriorityVoteList] = useState([]);
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
              flexDirection: 'column',
            }
      }
    >
      <>
        {proposals.length ? (
          proposals.map(proposal => (
            <Proposal
              key={proposal}
              proposal={proposal}
              selectedTab={selectedTab}
              priorityVoteList={priorityVoteList}
              onClick={() => {
                if (priorityVoteList.includes(proposal.ipfsHash)) {
                  setPriorityVoteList(
                    priorityVoteList.filter(res => res != proposal.ipfsHash),
                  );
                } else {
                  setPriorityVoteList(prev => [...prev, proposal.ipfsHash]);
                }
              }}
            />
          ))
        ) : (
          <span className={styles.noProposals}>
            {emptyListMessage || `No ${selectedTab} Proposals`}
          </span>
        )}
        <br />
        {priorityVoteList.length > 0 && (
          <div style={{ width: '100%', textAlign: 'end' }}>
            <Button
              disabled={proposals.length !== priorityVoteList.length}
              onClick={() => {
                if (proposals.length === priorityVoteList.length) {
                  submitPriorityVoting({ proposals: priorityVoteList });
                }
              }}
              variant='info'
              className={styles.createProposalButton}
            >
              SUBMIT PRIORITY VOTE
            </Button>
          </div>
        )}
      </>
    </Container>
  );
};

const mapStateToProps = state => ({
  period: state.period.period,
});

const mapDispatchToProps = dispatch => ({
  submitPriorityVoting: ({ proposals }) =>
    dispatch(submitPriorityVotingRequest({ proposals })),
});

export default connect(mapStateToProps, mapDispatchToProps)(PriorityVoteCard);
