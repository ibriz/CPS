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
import sortOrderProposalStates from './sortOrderProposalStates';
// import { select } from 'redux-saga/effects';
import wallet from 'Redux/ICON/FrontEndWallet';
import DetailsModal from 'Components/Card/DetailsModal';
import { withRouter } from 'react-router-dom';
import { getProposalPendingProgressReport } from 'Selectors';
import { proposalStatusMapping } from 'Constants';

const MyProposalCard = ({
  myProposalList,
  fetchMyProposalListRequest,
  walletAddress,
  totalPages,
  proposalStatesList,
  initialState,
  fetchDraftsRequest,
  myDraftsList,
  history,
  proposalList,
  proposalPendingProgressReport: {
    proposalPendingProgressReport,
    proposalNotPendingProgressReport,
  },
  fetchProposalByAddressRequest,
}) => {
  const PAGE_SIZE = 5;

  const [selectedTab, setSelectedTab] = useState('Proposals');

  const [filteredProposalList, setFilteredProposalList] =
    useState(myProposalList);
  let [searchText, setSearchText] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [modalShow, setModalShow] = React.useState(false);
  const [selectedProposal, setSelectedProposal] = React.useState();

  const [pageLength, setPageLength] = useState(1);

  const [proposalPendingPRList, setProposalPendingPRList] = useState(
    proposalPendingProgressReport,
  );

  const onClickProposal = proposal => {
    // setModalShow(true);
    setSelectedProposal(proposal);
    history.push(`/proposals/${proposal.ipfsHash}`);
  };

  const onClickProposalDraft = proposal => {
    setSelectedProposal(proposalList['Draft'][proposal.index]);
    history.push({
      pathname: '/newProposal',
      draftProposal: proposalList['Draft'][proposal.index],
      isDraft: true,
    });
  };

  useEffect(() => {
    if (selectedTab === 'Drafts') {
      fetchDraftsRequest({
        walletAddress,
      });
    } else {
      fetchMyProposalListRequest({
        // status: selectedTab,
        walletAddress: walletAddress || wallet.getAddress(),
        // pageNumber: pageNumber?.[selectedTab] ?? 1
      });

      fetchProposalByAddressRequest({
        walletAddress: walletAddress || wallet.getAddress(),
      });
    }
  }, [
    selectedTab,

    pageNumber,
    fetchDraftsRequest,
    fetchMyProposalListRequest,
    walletAddress,
  ]);

  const paginate = (array, page_size, page_number) => {
    return array.slice((page_number - 1) * page_size, page_number * page_size);
  };

  // Resets the pagination
  useEffect(() => {
    setPageNumber(1);
  }, [searchText, selectedTab]);

  useEffect(() => {
    const mainList =
      selectedTab === 'Proposals' ? myProposalList : myDraftsList;
    let filteredProposals = mainList.filter(proposal =>
      proposal._proposal_title
        ?.toLowerCase()
        .includes(searchText?.toLowerCase()),
    );

    filteredProposals.sort((a, b) => {
      const statusA = proposalStatusMapping.find(
        mapping => mapping.status === a?._status,
      )?.name;
      const statusB = proposalStatusMapping.find(
        mapping => mapping.status === b?._status,
      )?.name;
      return (
        sortOrderProposalStates[statusA] - sortOrderProposalStates[statusB]
      );
    });

    setPageLength(Math.ceil(filteredProposals.length / PAGE_SIZE) || 1);
    filteredProposals = paginate(filteredProposals, PAGE_SIZE, pageNumber || 1);

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
  }, [
    selectedTab,
    myProposalList,
    searchText,
    pageNumber,
    walletAddress,
    myDraftsList,
  ]);

  return (
    <>
      <Row className={styles.proposalCard}>
        <Col>
          <Card className={styles.card}>
            <Card.Body className={styles.cardBody}>
              <Container
                style={{
                  width: '100%',
                  display: 'flex',

                  alignItems: 'center',
                  padding: '0px 0px 10px 0px',
                }}
              >
                <div
                  style={{
                    width: '100%',
                    fontWeight: 'bold',
                    fontSize: '1.1rem',
                    whiteSpace: 'nowrap',
                  }}
                >
                  My Proposals
                  <TabBar
                    selectedTab={selectedTab}
                    setSelectedTab={setSelectedTab}
                    searchText={searchText}
                    setSearchText={setSearchText}
                    tabs={['Proposals', 'Drafts']}
                    placeholder='Search Proposal'
                    maxWidth
                  />
                </div>
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
                  selectedTab === 'Proposals'
                    ? onClickProposal
                    : onClickProposalDraft
                }
                emptyListMessage='No Proposal'
                minLayout={true}
                myProposalList={true}
                // showBudget={showDrafts ? false : true}
              />
              {filteredProposalList.length > 0 && (
                <Pagination
                  currentPage={pageNumber}
                  setCurrentPage={pageNumber => setPageNumber(pageNumber)}
                  totalPages={pageLength ?? 1}
                />
              )}

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
  myDraftsList: state.proposals.proposalList['Draft'],
  proposalList: state.proposals.proposalList,
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
