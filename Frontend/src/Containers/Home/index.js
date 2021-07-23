import React from "react";
import styles from "./Home.module.scss";
import SlantedHeader from "./SlantedHeader";
import ProposalCard from "../../Components/ProposalCard";
import Footer from "Components/Footer";
import { connect } from "react-redux";
import UpperCard from "Containers/Proposals/UpperCard";
import { Container } from "react-bootstrap";
import useTimer from "Hooks/useTimer";

const Home = ({ period, isPrep, isRegistered, address }) => {
  const { remainingTime, remainingTimeSecond } = useTimer();

  return (
    <div className={styles.home}>
      <SlantedHeader />

      {!address && (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <span
            className={styles.proposalTitle}
            style={{ paddingLeft: "7px", paddingRight: "7px" }}
          >
            {period === "VOTING"
              ? "Voting Period ends in "
              : "Application Period ends in  "}
            <b>{remainingTime.day}</b> days <b>{remainingTime.hour}</b> hours{" "}
            <b>{remainingTime.minute}</b> minutes <b>{remainingTime.second}</b>{" "}
            seconds
          </span>
        </div>
      )}
      {address && (
        <Container
          style={{ marginBottom: "10px" }}
          className={styles.upperCardContainer}
        >
          <UpperCard homePage />
        </Container>
      )}
      <div
        style={{
          textAlign: "center",
          color: "#262626",
          fontSize: "1.5rem",
          fontWeight: "595",
        }}
      >
        All Proposals
      </div>
      <div className={styles.proposalCard}>
        <ProposalCard
          proposalStatesList={[
            "Voting",
            "Active",
            "Paused",
            "Completed",
            "Rejected",
            "Disqualified",
          ]}
          initialState={"Voting"}
          minHeight="150px"
        />
      </div>
    </div>
  );
};

const mapStateToProps = (state) => ({
  address: state.account.address,
  isPrep: state.account.isPrep,
  isRegistered: state.account.isRegistered,
  period: state.period.period,
});

export default connect(mapStateToProps)(Home);
