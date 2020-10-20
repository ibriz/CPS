import React from 'react';
import styles from './ProposalList.module.scss';
import { Container } from 'react-bootstrap';
import Proposal from './Proposal';

const ProposalList = ({ proposals, selectedTab, onClickProposal }) => {


    return (
        <Container fluid>
            {
                proposals.length ? proposals.map((proposal) =>
                    <Proposal
                        proposal={proposal}
                        selectedTab={selectedTab}
                        onClick={() => onClickProposal(proposal)}
                    />

                ) : <span className={styles.noProposals}>No {selectedTab} Proposals</span>
            }
        </Container>
    )
}

export default ProposalList;