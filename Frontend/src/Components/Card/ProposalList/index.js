import React from 'react';
import styles from './ProposalList.module.scss';
import { Container } from 'react-bootstrap';
import Proposal from './Proposal';

const ProposalList = ({ proposals, selectedTab, onClickProposal, emptyListMessage, proposalPendingPR = false }) => {


    return (
        <Container fluid style = {proposals.length ? {} : {minHeight: '150px', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
            {
                proposals.length ? proposals.map((proposal) =>
                    <Proposal
                        key = {proposal.ipfsKey}
                        proposal={proposal}
                        selectedTab={selectedTab}
                        proposalPendingPR = {proposalPendingPR}
                        onClick={() => onClickProposal(proposal)}
                        
                    />

                ) : <span className={styles.noProposals}>{emptyListMessage || `No ${selectedTab} Proposals`}</span>
            }
        </Container>
    )
}

export default ProposalList;