import { sendTransaction } from '../../ICON/utils';

function* submitProgressReportToScoreWorker({ payload }) {
    console.log("submitProgressReportToScoreWorker");
    console.log(payload);

    const params = {
        _ipfs_hash: payload.response.hash,
        _ipfs_key: payload.progressReport.projectName,
        _report_key: payload.response.ipfsKey,
        _progress_report_title: payload.progressReport.progressReportTitle ,
        _budget_adjustment: `${Number(payload.progressReport.projectTermRevision)}` ,
        _adjustment_value: Number(payload.progressReport.additionalBudget).toFixed(),
        _ipfs_link: `https://gateway.ipfs.io/ipfs/${payload.response.hash}`,
        _completed_percent: `${payload.progressReport.percentageCompleted}`,
        _additional_month: payload.progressReport.additionalTime ? `${payload.progressReport.additionalTime}` : null,


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