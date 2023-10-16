import React from 'react';
import InfoIcon from 'Components/InfoIcon';
import ProgressBarCombined from 'Components/Card/ProgressBarCombined';
import ProgressText from 'Components/UI/ProgressText';

const VoteProgressBar = ({
  voterCount,
  approvedPercentage = 0,
  rejectedPercentage = 0,
  proposal = false,
  noProgressBar = false,
  budgetAdjustment,
  placement = 'top',
}) => {
  let type;
  if (proposal) {
    type = 'proposal';
  } else if (budgetAdjustment) {
    type = 'budget adjustment request';
  } else {
    type = 'progress report';
  }

  const progressText = `${
    approvedPercentage ? approvedPercentage.toFixed() : '0'
  }% approved, ${
    rejectedPercentage ? rejectedPercentage.toFixed() : '0'
  }% rejected, ${approvedPercentage+rejectedPercentage !==100 && `${100-approvedPercentage-rejectedPercentage}% abstained`} ${budgetAdjustment ? ' (Budget Change Request)' : ''}`;
  const description = !voterCount
    ? `Percentage of total stakes of the voters that have approved / rejected the ${type} (calculated based on the total P-Reps that have already participated in the voting for this ${type}).`
    : `Percentage of the total voters that have approved / rejected the ${type} (calculated based on the total possible P-Reps regardless of whether they have already participated in the voting or not for this ${type}).`;

  return (
    <>
      <ProgressText>{progressText}</ProgressText>
      <InfoIcon description={description} placement={placement} />

      {!noProgressBar && (
        <ProgressBarCombined
          approvedPercentage={approvedPercentage}
          rejectedPercentage={rejectedPercentage}
        />
      )}
    </>
  );
};

export default VoteProgressBar;
