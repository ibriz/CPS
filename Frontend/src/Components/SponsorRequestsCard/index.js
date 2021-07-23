import React, { useState, useEffect } from 'react';
import { Row, Card, Col } from 'react-bootstrap';
import styles from './ProposalCard.module.scss';
import TabBar from 'Components/Card/TabBar';
import ProposalList from 'Components/Card/ProposalList';
import { connect } from 'react-redux';
import {
  fetchSponsorRequestsListRequest,
  setModalShowSponsorRequests,
} from 'Redux/Reducers/proposalSlice';
import Pagination from 'Components/Card/Pagination';
import proposalStates from './proposalStates';
// import { select } from 'redux-saga/effects';
import wallet from 'Redux/ICON/FrontEndWallet';
import DetailsModal from 'Components/Card/DetailsModal';

const SponsorRequestsCard = ({
  proposalList,
  fetchProposalListRequest,
  walletAddress,
  totalPages,
  proposalStatesList,
  initialState,
  setModalShow,
  modalShow,
}) => {
  const [selectedTab, setSelectedTab] = useState(initialState);
  const [filteredProposalList, setFilteredProposalList] = useState(
    proposalList,
  );
  let [searchText, setSearchText] = useState('');
  const [pageNumber, setPageNumber] = useState();
  // const [modalShow, setModalShow] = React.useState(false);
  const [selectedProposal, setSelectedProposal] = React.useState();

  const onClickProposal = proposal => {
    setModalShow(true);
    setSelectedProposal(proposal);
  };

  const onClickProposalDraft = proposal => {};

  useEffect(() => {
    fetchProposalListRequest({
      status: selectedTab,
      walletAddress: walletAddress || wallet.getAddress(),
      pageNumber: pageNumber?.[selectedTab] ?? 1,
    });

    // setModalShowSponsorRequests(true);
  }, [selectedTab, pageNumber, fetchProposalListRequest, walletAddress]);

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
    // const filteredProposals = (selectedTab !== 'All') ? proposalList.filter(
    //     (proposal) => proposal._status === proposalStatusBySelectedTab[selectedTab]
    // ) : proposalList;

    const filteredProposals = (
      proposalList[selectedTab][pageNumber?.[selectedTab] - 1 || 0] || []
    ).filter(proposal => proposal._proposal_title.includes(searchText));

    setFilteredProposalList(filteredProposals);
  }, [selectedTab, proposalList, searchText]);

  return (
    <>
      <Row className={styles.proposalCard}>
        <Col>
          <Card>
            <Card.Body>
              <TabBar
                selectedTab={selectedTab}
                setSelectedTab={setSelectedTab}
                searchText={searchText}
                setSearchText={setSearchText}
                tabs={proposalStatesList}
                placeholder='Search Proposal'
              />
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
              />

              <Pagination
                currentPage={pageNumber?.[selectedTab]}
                setCurrentPage={pageNumber =>
                  setCurrentPages(selectedTab, pageNumber)
                }
                totalPages={totalPages[selectedTab]}
              />

              {modalShow && (
                <DetailsModal
                  show={modalShow}
                  onHide={() => setModalShow(false)}
                  proposal={selectedProposal}
                  status={selectedTab}
                  sponsorRequest={true}
                />
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

const mapStateToProps = state => ({
  proposalList: state.proposals.sponsorRequestsList,
  walletAddress: state.account.address,
  totalPages: state.proposals.totalPagesSponsorRequests,
  modalShow: state.proposals.modalShowSponsorRequests,
});

const mapDispatchToProps = dispatch => ({
  fetchProposalListRequest: payload =>
    dispatch(fetchSponsorRequestsListRequest(payload)),
  setModalShow: payload => dispatch(setModalShowSponsorRequests(payload)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(SponsorRequestsCard);
