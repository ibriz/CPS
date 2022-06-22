import React, { useState, useEffect } from 'react';
import { Button, Container, Row, Col, Card } from 'react-bootstrap';
import { connect } from 'react-redux';
import ProposalCard from '../../Components/ProposalCard';
import Header from '../../Components/Header';
import ProposalHistoryList from 'Components/Card/ProposalHistoryList';
import {
  fetchProposalListRequest,
  fetchDraftsRequest,
  fetchProposalByIpfsRequest,
  emptyProposalDetailRequest,
} from 'Redux/Reducers/proposalSlice';
import {
  withRouter,
  useLocation,
  useParams,
  useHistory,
} from 'react-router-dom';
import wallet from 'Redux/ICON/FrontEndWallet';
import ProposalList from 'Components/Card/ProposalList';
import TabBar from 'Components/Card/TabBar';
import styles from '../ActiveProposalsCard/ProposalCard.module.scss';

const ProposalHistoryCard = ({
  numberOfSubmittedProposals,
  proposalList,
  fetchProposalListRequest,
  walletAddress,
  totalPages,
  proposalStatesList,
  initialState,
  fetchDraftsRequest,
  minHeight,
  fetchProposalByIpfsRequest,
  selectedProposalByIpfs,
  emptyProposalDetailRequest,
}) => {
  const [filteredProposalList, setFilteredProposalList] =
    useState(proposalList);
  const [selectedProposal, setSelectedProposal] = React.useState();

  const proposalIpfsKey = useParams().id;
  const location = useLocation();
  const [displayLength, setDisplayLength] = useState(9);
  const [totalProposals, setTotalProposals] = useState(0);

  const [selectedTab, setSelectedTab] = useState('Completed');
  const onClickProposal = proposal => {
    setSelectedProposal(proposal);
    if (location.pathname !== '/') {
      history.push(`/proposals/${proposal.ipfsHash}`);
    }
  };

  const history = useHistory();

  useEffect(() => {
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
  }, [
    selectedTab,
    fetchDraftsRequest,
    fetchProposalListRequest,
    walletAddress,
    totalPages,
  ]);

  useEffect(() => {
    if (proposalIpfsKey) {
      fetchProposalByIpfsRequest({
        ipfs_key: proposalIpfsKey,
      });
    }
  }, []);

  useEffect(() => {
    const flattenedProposals =
      [].concat.apply([], proposalList[selectedTab]) || [];
    setTotalProposals(flattenedProposals.length);

    if (flattenedProposals.length > 0) {
      setFilteredProposalList(flattenedProposals.slice(0, displayLength));
    }
  }, [selectedTab, proposalList, walletAddress, displayLength]);

  useEffect(() => {
    if (selectedProposalByIpfs?.ipfsHash) {
      setSelectedProposal(selectedProposalByIpfs);
    }
  }, [selectedProposalByIpfs]);

  const showMore = () => {
    setDisplayLength(displayLength + 9);
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
      }}
    >
      {/* <Header title='Proposals' /> */}

      <ProposalHistoryList
        proposals={filteredProposalList}
        selectedTab={selectedTab}
        // searchText={searchText}
        selectedProposal={selectedProposal}
        setSelectedProposal={setSelectedProposal}
        onClickProposal={onClickProposal}
        minHeight={minHeight}
      ></ProposalHistoryList>
      {filteredProposalList.length > 0 && displayLength < totalProposals && (
        <Button
          variant='outline-secondary'
          style={{ borderRadius: '3px' }}
          onClick={showMore}
        >
          Show more
        </Button>
      )}

      <Row className={styles.proposalCard} style={{ marginTop: '32px' }}>
        <Col>
          <Card>
            <Card.Body className={styles.cardBody}>
              <TabBar
                selectedTab={selectedTab}
                // setSelectedTab={setSelectedTab}
                searchText={''}
                setSearchText={() => {}}
                tabs={['Completed']}
                placeholder='Search Proposal'
              />
              <hr style={{ marginTop: '-9px' }} />
              <ProposalList
                proposals={filteredProposalList}
                selectedTab={selectedTab}
                selectedProposal={selectedProposal}
                setSelectedProposal={setSelectedProposal}
                onClickProposal={onClickProposal}
                minHeight={minHeight}
              />

              {/* <Pagination
                currentPage={pageNumber?.[selectedTab]}
                setCurrentPage={pageNumber =>
                  setCurrentPages(selectedTab, pageNumber)
                }
                // totalPages={totalPages[selectedTab] ?? 1}
                totalPages={pageLength}
              /> */}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

const mapStateToProps = () => state => {
  return {
    numberOfSubmittedProposals: state.proposals.numberOfSubmittedProposals,
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

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ProposalHistoryCard);
