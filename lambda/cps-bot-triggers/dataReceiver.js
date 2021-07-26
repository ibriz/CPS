const axios = require('axios');
const { IconConverter } = require('icon-sdk-js');

const { ipfsBaseUrl, eventTypesMapping, resHeaders, scoreMethods } = require('./constants');
const { contractMethodCallService, triggerWebhook }  = require('./helpers');


exports.handler = async (req) => {
    try {
        const resCode = 200;
        console.log(req);

        if (req.httpMethod === 'POST') {
            const body = JSON.parse(req.body);
            console.log(body.eventType);
            //eventType => one of: add, vote, approve, ...
            if(!body.eventType) {
                // throw new Error({ name: "Input Validation", message: "eventType is required"});
                throw new Error("eventType is required")
            }

            switch(body.eventType) {

                //-------------------------------------------------------------------------------
                case eventTypesMapping.sponsorApproval: 
                {
                    // get details from IPFS using body's proposalIpfsHash & then filter info
                    const { proposalIpfsHash } = body.data;
                    if(!proposalIpfsHash) throw new Error("proposalIpfsHash requried");

                    let proposalDetails;
                    try {
                        proposalDetails = await axios.get(ipfsBaseUrl + proposalIpfsHash);
                    } catch (err) {
                        console.error("ERROR FETCHING PROPOSAL DATA" + JSON.stringify(err));
                        throw { statusCode: 400, name: "IPFS url", message: "Invalid IPFS hash provided" };
                    }

                    const { projectName, teamName, sponserPrep, sponserPrepName, totalBudget} = proposalDetails.data;
                    const finalResponse = {
                        projectName,
                        teamName,
                        sponsorPrepAddress: sponserPrep,
                        sponserPrepName: sponserPrepName,
                        totalBudgetIcx: totalBudget
                    };

                    await triggerWebhook(eventTypesMapping.sponsorApproval, finalResponse);
                    break;
                }

                //-------------------------------------------------------------------------------
                case eventTypesMapping.voteProposal: 
                {
                    const { proposalIpfsHash, userAddress } = body.data;
                    if(!proposalIpfsHash) throw new Error("proposalIpfsHash is required");
                    if(!userAddress) throw new Error("userAddress is required");

                    let proposalDetails;
                    try {
                        proposalDetails = await axios.get(ipfsBaseUrl + proposalIpfsHash);
                    } catch (err) {
                        console.error("ERROR FETCHING PROPOSAL DATA" + JSON.stringify(err));
                        throw { statusCode: 400, name: "IPFS url", message: "Invalid IPFS hash provided" };
                    }

                    const { projectName, teamName, sponserPrepName } = proposalDetails.data;

                    const proposalVotingInfo = await contractMethodCallService(
                        process.env['CPS_SCORE'],
                        scoreMethods.getVoteResult,
                        { '_ipfs_key': proposalIpfsHash }
                    );

                    const voterDetails = proposalVotingInfo.data.find(voter => 
                        voter.address == userAddress
                    );
                    if(!voterDetails) {
                        throw ({ 
                            statusCode: 400, 
                            name: "Voter not found", 
                            message: "Make sure that the userAddress is address of the voting P-rep"
                        });
                    }

                    const { prep_name, address, vote_reason, vote } = voterDetails;
                    const finalResponse = {
                        prepName: prep_name,
                        prepAddress: address,
                        remarks: vote_reason,
                        vote,
                        proposalName: projectName,
                        proposalTeamName: teamName,
                        proposalSponsor: sponserPrepName,
                        approvingVoters: IconConverter.toBigNumber(proposalVotingInfo.approve_voters).toFixed(0),
                        approvingVotersPercentage: IconConverter.toNumber(proposalVotingInfo.total_voters) > 0 ?
                            IconConverter.toBigNumber(proposalVotingInfo.approve_voters).dividedBy(proposalVotingInfo.total_voters).toFixed(2, 1)
                            :
                            '0',
                        rejectingVoters: IconConverter.toBigNumber(proposalVotingInfo.reject_voters).toFixed(0),
                        abstainingVoters: IconConverter.toBigNumber(proposalVotingInfo.total_voters)
                            .minus(proposalVotingInfo.approve_voters)
                            .minus(proposalVotingInfo.reject_voters)
                            .toFixed(0),
                        approvedVotes: IconConverter.toBigNumber(proposalVotingInfo.approved_votes).toFixed(0),
                        approvedVotesPercentage: IconConverter.toNumber(proposalVotingInfo.total_votes) > 0 ?
                            IconConverter.toBigNumber(proposalVotingInfo.approved_votes).dividedBy(proposalVotingInfo.total_votes).toFixed(2,1)
                            :
                            '0',
                        rejectedVotes: IconConverter.toBigNumber(proposalVotingInfo.rejected_votes).toFixed(0),
                        abstainedVotes: IconConverter.toBigNumber(proposalVotingInfo.total_votes)
                            .minus(proposalVotingInfo.approved_votes)
                            .minus(proposalVotingInfo.rejected_votes)
                            .toFixed(0),
                    };

                    await triggerWebhook(eventTypesMapping.voteProposal, finalResponse);
                    break;
                }

                //-------------------------------------------------------------------------------
                case eventTypesMapping.submitProgressReport: 
                {
                    const { proposalIpfsHash, progressIpfsHash } = body.data;
                    if(!proposalIpfsHash) throw new Error('proposalIpfsHash is required');
                    if(!progressIpfsHash) throw new Error('progressIpfsHash is required');
                    
                    // fetch proposal and progress report details from ipfs
                    let proposalDetails, progressDetails;
                    try {
                        const [ proposalDetailsRaw, progressDetailsRaw ]  = await Promise.all([
                            axios.get(ipfsBaseUrl + proposalIpfsHash),
                            axios.get(ipfsBaseUrl + progressIpfsHash)
                        ]);
                        proposalDetails = proposalDetailsRaw.data;
                        progressDetails = progressDetailsRaw.data
                        
                    } catch (err) {
                        console.error("ERROR FETCHING PROPOSAL DATA");
                        throw { statusCode: 400, name: "IPFS url", message: "Invalid IPFS hash provided" };
                    }
                    
                    const finalResponse = {
                        proposalName: proposalDetails.projectName,
                        progressReportName: progressDetails.progressReportTitle,
                        teamName: proposalDetails.teamName,
                        percentageCompleted: progressDetails.percentageCompleted,
                        sponsorPrep: proposalDetails.sponserPrepName,
                        additionalBudget: progressDetails.additionalBudget,
                        additionalTime: progressDetails.additionalTime,
                        additionalResources: progressDetails.additionalResources,
                        isLastProgressReport: progressDetails.isLastProgressReport,
                        revisionDescription: progressDetails.revisionDescription,
                        projectTermRevision: progressDetails.projectTermRevision
                    };

                    await triggerWebhook(eventTypesMapping.submitProgressReport, finalResponse);
                    break;
                }

                
                //-----------------------------------------------------------------------------
                case eventTypesMapping.voteProgressReport: 
                {
                    const { proposalIpfsHash, progressIpfsHash, userAddress, voteReason, vote } = body.data;
                    if(!proposalIpfsHash) throw new Error("proposalIpfsHash is required");
                    if(!progressIpfsHash) throw new Error("progressIpfsHash is required");
                    if(!userAddress) throw new Error("userAddress is required");
                    if(!voteReason) throw new Error("voteReason is required");
                    if(!vote) throw new Error("vote is required");
                    
                    const proposalDetails = await contractMethodCallService(
                        process.env['CPS_SCORE'],
                        scoreMethods.getProposalDetailsByHash,
                        { '_ipfs_key': proposalIpfsHash }
                    );

                    // get progress report's latest state
                    const progressReportsList = await contractMethodCallService(
                        process.env['CPS_SCORE'],
                        scoreMethods.getProgressReportsByProposal,
                        { '_ipfs_key': proposalIpfsHash }
                    );
                    const currProgressReport = progressReportsList.data.find(report => 
                        report.report_hash == progressIpfsHash
                    );
                    
                    if(!currProgressReport) {
                        throw ({ 
                            statusCode: 400, 
                            name: "Progress Report not found", 
                            message: "Ensure that the IPFS hashes for proposal and progress report are correct"
                        });
                    }

                    // fetch voter prep name
                    const prepsList = await contractMethodCallService(
                        process.env['CPS_SCORE'],
                        scoreMethods.getAllPreps
                    );
                    const voterPrep = prepsList.find(prep => 
                        prep.address == userAddress
                    );

                    const finalResponse = {
                        prepName: voterPrep.name,
                        prepAddress: voterPrep.address,
                        remarks: voteReason,
                        vote,
                        proposalName: proposalDetails['project_title'],
                        progressReportName: currProgressReport.progress_report_title,
                        approvingVoters: IconConverter.toBigNumber(currProgressReport.approve_voters).toFixed(0),
                        approvingVotersPercentage: IconConverter.toNumber(currProgressReport.total_voters) > 0 ?
                            IconConverter.toBigNumber(currProgressReport.approve_voters).dividedBy(currProgressReport.total_voters).toFixed(2, 1)
                            :
                            '0',
                        rejectingVoters: IconConverter.toBigNumber(currProgressReport.reject_voters).toFixed(0),
                        abstainOrRemainingVoters: IconConverter.toBigNumber(currProgressReport.total_voters)
                            .minus(currProgressReport.approve_voters)
                            .minus(currProgressReport.reject_voters)
                            .toFixed(0),
                        approvedVotes: IconConverter.toBigNumber(currProgressReport.approved_votes).toFixed(0),
                        approvedVotesPercentage: IconConverter.toNumber(currProgressReport.total_votes) > 0 ?
                            IconConverter.toBigNumber(currProgressReport.approved_votes).dividedBy(currProgressReport.total_votes).toFixed(2,1)
                            :
                            '0',
                        rejectedVotes: IconConverter.toBigNumber(currProgressReport.rejected_votes).toFixed(0),
                        abstainOrRemainingVotes: IconConverter.toBigNumber(currProgressReport.total_votes)
                            .minus(currProgressReport.approved_votes)
                            .minus(currProgressReport.rejected_votes)
                            .toFixed(0),
                    };

                    await triggerWebhook(eventTypesMapping.voteProgressReport, finalResponse);
                    break;
                }

                default:
                    throw new Error("Invalid eventType");
            }

            const response = {
                statusCode: resCode,
                headers: resHeaders,
                body: JSON.stringify({ message: "Successfully triggered webhook for " + body.eventType})
            }
            console.log(response);
            return response;
        }
    } catch (err) {
        console.error(JSON.stringify(err));
        console.error(err);
        return {
            statusCode: err.statusCode ? err.statusCode : 500,
            headers: resHeaders,
            body: JSON.stringify({
                error: err.name ? err.name : "Exception",
                message: err.message ? err.message : "Unknown error"
            })
        }
    }
}