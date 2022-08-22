import React, { useState, useEffect } from 'react';
import { Row, Card, Col, Container } from 'react-bootstrap';
import styles from './ProposalCard.module.scss';
import TabBar from 'Components/Card/TabBar';
import ProposalList from 'Components/Card/ProposalList';
import { connect } from 'react-redux';
import {
  fetchMyProposalListRequest,
  fetchDraftsRequest,
  fetchProposalByAddressRequest,
} from 'Redux/Reducers/proposalSlice';
import Pagination from 'Components/Card/Pagination';
import proposalStates from './proposalStates';
// import { select } from 'redux-saga/effects';
import wallet from 'Redux/ICON/FrontEndWallet';
import DetailsModal from 'Components/Card/DetailsModal';
import { withRouter } from 'react-router-dom';
import { getProposalPendingProgressReport } from 'Selectors';

const MyProposalCard = ({
  myProposalList,
  fetchMyProposalListRequest,
  walletAddress,
  totalPages,
  proposalStatesList,
  initialState,
  fetchDraftsRequest,
  history,
  proposalPendingProgressReport: {
    proposalPendingProgressReport,
    proposalNotPendingProgressReport,
  },
  fetchProposalByAddressRequest,
}) => {
  const [selectedTab, setSelectedTab] = useState();
  const [filteredProposalList, setFilteredProposalList] =
    useState(myProposalList);
  let [searchText, setSearchText] = useState('');
  const [pageNumber, setPageNumber] = useState();
  const [modalShow, setModalShow] = React.useState(false);
  const [selectedProposal, setSelectedProposal] = React.useState();

  const [proposalPendingPRList, setProposalPendingPRList] = useState(
    proposalPendingProgressReport,
  );

  const onClickProposal = proposal => {
    // setModalShow(true);
    setSelectedProposal(proposal);
    history.push(`/proposals/${proposal.ipfsHash}`);
  };

  const onClickProposalDraft = proposal => {
    // setSelectedProposal(proposalList[selectedTab][proposal.index]);
    // history.push({
    //     pathname: '/newProposal',
    //     draftProposal: proposalList[selectedTab][proposal.index],
    //     isDraft: true
    //   })
  };

  useEffect(() => {
    // if (selectedTab !== 'Draft') {
    fetchMyProposalListRequest({
      // status: selectedTab,
      walletAddress: walletAddress || wallet.getAddress(),
      // pageNumber: pageNumber?.[selectedTab] ?? 1
    });

    fetchProposalByAddressRequest({
      walletAddress: walletAddress || wallet.getAddress(),
    });
    // } else {
    //     fetchDraftsRequest(
    //         {
    //             walletAddress
    //         }
    //     );
    // }
  }, [
    selectedTab,
    pageNumber,
    fetchDraftsRequest,
    fetchMyProposalListRequest,
    walletAddress,
  ]);

  const setCurrentPages = (status, pageNumber) => {
    setPageNumber(prevState => ({
      ...prevState,
      [status]: pageNumber,
    }));
  };

  useEffect(() => {
    proposalStates.map(proposalState => {
      setCurrentPages(proposalState, 1);
    });
  }, []);

  useEffect(() => {
    let filteredProposals = proposalPendingProgressReport.filter(proposal =>
      proposal._proposal_title
        ?.toLowerCase()
        .includes(searchText?.toLowerCase()),
    );

    setFilteredProposalList(filteredProposals);
    // }

    // else {
    //     filteredProposals = proposalList[selectedTab].map((proposal, index) => (
    //         {
    //             _proposal_title: proposal.projectName || 'Untitled Proposal',
    //             _contributor_address: walletAddress,
    //             _timestamp: new Date() * 1000,
    //             budget: proposal.totalBudget,
    //             index: index
    //         }
    //     ))
    // }

    // setFilteredProposalList(filteredProposals);
  }, [selectedTab, myProposalList, searchText, pageNumber, walletAddress]);

  return (
    <>
      <Row className={styles.proposalCard}>
        <Col>
          <Card>
            <Card.Body className={styles.cardBody}>
              <Container
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0px 0px 10px 0px',
                }}
              >
                <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                  My Proposals
                </div>

                <TabBar
                  selectedTab={selectedTab}
                  setSelectedTab={setSelectedTab}
                  searchText={searchText}
                  setSearchText={setSearchText}
                  tabs={[]}
                  placeholder='Search Proposal'
                  maxWidth
                />
              </Container>
              <hr style={{ marginTop: '-9px' }} />

              <ProposalList
                proposals={filteredProposalList}
                selectedTab={selectedTab}
                searchText={searchText}
                modalShow={modalShow}
                setModalShow={setModalShow}
                selectedProposal={selectedProposal}
                setSelectedProposal={setSelectedProposal}
                onClickProposal={
                  selectedTab === 'Draft'
                    ? onClickProposalDraft
                    : onClickProposal
                }
                emptyListMessage='No Proposal'
                minLayout={true}
                myProposalList={true}
              />

              {/* <Pagination
                                currentPage={pageNumber?.[selectedTab]}
                                setCurrentPage={(pageNumber) => setCurrentPages(selectedTab, pageNumber)}
                                totalPages={totalPages[selectedTab] ?? 1} /> */}

              {/* {modalShow && (
                <DetailsModal
                  show={modalShow}
                  onHide={() => setModalShow(false)}
                  proposal={selectedProposal}
                  status={selectedTab}
                />
              )} */}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

const mapStateToProps = state => ({
  myProposalList: state.proposals.myProposalList,
  walletAddress: state.account.address,
  totalPages: state.proposals.totalPages,
  proposalPendingProgressReport: getProposalPendingProgressReport(state),
});

const mapDispatchToProps = dispatch => ({
  fetchMyProposalListRequest: payload =>
    dispatch(fetchMyProposalListRequest(payload)),
  fetchDraftsRequest: payload => dispatch(fetchDraftsRequest(payload)),
  fetchProposalByAddressRequest: payload =>
    dispatch(fetchProposalByAddressRequest(payload)),
});

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(MyProposalCard),
);
