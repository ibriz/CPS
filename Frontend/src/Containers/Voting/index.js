import React from 'react';
import Header from '../../Components/Header';
import {Container} from 'react-bootstrap';
import VotingCard from './VotingCard';

const Voting = () => {
    return (
        <Container>
            <Header title="Voting" />

            <VotingCard
                proposalStatesList = {['Proposals', 'Progress Reports']}
                initialState = {'Proposals'}
            />
        </Container>
    );
}

export default Voting;