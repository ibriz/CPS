import React from 'react';
import { Container} from 'react-bootstrap';
import {connect} from 'react-redux';
import UpperCard from './UpperCard';
import ProposalCard from '../../Components/ProposalCard';
import Header from '../../Components/Header';

const Proposals = ({numberOfSubmittedProposals}) => {

    return (
        <Container>
            <Header title = "Proposals"/>

            <UpperCard />
            <ProposalCard
                proposalStatesList = {['Active', 'Paused', 'Pending', 'Voting', 'Completed', 'Rejected', 'Disqualified', 'Draft']}
                initialState = {'Active'}
            />
        </Container>
    );
}

const mapStateToProps = () => state => {
    return {
        numberOfSubmittedProposals: state.proposals.numberOfSubmittedProposals
    };
};

export default connect(mapStateToProps)(Proposals);
