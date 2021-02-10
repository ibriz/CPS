from iconservice import *


class ProposalData(object):

    def __init__(self, db: IconScoreDatabase) -> None:
        self.ipfs_hash = VarDB('ipfs_hash', db, str)
        self.total_budget = VarDB('total_budget', db, int)
        self.sponsor_reward = VarDB('sponsor_reward', db, int)
        self.project_duration = VarDB('project_duration', db, int)
        self.sponsor_address = VarDB('sponsor_address', db, Address)
        self.contributor_address = VarDB('contributor_address', db, Address)

        self.withdraw_amount = VarDB('withdraw_amount', db, int)
        self.sponsor_withdraw_amount = VarDB('sponsor_withdraw_amount', db, int)
        self.remaining_amount = VarDB('remaining_amount', db, int)
        self.sponsor_remaining_amount = VarDB('sponsor_remaining_amount', db, int)

        self.installment_count = VarDB('installment_count', db, int)
        self.sponsor_reward_count = VarDB('sponsor_reward_count', db, int)

        self.status = VarDB('status', db, str)


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
    _proposals[prefix].total_budget.set(proposal_data.total_budget)
    _proposals[prefix].sponsor_reward.set(proposal_data.sponsor_reward)
    _proposals[prefix].project_duration.set(proposal_data.project_duration)
    _proposals[prefix].sponsor_address.set(proposal_data.sponsor_address)
    _proposals[prefix].contributor_address.set(proposal_data.contributor_address)
    _proposals[prefix].withdraw_amount.set(0)
    _proposals[prefix].sponsor_withdraw_amount.set(0)
    _proposals[prefix].remaining_amount.set(proposal_data.total_budget)
    _proposals[prefix].sponsor_remaining_amount.set(proposal_data.sponsor_reward)
    _proposals[prefix].installment_count.set(proposal_data.project_duration)
    _proposals[prefix].sponsor_reward_count.set(proposal_data.project_duration)


def getDataFromProposalDB(prefix: bytes, _proposals: 'ProposalDataDB') -> dict:
    ipfs_hash = _proposals[prefix].ipfs_hash.get()
    total_budget = _proposals[prefix].total_budget.get()
    sponsor_reward = _proposals[prefix].sponsor_reward.get()
    project_duration = _proposals[prefix].project_duration.get()
    sponsor_address = _proposals[prefix].sponsor_address.get()
    contributor_address = _proposals[prefix].contributor_address.get()
    withdraw_amount = _proposals[prefix].withdraw_amount.get()
    installment_count = _proposals[prefix].installment_count.get()
    sponsor_withdraw_amount = _proposals[prefix].sponsor_withdraw_amount.get()
    sponsor_reward_count = _proposals[prefix].sponsor_reward_count.get()
    remaining_amount = _proposals[prefix].remaining_amount.get()
    sponsor_remaining_amount = _proposals[prefix].sponsor_remaining_amount.get()

    return {
        'ipfs_hash': ipfs_hash,
        'total_budget': total_budget,
        'sponsor_reward': sponsor_reward,
        'project_duration': project_duration,
        'sponsor_address': sponsor_address,
        'contributor_address': contributor_address,
        'withdraw_amount': withdraw_amount,
        'installment_count': installment_count,
        'sponsor_reward_count': sponsor_reward_count,
        'sponsor_withdraw_amount': sponsor_withdraw_amount,
        'remaining_amount': remaining_amount,
        'sponsor_remaining_amount': sponsor_remaining_amount,
    }


def createProposalDataObject(proposal_data: dict) -> 'ProposalDataObject':
    return ProposalDataObject(ipfs_hash=proposal_data['ipfs_hash'],
                              total_budget=proposal_data['total_budget'],
                              sponsor_reward=proposal_data['sponsor_reward'],
                              project_duration=proposal_data['project_duration'],
                              sponsor_address=proposal_data['sponsor_address'],
                              contributor_address=proposal_data['contributor_address']
                              )


class ProposalDataObject(object):
    def __init__(self, **kwargs) -> None:
        self.ipfs_hash = kwargs.get('ipfs_hash')
        self.total_budget = kwargs.get('total_budget')
        self.sponsor_reward = kwargs.get('sponsor_reward')
        self.project_duration = kwargs.get('project_duration')
        self.sponsor_address = kwargs.get('sponsor_address')
        self.contributor_address = kwargs.get('contributor_address')
