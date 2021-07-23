import React from "react";
import styles from "./ProposalList.module.scss";
import { Container } from "react-bootstrap";
import Proposal from "./Proposal";

const ProposalList = ({
  proposals,
  selectedTab,
  onClickProposal,
  emptyListMessage,
  proposalPendingPR = false,
  proposalPendingPRSameList = false,
  minHeight = "100px",
}) => {
  return (
    <Container
      fluid
      style={
        proposals.length
          ? {}
          : {
              minHeight: minHeight,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }
      }
    >
      {proposals.length ? (
        proposals.map((proposal) => (
          <Proposal
            proposal={proposal}
            selectedTab={selectedTab}
            proposalPendingPR={proposalPendingPR}
            proposalPendingPRSameList={proposal.pendingPR}
            onClick={() => onClickProposal(proposal)}
          />
        ))
      ) : (
        <span className={styles.noProposals}>
          {emptyListMessage || `No ${selectedTab} Proposals`}
        </span>
      )}
    </Container>
  );
};

export default ProposalList;
