from iconservice import *


class ProposalData(object):

    def __init__(self, db: IconScoreDatabase) -> None:
        self.ipfs_hash = VarDB('ipfs_hash', db, str)
        self.project_title = VarDB('project_title', db, str)
        self.timestamp = VarDB('timestamp', db, int)
        self.total_budget = VarDB('total_budget', db, int)
        self.project_duration = VarDB('project_duration', db, int)
        self.approved_reports = VarDB('approved_reports', db, int)
        self.sponsor_address = VarDB('sponsor_address', db, Address)
        self.contributor_address = VarDB('contributor_address', db, Address)
        self.status = VarDB('status', db, str)
        self.tx_hash = VarDB('tx_hash', db, str)
        self.percentage_completed = VarDB('percentage_completed', db, int)

        self.voters_reasons = ArrayDB("voters_reasons", db, bytes)
        self.total_votes = VarDB("total_votes", db, int)
        self.total_voters = VarDB("total_voters", db, int)
        self.approved_votes = VarDB("approved_votes", db, int)
        self.rejected_votes = VarDB("rejected_votes", db, int)

        self.sponsor_deposit_amount = VarDB("sponsor_deposit", db, int)
        self.sponsored_timestamp = VarDB("sponsored_timestamp", db, int)
        self.sponsor_deposit_status = VarDB("sponsor_deposit_status", db, str)
        self.sponsor_vote_reason = VarDB("sponsor_vote_reason", db, bytes)

        self.voters_list = ArrayDB("voters_list", db, Address)
        self.approve_voters = ArrayDB("approve_voters", db, Address)
        self.reject_voters = ArrayDB("reject_voters", db, Address)

        self.progress_reports = ArrayDB('progress_reports', db, str)
        self.budget_adjustment = VarDB("budget_adjustment", db, bool)
        self.submit_progress_report = VarDB("submit_progress_report", db, bool)


class ProposalDataDB:

    def __init__(self, db: IconScoreDatabase):
        self._db = db
        self._items = {}

    def __getitem__(self, prefix: bytes) -> ProposalData:
        if prefix not in self._items:
            sub_db = self._db.get_sub_db(prefix)
            self._items[prefix] = ProposalData(sub_db)

        return self._items[prefix]

    def __setitem__(self, key, value):
        revert('illegal access')


def addDataToProposalDB(prefix: bytes, _proposals: 'ProposalDataDB', proposal_data: 'ProposalDataObject'):
    _proposals[prefix].ipfs_hash.set(proposal_data.ipfs_hash)
    _proposals[prefix].project_title.set(proposal_data.project_title)
    _proposals[prefix].timestamp.set(proposal_data.timestamp)
    _proposals[prefix].total_budget.set(proposal_data.total_budget)
    _proposals[prefix].project_duration.set(proposal_data.project_duration)
    _proposals[prefix].sponsor_address.set(proposal_data.sponsor_address)
    _proposals[prefix].contributor_address.set(proposal_data.contributor_address)
    _proposals[prefix].status.set(proposal_data.status)
    _proposals[prefix].tx_hash.set(proposal_data.tx_hash)
    _proposals[prefix].percentage_completed.set(proposal_data.percentage_completed)
    _proposals[prefix].total_votes.set(0)
    _proposals[prefix].total_voters.set(0)
    _proposals[prefix].approved_votes.set(0)
    _proposals[prefix].rejected_votes.set(0)
    _proposals[prefix].approved_reports.set(0)
    _proposals[prefix].budget_adjustment.set(False)
    _proposals[prefix].submit_progress_report.set(False)


def getDataFromProposalDB(prefix: bytes, _proposals: 'ProposalDataDB') -> dict:
    ipfs_hash = _proposals[prefix].ipfs_hash.get()
    project_title = _proposals[prefix].project_title.get()
    timestamp = _proposals[prefix].timestamp.get()
    total_budget = _proposals[prefix].total_budget.get()
    project_duration = _proposals[prefix].project_duration.get()
    approved_reports = _proposals[prefix].approved_reports.get()
    sponsor_address: 'Address' = _proposals[prefix].sponsor_address.get()
    contributor_address: 'Address' = _proposals[prefix].contributor_address.get()
    status = _proposals[prefix].status.get()
    tx_hash = _proposals[prefix].tx_hash.get()
    percentage_completed = _proposals[prefix].percentage_completed.get()

    total_votes = _proposals[prefix].total_votes.get()
    total_voters = _proposals[prefix].total_voters.get()
    approved_votes = _proposals[prefix].approved_votes.get()
    rejected_votes = _proposals[prefix].rejected_votes.get()
    sponsor_deposit_amount = _proposals[prefix].sponsor_deposit_amount.get()
    sponsored_timestamp = _proposals[prefix].sponsored_timestamp.get()
    sponsor_deposit_status = _proposals[prefix].sponsor_deposit_status.get()
    sponsor_vote_reason = _proposals[prefix].sponsor_vote_reason.get()
    if sponsor_vote_reason != b"":
        sponsor_vote_reason = sponsor_vote_reason.decode('utf-8')

    approve_voters = len(_proposals[prefix].approve_voters)
    reject_voters = len(_proposals[prefix].reject_voters)
    budget_adjustment = _proposals[prefix].budget_adjustment.get()
    submit_progress_report = _proposals[prefix].submit_progress_report.get()

    return {
        'ipfs_hash': ipfs_hash,
        'project_title': project_title,
        'timestamp': timestamp,
        'total_budget': total_budget,
        'project_duration': project_duration,
        'approved_reports': approved_reports,
        'sponsor_address': sponsor_address,
        'contributor_address': contributor_address,
        'status': status,
        'tx_hash': tx_hash,
        'percentage_completed': percentage_completed,
        'budget_adjustment': budget_adjustment,
        'submit_progress_report': submit_progress_report,
        'sponsor_deposit_amount': sponsor_deposit_amount,
        'sponsored_timestamp': sponsored_timestamp,
        'sponsor_deposit_status': sponsor_deposit_status,
        'sponsor_vote_reason': sponsor_vote_reason,
        'total_votes': total_votes,
        'approved_votes': approved_votes,
        'rejected_votes': rejected_votes,
        'total_voters': total_voters,
        'approve_voters': approve_voters,
        'reject_voters': reject_voters
    }


def createProposalDataObject(proposal_data: dict) -> 'ProposalDataObject':
    return ProposalDataObject(ipfs_hash=proposal_data['ipfs_hash'],
                              project_title=proposal_data['project_title'],
                              timestamp=proposal_data['timestamp'],
                              total_budget=proposal_data['total_budget'],
                              project_duration=proposal_data['project_duration'],
                              sponsor_address=proposal_data['sponsor_address'],
                              contributor_address=proposal_data['contributor_address'],
                              status=proposal_data['status'],
                              tx_hash=proposal_data['tx_hash'],
                              percentage_completed=proposal_data['percentage_completed'])


class ProposalDataObject(object):
    def __init__(self, **kwargs) -> None:
        self.ipfs_hash = kwargs.get('ipfs_hash')
        self.project_title = kwargs.get('project_title')
        self.timestamp = kwargs.get('timestamp')
        self.total_budget = kwargs.get('total_budget')
        self.project_duration = kwargs.get('project_duration')
        self.sponsor_address = kwargs.get('sponsor_address')
        self.contributor_address = kwargs.get('contributor_address')
        self.status = kwargs.get('status')
        self.tx_hash = kwargs.get('tx_hash')
        self.percentage_completed = kwargs.get('percentage_completed')
