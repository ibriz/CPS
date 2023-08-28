import React, { useState, useEffect } from 'react';
import { Row, Card, Col } from 'react-bootstrap';
import styles from './ProposalCard.module.scss';
import TabBar from 'Components/Card/TabBar';
import ProposalList from 'Components/Card/ProposalList';
import { connect } from 'react-redux';
import {
  fetchProposalListRequest,
  fetchDraftsRequest,
  fetchProposalByIpfsRequest,
  emptyProposalDetailRequest,
} from 'Redux/Reducers/proposalSlice';
import Pagination from 'Components/Card/Pagination';
import proposalStates from './proposalStates';
// import { select } from 'redux-saga/effects';
import wallet from 'Redux/ICON/FrontEndWallet';
import DetailsModal from 'Components/Card/DetailsModal';
import { withRouter, useLocation, useParams } from 'react-router-dom';
import useQuery from 'Hooks/useQuery';

const ActiveProposalsCard = ({
  proposalList,
  fetchProposalListRequest,
  walletAddress,
  totalPages,
  proposalStatesList,
  initialState,
  fetchDraftsRequest,
  history,
  minHeight,
  fetchProposalByIpfsRequest,
  selectedProposalByIpfs,
  emptyProposalDetailRequest,
}) => {
  const [selectedTab, setSelectedTab] = useState(initialState);
  const [filteredProposalList, setFilteredProposalList] =
    useState(proposalList);

  let [searchText, setSearchText] = useState('');
  const [pageNumber, setPageNumber] = useState();
  const [modalShow, setModalShow] = React.useState(false);
  const [selectedProposal, setSelectedProposal] = React.useState();
  const [pageLength, setPageLength] = useState(1);
  const proposalIpfsKey = useParams().id;
  const location = useLocation();
  const onClickProposal = proposal => {
    // console.log('Here', { proposal });
    setModalShow(true);
    setSelectedProposal(proposal);
    if (location.pathname !== '/') {
      history.push(`/proposals/${proposal.ipfsHash}`);
    }
  };

  const onClickProposalDraft = proposal => {
    setSelectedProposal(proposalList[selectedTab][proposal.index]);
    history.push({
      pathname: '/newProposal',
      draftProposal: proposalList[selectedTab][proposal.index],
      isDraft: true,
    });
  };

  useEffect(() => {
    if (selectedTab !== 'Draft') {
      // fetchProposalListRequest({
      //   status: selectedTab,
      //   walletAddress: walletAddress || wallet.getAddress(),
      //   pageNumber: pageNumber?.[selectedTab] ?? 1,
      // });
      let length = totalPages[selectedTab] || 1;
      for (let i = 0; i < length; i++) {
        fetchProposalListRequest({
          status: selectedTab,
          walletAddress: walletAddress || wallet.getAddress(),
          // pageNumber: pageNumber?.[selectedTab] ?? 1,
          pageNumber: i + 1,
        });
      }
    } else {
      fetchDraftsRequest({
        walletAddress,
      });
    }
  }, [
    selectedTab,
    pageNumber,
    fetchDraftsRequest,
    fetchProposalListRequest,
    walletAddress,
    totalPages,
  ]);

  useEffect(() => {
    setCurrentPages(selectedTab, 1);
  }, [searchText]);

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
    if (proposalIpfsKey) {
      fetchProposalByIpfsRequest({
        ipfs_key: proposalIpfsKey,
      });
    }
  }, []);
  useEffect(() => {
    if (selectedProposalByIpfs?.ipfsHash) {
      setSelectedProposal(selectedProposalByIpfs);
      setTimeout(() => {
        setModalShow(true);
      }, 300);
    }
  }, [selectedProposalByIpfs]);

  const paginate = (array, page_size, page_number) => {
    return array.slice((page_number - 1) * page_size, page_number * page_size);
  };

  useEffect(() => {
    // const filteredProposals = (selectedTab !== 'All') ? proposalList.filter(
    //     (proposal) => proposal._status === proposalStatusBySelectedTab[selectedTab]
    // ) : proposalList;
    let filteredProposals;
    if (selectedTab !== 'Draft') {
      const flattenedProposals =
        [].concat.apply([], proposalList[selectedTab]) || [];
      const searchFilteredProposals = flattenedProposals.filter(proposal =>
        proposal?._proposal_title
          ?.toLowerCase()
          .includes(searchText?.toLowerCase()),
      );
      setPageLength(Math.ceil(searchFilteredProposals.length / 10) || 1);
      filteredProposals = paginate(
        searchFilteredProposals,
        10,
        pageNumber?.[selectedTab] || 1,
      );

      // filteredProposals = (
      //   proposalList[selectedTab][pageNumber?.[selectedTab] - 1 || 0] || []
      // ).filter(proposal =>
      //   proposal._proposal_title
      //     ?.toLowerCase()
      //     .includes(searchText?.toLowerCase()),
      // );
    } else {
      filteredProposals = proposalList[selectedTab].map((proposal, index) => ({
        ...proposal,
      }));
      setPageLength(Math.ceil(filteredProposals / 10) || 1);
    }

    setFilteredProposalList(filteredProposals);
  }, [selectedTab, proposalList, searchText, pageNumber, walletAddress]);

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
                onClickProposal={
                  selectedTab === 'Draft'
                    ? onClickProposalDraft
                    : onClickProposal
                }
                minHeight={minHeight}
                minLayout={true}
              />

              {filteredProposalList.length > 0 && (
                <Pagination
                  currentPage={pageNumber?.[selectedTab]}
                  setCurrentPage={pageNumber =>
                    setCurrentPages(selectedTab, pageNumber)
                  }
                  // totalPages={totalPages[selectedTab] ?? 1}
                  totalPages={pageLength}
                />
              )}
              {/* {modalShow && (
                <DetailsModal
                  show={modalShow}
                  onHide={() => {
                    setModalShow(false);
                    emptyProposalDetailRequest();
                    if (location.pathname !== '/') {
                      history.push(`/proposals`);
                    }
                  }}
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

const mapStateToProps = state => {
  // console.log(state);
  return {
    proposalList: state.proposals.proposalList,
    walletAddress: state.account.address,
    totalPages: state.proposals.totalPages,
    selectedProposalByIpfs: state.proposals.selectedProposal,
  };
};

const mapDispatchToProps = dispatch => ({
  fetchProposalListRequest: payload =>
    dispatch(fetchProposalListRequest(payload)),
  fetchDraftsRequest: payload => dispatch(fetchDraftsRequest(payload)),
  fetchProposalByIpfsRequest: payload =>
    dispatch(fetchProposalByIpfsRequest(payload)),
  emptyProposalDetailRequest: payload => dispatch(emptyProposalDetailRequest()),
});

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(ActiveProposalsCard),
);
