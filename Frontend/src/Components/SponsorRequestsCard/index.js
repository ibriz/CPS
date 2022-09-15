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
import sortOrderProposalStates from './sortOrderProposalStates';
// import { select } from 'redux-saga/effects';
import wallet from 'Redux/ICON/FrontEndWallet';
import DetailsModal from 'Components/Card/DetailsModal';
import { useHistory } from 'react-router-dom';
import { proposalStatusMapping } from 'Constants';

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
  const PAGE_SIZE = 5;
  const [selectedTab, setSelectedTab] = useState(initialState);
  const [filteredProposalList, setFilteredProposalList] =
    useState(proposalList);
  let [searchText, setSearchText] = useState('');
  const [pageNumber, setPageNumber] = useState();
  const [pageLength, setPageLength] = useState(1);
  // const [modalShow, setModalShow] = React.useState(false);
  const [selectedProposal, setSelectedProposal] = React.useState();
  const history = useHistory();
  const onClickProposal = proposal => {
    // setModalShow(true);
    history.push(`/proposals/${proposal.ipfsHash}`);
    setSelectedProposal(proposal);
  };

  const onClickProposalDraft = proposal => {};

  useEffect(() => {
    // fetchProposalListRequest({
    //   status: selectedTab,
    //   walletAddress: walletAddress || wallet.getAddress(),
    //   pageNumber: pageNumber?.[selectedTab] ?? 1,
    // });

    let length = totalPages[selectedTab] || 1;
    for (let i = 0; i < length; i++) {
      console.log('length fetching new page');
      fetchProposalListRequest({
        status: selectedTab,
        walletAddress: walletAddress || wallet.getAddress(),
        // pageNumber: pageNumber?.[selectedTab] ?? 1,
        pageNumber: i + 1,
      });
    }

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
    setCurrentPages(selectedTab, 1);
  }, [searchText]);

  useEffect(() => {
    // const filteredProposals = (selectedTab !== 'All') ? proposalList.filter(
    //     (proposal) => proposal._status === proposalStatusBySelectedTab[selectedTab]
    // ) : proposalList;

    // const filteredProposals = (
    //   proposalList[selectedTab][pageNumber?.[selectedTab] - 1 || 0] || []
    // ).filter(proposal =>
    //   proposal._proposal_title.toLowerCase().includes(searchText.toLowerCase()),
    // );

    // setFilteredProposalList(filteredProposals);

    const flattenedProposals =
      [].concat.apply([], proposalList[selectedTab]) || [];
    const searchFilteredProposals = flattenedProposals.filter(proposal =>
      proposal?._proposal_title
        ?.toLowerCase()
        .includes(searchText?.toLowerCase()),
    );
    setPageLength(Math.ceil(searchFilteredProposals.length / PAGE_SIZE) || 1);
    const filteredProposals = paginate(
      searchFilteredProposals,
      PAGE_SIZE,
      pageNumber?.[selectedTab] || 1,
    );
    setFilteredProposalList(filteredProposals);
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
  }, [selectedTab, proposalList, searchText, pageNumber]);

  const paginate = (array, page_size, page_number) => {
    return array.slice((page_number - 1) * page_size, page_number * page_size);
  };

  return (
    <>
      <Row className={styles.proposalCard}>
        <Col>
          <Card className={styles.card}>
            <Card.Body className={styles.cardBody}>
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
                sponsorRequest={true}
                onClickProposal={
                  selectedTab === 'Draft'
                    ? onClickProposalDraft
                    : onClickProposal
                }
                minLayout={true}
              />

              {filteredProposalList.length > 0 && (
                <Pagination
                  currentPage={pageNumber?.[selectedTab]}
                  setCurrentPage={pageNumber =>
                    setCurrentPages(selectedTab, pageNumber)
                  }
                  totalPages={pageLength}
                />
              )}

              {/* {
                                modalShow && <DetailsModal
                                show={modalShow}
                                onHide={() => setModalShow(false)}
                                proposal={selectedProposal}
                                status={selectedTab}
                                sponsorRequest = {true}
                            />
                            } */}
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
