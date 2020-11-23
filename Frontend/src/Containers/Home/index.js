import React from 'react';
import styles from './Home.module.scss';
import SlantedHeader from './SlantedHeader';
import ProposalCard from '../../Components/ProposalCard';
import Footer from 'Components/Footer';

const Home = () => {
    return (
        <div className={styles.home}>
            <SlantedHeader />
            <div className={styles.proposalCard}>
                <ProposalCard
                 proposalStatesList = {['Active', 'Voting', 'Completed', 'Disqualified', 'Paused']}
                 initialState = {'Active'}
                 minHeight = '150px'
                />

            </div>
            

        </div>
    )
}

export default Home;