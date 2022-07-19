import React, { useState, useEffect } from 'react';
import { Button, Container, Row, Col, Card, Spinner } from 'react-bootstrap';
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
import styled from 'styled-components';

const LoadingDiv = styled.div`
  height: 50vh;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
`;

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
  const [totalProposals, setTotalProposals] = useState(-1);
  const [loading, setLoading] = useState(false);

  const [tabs, setTabs] = useState(['Completed', 'Rejected', 'Disqualified']);

  const onClickProposal = proposal => {
    setSelectedProposal(proposal);
    if (location.pathname !== '/') {
      history.push(`/proposals/${proposal.ipfsHash}`);
    }
  };

  const history = useHistory();

  useEffect(() => {
    for (let i = 0; i < tabs.length; i++) {
      let tab = tabs[i];
      let length = totalPages[tab] || 1;

      setLoading(true);
      for (let i = 0; i < length; i++) {
        fetchProposalListRequest({
          status: tab,
          walletAddress: walletAddress || wallet.getAddress(),
          // pageNumber: pageNumber?.[selectedTab] ?? 1,
          pageNumber: i + 1,
        });
      }
    }
  }, [
    fetchDraftsRequest,
    fetchProposalListRequest,
    tabs,
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
    const flattenedProposals = [];
    for (let i = 0; i < tabs.length; i++) {
      const flattenedProposalsTemp =
        [].concat.apply([], proposalList[tabs[i]]) || [];

      flattenedProposals.push(...flattenedProposalsTemp);
    }

    setTotalProposals(flattenedProposals.length);
    if (flattenedProposals.length > 0) {
      setLoading(false);
      setFilteredProposalList(flattenedProposals.slice(0, displayLength));
    }
  }, [proposalList, walletAddress, displayLength, tabs]);

  useEffect(() => {
    if (selectedProposalByIpfs?.ipfsHash) {
      setSelectedProposal(selectedProposalByIpfs);
    }
  }, [selectedProposalByIpfs]);

  const showMore = () => {
    setDisplayLength(displayLength + 9);
  };

  return (
    <div>
      {loading ? (
        <LoadingDiv>
          <Spinner animation='border' variant='secondary' />
        </LoadingDiv>
      ) : (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'column',
          }}
        >
          <ProposalHistoryList
            proposals={filteredProposalList}
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

          <Row
            className={styles.proposalCard}
            style={{ marginTop: '32px' }}
          ></Row>
        </div>
      )}
      {/* <Header title='Proposals' /> */}
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
