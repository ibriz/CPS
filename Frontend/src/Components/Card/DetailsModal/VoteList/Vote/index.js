import React from 'react';
import {Row, Col, Badge} from 'react-bootstrap';
import styles from './Vote.module.scss';
import LowerCardInfo from 'Components/UI/LowerCardList/LowerCardInfo';
import LowerCardTitle from 'Components/UI/LowerCardList/LowerCardTitle';
import {proposalStatusMapping} from 'Constants'
import { formatDescription } from 'Helpers';

const Vote = ({vote, budgetChange = false}) => {

    const [showSponsorMessage, setShowSponsorMessage] = React.useState(false);

    const [voteReason, setVoteReason] = React.useState('');

    React.useEffect(() => {
        let description = formatDescription(vote?.reason);
        setVoteReason(description);
      }, [vote?.reason])
    return (
        <>
            <Row className={styles.proposalContainer} 
 onClick = {() => setShowSponsorMessage(prevState => !prevState)}                    >
                <Col sm="12" className = {styles.infos}>
                    <Row style={{ alignItems: 'center' }} className={styles.firstRow} style={budgetChange ? {cursor: 'auto'} : {}}>
                        {/* <Badge size="xs" variant={badgeColor[selectedTab]} className={styles.badge}>{selectedTab}</Badge>{' '} */}
                        <Col lg = "8" xs = "12" style = {{paddingLeft: '0px'}}>
    <LowerCardTitle style = {{fontSize:'14px'}}>{vote.prepName} ({vote.sponsorAddress?.slice(0, 4)}...{vote.sponsorAddress?.slice(vote.sponsorAddress.length - 4)})</LowerCardTitle>
                        </Col>
                        <Col lg = "3" xs = "12" className = {styles.badgeContainer}>

                        <Badge size="xs" variant={proposalStatusMapping.find(mapping => 
                            mapping.name === vote.status)?.badgeColor} className={styles.badge}>{vote.status}</Badge>{' '}
                        </Col>

                    </Row>
                    {
                        showSponsorMessage && !budgetChange &&
                        <Row className={styles.firstRow} style = {{paddingLeft: '15px'}}>
                            <span style = {{fontWeight: 600, fontSize: '0.85rem'}}>Reason:</span>
                            {
                                vote.reason ?
                                <div style = {{fontSize: '0.85rem'}}                                 
                                    dangerouslySetInnerHTML={{ __html: voteReason }}
                                /> :
                                <div style = {{fontSize: '0.85rem'}}                                 
                                
                            >No Message</div>

                            }
                        </Row>
                    }

                    {/* <Row className={styles.secondRow}>
                        <LowerCardInfo>{`${proposal._contributor_address.slice(0, 4)}...${proposal._contributor_address.slice(proposal._contributor_address.length - 3)}`}</LowerCardInfo>
                        <LowerCardInfo className={"proposalInfo2"}>Started from: {new Date(proposal._timestamp / 1000).toLocaleDateString()}</LowerCardInfo>
                        <Budget>
                            Budget: {proposal.budget} ICX
                    </Budget>

                    </Row> */}

                </Col>

                {/* <Col lg="3" xs = "12" className = {styles.dateContainer}>
                    <LowerCardInfo>{new Date(vote.timestamp / 1000).toLocaleString()}</LowerCardInfo>

                </Col> */}

            </Row>

        
            <hr className = {styles.horizontalRule}/>
        </>
    )
}

export default Vote;