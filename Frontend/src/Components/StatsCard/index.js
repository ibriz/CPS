import React, { useState, useEffect } from 'react';
import { Row, Card, Col, Spinner, Container, Button } from 'react-bootstrap';
import TabBar from 'Components/Card/TabBar';
import { connect } from 'react-redux';
import { withRouter, useLocation, useParams } from 'react-router-dom';
import styles from './StatsCard.module.scss';
import ValidatorStatsCard from './ValidatorStatsCard';
import PlatformStatsCard from './PlatformStatsCard';
import {
  fetchPrepsRequest,
  fetchPrepsWithStatsRequest,
} from 'Redux/Reducers/prepsSlice';
import { fetchProposalListRequest } from 'Redux/Reducers/proposalSlice';
import { fetchProgressReportListRequest } from 'Redux/Reducers/progressReportSlice';
import styled from 'styled-components';

import wallet from 'Redux/ICON/FrontEndWallet';
const LoadingDiv = styled.div`
  height: 50vh;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
`;
const StatsCard = ({
  stateList,
  initialState,
  preps,
  prepsWithStats,
  totalCountProposal,
  progressReports,
  walletAddress,
  fetchPrepsRequest,
  fetchPrepsWithStatsRequest,
  fetchProposalListRequest,
  fetchProgressReport,
  loading,
}) => {
  const [selectedTab, setSelectedTab] = useState(initialState);
  //   const [filteredProposalList, setFilteredProposalList] =
  //     useState(proposalList);

  //   let [searchText, setSearchText] = useState('');
  //   const [pageNumber, setPageNumber] = useState();
  //   const [modalShow, setModalShow] = React.useState(false);
  //   const [selectedProposal, setSelectedProposal] = React.useState();
  //   const [pageLength, setPageLength] = useState(1);
  //   const proposalIpfsKey = useParams().id;
  //   const location = useLocation();
  //   const onClickProposal = proposal => {
  //     console.log('Here', { proposal });
  //     setModalShow(true);
  //     setSelectedProposal(proposal);
  //     if (location.pathname !== '/') {
  //       history.push(`/proposals/${proposal.ipfsHash}`);
  //     }
  //   };

  useEffect(() => {
    if (selectedTab === 'Validator stats') {
      fetchProposalListRequest({
        status: 'Voting',
        walletAddress: walletAddress || wallet.getAddress(),
        pageNumber: 1,
      });
      fetchProgressReport({
        status: 'Voting',
        walletAddress: walletAddress || wallet.getAddress(),
        pageNumber: 1,
      });
    }
  }, []);

  useEffect(() => {
    if (!prepsWithStats && selectedTab === 'Validator stats')
      fetchPrepsWithStatsRequest();
  }, []);

  let totalCountProgressReport = 0;
  for (let i = 0; i < progressReports.length; i++) {
    totalCountProgressReport += progressReports[i].length;
  }

  return loading ? (
    <Container>
      <LoadingDiv>
        <Spinner animation='border' variant='secondary' />
      </LoadingDiv>
    </Container>
  ) : (
    <>
      <Row className={styles.proposalCard}>
        <Col>
          <Card className={styles.card}>
            <Card.Body className={styles.cardBody}>
              <Container className={styles.statsTab}>
                <TabBar
                  selectedTab={selectedTab}
                  setSelectedTab={setSelectedTab}
                  // searchText={searchText}
                  // setSearchText={setSearchText}
                  tabs={stateList}
                  // placeholder='Search Proposal'
                  hideSearch={true}
                />

                {selectedTab === 'Validator stats' && (
                  <Button
                    className={styles.refreshButton}
                    onClick={fetchPrepsWithStatsRequest}
                  >
                    Refresh
                  </Button>
                )}
              </Container>
              <hr style={{ marginTop: '-9px' }} />

              {selectedTab === 'Validator stats' && (
                <ValidatorStatsCard
                  preps={prepsWithStats}
                  count1={totalCountProposal}
                  count2={totalCountProgressReport}
                />
              )}
              {selectedTab === 'Platform stats' && <PlatformStatsCard />}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};
const mapStateToProps = state => {
  return {
    proposalList: state.proposals.proposalList,
    walletAddress: state.account.address,
    totalPages: state.proposals.totalPages,
    selectedProposalByIpfs: state.proposals.selectedProposal,
    preps: state.preps.preps,
    prepsWithStats: state.preps.prepsWithStats,
    loading: state.preps.loading,
    totalCountProposal: state.proposals.totalCount['Voting'],
    progressReports: state.progressReport.progressReportList['Voting'],

    walletAddress: state.account.address,
  };
};

const mapDispatchToProps = dispatch => ({
  //   fetchProposalListRequest: payload =>
  //     dispatch(fetchProposalListRequest(payload)),
  //   fetchDraftsRequest: payload => dispatch(fetchDraftsRequest(payload)),
  //   fetchProposalByIpfsRequest: payload =>
  //     dispatch(fetchProposalByIpfsRequest(payload)),
  //   emptyProposalDetailRequest: payload => dispatch(emptyProposalDetailRequest()),
  fetchPrepsRequest: payload => dispatch(fetchPrepsRequest(payload)),
  fetchPrepsWithStatsRequest: payload =>
    dispatch(fetchPrepsWithStatsRequest(payload)),
  fetchProposalListRequest: payload =>
    dispatch(fetchProposalListRequest(payload)),
  fetchProgressReport: payload =>
    dispatch(fetchProgressReportListRequest(payload)),
});

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(StatsCard),
);
