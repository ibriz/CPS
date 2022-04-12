import React, { useState } from 'react';
import { Container, Button, Alert } from 'react-bootstrap';
import { connect } from 'react-redux';
import Proposal from './Proposal';
const PriorityVoteStatusCard = ({
  proposals,
  selectedTab,
  emptyListMessage,
  minHeight = '100px',
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
              flexDirection: 'column',
            }
      }
    >
      <>
        {proposals.length ? (
          proposals.map((proposal, index) => (
            <Proposal key={proposal} proposal={proposal} index={index} />
          ))
        ) : (
          <span
            style={{
              display: 'flex',
              justifyContent: 'center',
              fontSize: '27px',
            }}
          >
            {emptyListMessage || `No ${selectedTab} Proposals`}
          </span>
        )}
        <Alert variant='info'>
          Note: 1 = Best 2 = 2nd Best ... N = Least Best
        </Alert>
      </>
    </Container>
  );
};

const mapStateToProps = state => ({
  period: state.period.period,
});

const mapDispatchToProps = dispatch => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(PriorityVoteStatusCard);
