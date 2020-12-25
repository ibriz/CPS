const IconService = require('icon-sdk-js');

// Environment variable declaration
const provider = process.env.BLOCKCHAIN_PROVIDER;
const score_address = process.env.SCORE_ADDRESS;
const priv_key = process.env.PRIVATE_KEY;
const user_address = process.env.USER_ADDRESS;

// ICON initialize
const {
    IconBuilder,
    HttpProvider,
    IconWallet,
    SignedTransaction,
    IconConverter,
} = IconService;
const { CallTransactionBuilder, CallBuilder } = IconBuilder;
const httpProvider = new HttpProvider(provider);
const iconService = new IconService(httpProvider);

const wallet = IconWallet.loadPrivateKey(priv_key);

const timeout = instance => {
    const seconds = instance === 1 ? 2000 : 1000;
    return new Promise(resolve => setTimeout(resolve, seconds));
};

const getResult = async (txHash, instance = 1) => {
    try {
        await timeout(instance);
        const txResult = await iconService.getTransactionResult(txHash).execute();
        console.log(txResult);
        return true;
    } catch (err) {
        if (instance === 10) {
            console.log(err);
            return false;
        }
        instance++;
        console.log(`Retrying...., Atempt ${instance - 1}`);
        await getResult(txHash, instance);
    }
};

function icon_call_builder(methodName, params = {}) {
    const callBuilder = new CallBuilder();
    const call = callBuilder
        .to(score_address)
        .method(methodName)
        .params(params)
        .build();
    return call;
}

function icon_transaction_call_builder(methodName, params = {}) {
    const callTransactionBuilder = new CallTransactionBuilder();
    const call = callTransactionBuilder
        .from(user_address)
        .to(score_address)
        .stepLimit(IconConverter.toBigNumber('2000000'))
        .nid(IconConverter.toBigNumber('3'))
        .nonce(IconConverter.toBigNumber('1'))
        .version(IconConverter.toBigNumber('3'))
        .timestamp((new Date()).getTime() * 1000)
        .method(methodName)
        .params(params)
        .build();
    return call;
}

async function recursive_score_call(func, params = {}, data = []) {
    console.log(params);
    if (Object.keys(params).length !== 0) {
        if (!params._start_index) params._start_index = 0;
    }

    const results = await iconService.call(icon_call_builder(func, params)).execute();

    console.log(results);

    if (Array.isArray(results)) return results;

    data = data.concat(results.data);

    if (parseInt(results.count, 'hex') > results.data.length) {
        params._start_index = params._end_index + 20;
        return await recursive_score_call(func, params, data)
    } else {
        return data;
    }
}

async function period_check() {
    try {
        console.log('RPC Call for Period');
        const period_status = await iconService.call(icon_call_builder('get_period_status')).execute();

        return period_status;
    } catch (error) {
        console.error(error);
        throw new Error(error);
    }
}

async function get_preps() {
    try {
        console.log('RPC call for Preps');

        const preps = await iconService.call(icon_call_builder('get_PReps')).execute();

        console.log('=========Preps=============');
        console.log(preps);
        return preps;
    } catch (error) {
        console.log(error);
        throw new Error(error);
    }
}

async function update_period() {
    try {

        const updatePeriodTransaction = await icon_transaction_call_builder('update_period');

        console.log(updatePeriodTransaction, wallet);

        const signedTransaction = new SignedTransaction(updatePeriodTransaction, wallet);
        const txHash = await iconService.sendTransaction(signedTransaction).execute();
        console.log('Transaction hash' + txHash);

        const result = await getResult(txHash);
        console.log('Result of update period' + JSON.stringify(result));

        return result;
    } catch (error) {
        console.error(error);
        throw new Error(error);
    }
}

async function get_active_proposals(address) {
    console.log('RPC Call for Active Proposals');
    const active_proposals = await recursive_score_call('get_active_proposals', { _wallet_address: address });
    // const active_proposals = await iconService.call(icon_call_builder('get_active_proposals', { _wallet_address: address })).execute();

    console.log(active_proposals);
    return active_proposals;
}

async function get_progress_reports_by_status(status = '_approved') {
    console.log('RPC Call for Budget Accepted Progress Reports');
    const accepted_active_proposals = await recursive_score_call('get_progress_reports', { status: status });
    // const accepted_active_proposals = await iconService.call(icon_call_builder('get_progress_reports', { status: '_approved' }));

    console.log(accepted_active_proposals);
    return accepted_active_proposals;
}

async function get_remaining_projects(address) {
    console.log('RPC Call for Voting List');
    const project_list = await recursive_score_call('get_remaining_project', { _project_type: 'proposal', _wallet_address: address });
    // const project_list = await iconService.call(icon_call_builder('get_remaining_project', { _wallet_address: address })).execute();

    console.log(project_list);
    return project_list;
}

async function get_proposals_details(address) {
    console.log('RPC Call for Voting List');
    const proposal_details = await recursive_score_call('get_proposal_detail_by_wallet', { _wallet_address: address });

    console.log(proposal_details);
    return proposal_details;
}

async function progress_report_reminder_before_one_day(user_details_list) {
    let address_notification_list = [];
    try {
        for (const user_detail of user_details_list) {
            const user_active_proposals = await get_active_proposals(user_detail.address);

            console.log(user_active_proposals);
            const new_user_active_proposals = user_active_proposals.filter(function (proposal) {
                return parseInt(proposal.new_progress_report) == 1;
            })
            console.log(new_user_active_proposals);

            for (const new_proposal of new_user_active_proposals) {
                user_detail.replacementTemplateData = `{
                    \"firstName\": \"${user_detail.firstName}\",
                    \"project_title\": \"${new_proposal.project_title}\",
                    \"address\": \"${user_detail.address}\"
                }`
                address_notification_list.push(user_detail);
            }
        }
    } catch (error) {
        console.error(error);
        throw new Error(error);
    } finally {
        return address_notification_list;
    }
}

async function progress_report_reminder_before_one_week(user_details_list) {
    let address_notification_list = [];
    try {
        for (const user_detail of user_details_list) {
            const user_active_proposals = await get_active_proposals(user_detail.address);

            console.log(user_active_proposals);
            const new_user_active_proposals = user_active_proposals.filter(function (proposal) {
                return parseInt(proposal.new_progress_report) == 1;
            })
            console.log(new_user_active_proposals);

            for (const new_proposal of new_user_active_proposals) {
                user_detail.replacementTemplateData = `{
                    \"firstName\": \"${user_detail.firstName}\",
                    \"project_title\": \"${new_proposal.project_title}\",
                    \"address\": \"${user_detail.address}\"
                }`
                address_notification_list.push(user_detail);
            }
        }
    } catch (error) {
        console.error(error);
        throw new Error(error);
    } finally {
        return address_notification_list;
    }
}

async function voting_reminder_before_one_day(user_details_list, type) {
    let address_notification_list = [];
    try {
        type = (type === 'Proposal') ? 'Proposal' : 'Progress Report';

        for (const user_detail of user_details_list) {
            const user_active_proposals = await get_remaining_projects(user_detail.address);

            console.log(user_active_proposals);
            const new_user_active_proposals = user_active_proposals.filter(function (proposal) {
                return proposal._project_type == type;
            })
            console.log(new_user_active_proposals);

            if (new_user_active_proposals.length != 0 && address_notification_list.indexOf(user_detail) === -1) {
                user_detail.replacementTemplateData = `{
                    \"firstName\": \"${user_detail.firstName}\",
                    \"address\": \"${user_detail.address}\"
                }`
                address_notification_list.push(user_detail);
            }
        }
    } catch (error) {
        console.error(error);
        throw new Error(error);
    } finally {
        return address_notification_list;
    }
}

async function voting_reminder_before_one_week(user_details_list, type) {
    let address_notification_list = [];
    try {
        type = (type === 'Proposal') ? 'Proposal' : 'Progress Report';

        for (const user_detail of user_details_list) {
            const user_active_proposals = await get_remaining_projects(user_detail.address);

            console.log(user_active_proposals);
            const new_user_active_proposals = user_active_proposals.filter(function (proposal) {
                return proposal._project_type == type;
            })
            console.log(new_user_active_proposals);

            if (new_user_active_proposals.length != 0 && address_notification_list.indexOf(user_detail) === -1) {
                user_detail.replacementTemplateData = `{
                    \"firstName\": \"${user_detail.firstName}\",
                    \"address\": \"${user_detail.address}\"
                }`
                address_notification_list.push(user_detail);
            }
        }
    } catch (error) {
        console.error(error);
        throw new Error(error);
    } finally {
        return address_notification_list;
    }
}

async function sponsorship_accepted_notification(user_details_list) {
    let address_notification_list = [];
    try {

        for (const user_detail of user_details_list) {
            const user_active_proposals = await get_proposals_details(user_detail.address);

            console.log(user_active_proposals);
            const new_user_active_proposals = user_active_proposals.filter(function (proposal) {
                return proposal._status == '_pending';
            })
            console.log(new_user_active_proposals);

            for (const new_proposal of new_user_active_proposals) {
                user_detail.replacementTemplateData = `{
                    \"firstName\": \"${user_detail.firstName}\",
                    \"project_title\": \"${new_proposal.project_title}\",
                    \"contributor_address\": \"${new_proposal.contributor_address}\"
                }`
                address_notification_list.push(user_detail);
            }
        }
    } catch (error) {
        console.error(error);
        throw new Error(error);
    } finally {
        return address_notification_list;
    }
}

async function proposal_accepted_notification(user_details_list) {
    let address_notification_list = [];
    try {

        for (const user_detail of user_details_list) {
            const user_active_proposals = await get_proposals_details(user_detail.address);

            console.log(user_active_proposals);
            const new_user_active_proposals = user_active_proposals.filter(function (proposal) {
                return proposal._status == '_active';
            })
            console.log(new_user_active_proposals);

            for (const new_proposal of new_user_active_proposals) {
                user_detail.replacementTemplateData = `{
                    \"firstName\": \"${user_detail.firstName}\",
                    \"project_title\": \"${new_proposal.project_title}\",
                    \"total_budget\": \"${new_proposal.total_budget}\",
                    \"project_duration\": \"${new_proposal.project_duration}\",
                    \"address\": \"${user_detail.address}\",
                }`
                address_notification_list.push(user_detail);
            }
        }
    } catch (error) {
        console.error(error);
        throw new Error(error);
    } finally {
        return address_notification_list;
    }
}

async function budget_approved_notification(user_details_list) {
    let address_notification_list = [];
    try {
        const proposals = await get_progress_reports_by_status();

        for (const user_detail of user_details_list) {

            console.log(proposals);

            const user_reports = proposals.filter(e => e.contributor_address === user_detail.address);

            for (const user_report of user_reports) {
                user_detail.replacementTemplateData = `{
                    \"firstName\": \"${user_detail.firstName}\",
                    \"progress_report_title\": \"${user_report.progress_report_title}\",
                    \"additional_budget\": \"${user_report.additional_budget}\",
                    \"address\": \"${user_detail.address}\",
                }`
                address_notification_list.push(user_detail);
            }
        }
    } catch (error) {
        console.error(error);
        throw new Error(error);
    } finally {
        return address_notification_list;
    }
}

async function budget_rejected_notification(user_details_list) {
    let address_notification_list = [];
    try {
        const proposals = await get_progress_reports_by_status('_progress_report_rejected');

        for (const user_detail of user_details_list) {

            console.log(proposals);

            const user_reports = proposals.filter(e => e.contributor_address === user_detail.address);

            for (const user_report of user_reports) {
                user_detail.replacementTemplateData = `{
                    \"firstName\": \"${user_detail.firstName}\",
                    \"progress_report_title\": \"${user_report.progress_report_title}\",
                    \"additional_budget\": \"${user_report.additional_budget}\",
                    \"address\": \"${user_detail.address}\",
                }`
                address_notification_list.push(user_detail);
            }
        }
    } catch (error) {
        console.error(error);
        throw new Error(error);
    } finally {
        return address_notification_list;
    }
}

module.exports = {
    budget_rejected_notification,
    budget_approved_notification,
    proposal_accepted_notification,
    sponsorship_accepted_notification,
    voting_reminder_before_one_day,
    voting_reminder_before_one_week,
    progress_report_reminder_before_one_day,
    progress_report_reminder_before_one_week,
    get_progress_reports_by_status,
    get_active_proposals,
    get_proposals_details,
    get_remaining_projects,
    update_period,
    period_check,
    get_preps
}
