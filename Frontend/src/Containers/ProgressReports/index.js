import React from 'react';
import { Container} from 'react-bootstrap';
import {connect} from 'react-redux';
import UpperCard from './UpperCard';
import ProgressReportCard from '../../Components/ProgressReportCard';
import Header from '../../Components/Header';

const Proposals = ({numberOfSubmittedProposals}) => {

    return (
        <Container>
            <Header title = "Progress Reports"/>

            <UpperCard />
            <ProgressReportCard />
        </Container>
    );
}

const mapStateToProps = () => state => {
    return {
        numberOfSubmittedProposals: state.proposals.numberOfSubmittedProposals
    };
};

export default connect(mapStateToProps)(Proposals);
