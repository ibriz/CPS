import React from "react";
import Header from "../../Components/Header";
import { Container } from "react-bootstrap";
import VotingCard from "Components/VotingCard";
import UpperCard from "../Proposals/UpperCard";

const Voting = () => {
  return (
    <Container>
      <Header title="Voting" />
      <UpperCard voting />

      <VotingCard
        proposalStatesList={["Proposals", "Progress Reports"]}
        initialState={"Proposals"}
      />
    </Container>
  );
};

export default Voting;
