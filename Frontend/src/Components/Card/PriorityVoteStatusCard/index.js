import React from 'react';
import { Container, Alert, Row } from 'react-bootstrap';
import { connect } from 'react-redux';
import Proposal from './Proposal';
import { useSelector } from 'react-redux';

const PriorityVoteStatusCard = ({
  proposals,
  selectedTab,
  emptyListMessage,
  minHeight = '100px',
}) => {
  const isDarkTheme = localStorage.getItem('theme') === 'dark';
  // const isDark = useSelector(state => state.theme.isDark);
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
      <Row
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1rem',
          fontWeight: 600,
          fontStyle: 'normal',
          paddingBottom: '16px',
          wordWrap: 'break-word',
          color: !isDarkTheme ? '#262626' : 'white',
          textDecoration: 'underline',
        }}
      >
        Current Ranking
      </Row>
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
        Note: 1 = Highest Priority ... N = Lowest Priority
      </Alert>
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
