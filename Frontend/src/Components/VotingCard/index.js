import React, { useState, useEffect } from 'react';
import { Row, Card, Col } from 'react-bootstrap';
import styles from './ProposalCard.module.scss';
import TabBar from 'Components/Card/TabBar';
import ProposalList from 'Components/Card/ProposalList';
import { connect } from 'react-redux';
import {
  fetchProposalListRequest,
  setModalShowVoting,
  fetchRemainingVotesRequest,
} from 'Redux/Reducers/proposalSlice';
import Pagination from 'Components/Card/Pagination';
import proposalStates from './proposalStates';
// import { select } from 'redux-saga/effects';
import wallet from 'Redux/ICON/FrontEndWallet'
import DetailsModal from 'Components/Card/DetailsModal';
import ProgressReportList from 'Components/Card/ProgressReportList';
import {fetchProgressReportListRequest, setModalShowVotingPR} from 'Redux/Reducers/progressReportSlice';
import DetailsModalProgressReport from 'Components/Card/DetailsModalProgressReport';
import PriorityVoteCard from 'Components/Card/PriorityVoteCard';


const VotingCard = ({ proposalList, fetchProposalListRequest, walletAddress, totalPages, proposalStatesList, initialState, fetchProgressReport, progressReportList,modalShow, setModalShow, modalShowPR, setModalShowPR, fetchRemainingVotesRequest, remainingVotesProposal, remainingVotesPR }) => {

    const [selectedTab, setSelectedTab] = useState(initialState);
    const [filteredProposalList, setFilteredProposalList] = useState(proposalList);
    let [searchText, setSearchText] = useState('');
    const [pageNumber, setPageNumber] = useState();
    // const [modalShow, setModalShow] = React.useState(false);
    // const [modalShowPR, setModalShowPR] = React.useState(false);

    const [selectedProposal, setSelectedProposal] = React.useState();
    const status = "Voting";
    const [filteredProgressReportList, setFilteredProgressReportList] = useState(progressReportList);
    const [selectedProgressReport, setSelectedProgressReport] = React.useState();

    const onClickProposal = (proposal) => {
        setModalShow(true);
        setSelectedProposal(proposal);
    }

    const onClickProposalDraft = (proposal) => {

    }

    const onClickProgressReport = (progressReport) => {
        setModalShowPR(true);
        setSelectedProgressReport(progressReport);
    }

    useEffect(() => {
      if(selectedTab==='Priority Voting')
      {
      fetchProposalListRequest({ status,walletAddress })
      }
    },[selectedTab])

    useEffect (() => {
        // fetchProgressReport(
        //     {
        //         status: status,
        //         walletAddress: walletAddress || wallet.getAddress(),
        //         pageNumber: pageNumber?.[selectedTab] ?? 1
        //     }        
        // );
        fetchRemainingVotesRequest(
            {
                type: "progress_report"
            }        
        );
    }, [selectedTab, pageNumber, fetchRemainingVotesRequest])

    useEffect(() => {


        // const filteredProgressReports = (progressReportList[status][(pageNumber?.[selectedTab] - 1) || 0] || []).filter(
        //     (proposal) => proposal.progressReportTitle.includes(searchText)
        // );

        const filteredProgressReports = remainingVotesPR.filter(
            (proposal) => proposal.progressReportTitle?.toLowerCase().includes(searchText?.toLowerCase())
        );

        // const filteredProgressReports = [];


        setFilteredProgressReportList(filteredProgressReports);
    }, [selectedTab, remainingVotesPR, searchText, pageNumber]);

    useEffect(() => {
        // fetchProposalListRequest(
        //     {
        //         status: status,
        //         walletAddress: walletAddress || wallet.getAddress(),
        //         pageNumber: pageNumber?.[selectedTab] ?? 1
        //     }
        // );

        fetchRemainingVotesRequest(
            {
                type: "proposal"
            }        
        );
    }, [selectedTab, pageNumber, fetchRemainingVotesRequest])

    const setCurrentPages = (status, pageNumber) => {
        setPageNumber(prevState => (
            {
                ...prevState,
                [status]: pageNumber
            }
        ))
    }

    useEffect(() => {
        proposalStates.map(proposalState => {
            setCurrentPages(proposalState, 1)
        })
    }, [])


    useEffect(() => {



        // const filteredProposals = (selectedTab !== 'All') ? proposalList.filter(
        //     (proposal) => proposal._status === proposalStatusBySelectedTab[selectedTab]
        // ) : proposalList;

        // const filteredProposals = (proposalList[status][(pageNumber?.[selectedTab] - 1) || 0] || []).filter(
        //     (proposal) => proposal._proposal_title.includes(searchText)
        // );

        const filteredProposals = remainingVotesProposal.filter(
            (proposal) => proposal._proposal_title.includes(searchText)
        );

        setFilteredProposalList(filteredProposals);
    }, [selectedTab, remainingVotesProposal, searchText, pageNumber]);

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
                                placeholder="Search Proposal"

                            />
                            <hr style={{ marginTop: '-9px' }} />
                            {
                                (selectedTab === 'Proposals' ? 
                                <ProposalList
                                proposals={filteredProposalList}
                                selectedTab={status}
                                searchText={searchText}
                                modalShow={modalShow}
                                setModalShow={setModalShow}
                                selectedProposal={selectedProposal}
                                setSelectedProposal={setSelectedProposal}
                                onClickProposal={(selectedTab === 'Draft') ? onClickProposalDraft : onClickProposal}

                            /> : (selectedTab === 'Progress Reports') ?
                            <ProgressReportList
                            projectReports = {filteredProgressReportList}
                            selectedTab = {status}
                            onClickProgressReport = {onClickProgressReport}

                             />:<PriorityVoteCard
                                proposals={proposalList?.['Voting']?.[0] || []}
                                selectedTab={status}  
                                searchText={searchText}
                                emptyListMessage = 'No Priority Voting' />
                            )
                            }


                            {/* <Pagination
                                currentPage={pageNumber?.[selectedTab]}
                                setCurrentPage={(pageNumber) => setCurrentPages(selectedTab, pageNumber)}
                                totalPages={totalPages[status]} /> */}
              {modalShow && (
                <DetailsModal
                  show={modalShow}
                  onHide={() => setModalShow(false)}
                  proposal={selectedProposal}
                  status={status}
                  voting={true}
                />
              )}

              {modalShowPR && (
                <DetailsModalProgressReport
                  show={modalShowPR}
                  onHide={() => setModalShowPR(false)}
                  progressReport={selectedProgressReport}
                  status={status}
                  voting={true}
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
  proposalList: state.proposals.proposalList,
  walletAddress: state.account.address,
  totalPages: state.proposals.totalPages,
  progressReportList: state.progressReport.progressReportList,
  totalPagesProgressReport: state.progressReport.totalPages,
  modalShow: state.proposals.modalShowVoting,
  modalShowPR: state.progressReport.modalShowVotingPR,

  remainingVotesProposal: state.proposals.remainingVotes,
  remainingVotesPR: state.progressReport.remainingVotes,
});

const mapDispatchToProps = dispatch => ({
  fetchProposalListRequest: payload =>
    dispatch(fetchProposalListRequest(payload)),
  fetchProgressReport: payload =>
    dispatch(fetchProgressReportListRequest(payload)),
  setModalShow: payload => dispatch(setModalShowVoting(payload)),
  setModalShowPR: payload => dispatch(setModalShowVotingPR(payload)),
  fetchRemainingVotesRequest: payload =>
    dispatch(fetchRemainingVotesRequest(payload)),
});

export default connect(mapStateToProps, mapDispatchToProps)(VotingCard);
