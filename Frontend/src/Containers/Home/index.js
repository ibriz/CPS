import React from 'react';
import styles from './Home.module.scss';
import SlantedHeader from './SlantedHeader';
import ProposalCard from '../../Components/ProposalCard'

const Home = () => {
    return (
        <div className={styles.home}>
            <SlantedHeader />
            <div className={styles.proposalCard}>
                <ProposalCard
                 proposalStatesList = {['Active', 'Voting', 'Completed', 'Disqualified', 'Paused']}
                 initialState = {'Active'}
                />

            </div>
        </div>
    )
}

export default Home;