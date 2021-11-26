from iconservice import *


class ProgressReportData(object):

    def __init__(self, db: IconScoreDatabase) -> None:
        self.ipfs_hash = VarDB('ipfs_hash', db, str)
        self.report_hash = VarDB('report_hash', db, str)
        self.progress_report_title = VarDB('progress_report_title', db, str)
        self.timestamp = VarDB('timestamp', db, int)
        self.status = VarDB('status', db, str)
        self.tx_hash = VarDB('tx_hash', db, str)

        self.budget_adjustment = VarDB("budget_adjustment", db, bool)
        self.additional_budget = VarDB('additional_budget', db, int)
        self.additional_month = VarDB('additional_month', db, int)
        self.voters_reasons = ArrayDB("voters_reasons", db, bytes)

        self.total_votes = VarDB("total_votes", db, int)
        self.approved_votes = VarDB("approved_votes", db, int)
        self.rejected_votes = VarDB("rejected_votes", db, int)

        self.voters_list = ArrayDB("voters_list", db, Address)
        self.approve_voters = ArrayDB("approve_voters", db, Address)
        self.reject_voters = ArrayDB("reject_voters", db, Address)
        self.total_voters = VarDB("total_voters", db, int)
        self.voters_list_index = DictDB('voters_list_indexes', db, value_type=int, depth=2)

        self.budget_approved_votes = VarDB("budget_approved_votes", db, int)
        self.budget_rejected_votes = VarDB("budget_rejected_votes", db, int)
        self.budget_approve_voters = ArrayDB("budget_approve_voters", db, Address)
        self.budget_reject_voters = ArrayDB("budget_reject_voters", db, Address)
        self.budget_adjustment_status = VarDB("budget_adjustment_status", db, str)
        self.budget_voters_list_index = DictDB('budget_voters_list_indexes', db, value_type=int, depth=2)


class ProgressReportDataDB:

    def __init__(self, db: IconScoreDatabase):
        self._db = db
        self._items = {}

    def __getitem__(self, prefix: bytes) -> ProgressReportData:
        if prefix not in self._items:
            sub_db = self._db.get_sub_db(prefix)
            self._items[prefix] = ProgressReportData(sub_db)

        return self._items[prefix]

    def __setitem__(self, key, value):
        revert('illegal access')


def addDataToProgressReportDB(prefix: bytes, _proposals: 'ProgressReportDataDB',
                              proposal_data: 'ProgressReportDataObject'):
    _proposals[prefix].ipfs_hash.set(proposal_data.ipfs_hash)
    _proposals[prefix].report_hash.set(proposal_data.report_hash)
    _proposals[prefix].progress_report_title.set(proposal_data.progress_report_title)
    _proposals[prefix].timestamp.set(proposal_data.timestamp)
    _proposals[prefix].additional_budget.set(proposal_data.additional_budget)
    _proposals[prefix].additional_month.set(proposal_data.additional_month)
    _proposals[prefix].status.set(proposal_data.status)
    _proposals[prefix].tx_hash.set(proposal_data.tx_hash)
    _proposals[prefix].budget_adjustment.set(proposal_data.budget_adjustment)
    _proposals[prefix].budget_adjustment_status.set(proposal_data.budget_adjustment_status)
    _proposals[prefix].total_votes.set(0)
    _proposals[prefix].total_voters.set(0)
    _proposals[prefix].approved_votes.set(0)
    _proposals[prefix].rejected_votes.set(0)
    _proposals[prefix].budget_approved_votes.set(0)
    _proposals[prefix].budget_rejected_votes.set(0)


def getDataFromProgressReportDB(prefix: bytes, _proposals: 'ProgressReportDataDB') -> dict:
    ipfs_hash = _proposals[prefix].ipfs_hash.get()
    progress_hash = _proposals[prefix].report_hash.get()
    progress_report_title = _proposals[prefix].progress_report_title.get()
    timestamp = _proposals[prefix].timestamp.get()
    additional_budget = _proposals[prefix].additional_budget.get()
    additional_month = _proposals[prefix].additional_month.get()
    status = _proposals[prefix].status.get()
    tx_hash = _proposals[prefix].tx_hash.get()
    budget_adjustment = _proposals[prefix].budget_adjustment.get()

    total_votes = _proposals[prefix].total_votes.get()
    approved_votes = _proposals[prefix].approved_votes.get()
    rejected_votes = _proposals[prefix].rejected_votes.get()

    total_voters = _proposals[prefix].total_voters.get()
    approve_voters = len(_proposals[prefix].approve_voters)
    reject_voters = len(_proposals[prefix].reject_voters)

    budget_approved_votes = _proposals[prefix].budget_approved_votes.get()
    budget_rejected_votes = _proposals[prefix].budget_rejected_votes.get()
    budget_approve_voters = len(_proposals[prefix].budget_approve_voters)
    budget_reject_voters = len(_proposals[prefix].budget_reject_voters)
    budget_adjustment_status = _proposals[prefix].budget_adjustment_status.get()

    return {
        'ipfs_hash': ipfs_hash,
        'report_hash': progress_hash,
        'progress_report_title': progress_report_title,
        'timestamp': timestamp,
        'additional_budget': additional_budget,
        'additional_month': additional_month,
        'status': status,
        'tx_hash': tx_hash,
        'budget_adjustment': budget_adjustment,

        'total_votes': total_votes,
        'approved_votes': approved_votes,
        'rejected_votes': rejected_votes,
        'total_voters': total_voters,
        'approve_voters': approve_voters,
        'reject_voters': reject_voters,

        'budget_approved_votes': budget_approved_votes,
        'budget_rejected_votes': budget_rejected_votes,
        'budget_approve_voters': budget_approve_voters,
        'budget_reject_voters': budget_reject_voters,
        'budget_adjustment_status': budget_adjustment_status
    }


def createProgressDataObject(progress_report_data: dict) -> 'ProgressReportDataObject':
    return ProgressReportDataObject(ipfs_hash=progress_report_data['ipfs_hash'],
                                    report_hash=progress_report_data['report_hash'],
                                    progress_report_title=progress_report_data['progress_report_title'],
                                    timestamp=progress_report_data['timestamp'],
                                    budget_adjustment=progress_report_data['budget_adjustment'],
                                    budget_adjustment_status=progress_report_data['budget_adjustment_status'],
                                    additional_budget=progress_report_data['additional_budget'],
                                    additional_month=progress_report_data['additional_month'],
                                    status=progress_report_data['status'],
                                    tx_hash=progress_report_data['tx_hash'])


class ProgressReportDataObject(object):

    def __init__(self, **kwargs) -> None:
        self.ipfs_hash = kwargs.get('ipfs_hash')
        self.report_hash = kwargs.get('report_hash')
        self.progress_report_title = kwargs.get('progress_report_title')
        self.timestamp = kwargs.get('timestamp')
        self.additional_budget = kwargs.get('additional_budget')
        self.additional_month = kwargs.get('additional_month')
        self.budget_adjustment = kwargs.get('budget_adjustment')
        self.budget_adjustment_status = kwargs.get('budget_adjustment_status')
        self.status = kwargs.get('status')
        self.tx_hash = kwargs.get('tx_hash')
