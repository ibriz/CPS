const { PROPOSAL_STATUS, PROGRESS_REPORT_STATUS } = require('../constants');
const { fetchFromIpfs } = require('../helpers');
const BigNumber = require('bignumber.js');

async function formatPRsResponse(allPRs) {
	const response = {
		passedProgressReports: [],
		rejectedProgressReports: [],
	};

	for(let progressReport of allPRs) {
		let proposalDetails;
		try {
				proposalDetails = await fetchFromIpfs(progressReport.ipfs_hash);
		} catch (err) {
				console.error("ERROR FETCHING PROGRESS REPORT DATA" + JSON.stringify(err));
				throw { statusCode: 400, name: "IPFS url", message: "Invalid IPFS hash provided" };
		}

		const { projectName, projectDuration, totalBudget, sponserPrepName, teamName } = proposalDetails;

		const amtReleased = new BigNumber(totalBudget).div(projectDuration);

		const progressReportRes = {
			progressReportName: progressReport.progress_report_title,
			projectName,
			projectDuration,
			totalBudget,
			sponsorName: sponserPrepName,
			teamName,
			proposalIpfsHash: progressReport.ipfs_hash,
			prIpfsHash: progressReport.report_hash,
		}

		switch(progressReport.status) {
			case PROGRESS_REPORT_STATUS.REJECTED: {
				response.rejectedProgressReports.push(progressReportRes);
				break;
			}

			case PROGRESS_REPORT_STATUS.APPROVED: {
				const passedPRDetails = {
					...progressReportRes,
					amtReleasedToApplicant: amtReleased.toFixed(0),
					amtReleasedToSponsor: amtReleased.times(0.02).toFixed(0),
				};
				response.passedProgressReports.push(passedPRDetails);
				break;
			}

			default: {
				break;
			}
		}
	}

	return response;
}


async function formatProposalDetailsResponse(allProposals) {
	
	// ==============================BUILD RESPONSE FOR PROPOSALS DETAILS==============================
	const response = {
		approvedProposals: [],
		rejectedProposals: [],
		pausedProposals: [],
		disqualifiedProposals: [],
		completedProposals: [],
	}

	for(let proposal of allProposals) {
		// fetch teamName and sponsorName
		
		let proposalDetails;
		try {
				proposalDetails = await fetchFromIpfs(proposal.ipfs_hash);
		} catch (err) {
				console.error("ERROR FETCHING PROPOSAL DATA" + JSON.stringify(err));
				throw { statusCode: 400, name: "IPFS url", message: "Invalid IPFS hash provided" };
		}

		const {teamName, sponserPrepName } = proposalDetails;

		const proposalRes = {
			proposalName: proposal.project_title,
			totalBudget: proposal.total_budget,
			teamName: teamName,
			sponsorAddress: proposal.sponsor_address,
			sponsorName: sponserPrepName,
			sponsorVoteReason: proposal.sponsor_vote_reason,
			proposalIpfsHash: proposal.ipfs_hash,
		}

		switch(proposal.status) {
			case PROPOSAL_STATUS.ACTIVE: {
				const approvedProposalDetails = {
					...proposalRes,
					approvingVoters: new BigNumber(proposal.approve_voters).toFixed(0),
					approvingVotersPercentage: new BigNumber(proposal.total_voters).toNumber() > 0 ?
							new BigNumber(proposal.approve_voters).dividedBy(proposal.total_voters).toFixed(2, 1)
							:
							'0',
					approvedVotes: new BigNumber(proposal.approved_votes).toFixed(0),
					approvedVotesPercentage: new BigNumber(proposal.total_votes) > 0 ?
							new BigNumber(proposal.approved_votes).dividedBy(proposal.total_votes).toFixed(2,1)
							:
							'0',
				};
				response.approvedProposals.push(approvedProposalDetails);
				break;
			}
			
			case PROPOSAL_STATUS.REJECTED: {
				const rejectedProposalDetails = {
					...proposalRes,
					rejectingVoters: new BigNumber(proposal.reject_voters).toFixed(0),
					rejectingVotersPercentage: new BigNumber(proposal.total_voters).toNumber() > 0 ?
							new BigNumber(proposal.reject_voters).dividedBy(proposal.total_voters).toFixed(2, 1)
							:
							'0',
					rejectedVotes: new BigNumber(proposal.rejected_votes).toFixed(0),
					rejectedVotesPercentage: new BigNumber(proposal.total_votes) > 0 ?
							new BigNumber(proposal.rejected_votes).dividedBy(proposal.total_votes).toFixed(2,1)
							:
							'0',
					abstainingVoters: new BigNumber(proposal.total_voters)
						.minus(proposal.approve_voters)
						.minus(proposal.reject_voters)
						.toFixed(0),
					abstainedVotes: new BigNumber(proposal.total_votes)
						.minus(proposal.approved_votes)
						.minus(proposal.rejected_votes)
						.toFixed(0),
				};
				response.rejectedProposals.push(rejectedProposalDetails);
				break;
			}

			case PROPOSAL_STATUS.PAUSED: {
				response.pausedProposals.push(proposalRes);
				break;
			}
			
			case PROPOSAL_STATUS.DISQUALIFIED: {
				response.disqualifiedProposals.push(proposalRes);
				break;
			}

			case PROPOSAL_STATUS.COMPLETED: {
				response.completedProposals.push(proposalRes);
				break;
			}
		}
	}

	return response;

}


module.exports = { formatProposalDetailsResponse, formatPRsResponse };