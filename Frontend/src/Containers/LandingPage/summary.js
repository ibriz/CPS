import React, { useEffect, useState, useRef } from 'react';
import { connect } from 'react-redux';
import {
  fetchProposalListRequest,
  fetchProjectAmountsRequest,
} from 'Redux/Reducers/proposalSlice';
import { fetchPrepsRequest } from 'Redux/Reducers/prepsSlice';
import {
  fetchCPFTreasuryScoreAddressRequest,
  fetchCPFRemainingFundRequest,
} from 'Redux/Reducers/fundSlice';
import { icxFormat } from 'Helpers';
import PRepListModal from 'Containers/Home/SlantedHeader/PRepListModal';
import { OverlayTrigger, Popover } from 'react-bootstrap';
var SI_SYMBOL = ['', 'k', 'M', 'G', 'T', 'P', 'E'];

function abbreviateNumber(number) {
  if (number == 0) {
    return 0;
  }
  // what tier? (determines SI symbol)
  var tier = (Math.log10(Math.abs(number)) / 3) | 0;

  // if zero, we don't need a suffix
  if (tier == 0) return number.toFixed(2);

  // get suffix and determine scale
  var suffix = SI_SYMBOL[tier];
  var scale = Math.pow(10, tier * 3);

  // scale the number
  var scaled = number / scale;

  // format number and add suffix
  return scaled.toFixed(1) + suffix;
}
const Summary = ({
  numberOfPendingProposals,
  numberOfSubmittedProposals,
  totalPendingProposalBudge,
  totalSubmittedProposalBudget,
  cpfRemainingFunds,
  numberOfApprovedProposals,
  totalApprovedProposalBudget,
  fetchProposalListRequest,
  walletAddress,
  totalCount,
  fetchCPFTreasuryScoreAddressRequest,
  fetchCPFRemainingFundRequest,
  cpfTreasuryScoreAddress,
  fetchProjectAmountsRequest,
  projectAmounts,
  fetchPrepsRequest,
  preps,
}) => {
  useEffect(() => {
    fetchCPFTreasuryScoreAddressRequest();
    fetchProjectAmountsRequest();
    fetchPrepsRequest();
  }, [
    fetchCPFTreasuryScoreAddressRequest,
    fetchProjectAmountsRequest,
    fetchPrepsRequest,
  ]);

  useEffect(() => {
    fetchCPFRemainingFundRequest();
  }, [cpfTreasuryScoreAddress]);

  const getTreasuryValue = () => {
    const result =
      (Number(cpfRemainingFunds.icx || 0) *
        (1 / Number(cpfRemainingFunds.sicxToICX || 0)) +
        Number(cpfRemainingFunds.sicx || 0)) *
        (cpfRemainingFunds.sicxTobnUSD || 0) +
      Number(cpfRemainingFunds.bnUSD || 0);
    return result || 0;
  };

  const [prepListModalShow, setPrepListModalShow] = useState(false);
  const [showPopover, setShowPopover] = useState(false);
  const ref = useRef(null);

  return (
    <div className='landingPage__Summary'>
      <div className='description'>
        <div>
          <OverlayTrigger
            trigger={['click']}
            delay={{ show: 250, hide: 200 }}
            placement={'top-start'}
            overlay={
              <Popover
                className={'balancePopover'}
                style={{ border: '2px solid #27AAB9', borderRadius: 10 }}
              >
                <Popover.Content style={{ padding: '10px 20px' }}>
                  <>
                    <span
                      style={{
                        textAlign: 'center',
                        fontSize: 18,
                        color: '#27AAB9',
                        fontWeight: 600,
                      }}
                    >
                      {abbreviateNumber(
                        Number(projectAmounts.Active?.amount?.icx || 0),
                      )}{' '}
                      ICX
                    </span>
                    <br />
                    <span
                      style={{
                        textAlign: 'center',
                        fontSize: 18,
                        color: '#27AAB9',
                        fontWeight: 600,
                      }}
                    >
                      {abbreviateNumber(
                        Number(projectAmounts.Active?.amount?.bnUSD || 0),
                      )}{' '}
                      bnUSD
                    </span>
                  </>
                </Popover.Content>
              </Popover>
            }
            rootClose
            transition
          >
            <span className='d-inline-block' style={{ cursor: 'pointer' }}>
              <p>
                {projectAmounts.Active.count}
                <br />
              </p>
              <p style={{ textDecoration: 'underline' }}>Active Projects</p>
            </span>
          </OverlayTrigger>
        </div>
        <div>
          {/* <p>{projectAmounts.Completed.count}</p>
                <p>Projects Completed</p> */}
          <OverlayTrigger
            trigger={['click']}
            delay={{ show: 250, hide: 200 }}
            placement={'top-start'}
            overlay={
              <Popover
                className={'balancePopover'}
                style={{ border: '2px solid #27AAB9', borderRadius: 10 }}
              >
                <Popover.Content style={{ padding: '10px 20px' }}>
                  <>
                    <span
                      style={{
                        textAlign: 'center',
                        fontSize: 18,
                        color: '#27AAB9',
                        fontWeight: 600,
                      }}
                    >
                      {abbreviateNumber(
                        Number(projectAmounts.Completed?.amount?.icx || 0),
                      )}{' '}
                      ICX
                    </span>
                    <br />
                    <span
                      style={{
                        textAlign: 'center',
                        fontSize: 18,
                        color: '#27AAB9',
                        fontWeight: 600,
                      }}
                    >
                      {abbreviateNumber(
                        Number(projectAmounts.Completed?.amount?.bnUSD || 0),
                      )}{' '}
                      bnUSD
                    </span>
                  </>
                </Popover.Content>
              </Popover>
            }
            rootClose
            transition
          >
            <span className='d-inline-block' style={{ cursor: 'pointer' }}>
              <p>
                {projectAmounts.Completed.count}
                <br />
              </p>
              <p style={{ textDecoration: 'underline' }}>Projects Completed</p>
            </span>
          </OverlayTrigger>
        </div>
        <div>
          <OverlayTrigger
            trigger={['click']}
            delay={{ show: 250, hide: 200 }}
            placement={'top-start'}
            overlay={
              <Popover
                className={'balancePopover'}
                style={{ border: '2px solid #27AAB9', borderRadius: 10 }}
              >
                <Popover.Content style={{ padding: '10px 20px' }}>
                  <>
                    <span
                      style={{
                        textAlign: 'center',
                        fontSize: 18,
                        color: '#27AAB9',
                        fontWeight: 600,
                      }}
                    >
                      {abbreviateNumber(Number(cpfRemainingFunds?.icx || 0))}{' '}
                      ICX
                    </span>
                    <br />
                    <span
                      style={{
                        textAlign: 'center',
                        fontSize: 18,
                        color: '#27AAB9',
                        fontWeight: 600,
                      }}
                    >
                      {abbreviateNumber(Number(cpfRemainingFunds?.bnUSD || 0))}{' '}
                      bnUSD
                    </span>
                  </>
                </Popover.Content>
              </Popover>
            }
            rootClose
            transition
          >
            <span className='d-inline-block' style={{ cursor: 'pointer' }}>
              <p>
                ${abbreviateNumber(getTreasuryValue())}
                <br />
              </p>
              <p style={{ textDecoration: 'underline' }}> Treasury Value</p>
            </span>
          </OverlayTrigger>
          {/* <Button style={{ background: 'transparent', border: 'none', boxShadow: 'none' }} ref={target} onClick={handleClick}>  </Button> */}
        </div>
        <div>
          <p>
            {' '}
            {abbreviateNumber(projectAmounts.Completed.amount.icx || 0)}
            <br />{' '}
          </p>
          <p>ICX Distribution</p>
        </div>
        <div>
          <p>
            {' '}
            {abbreviateNumber(projectAmounts.Completed.amount.bnUSD || 0)}
            <br />
          </p>
          <p>bnUSD Distribution</p>
        </div>
        <div>
          <p>
            {' '}
            {preps.length}
            <br />
          </p>
          <p
            onClick={() => setPrepListModalShow(true)}
            style={{ textDecoration: 'underline', cursor: 'pointer' }}
          >
            P-Reps
          </p>
        </div>
      </div>
      <PRepListModal
        show={prepListModalShow}
        onHide={() => setPrepListModalShow(false)}
        preps={preps}
      />
    </div>
  );
};

const mapStateToProps = () => state => {
  return {
    numberOfSubmittedProposals: state.proposals.numberOfSubmittedProposals,
    totalSubmittedProposalBudget: state.proposals.totalSubmittedProposalBudget,

    numberOfPendingProposals: state.proposals.numberOfPendingProposals,
    totalPendingProposalBudge: state.proposals.totalPendingProposalBudge,

    numberOfApprovedProposals: state.proposals.numberOfApprovedProposals,
    totalApprovedProposalBudget: state.proposals.totalApprovedProposalBudget,

    cpfRemainingFunds: state.fund.cpfRemainingFunds,
    cpfTreasuryScoreAddress: state.fund.cpfTreasuryScoreAddress,

    walletAddress: state.account.address,
    totalCount: state.proposals.totalCount,

    projectAmounts: state.proposals.projectAmounts,
    preps: state.preps.preps,
  };
};

const mapDispatchToProps = dispatch => ({
  fetchProposalListRequest: payload =>
    dispatch(fetchProposalListRequest(payload)),
  fetchCPFTreasuryScoreAddressRequest: payload =>
    dispatch(fetchCPFTreasuryScoreAddressRequest(payload)),
  fetchCPFRemainingFundRequest: payload =>
    dispatch(fetchCPFRemainingFundRequest(payload)),
  fetchProjectAmountsRequest: payload =>
    dispatch(fetchProjectAmountsRequest(payload)),
  fetchPrepsRequest: payload => dispatch(fetchPrepsRequest(payload)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Summary);
