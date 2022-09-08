import React, { useState, useEffect } from 'react';
import { Row, Card, Col } from 'react-bootstrap';
import styles from './ProposalCard.module.scss';
import TabBar from 'Components/Card/VotingTabBar';
import ProposalList from 'Components/Card/ProposalList';
import { connect } from 'react-redux';
import {
  fetchProposalListRequest,
  setModalShowVoting,
  fetchRemainingVotesRequest,
  fetchSortPriorityProposalListRequest,
} from 'Redux/Reducers/proposalSlice';
import Pagination from 'Components/Card/Pagination';
import proposalStates from './proposalStates';
// import { select } from 'redux-saga/effects';
import wallet from 'Redux/ICON/FrontEndWallet';
import DetailsModal from 'Components/Card/DetailsModal';
import ProgressReportList from 'Components/Card/ProgressReportList';
import {
  fetchProgressReportListRequest,
  setModalShowVotingPR,
} from 'Redux/Reducers/progressReportSlice';
import DetailsModalProgressReport from 'Components/Card/DetailsModalProgressReport';
import PriorityVoteCard from 'Components/Card/PriorityVoteCard';
import PriorityVoteStatusCard from 'Components/Card/PriorityVoteStatusCard';
import { useHistory } from 'react-router-dom';

const VotingCard = ({
  proposalList,
  fetchProposalListRequest,
  fetchSortPriorityProposalListRequest,
  walletAddress,
  totalPages,
  totalPagesProgressReport,
  proposalStatesList,
  initialState,
  priorityVote,
  fetchProgressReport,
  progressReportList,
  modalShow,
  setModalShow,
  modalShowPR,
  setModalShowPR,
  fetchRemainingVotesRequest,
  remainingVotesProposal,
  remainingVotesPR,
  priorityVoting,
}) => {
  const [selectedTab, setSelectedTab] = useState(initialState);
  const [filteredProposalList, setFilteredProposalList] =
    useState(proposalList);
  let [searchText, setSearchText] = useState('');
  const [pageNumber, setPageNumber] = useState();
  // const [modalShow, setModalShow] = React.useState(false);
  // const [modalShowPR, setModalShowPR] = React.useState(false);
  const history = useHistory();
  const [pageLength, setPageLength] = useState(1);

  const [selectedProposal, setSelectedProposal] = React.useState();
  const status = 'Voting';
  const [filteredProgressReportList, setFilteredProgressReportList] =
    useState(progressReportList);
  const [selectedProgressReport, setSelectedProgressReport] = React.useState();

  const onClickProposal = proposal => {
    // setModalShow(true);
    history.push(`/proposals/${proposal.ipfsHash}`);
    setSelectedProposal(proposal);
  };

  const onClickProposalDraft = proposal => {};

  const onClickProgressReport = progressReport => {
    // setModalShowPR(true);
    history.push(`/progress-reports/${progressReport.ipfsHash}`);
    setSelectedProgressReport(progressReport);
  };

  useEffect(() => {
    const length =
      (selectedTab === 'Proposals'
        ? totalPages[status]
        : totalPagesProgressReport[status]) || 1;

    // Note: Total pages is 1 if proposal/pr has not been fetched yet. It fetches the first page, which gives back the total pages for that status.
    // Then the page no change will cause other pages to be fetched.
    for (let i = 0; i < length; i++) {
      if (selectedTab === 'Proposals') {
        fetchProposalListRequest({
          status: status,
          walletAddress: walletAddress || wallet.getAddress(),
          pageNumber: i + 1,
        });
      } else {
        fetchProgressReport({
          status: status,
          walletAddress: walletAddress || wallet.getAddress(),
          // pageNumber: pageNumber?.[selectedTab] ?? 1,
          pageNumber: i + 1,
        });
      }
    }
    // fetchRemainingVotesRequest({
    //   type: 'progress_report',
    // });
  }, [
    selectedTab,
    pageNumber,
    fetchRemainingVotesRequest,
    totalPages,
    totalPagesProgressReport,
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

  const paginate = (array, page_size, page_number) => {
    return array.slice((page_number - 1) * page_size, page_number * page_size);
  };

  useEffect(() => {
    // const filteredProposals = (selectedTab !== 'All') ? proposalList.filter(
    //     (proposal) => proposal._status === proposalStatusBySelectedTab[selectedTab]
    // ) : proposalList;

    // const filteredProposals = (
    //   proposalList[status][pageNumber?.[selectedTab] - 1 || 0] || []
    // ).filter(proposal => proposal._proposal_title.includes(searchText));

    // setFilteredProposalList(filteredProposals);

    if (selectedTab === 'Proposals') {
      let filteredProposals;
      const flattenedProposals =
        [].concat.apply([], proposalList[status]) || [];
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
      setFilteredProposalList(filteredProposals);
    } else {
      let filteredPRs;
      const flattenedPRs =
        [].concat.apply([], progressReportList[status]) || [];
      const searchFilteredPRs = flattenedPRs.filter(pr =>
        pr?.progressReportTitle
          ?.toLowerCase()
          .includes(searchText?.toLowerCase()),
      );

      setPageLength(Math.ceil(searchFilteredPRs.length / 10) || 1);
      filteredPRs = paginate(
        searchFilteredPRs,
        10,
        pageNumber?.[selectedTab] || 1,
      );
      setFilteredProgressReportList(filteredPRs);
    }
  }, [selectedTab, proposalList, progressReportList, searchText, pageNumber]);

  // useEffect(() => {
  //   setSelectedTab('Proposals');
  // }, [priorityVoting]);

  return (
    <>
      <Row className={styles.proposalCard}>
        <Col>
          <Card>
            <Card.Body className={styles.cardBody}>
              <TabBar
                selectedTab={selectedTab}
                setSelectedTab={setSelectedTab}
                searchText={searchText}
                setSearchText={setSearchText}
                tabs={proposalStatesList}
                placeholder='Search Proposal'
                // newIndexList={
                //   !priorityVote &&
                //   proposalStatesList.includes('Priority Voting')
                //     ? [proposalStatesList.indexOf('Priority Voting')]
                //     : []
                // }
              />
              <hr style={{ marginTop: '-9px' }} />
              {selectedTab === 'Proposals' ? (
                <>
                  <ProposalList
                    minLayout={true}
                    showBadge={false}
                    proposals={filteredProposalList}
                    selectedTab={status}
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
                </>
              ) : (
                <>
                  <ProgressReportList
                    minLayout={true}
                    showBadge={false}
                    projectReports={filteredProgressReportList}
                    selectedTab={status}
                    onClickProgressReport={onClickProgressReport}
                  />

                  {filteredProgressReportList.length > 0 && (
                    <Pagination
                      currentPage={pageNumber?.[selectedTab]}
                      setCurrentPage={pageNumber =>
                        setCurrentPages(selectedTab, pageNumber)
                      }
                      // totalPages={totalPages[selectedTab] ?? 1}
                      totalPages={pageLength}
                    />
                  )}
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

const mapStateToProps = state => ({
  proposalList: state.proposals.proposalList,
  walletAddress: state.account.address,
  totalPages: state.proposals.totalPages,
  progressReportList: state.progressReport.progressReportList,
  totalPagesProgressReport: state.progressReport.totalPages,
  modalShow: state.proposals.modalShowVoting,
  modalShowPR: state.progressReport.modalShowVotingPR,

  remainingVotesProposal: state.proposals.remainingVotes,
  remainingVotesPR: state.progressReport.remainingVotes,
  priorityVoting: state.proposals.priorityVoting,
});

const mapDispatchToProps = dispatch => ({
  fetchProposalListRequest: payload =>
    dispatch(fetchProposalListRequest(payload)),
  fetchSortPriorityProposalListRequest: payload =>
    dispatch(fetchSortPriorityProposalListRequest(payload)),
  fetchProgressReport: payload =>
    dispatch(fetchProgressReportListRequest(payload)),
  setModalShow: payload => dispatch(setModalShowVoting(payload)),
  setModalShowPR: payload => dispatch(setModalShowVotingPR(payload)),
  fetchRemainingVotesRequest: payload =>
    dispatch(fetchRemainingVotesRequest(payload)),
});

export default connect(mapStateToProps, mapDispatchToProps)(VotingCard);
