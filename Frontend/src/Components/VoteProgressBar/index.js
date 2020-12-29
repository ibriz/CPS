import React from 'react';
import InfoIcon from 'Components/InfoIcon';
import ProgressBarCombined from 'Components/Card/ProgressBarCombined';
import ProgressText from 'Components/UI/ProgressText';

const VoteProgressBar = ({voterCount, approvedPercentage = 0, rejectedPercentage = 0, proposal = false, noProgressBar = false, budgetAdjustment}) => {

    let type;
    if(proposal) {
        type = 'proposal';
    } else if (budgetAdjustment) {
        type = 'budget adjustment request';
    } else {
        type = 'progress report';
    }

    const progressText = `${voterCount ? 'Voter count ' : 'Stake'}- ${approvedPercentage ? approvedPercentage.toFixed() : 0}% approved, ${rejectedPercentage ? rejectedPercentage.toFixed() : 0}% rejected${budgetAdjustment ? ' (Budget Change Request)': ''}`;
    const description = !voterCount ? `Percentage of total stakes of the voters that have approved / rejected the ${type}` : `Percetage of the total voters that have approved / rejected the ${proposal ? 'proposal' : 'progress report'}`;

    return (
        <>
            <ProgressText>{progressText}</ProgressText>
            <InfoIcon description={description}
                placement="top" />

            {
                !noProgressBar && 
                <ProgressBarCombined
                approvedPercentage={approvedPercentage}
                rejectedPercentage={rejectedPercentage}
            />
            }

        </>
    )
};

export default VoteProgressBar