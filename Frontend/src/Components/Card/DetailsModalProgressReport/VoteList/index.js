import React from 'react';
import { Container } from 'react-bootstrap';
import Vote from './Vote';
import styles from './VoteList.module.css';

const VoteList = () => {
  const votes = [{}];
  return (
    <Container fluid>
      {votes.length ? (
        votes.map(vote => <Vote vote={vote} />)
      ) : (
        <span className={styles.noProposals}>
          No Votes for this progress report
        </span>
      )}
    </Container>
  );
};

export default VoteList;
