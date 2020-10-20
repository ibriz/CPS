import React from 'react';
import Header from '../../Components/Header';
import {Container} from 'react-bootstrap';
import SponsorRequestsCard from './SponsorRequestsCard';

const SponsorRequests = () => {
    return (
        <Container>
            <Header title="Sponsor Requests" />

            <SponsorRequestsCard
                proposalStatesList = {['Pending', 'Approved', 'Rejected']}
                initialState = {'Pending'}
            />
        </Container>
    );
}

export default SponsorRequests;