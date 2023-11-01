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
  fetchProposalHistoryRequest,
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
import NavBarInputGroup from '../UI/LowerCardNavBar/NavBarInputGroup';

const LoadingDiv = styled.div`
  height: 50vh;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
`;

const ProposalHistoryCard = ({
  walletAddress,
  minHeight,
  fetchProposalByIpfsRequest,
  selectedProposalByIpfs,
  proposalListLoading,
  proposalHistoryList,
  proposalHistoryListCount,
  fetchProposalHistoryRequest,
}) => {
  const data = [...proposalHistoryList];
  const sortedProposalList =data.sort((a,b)=>Number(b._timestamp) - Number(a._timestamp));
  // const sortedProposalList =data;
  // console.log(sortedProposalList);
  // console.log(sortedProposalList);
  const [filteredProposalList, setFilteredProposalList] =
    useState(proposalHistoryList);
  const [selectedProposal, setSelectedProposal] = React.useState();

  const proposalIpfsKey = useParams().id;
  const location = useLocation();
  const DISPLAY_SIZE = 9;

  const [totalLength, setTotalLength] = useState(proposalHistoryListCount);
  const [displayLength, setDisplayLength] = useState(DISPLAY_SIZE);

  let [searchText, setSearchText] = useState('');
  const onClickProposal = proposal => {
    setSelectedProposal(proposal);
    if (location.pathname !== '/') {
      history.push(`/proposals/${proposal.ipfsHash}`);
    }
  };

  const history = useHistory();

  useEffect(() => {
    // if (proposalHistoryList.length === 0) {
    // }
    fetchProposalHistoryRequest({ startIndex: 0 });
  }, []);

  useEffect(() => {
    if (proposalIpfsKey) {
      fetchProposalByIpfsRequest({
        ipfs_key: proposalIpfsKey,
      });
    }
  }, []);

  useEffect(() => {
    let flattenedProposals = sortedProposalList;
    flattenedProposals = flattenedProposals.filter(proposal =>
      proposal?._proposal_title
        ?.toLowerCase()
        .includes(searchText?.toLowerCase()),
    );
    setTotalLength(flattenedProposals.length);
    setFilteredProposalList(flattenedProposals.slice(0, displayLength));
  }, [walletAddress, displayLength, searchText, proposalHistoryList]);

  useEffect(() => {
    if (selectedProposalByIpfs?.ipfsHash) {
      setSelectedProposal(selectedProposalByIpfs);
    }
  }, [selectedProposalByIpfs]);

  const showMore = () => {
    setDisplayLength(displayLength + DISPLAY_SIZE);
    // console.log(
    //   'Length history list',
    //   proposalHistoryList.length,
    //   proposalHistoryListCount,
    //   { displayLength },
    // );
  };

  const isShowMoreVisible = () => {
    return filteredProposalList.length > 0 && displayLength < totalLength;
  };

  return (
    <div>
      {proposalListLoading ? (
        <LoadingDiv>
          <Spinner animation='border' variant='secondary' />
        </LoadingDiv>
      ) : (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'column',
            marginTop: '16px',
            minHeight: '50vh',
          }}
        >
          <NavBarInputGroup
            placeholder='Search'
            value={searchText}
            setValue={setSearchText}
          />
          <ProposalHistoryList
            proposals={filteredProposalList}
            selectedProposal={selectedProposal}
            setSelectedProposal={setSelectedProposal}
            onClickProposal={onClickProposal}
            minHeight={minHeight}
          ></ProposalHistoryList>
          {isShowMoreVisible() && (
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
    walletAddress: state.account.address,
    selectedProposalByIpfs: state.proposals.selectedProposal,
    proposalListLoading: state.proposals.proposalListLoading,
    proposalHistoryList: state.proposals.proposalHistoryList,
    proposalHistoryListCount: state.proposals.proposalHistoryListCount,
  };
};

const mapDispatchToProps = dispatch => ({
  fetchProposalByIpfsRequest: payload =>
    dispatch(fetchProposalByIpfsRequest(payload)),
  fetchProposalHistoryRequest: payload =>
    dispatch(fetchProposalHistoryRequest(payload)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ProposalHistoryCard);
