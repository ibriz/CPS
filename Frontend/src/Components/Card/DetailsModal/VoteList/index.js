import React from 'react';
import {Container} from 'react-bootstrap';
import Vote from './Vote';
import styles from './VoteList.module.css';

const VoteList = ({votes, progressReport}) => {

    return(
        <Container fluid>
        {
            votes.length ? votes.map((vote, index) =>
                <Vote
                key = {index}
                vote = {vote}
                />

            ) : <span className={styles.noProposals}>No Votes for this {progressReport? 'Progress Report' : 'Proposal'}</span>
        }

    </Container>
    )
}

export default VoteList;