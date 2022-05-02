import React, { useEffect, useState } from 'react';
import styles from './TabularData.module.css';
import { connect } from 'react-redux';
import {
  fetchProposalListRequest,
  fetchProjectAmountsRequest,
} from 'Redux/Reducers/proposalSlice';
import wallet from 'Redux/ICON/FrontEndWallet';
import {
  fetchCPFTreasuryScoreAddressRequest,
  fetchCPFRemainingFundRequest,
} from 'Redux/Reducers/fundSlice';
import { icxFormat } from 'Helpers';
import useTimer from 'Hooks/useTimer';
import { fetchPrepsRequest } from 'Redux/Reducers/prepsSlice';
import PRepListModal from '../PRepListModal';

const TabularData = ({
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
  const { period } = useTimer();
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
  }, [fetchCPFRemainingFundRequest, cpfTreasuryScoreAddress]);

  const [prepListModalShow, setPrepListModalShow] = React.useState(false);

  const tabularData = [
    {
      key: 'Period',
      value: period !== 'VOTING' ? 'Application Period' : 'Voting Period',
    },
    {
      key: 'No. of Registered P-Reps',
      value: (
        <span
          onClick={() => setPrepListModalShow(true)}
          style={{ textDecoration: 'underline', cursor: 'pointer' }}
        >
          {preps.length}
        </span>
      ),
    },
    {
      key: 'Voting Proposals',
      value: `${projectAmounts.Voting.count} (${icxFormat(
        projectAmounts.Voting.amount.bnUSD || 0,
      )} bnUSD${
        projectAmounts.Voting.amount.icx > 0
          ? ', ' + icxFormat(projectAmounts.Voting.amount.icx || 0) + ' ICX)'
          : ')'
      }`,
    },
    {
      key: 'Approved Proposals',
      value: `${
        projectAmounts.Active.count + projectAmounts.Paused.count
      }(${icxFormat(
        projectAmounts.Active.amount.bnUSD ||
          0 + projectAmounts.Paused.amount.bnUSD ||
          0,
      )} bnUSD${
        projectAmounts.Active.amount.icx > 0 ||
        projectAmounts.Paused.amount.icx > 0
          ? ', ' +
            icxFormat(
              projectAmounts.Active.amount.icx ||
                0 + projectAmounts.Paused.amount.icx ||
                0,
            ) +
            ' ICX)'
          : ')'
      }`,
    },
    {
      key: 'CPF Remaining Funds',
      value: `${icxFormat(cpfRemainingFunds?.bnUSD || 0, true)} bnUSD`,
    },
  ];

  useEffect(() => {
    fetchProposalListRequest({
      status: 'Voting',
      walletAddress: walletAddress || wallet.getAddress(),
      pageNumber: 1,
    });
  }, []);

  return (
    <div className={styles.tabular}>
      {tabularData.map((data, index) => (
        <div
          className={styles.tableRow}
          style={index === 0 ? { marginTop: 0 } : {}}
          key={data.key}
        >
          <span className={styles.key}>{data.key}</span>
          <span className={styles.value}>{data.value}</span>
        </div>
      ))}

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

export default connect(mapStateToProps, mapDispatchToProps)(TabularData);
