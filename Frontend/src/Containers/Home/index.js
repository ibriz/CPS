import React from 'react';
import styles from './Home.module.scss';
import SlantedHeader from './SlantedHeader';
import ProposalCard from '../../Components/ProposalCard';
import Footer from 'Components/Footer';
import { connect } from 'react-redux';
import UpperCard from 'Containers/Proposals/UpperCard';
import { Container } from 'react-bootstrap';

const Home = ({ period, isPrep, isRegistered, address }) => {
    return (
        <div className={styles.home}>
            <SlantedHeader />
            {
                address &&
                <Container style = {{marginBottom: '10px'}} className = {styles.upperCardContainer}>
                    <UpperCard />
                </Container>
            }
            <div style={{ textAlign: 'center', color: '#262626', fontSize: '1.5rem', fontWeight: '595' }}>All Proposals</div>
            <div className={styles.proposalCard}>
                <ProposalCard
                    proposalStatesList={['Active', 'Paused', 'Voting', 'Completed', 'Rejected' , 'Disqualified']}
                    initialState={'Active'}
                    minHeight='150px'
                />

            </div>


        </div>
    )
}

const mapStateToProps = state => (
    {
        address: state.account.address,
        isPrep: state.account.isPrep,
        isRegistered: state.account.isRegistered
    }
);

export default connect(mapStateToProps)(Home);