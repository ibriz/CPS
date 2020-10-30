import React, { useState, useEffect } from 'react';
import { Row, Card, Col } from 'react-bootstrap';
import styles from './ProposalCard.module.scss';
import TabBar from 'Components/Card/TabBar';
import ProposalList from 'Components/Card/ProposalList';
import { connect } from 'react-redux';
import { fetchProposalListRequest, fetchDraftsRequest } from 'Redux/Reducers/proposalSlice';
import Pagination from 'Components/Card/Pagination';
import proposalStates from './proposalStates';
// import { select } from 'redux-saga/effects';
import wallet from 'Redux/ICON/FrontEndWallet'
import DetailsModal from 'Components/Card/DetailsModal';
import {withRouter} from 'react-router-dom';

const ProposalCard = ({ proposalList, fetchProposalListRequest, walletAddress, totalPages, proposalStatesList, initialState, fetchDraftsRequest, history }) => {

    const [selectedTab, setSelectedTab] = useState(initialState);
    const [filteredProposalList, setFilteredProposalList] = useState(proposalList);
    let [searchText, setSearchText] = useState('');
    const [pageNumber, setPageNumber] = useState();
    const [modalShow, setModalShow] = React.useState(false);
    const [selectedProposal, setSelectedProposal] = React.useState();

    const onClickProposal = (proposal) => {
        setModalShow(true);
        setSelectedProposal(proposal);
    }

    const onClickProposalDraft = (proposal) => {
        setSelectedProposal(proposalList[selectedTab][proposal.index]);
        history.push({
            pathname: '/newProposal',
            draftProposal: proposalList[selectedTab][proposal.index],
            isDraft: true
          })
    }

    useEffect(() => {
        if (selectedTab !== 'Draft') {
            fetchProposalListRequest(
                {
                    status: selectedTab,
                    walletAddress: walletAddress || wallet.getAddress(),
                    pageNumber: pageNumber?.[selectedTab] ?? 1
                }
            );
        } else {
            fetchDraftsRequest(
                {
                    walletAddress
                }
            );
        }

    }, [selectedTab, pageNumber, fetchDraftsRequest, fetchProposalListRequest, walletAddress])

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
        let filteredProposals
        if(selectedTab !== 'Draft') 
        {
            filteredProposals = (proposalList[selectedTab][(pageNumber?.[selectedTab] - 1) || 0] || []).filter(
                (proposal) => proposal._proposal_title.includes(searchText)
            );
        }

        else {
            filteredProposals = proposalList[selectedTab].map((proposal, index) => (
                {
                    _proposal_title: proposal.projectName || 'Untitled Proposal',
                    _contributor_address: walletAddress,
                    _timestamp: new Date() * 1000,
                    budget: proposal.totalBudget,
                    index: index
                }
            ))
        }


        setFilteredProposalList(filteredProposals);
    }, [selectedTab, proposalList, searchText, pageNumber, walletAddress]);

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
                                placeholder="Search Proposal by title"

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
                                onClickProposal={(selectedTab === 'Draft') ? onClickProposalDraft : onClickProposal}

                            />

                            <Pagination
                                currentPage={pageNumber?.[selectedTab]}
                                setCurrentPage={(pageNumber) => setCurrentPages(selectedTab, pageNumber)}
                                totalPages={totalPages[selectedTab] ?? 1} />

                            <DetailsModal
                                show={modalShow}
                                onHide={() => setModalShow(false)}
                                proposal={selectedProposal}
                                status={selectedTab}
                            />

                        </Card.Body>
                    </Card>
                </Col>
            </Row>

        </>
    )
}

const mapStateToProps = state => (
    {
        proposalList: state.proposals.proposalList,
        walletAddress: state.account.address,
        totalPages: state.proposals.totalPages
    }
)

const mapDispatchToProps = dispatch => (
    {
        fetchProposalListRequest: (payload) => dispatch(fetchProposalListRequest(payload)),
        fetchDraftsRequest: payload => dispatch(fetchDraftsRequest(payload))
    }
)

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ProposalCard));