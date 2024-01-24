import React, { useEffect } from 'react';
import { FaAngleDown } from 'react-icons/fa';
import styles from './MilestoneVotingCard.module.scss';
import { MdStars } from 'react-icons/md';
import { ButtonGroup, Button, Row, Col, Container } from 'react-bootstrap';
import { ListTitle } from 'Components/UI/DetailsModal';
import VoteList from 'Components/Card/DetailsModalProgressReport/VoteList';
import InfoIcon from 'Components/InfoIcon';
import store from 'Redux/Store';
import { IconConverter } from 'icon-sdk-js';
import { CPSScore, call, callKeyStoreWallet } from 'Redux/ICON/utils';
import ProgressBarCombined from 'Components/Card/ProgressBarCombined';
import VoteProgressBar from 'Components/VoteProgressBar';
import { useParams } from 'react-router-dom';

const MilestoneVoteCard = ({
  id,
  reportKey,
  name,
  description,
  duration,
  status,
  budget,
  button,
  votesByProgressReport,
}) => {
  const [data, setData] = React.useState();
  const params = useParams();
  // console.log("parameters",votesByProgressReport);
  useEffect(() => {
    let isMounted = true;
    try {
      callKeyStoreWallet({
        method: 'getMilestoneVoteResult',
        params: {
          reportKey: `${reportKey}`,
          // milestoneID: `0x${Number(id).toString(16)}`
          milestoneId: `${id}`,
        },
      }).then(res => {
        if (isMounted) setData(res); // add conditional check
      });
    } catch (e) {
      console.log(e);
    }
    return () => {
      isMounted = false;
    };
  }, [id]);

  // console.log(data);

  return (
    <>
      <div className='accordion pb-1 pt-1' id='accordionComponent'>
        <div
          className='card'
          style={{
            backgroundColor: 'var(--proposal-card-color)',
            color: 'var(--proposal-text-color)',
            border: '1px solid var(--table-border-color)',
          }}
        >
          <div
            className='card-header w-100 d-flex justify-content-between'
            id={`heading${id}`}
            style={{
              borderBottom: '1px solid var(--table-border-color)',
            }}
          >
            <h2 className='mb-0 d-flex'>
              <div
                className='btn d-flex btn-block text-left w-100 align-items-center '
                type='button'
                data-toggle='collapse'
                data-target={`#collapse${id}`}
                aria-expanded='true'
                aria-controls={`collapse${id}`}
              >
                <div className='d-flex'>
                  <div className='p-2'>
                    <MdStars className={styles.icon} />
                  </div>
                  <div className='d-flex flex-column pl-2 pr-4'>
                    <div style={{ gap: 16 }} className='d-flex pt-2'>
                      <h6
                        style={{
                          fontSize: '18',
                          fontWeight: '600',
                          lineHeight: '1.2',
                          marginBottom: '0',
                          color: 'var(--font-color)',
                        }}
                      >
                        {name}
                      </h6>
                      <p
                        style={{
                          marginBottom: '0',
                          fontSize: '18',
                          lineHeight: '1.2',
                          fontWeight: '600',
                          color: status === '0x1' ? 'green' : 'red',
                        }}
                      >
                        {`( ${status === '0x1' ? 'Completed' : 'Incomplete'} )`}
                      </p>
                    </div>

                    <div style={{ gap: 16 }} className='d-flex pt-2'>
                      <p
                        style={{
                          marginBottom: '0',
                          fontSize: '16',
                          color: 'grey',
                        }}
                      >
                        {' '}
                        {`${Number(budget / 10 ** 18).toFixed(2)} bnUSD`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </h2>
            {/* <ButtonGroup aria-label='Basic example'>
            <Button variant='dark' onClick={() => {}}>
              Accept
            </Button>
            <Button variant='dark' onClick={() => {}}>
              Reject
            </Button>
          </ButtonGroup> */}
            {button}
          </div>

          <div
            id={`collapse${id}`}
            class='collapse show'
            aria-labelledby='headingOne'
            data-parent='#accordionComponent'
          >
            <div class='card-body'>
              <div className='d-flex flex-column'>
                <p style={{ fontWeight: '600', marginBottom: '4px' }}>
                  Milestone Description
                </p>
                <p>{description}</p>
              </div>
              <Row>
                <Col xs='12'>
                  {votesByProgressReport?.length ? (
                    <div
                      style={{
                        marginTop: '12px',
                        backgroundColor: 'var(--proposal-card-color)',
                        padding: '12px',
                      }}
                    >
                      <ListTitle>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                          }}
                        >
                          <div style={{ padding: '10px', display: 'flex' }}>
                            <span
                              style={{
                                marginRight: '4px',
                                color: 'var(--proposal-text-color)',
                              }}
                            >
                              VOTES
                            </span>
                            <InfoIcon
                              description={
                                'Click on a vote to view more details'
                              }
                            />
                          </div>
                        </div>
                      </ListTitle>

                      <VoteList votes={votesByProgressReport} progressReport />
                      <div
                        style={{
                          width: '100%',
                          alignItems: 'center',
                          justifyContent: 'center',
                          display: 'flex',
                          flexWrap:'wrap',
                          gap: 24,
                          padding: '4px 16px',
                        }}
                      >
                        <div style={{
                            display: 'flex',
                            gap:4,
                            flexWrap:'wrap',
                          }}>
                        <p>Stake:</p>
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                          }}
                        >
                          <ProgressBarCombined
                            approvedPercentage={IconConverter.toBigNumber(
                              (
                                (data?.approved_votes * 100) /
                                data?.total_votes
                              ).toFixed(2),
                            )}
                            rejectedPercentage={IconConverter.toBigNumber(
                              (
                                (data?.rejected_votes * 100) /
                                data?.total_votes
                              ).toFixed(2),
                            )}
                          />

                          <Container
                            style={{
                              display: 'flex',
                              flexDirection: 'row',
                            }}
                          >
                            <VoteProgressBar
                              approvedPercentage={IconConverter.toBigNumber(
                                (
                                  (data?.approved_votes * 100) /
                                  data?.total_votes
                                ).toFixed(2),
                              )}
                              rejectedPercentage={IconConverter.toBigNumber(
                                (
                                  (data?.rejected_votes * 100) /
                                  data?.total_votes
                                ).toFixed(2),
                              )}
                              noProgressBar
                              // budgetAdjustment
                            />
                          </Container>
                        </div>
                        </div>

                        <div style={{
                            display: 'flex',
                            gap:4,
                            flexWrap:'wrap',
                          }}>
                        <p>Voters:</p>

                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                          }}
                        >
                          <ProgressBarCombined
                            approvedPercentage={IconConverter.toBigNumber(
                              (
                                (data?.approve_voters * 100) /
                                data?.total_voters
                              ).toFixed(2),
                            )}
                            rejectedPercentage={IconConverter.toBigNumber(
                              (
                                (data?.reject_voters * 100) /
                                data?.total_voters
                              ).toFixed(2),
                            )}
                          />

                          <Container
                            style={{
                              display: 'flex',
                              flexDirection: 'row',
                            }}
                          >
                            <VoteProgressBar
                              approvedPercentage={IconConverter.toBigNumber(
                                (
                                  (data?.approve_voters * 100) /
                                  data?.total_voters
                                ).toFixed(2),
                              )}
                              rejectedPercentage={IconConverter.toBigNumber(
                                (
                                  (data?.reject_voters * 100) /
                                  data?.total_voters
                                ).toFixed(2),
                              )}
                              noProgressBar
                              // budgetAdjustment
                              voterCount
                            />
                          </Container>
                        </div>
                        </div>

                      </div>
                    </div>
                  ) : null}
                </Col>
              </Row>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MilestoneVoteCard;
