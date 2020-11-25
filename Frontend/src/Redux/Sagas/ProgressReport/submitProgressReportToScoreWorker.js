import { sendTransaction } from '../../ICON/utils';

function* submitProgressReportToScoreWorker({ payload }) {
    console.log("submitProgressReportToScoreWorker");
    console.log(payload);

    const params = {
        _progress_report: {
            // ipfs_hash: payload.response.hash,
            report_hash: payload.response.hash,

            ipfs_hash: payload.progressReport.projectName,
            progress_report_title: payload.progressReport.progressReportTitle ,
            budget_adjustment: `${Number(payload.progressReport.projectTermRevision)}` ,
            additional_budget: Number(payload.progressReport.additionalBudget).toFixed(),
            ipfs_link: `https://gateway.ipfs.io/ipfs/${payload.response.hash}`,
            completed_percent: `${payload.progressReport.percentageCompleted || 0}`,
            additional_month: `${payload.progressReport.additionalTime ?? 0}`,
        }



    }

    sendTransaction({
        method: 'submit_progress_report',
        params,
        icxAmount: 0,
    }
    )

    console.log(params);
    //     const response = yield call(submitProposal, payload.proposal);
    //     yield put(submitProposalSuccess(
    //       {
    //         response,
    //         proposal: payload.proposal
    //       }
    //     ));
    //   } catch (error) {
    //     yield put(submitProposalFailure());
    //   }
}

export default submitProgressReportToScoreWorker;