import React from 'react';
import {Row, Col, Badge} from 'react-bootstrap';
import styles from './Vote.module.scss';
import LowerCardInfo from 'Components/UI/LowerCardList/LowerCardInfo';
import LowerCardTitle from 'Components/UI/LowerCardList/LowerCardTitle';
import {proposalStatusMapping} from 'Constants'

const Vote = ({vote}) => {
    return (
        <>
            <Row className={styles.proposalContainer} 
                    // onClick = {onClick}
                    >
                <Col sm="12" className = {styles.infos}>
                    <Row style={{ alignItems: 'center' }} className={styles.firstRow}>
                        {/* <Badge size="xs" variant={badgeColor[selectedTab]} className={styles.badge}>{selectedTab}</Badge>{' '} */}
                        <Col lg = "8" xs = "12" style = {{paddingLeft: '0px'}}>
                        <LowerCardTitle style = {{fontSize:'14px'}}>{vote.sponsorAddress}</LowerCardTitle>
                        </Col>
                        <Col lg = "3" xs = "12" style = {{display: 'flex', justifyContent: 'flex-end'}}>

                        <Badge size="xs" variant={proposalStatusMapping.find(mapping => 
                            mapping.name === vote.status)?.badgeColor} className={styles.badge}>{vote.status}</Badge>{' '}
                        </Col>

                    </Row>
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