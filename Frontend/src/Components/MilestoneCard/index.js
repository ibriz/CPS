import React from 'react';
import Col from 'react-bootstrap/Col';
import Nav from 'react-bootstrap/Nav';
import Row from 'react-bootstrap/Row';
import Tab from 'react-bootstrap/Tab';
import { MdStars } from 'react-icons/md';
import styles from './MilestoneTest.module.scss';
import './style.css';

const MilestoneListCard = ({ milestoneList }) => {

  console.log({ milestoneList });
  return (
    <div className={`${styles.container} milestone-test`}>
      <div className={styles.heading}>MILESTONES</div>
      <Tab.Container id='left-tabs-example' defaultActiveKey='tab1'>
        <Row style={{gap:16}}>
          {/* left column */}
          <Col sm={12} lg={3} className={styles.leftCol}>
            <Nav
              variant='pills'
              contentClassName={styles['tab']}
              className={styles.flexColumn}
            >
              {milestoneList.map((milestone, index) => (
                <Nav.Item key={index} className={styles.navItem}>
                  <Nav.Link
                    eventKey={`tab${index + 1}`}
                    className={styles.milestoneTab}
                  >
                    <div style={{gap:"8px"}} className='d-flex flex-column '>
                      <div className='d-flex justify-content-between'>
                      <div className='d-flex align-items-center'>
                        <MdStars className={styles.icon} />
                        <h6 className={styles.smallText}>
                          Milestone {index + 1}
                        </h6>
                      </div>
                        <h6 className={styles.smallText}>{milestone.duration} days</h6>
                      </div>

                      {/* <div className={styles.tabContainer}> */}
                      <div className='d-flex flex-column'>
                        <h6 className={styles.headingText}>{milestone.name}</h6>
                      </div>
                    </div>
                  </Nav.Link>
                </Nav.Item>
              ))}
            </Nav>
          </Col>
          {/* right column */}
          <Col sm={12} md={8} className={styles.rightCol}>
            <Tab.Content>
              <div className={styles.description}>Description</div>

              {milestoneList.map((milestone, index) => (
                <Tab.Pane
                  key={index}
                  eventKey={`tab${index + 1}`}
                  className={styles.descContent}
                >
                  {milestone.description}
                </Tab.Pane>
              ))}
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>
    </div>
  );
};

export default MilestoneListCard;
