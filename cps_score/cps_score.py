from .utils.checkers import *
from .db.progress_report_data import *
from .db.proposal_data import *
from .utils.consts import *
from .utils.interfaces import *
from .utils.utils import *
from iconservice import *


class ProposalAttributes(TypedDict):
    ipfs_hash: str
    project_title: str
    project_duration: int
    total_budget: int
    sponsor_address: Address
    ipfs_link: str


class ProgressReportAttributes(TypedDict):
    ipfs_hash: str
    report_hash: str
    ipfs_link: str
    progress_report_title: str
    budget_adjustment: bool
    additional_budget: int
    additional_month: int
    percentage_completed: int


class CPS_Score(IconScoreBase):
    ID = 'id'

    _CPS_TREASURY_SCORE = "_cps_treasury_score"
    _CPF_SCORE = "_cpf_score"

    _INITIAL_BLOCK = "initial_block"
    _PERIOD_DETAILS = "_period_details"
    _PERIOD_NAME = "period_name"
    _PERIOD_SPAN = "period_span"

    _VOTE = "vote"
    _ADDRESS = "address"
    _ADMINS = "admins"

    _LASTBLOCK = "last_block"
    _CURRENTBLOCK = "current_block"
    _NEXTBLOCK = "next_block"
    _REMAINING_TIME = "remaining_time"

    _MAIN_PREPS = "main_preps"
    _ALL_PREPS = "_all_preps"
    _UNREGISTERED_PREPS = "unregistered_preps"
    _REGISTERED_PREPS = "registered_preps"
    _INACTIVE_PREPS = "inactive_preps"
    _PROPOSALS_KEY_LIST = 'proposals_key_list'
    _PROGRESS_KEY_LIST = 'progress_key_list'
    _CONTRIBUTORS = "contributors"
    _SPONSORS = "sponsors"
    _BUDGET_APPROVALS_LIST = "budget_approvals_list"
    _SPONSOR_ADDRESS = 'sponsor_address'
    _TOTAL_BUDGET = 'total_budget'
    _ACTIVE_PROPOSALS = "active_proposals"
    _VOTING_PROPOSALS = "voting_proposals"
    _VOTING_PROGRESS_REPORTS = "voting_progress_reports"
    _AMOUNT = "_total_amount"

    _PROJECT_TITLE = "project_title"
    _PROGRESS_REPORT_TITLE = "progress_report_title"
    _TOTAL_VOTES = "total_votes"
    _TOTAL_VOTERS = "total_voters"
    _TIMESTAMP = 'timestamp'
    _CONTRIBUTOR_ADDRESS = "contributor_address"
    _TX_HASH = "tx_hash"
    _IPFS_HASH = 'ipfs_hash'
    _REPORT_KEY = 'report_key'
    _REPORT_HASH = 'report_hash'
    _PROJECT_DURATION = 'project_duration'
    _APPROVED_REPORTS = "approved_reports"
    _IPFS_LINK = "ipfs_link"
    _PERCENTAGE_COMPLETED = 'percentage_completed'
    _ADDITIONAL_BUDGET = 'additional_budget'
    _ADDITIONAL_DURATION = 'additional_month'
    _BUDGET_ADJUSTMENT = 'budget_adjustment'
    _BUDGET_ADJUSTMENT_STATUS = "budget_adjustment_status"

    _SPONSOR_PENDING = '_sponsor_pending'
    _PENDING = '_pending'
    _ACTIVE = '_active'
    _PAUSED = "_paused"
    _DISQUALIFIED = "_disqualified"
    _REJECTED = "_rejected"
    _COMPLETED = "_completed"
    STATUS_TYPE = [_SPONSOR_PENDING, _PENDING, _ACTIVE, _PAUSED, _DISQUALIFIED, _REJECTED, _COMPLETED]

    _WAITING = "_waiting"
    _APPROVED = "_approved"
    _PROGRESS_REPORT_REJECTED = "_progress_report_rejected"
    PROGRESS_REPORT_STATUS_TYPE = [_APPROVED, _WAITING, _PROGRESS_REPORT_REJECTED]

    _PREPS_DENYLIST = "preps_denylist"
    _DENYLIST = "denylist"
    _PENALTY_AMOUNT = "penalty_amount"
    _STATUS = "status"

    _APPROVE = "_approve"
    _REJECT = "_reject"
    _ABSTAIN = "_abstain"
    _ACCEPT = "_accept"
    _YES = "yes"
    _NO = "no"

    @eventlog(indexed=2)
    def ProposalSubmitted(self, _sender_address: Address, note: str):
        pass

    @eventlog(indexed=2)
    def TokenBurn(self, _sender_address: Address, note: str):
        pass

    @eventlog(indexed=2)
    def ProgressReportSubmitted(self, _sender_address: Address, _project_title: str):
        pass

    @eventlog(indexed=2)
    def SponsorBondReceived(self, _sender_address: Address, _notes: str):
        pass

    @eventlog(indexed=2)
    def SponsorBondRejected(self, _sender_address: Address, _notes: str):
        pass

    @eventlog(indexed=2)
    def PRepPenalty(self, _prep_address: Address, _notes: str):
        pass

    @eventlog(indexed=2)
    def UnRegisterPRep(self, _sender_address: Address, _notes: str):
        pass

    @eventlog(indexed=2)
    def SponsorBondReturned(self, _sender_address: Address, _notes: str):
        pass

    @eventlog(indexed=1)
    def PeriodUpdate(self, _notes: str):
        pass

    @eventlog(indexed=1)
    def PeriodNotUpdate(self, notes: str):
        pass

    @eventlog(indexed=1)
    def NotPeriod(self, notes: str):
        pass

    def __init__(self, db: IconScoreDatabase) -> None:
        super().__init__(db)

        self.system_score = self.create_interface_score(ZERO_SCORE_ADDRESS, InterfaceSystemScore)

        self.id = VarDB(self.ID, db, str)
        self.proposals = ProposalDataDB(db)
        self.progress_reports = ProgressReportDataDB(db)

        self.cps_treasury_score = VarDB(self._CPS_TREASURY_SCORE, db, value_type=Address)
        self.cpf_score = VarDB(self._CPF_SCORE, db, value_type=Address)

        self.initial_block = VarDB(self._INITIAL_BLOCK, db, value_type=int)
        self.period_name = VarDB(self._PERIOD_NAME, db, value_type=str)
        self.next_block = VarDB(self._NEXTBLOCK, db, value_type=int)

        self.main_preps = ArrayDB(self._MAIN_PREPS, db, value_type=Address)
        self.unregistered_preps = ArrayDB(self._UNREGISTERED_PREPS, db, value_type=Address)
        self.registered_preps = ArrayDB(self._REGISTERED_PREPS, db, value_type=Address)
        self.inactive_preps = ArrayDB(self._INACTIVE_PREPS, db, value_type=Address)

        self.proposals_key_list = ArrayDB(self._PROPOSALS_KEY_LIST, db, value_type=str)
        self.progress_key_list = ArrayDB(self._PROGRESS_KEY_LIST, db, value_type=str)
        self.budget_approvals_list = ArrayDB(self._BUDGET_APPROVALS_LIST, db, value_type=str)

        self.active_proposals = ArrayDB(self._ACTIVE_PROPOSALS, db, value_type=str)
        self.voting_proposals = ArrayDB(self._VOTING_PROPOSALS, db, value_type=str)
        self.voting_progress_reports = ArrayDB(self._VOTING_PROGRESS_REPORTS, db, value_type=str)

        self.contributors = ArrayDB(self._CONTRIBUTORS, db, value_type=Address)
        self.sponsors = ArrayDB(self._SPONSORS, db, value_type=Address)
        self.admins = ArrayDB(self._ADMINS, db, value_type=Address)

        self.penalty_amount = ArrayDB(self._PENALTY_AMOUNT, db, value_type=int)

        self._sponsor_pending = ArrayDB(self._SPONSOR_PENDING, db, value_type=str)
        self._pending = ArrayDB(self._PENDING, db, value_type=str)
        self._active = ArrayDB(self._ACTIVE, db, value_type=str)
        self._paused = ArrayDB(self._PAUSED, db, value_type=str)
        self._completed = ArrayDB(self._COMPLETED, db, value_type=str)
        self._rejected = ArrayDB(self._REJECTED, db, value_type=str)
        self._disqualified = ArrayDB(self._DISQUALIFIED, db, value_type=str)
        self.proposals_status = {self._SPONSOR_PENDING: self._sponsor_pending,
                                 self._PENDING: self._pending,
                                 self._ACTIVE: self._active,
                                 self._PAUSED: self._paused,
                                 self._COMPLETED: self._completed,
                                 self._REJECTED: self._rejected,
                                 self._DISQUALIFIED: self._disqualified}

        self._waiting = ArrayDB(self._WAITING, db, value_type=str)
        self._approved = ArrayDB(self._APPROVED, db, value_type=str)
        self._progress_rejected = ArrayDB(self._PROGRESS_REPORT_REJECTED, db, value_type=str)
        self.progress_report_status = {self._WAITING: self._waiting,
                                       self._APPROVED: self._approved,
                                       self._PROGRESS_REPORT_REJECTED: self._progress_rejected}

        self.denylist = ArrayDB(self._DENYLIST, db, value_type=Address)
        self.preps_denylist = DictDB(self._PREPS_DENYLIST, db, value_type=str)

    def on_install(self) -> None:
        self.admins.put(self.owner)
        super().on_install()

    def on_update(self) -> None:
        super().on_update()

    @external(readonly=True)
    def name(self) -> str:
        return "CPS_SCORE"

    def only_admin(self):
        if self.msg.sender not in self.admins:
            revert(f"{self.address} : Only Admins can call this method.")

    def check_period(self, period_name: str):
        if self.next_block.get() <= self.now():
            self.update_period()
            if self.period_name.get() != period_name:
                self.NotPeriod(f"{self.address} : This method can be only called on {period_name}")

    def set_id(self, _val: str):
        self.id.set(_val)

    def get_id(self) -> str:
        return self.id.get()

    def proposal_prefix(self, _proposal_key: str) -> bytes:
        return b'|'.join([PROPOSAL_DB_PREFIX, self.id.get().encode(), _proposal_key.encode()])

    def progress_report_prefix(self, _progress_key: str) -> bytes:
        return b'|'.join([PROGRESS_REPORT_DB_PREFIX, self.id.get().encode(), _progress_key.encode()])

    @only_owner
    @external
    def add_admin(self, _address: Address):
        """
        Add Admins for the CPS
        :param _address: Wallet Address for admin
        :type _address: Address
        """
        if _address not in self.admins:
            self.admins.put(_address)

    @only_owner
    @external
    def remove_admin(self, _address: Address):
        """
        Remove admin from the list
        :param _address: Admin wallet address
        :type _address: Address
        :return:
        """
        if _address != self.owner:
            prep = self.admins.pop()
            if prep != _address:
                for x in range(0, len(self.admins)):
                    if self.admins[x] == _address:
                        self.admins[x] = prep

    @external
    def set_cps_treasury_score(self, _score: Address) -> None:
        """
        Sets the cps treasury score address. Only owner can set the address.
        :param _score: Address of the cps treasury score address
        :type _score: :class:`iconservice.base.address.Address`
        :return:
        """
        self.only_admin()
        if _score.is_contract:
            self.cps_treasury_score.set(_score)

    @external
    def set_cpf_treasury_score(self, _score: Address) -> None:
        """
        Sets the cps treasury score address. Only owner can set the address.
        :param _score: Address of the cps treasury score address
        :type _score: :class:`iconservice.base.address.Address`
        :return:
        """
        self.only_admin()
        if _score.is_contract:
            self.cpf_score.set(_score)

    def _get_preps_address(self) -> list:
        """
        Returns the all Main P-Reps and SubP-Reps details for the term
        :return: all Main P-Reps and SubP-Reps full details
        """
        _preps_list = []
        _all_preps = self.system_score.getPRepTerm()['preps']
        for _prep in range(0, len(_all_preps)):
            _preps_list.append(_all_preps[_prep]['address'])

        return _preps_list

    def _get_prep_name(self, _address: Address) -> str:
        """
        Returns the name of the given P-Rep
        :return: name of P-Rep
        """
        _all_preps = self.system_score.getPRepTerm()['preps']
        for _prep in range(0, len(_all_preps)):
            if _all_preps[_prep]['address'] == _address:
                return _all_preps[_prep]['name']

    def _get_stake(self, _address: Address) -> int:
        """
        get the total stake weight of given address
        :param _address : P-Rep Address
        :return : total delegated amount (loop)
        """

        _all_preps = self.system_score.getPRepTerm()['preps']
        for _prep in range(0, len(_all_preps)):
            if _all_preps[_prep]['address'] == _address:
                return _all_preps[_prep]['delegated']

    def set_PReps(self) -> None:
        """
        Set the list of P-Reps' address for the period
        :return:
        """
        ArrayDBUtils.array_db_clear(self.main_preps)
        _prep_list = self._get_preps_address()

        for prep in _prep_list:
            if prep not in self.denylist:
                if prep not in self.unregistered_preps:
                    if prep in self.registered_preps:
                        self.main_preps.put(prep)

    @external
    def unregister_prep(self) -> None:
        """
        Unregister a registered P-Rep from CPS.
        :return:
        """

        if self.msg.sender not in self.main_preps and self.msg.sender not in self.registered_preps:
            revert(f"{self.address} : -> P-Rep is not registered yet.")

        _data_out = self.main_preps.pop()
        if _data_out != self.msg.sender:
            for prep in range(0, len(self.main_preps)):
                if self.main_preps[prep] == self.msg.sender:
                    self.main_preps[prep] = _data_out

        registered_out = self.registered_preps.pop()
        if registered_out != self.msg.sender:
            for prep in range(0, len(self.registered_preps)):
                if self.registered_preps[prep] == self.msg.sender:
                    self.registered_preps[prep] = registered_out

        self.unregistered_preps.put(self.msg.sender)
        self.UnRegisterPRep(self.msg.sender, f'{self.msg.sender} has ben unregistered successfully.')

    @application_period
    @external
    def register_prep(self) -> None:
        """
        Unregister a registered P-Rep from CPS.
        :return:
        """

        _address = self.msg.sender
        _prep_list = self._get_preps_address()

        if _address not in _prep_list:
            revert(f"{self.address} : Not a P-Rep")

        if _address in self.registered_preps:
            revert(f"{self.address} : -> P-Rep is already registered.")

        if _address in self.denylist:
            revert(f"{self.address} : -> You are in denylist. To register, You've to pay Penalty.")

        if _address in self.unregistered_preps:
            _data_out = self.unregistered_preps.pop()
            if _data_out != _address:
                for prep in range(0, len(self.unregistered_preps)):
                    if self.unregistered_preps[prep] == _address:
                        self.unregistered_preps[prep] = _data_out

        self.registered_preps.put(_address)

        if self.period_name.get() == APPLICATION_PERIOD:
            self.main_preps.put(_address)

    def _remove_sponsor(self, _address: Address) -> None:
        """
        remove Sponsor from the sponsor list
        :param _address: Address of the Sponsor
        :type _address: Address
        :return:
        """
        if _address in self.sponsors:
            sponsor_address = self.sponsors.pop()
            if sponsor_address != _address:
                for index in range(0, len(self.sponsors)):
                    if self.sponsors[index] == _address:
                        self.sponsors[index] = sponsor_address

    def _remove_contributor(self, _address: Address) -> None:
        """
        remove contributor address from the sponsor list
        :param _address: Address of the contributor
        :type _address: Address
        :return:
        """
        if _address in self.contributors:
            contributor_address = self.contributors.pop()
            if contributor_address != _address:
                for index in range(0, len(self.contributors)):
                    if self.contributors[index] == _address:
                        self.contributors[index] = contributor_address

    def _check_proposal(self, _proposal_key: str) -> bool:
        """
        Check if the _proposal_key is already set or not
        :param _proposal_key: Proposal IPFS Hash
        :type _proposal_key: str
        :return: bool
        """
        if _proposal_key not in self.get_proposal_keys():
            return False
        else:
            return True

    def _check_progress_report(self, _progress_key: str) -> bool:
        """
        Check if the _progress_key is already set or not
        :param _progress_key: Progress Report IPFS Hash
        :type _progress_key: str
        :return: bool
        """
        if _progress_key not in self.get_progress_keys():
            return False
        else:
            return True

    def get_proposal_keys(self) -> list:
        """
        Returns a list of proposal ipfs hash
        :return: list of proposal keys
        """
        proposals = []
        for item in self.proposals_key_list:
            proposals.append(item)
        return proposals

    def get_progress_keys(self) -> list:
        """
        Return a list of progress reports ipfs hash
        :return: list of progress report ipfs hash
        """
        progress_reports = []
        for item in self.progress_key_list:
            progress_reports.append(item)
        return progress_reports

    def _get_penalty_amount(self, _address: Address) -> int:
        """
        Get a denylist payment amount for the given address.
        Amount Depends on how many time they have been on denylist.
        :param _address: Address of the Denied P-Rep
        :return: integer ICX amount for Penalty
        """
        if self.preps_denylist[str(_address)] == "Denylist for once.":
            _penalty_amount = self.penalty_amount[0]
        elif self.preps_denylist[str(_address)] == "Denylist for twice.":
            _penalty_amount = self.penalty_amount[1]
        else:
            _penalty_amount = self.penalty_amount[2]

        return _penalty_amount

    def _add_new_proposal(self, _key: str) -> None:
        self.proposals_key_list.put(_key)

    def _update_proposal_status(self, _proposal_key: str, _status: str) -> None:
        prefix = self.proposal_prefix(_proposal_key)
        _current_status = self.proposals[prefix].status.get()
        self.proposals[prefix].timestamp.set(self.now())
        self.proposals[prefix].status.set(_status)

        _data_out = self.proposals_status[_current_status].pop()
        if _data_out != _proposal_key:
            for p in range(0, len(self.proposals_status[_current_status])):
                if self.proposals_status[_current_status][p] == _proposal_key:
                    self.proposals_status[_current_status][p] = _data_out

        self.proposals_status[_status].put(_proposal_key)

    def _update_percentage_completed(self, _key: str, _percent_completed: int) -> None:
        prefix = self.proposal_prefix(_key)
        self.proposals[prefix].percentage_completed.set(_percent_completed)

    def _add_proposals(self, _proposal: ProposalAttributes) -> None:
        proposal_data_obj = createProposalDataObject(_proposal)
        if not self._check_proposal(proposal_data_obj.ipfs_hash):
            self._add_new_proposal(proposal_data_obj.ipfs_hash)
        prefix = self.proposal_prefix(proposal_data_obj.ipfs_hash)
        addDataToProposalDB(prefix, self.proposals, proposal_data_obj)

    def _get_proposal_details(self, _proposal_key: str) -> dict:
        prefix = self.proposal_prefix(_proposal_key)
        _proposal_details = getDataFromProposalDB(prefix, self.proposals)
        return _proposal_details

    def _get_voters_list(self, _key: str) -> list:
        if _key in self.proposals_key_list:
            prefix = self.proposal_prefix(_key)
            _voters = self.proposals[prefix].voters_list
        else:
            prefix = self.progress_report_prefix(_key)
            _voters = self.progress_reports[prefix].voters_list

        _list = []
        for _keys in _voters:
            _list.append(_keys)

        return _list

    def _add_new_progress_report_key(self, proposal_key: str, progress_key: str) -> None:
        self.progress_key_list.put(progress_key)

        prefix = self.proposal_prefix(proposal_key)
        if proposal_key not in self.proposals[prefix].progress_reports:
            self.proposals[prefix].progress_reports.put(progress_key)

    def _update_progress_report_status(self, progress_report_key: str, _status: str) -> None:
        prefix = self.progress_report_prefix(progress_report_key)
        _current_status = self.progress_reports[prefix].status.get()

        self.progress_reports[prefix].timestamp.set(self.now())
        self.progress_reports[prefix].status.set(_status)

        _data_out = self.progress_report_status[_current_status].pop()
        if _data_out != progress_report_key:
            for p in range(0, len(self.progress_report_status[_current_status])):
                if self.progress_report_status[_current_status][p] == progress_report_key:
                    self.progress_report_status[_current_status][p] = _data_out

        self.progress_report_status[_status].put(progress_report_key)

    def _add_progress_report(self, _progress_report: ProgressReportAttributes) -> None:
        progress_report_obj = createProgressDataObject(_progress_report)
        if not self._check_progress_report(progress_report_obj.report_hash):
            self._add_new_progress_report_key(progress_report_obj.ipfs_hash, progress_report_obj.report_hash)
        prefix = self.progress_report_prefix(progress_report_obj.report_hash)
        addDataToProgressReportDB(prefix, self.progress_reports, progress_report_obj)

    def _get_progress_reports_details(self, _progress_hash: str) -> dict:
        prefix = self.progress_report_prefix(_progress_hash)
        response = getDataFromProgressReportDB(prefix, self.progress_reports)
        return response

    @application_period
    @external
    @payable
    def submit_proposal(self, _proposals: ProposalAttributes) -> None:
        """
        Submits a proposal, with ipfs_hash
        :param _proposals: dict of the necessary params to be stored
        :return:
        """
        self.check_period(APPLICATION_PERIOD)
        proposal_key = _proposals.copy()

        if self.msg.sender.is_contract:
            revert(f"{self.address} : -> Contract Address not supported.")

        if proposal_key[self._PROJECT_DURATION] > MAX_PROJECT_PERIOD:
            revert(f'{self.address} : -> Maximum Project Duration = 6 ')

        if proposal_key[self._TOTAL_BUDGET] * MULTIPLIER > self.get_remaining_fund():
            revert(f'{self.address} : -> Budget Exceeds than Treasury Amount. '
                   f'{self.get_remaining_fund() // MULTIPLIER} ICX')

        if proposal_key[self._SPONSOR_ADDRESS] not in self.main_preps:
            revert(f"{self.address} : -> Sponsor P-Rep not a Top 100 P-Rep.")

        if self.msg.value != 50 * MULTIPLIER:
            revert(f"{self.address} : -> Deposit 50 ICX to submit a proposal.")

        _tx_hash = str(bytes.hex(self.tx.hash))

        proposal_key.pop(self._IPFS_LINK, None)
        proposal_key[self._TIMESTAMP] = self.now()
        proposal_key[self._STATUS] = self._SPONSOR_PENDING
        proposal_key[self._CONTRIBUTOR_ADDRESS] = self.msg.sender
        proposal_key[self._TX_HASH] = _tx_hash
        proposal_key[self._PERCENTAGE_COMPLETED] = 0

        self._add_proposals(proposal_key)

        self._sponsor_pending.put(proposal_key[self._IPFS_HASH])

        self.contributors.put(self.msg.sender)

        self.ProposalSubmitted(self.msg.sender, "Successfully submitted a Proposal.")
        try:
            self.icx.transfer(ZERO_WALLET_ADDRESS, self.msg.value)
            self.TokenBurn(self.msg.sender, f"{self.msg.value} ICX transferred to burn.")
        except BaseException as e:
            revert(f"{self.address} : Network problem. Sending proposal funds. {e}")

    @application_period
    @external
    @payable
    def submit_progress_report(self, _progress_report: ProgressReportAttributes) -> None:
        self.check_period(APPLICATION_PERIOD)
        _contributor_address = self.msg.sender
        _progress = _progress_report.copy()
        if _contributor_address.is_contract:
            revert(f"{self.address} : Contract Address not supported.")

        if self.msg.sender != self._get_proposal_details(_progress[self._IPFS_HASH])[self._CONTRIBUTOR_ADDRESS]:
            revert(f"{self.address} : Sorry, You are not the contributor for this project.")

        if _progress[self._IPFS_HASH] not in self.get_proposal_keys():
            revert(f"{self.address} : Sorry, Project not found.")

        _percentage_completed = _progress[self._PERCENTAGE_COMPLETED]
        self._update_percentage_completed(_progress[self._IPFS_HASH], _percentage_completed)
        _progress.pop(self._PERCENTAGE_COMPLETED, None)
        _progress[self._STATUS] = self._WAITING
        _progress[self._TIMESTAMP] = self.now()
        _progress[self._TX_HASH] = str(bytes.hex(self.tx.hash))
        _progress[self._BUDGET_ADJUSTMENT_STATUS] = "N/A"
        self._add_progress_report(_progress)
        self._waiting.put(_progress[self._REPORT_HASH])

        if _progress[self._BUDGET_ADJUSTMENT] == 1:
            self.budget_approvals_list.put(_progress[self._REPORT_HASH])
            _progress[self._BUDGET_ADJUSTMENT_STATUS] = self._PENDING

        self.ProgressReportSubmitted(_contributor_address, f'{_progress[self._PROGRESS_REPORT_TITLE]} --> Progress '
                                                           f'Report Submitted Successfully.')

    @external(readonly=True)
    def get_proposals_keys_by_status(self, _status: str) -> list:
        """
        Returns the proposal keys of proposal by status
        :return: list of keys of given status
        :rtype: list
        """
        if _status not in self.STATUS_TYPE:
            return [f"{self.address} : Not a valid status."]

        _list = []

        for x in self.proposals_status[_status]:
            _list.append(x)

        return _list

    @application_period
    @external
    @payable
    def sponsor_vote(self, _ipfs_key: str, _vote: str) -> None:
        """
        Selected Sponsor P-Rep to approve the requested proposal for CPS
        :param _vote: Vote from Sponsor [_accept,_reject]
        :param _ipfs_key : proposal ipfs hash
        :type _ipfs_key : str
        """

        self.check_period(VOTING_PERIOD)
        _proposal_details = self._get_proposal_details(_ipfs_key)
        _status = _proposal_details[self._STATUS]
        _sponsor = _proposal_details[self._SPONSOR_ADDRESS]
        _contributor_address = _proposal_details[self._CONTRIBUTOR_ADDRESS]

        if self.msg.sender not in self.main_preps:
            revert(f"{self.address} : -> Not a P-Rep.")

        if self.msg.sender != _sponsor:
            revert(f"{self.address} :-> Not a valid Sponsor.")

        if _vote == self._ACCEPT:
            if _status == self._SPONSOR_PENDING:
                _budget = int(_proposal_details[self._TOTAL_BUDGET])

                if self.msg.value != (_budget * MULTIPLIER) / 10:
                    revert(f"{self.address} : -> Deposit 10% of the total budget of the project.")

                self._update_proposal_status(_ipfs_key, self._PENDING)

                prefix = self.proposal_prefix(_ipfs_key)

                self.proposals[prefix].sponsor_deposit_amount.set(self.msg.value)
                self.proposals[prefix].sponsored_timestamp.set(self.now())
                self.proposals[prefix].sponsor_deposit_status.set(BOND_RECEIVED)

                self.SponsorBondReceived(self.msg.sender, "Sponsor Bond Received.")
        else:
            self._remove_contributor(_contributor_address)
            self._update_proposal_status(_ipfs_key, self._REJECTED)
            self.SponsorBondRejected(self.msg.sender, "Sponsor Bond Rejected.")

    @voting_period
    @external
    def vote_proposal(self, _ipfs_key: str, _vote: str, _vote_reason: str = "") -> None:
        """
        P-Rep(s) voting for a proposal to be approved or not
        :param _ipfs_key : proposal ipfs hash
        :type _ipfs_key : str
        :param _vote: vote in [_approve,_reject,_abstain]
        :type _vote : str
        :param _vote_reason : Any specific reason behind the vote
        :type _vote_reason : str
        """
        self.check_period(VOTING_PERIOD)
        if _vote not in [self._APPROVE, self._REJECT, self._ABSTAIN]:
            revert(f'{self.address} : Vote should be on _approve, _reject or _abstain')

        _proposal_details = self._get_proposal_details(_ipfs_key)
        _status = _proposal_details[self._STATUS]
        prefix = self.proposal_prefix(_ipfs_key)
        _voters_list = self._get_voters_list(_ipfs_key)

        if self.msg.sender in _voters_list:
            revert(f"{self.address} : -> Already voted on this Proposal.")

        if _status == self._PENDING:
            _voter_stake = self._get_stake(self.msg.sender)
            _total_votes = int(_proposal_details['total_votes'])
            _approved_votes = int(_proposal_details['approved_votes'])
            _rejected_votes = int(_proposal_details['rejected_votes'])

            self.proposals[prefix].total_votes.set(_total_votes + _voter_stake)
            self.proposals[prefix].voters_list.put(self.msg.sender)

            if _vote == self._APPROVE:
                self.proposals[prefix].approve_voters.put(self.msg.sender)
                self.proposals[prefix].approved_votes.set(_approved_votes + _voter_stake)
            elif _vote == self._REJECT:
                self.proposals[prefix].reject_voters.put(self.msg.sender)
                self.proposals[prefix].rejected_votes.set(_rejected_votes + _voter_stake)

    @voting_period
    @external
    def vote_progress_report(self, _ipfs_key: str, _report_key: str, _vote: str, _budget_adjustment_vote: str = "",
                             _vote_reason: str = "") -> None:
        """
        P-Rep(s) voting for a progress report of all active proposals
        :param _ipfs_key : proposal ipfs hash
        :type _ipfs_key : str
        :param _report_key : progress report ipfs hash
        :type _report_key : str
        :param _vote : voting in [_approve,_reject]
        :type _vote : str
        :param _budget_adjustment_vote: Budget voting Adjustment [_approve,_reject]
        :type _budget_adjustment_vote : str
        :param _vote_reason : Any specific reason behind the vote
        :type _vote_reason : str
        """
        self.check_period(VOTING_PERIOD)

        _progress_report_details = self._get_progress_reports_details(_report_key)
        _status = _progress_report_details[self._STATUS]
        prefix = self.progress_report_prefix(_report_key)
        _voters_list = self.progress_reports[prefix].voters_list

        if self.msg.sender in _voters_list:
            revert(f"{self.address} : -> Already Voted on this proposal.")

        if _status == self._WAITING:
            _voter_stake = self._get_stake(self.msg.sender)
            _total_votes = self.progress_reports[prefix].total_votes.get()
            _approved_votes = self.progress_reports[prefix].approved_votes.get()
            _rejected_votes = self.progress_reports[prefix].rejected_votes.get()
            _total_votes += _voter_stake
            self.progress_reports[prefix].total_votes.set(_total_votes)

            self.progress_reports[prefix].voters_list.put(self.msg.sender)

            if _vote == self._APPROVE:
                self.progress_reports[prefix].approve_voters.put(self.msg.sender)
                self.progress_reports[prefix].approved_votes.set(_approved_votes + _voter_stake)
            elif _vote == self._REJECT:
                self.progress_reports[prefix].reject_voters.put(self.msg.sender)
                self.progress_reports[prefix].rejected_votes.set(_rejected_votes + _voter_stake)

            if _report_key in self.budget_approvals_list:
                if _budget_adjustment_vote == self._APPROVE:
                    self.progress_reports[prefix].budget_approve_voters.put(self.msg.sender)
                    self.progress_reports[prefix].budget_approved_votes.set(_approved_votes + _voter_stake)
                elif _budget_adjustment_vote == self._REJECT:
                    self.progress_reports[prefix].budget_reject_voters.put(self.msg.sender)
                    self.progress_reports[prefix].budget_rejected_votes.set(_rejected_votes + _voter_stake)

    @external
    def set_prep_penalty_amount(self, _penalty: List[int]) -> None:
        """
        Sets the Penalty amount for the registered P-Rep(s) missing to vote on voting period.
        Only owner can set the address.
        :param _penalty: Penalty Amount Lists
        :type _penalty: List of int

        :return:
        """
        self.only_admin()

        if len(_penalty) != 3:
            revert(f"{self.address} : Exactly 3 Penalty amount Required.")
        for amount in _penalty:
            self.penalty_amount.put(amount)

    @payable
    @external
    def pay_prep_penalty(self):
        """
        To remove the address from denylist
        :return:
        """
        self.check_period(APPLICATION_PERIOD)
        _address = self.msg.sender
        if _address not in self.denylist:
            revert(f"{self.address} : -> {_address} not in denylist.")

        _penalty_amount = self._get_penalty_amount(_address)

        if self.msg.value != _penalty_amount * MULTIPLIER:
            revert(f"{self.address} :  -> Please pay Penalty amount of {_penalty_amount} ICX to register as a P-Rep.")

        _prep = self.denylist.pop()
        if _prep != _address:
            for prep in range(0, len(self.denylist)):
                if self.denylist[prep] == _address:
                    self.denylist[prep] = _prep

        self.main_preps.put(_address)
        self.PRepPenalty(self.msg.sender,
                         f"{self.msg.value // 10 ** 18} ICX Penalty Received. P-Rep removed from Denylist.")

        try:
            self.icx.transfer(ZERO_WALLET_ADDRESS, self.msg.value)
            self.TokenBurn(self.msg.sender, f"{self.msg.value // 10 ** 18} ICX Burned from penalty deposit.")
        except BaseException as e:
            revert(f"{self.address} : -> Network problem. "
                   f"Sending proposal funds. {e}")

    @only_owner
    @external
    def set_initialBlock(self, _timestamp: int) -> None:
        """
        To set the initial block of application period to start (once only)
        :param _timestamp : initial UTC Day for the CPS to be set

        :return: X
        """

        self.set_PReps()
        if _timestamp < self.now():
            _timestamp = self.now()

        current_day_number = _timestamp // U_SECONDS_DAY
        self.initial_block.set(current_day_number)
        self.next_block.set(current_day_number + DAY_COUNT)
        self.period_name.set(APPLICATION_PERIOD)

    @external(readonly=True)
    def login_prep(self, _address: Address) -> dict:
        """
        Checks the logged in user is P-Rep or not.
        :return : dict of logged in information
        """

        _login_dict = {}
        _all_preps = self._get_preps_address()

        if _address in _all_preps:
            _login_dict["isPRep"] = True

            if _address in self.unregistered_preps:
                _login_dict["isRegistered"] = False
                _login_dict["payPenalty"] = False

            if _address in self.denylist:
                _login_dict["isRegistered"] = False
                _login_dict["payPenalty"] = True

                _login_dict["penaltyAmount"] = self._get_penalty_amount(_address)

            if _address in self.main_preps:
                _login_dict["isRegistered"] = True
                _login_dict["payPenalty"] = False

        else:
            _login_dict["isPRep"] = False
            _login_dict["isRegistered"] = False
            _login_dict["payPenalty"] = False

        return _login_dict

    @external(readonly=True)
    def get_admins(self) -> list:
        admins = []
        for admin in self.admins:
            admins.append(admin)

        return admins

    @external(readonly=True)
    def get_cps_treasury_score(self) -> Address:
        """
        Returns the cps treasury score address
        :return: cps treasury score address
        :rtype: :class:`iconservice.base.address.Address`
        """
        return self.cps_treasury_score.get()

    @external(readonly=True)
    def get_cpf_treasury_score(self) -> Address:
        """
        Returns the cps treasury score address
        :return: cps treasury score address
        :rtype: :class:`iconservice.base.address.Address`
        """
        return self.cpf_score.get()

    @external(readonly=True)
    def get_remaining_fund(self) -> int:
        """
        Returns the remaining Treasury amount on CPF Score
        :return: Return amount on CPF Treasury amount
        :rtype: int
        """
        cpf_treasury_score = self.create_interface_score(self.cpf_score.get(), CPF_TREASURY_INTERFACE)
        return cpf_treasury_score.get_total_fund()

    @external(readonly=True)
    def get_PReps(self) -> list:
        """
        Returns the all P-Reps who can be active in this period
        :return: P-Rep address list
        """
        _preps = []
        for prep in self.main_preps:
            _preps.append({"name": self._get_prep_name(prep),
                           "address": prep,
                           "delegated": self._get_stake(prep)})
        return _preps

    @external(readonly=True)
    def get_denylist(self) -> list:
        """
        :return: list of P-Rep denylist
        """
        _preps = []

        for _address in self.denylist:
            _preps.append(_address)

        return _preps

    @external(readonly=True)
    def get_period_status(self) -> dict:
        """
        To get the period status
        :return: dict of status
        """

        _current_day = self.now() // U_SECONDS_DAY
        _remaining_time = (_current_day + 1) * U_SECONDS_DAY - self.now()

        period_dict = {self._CURRENTBLOCK: _current_day,
                       self._NEXTBLOCK: self.next_block.get(),
                       self._REMAINING_TIME: _remaining_time // U_SECONDS,
                       self._PERIOD_NAME: self.period_name.get(),
                       self._PERIOD_SPAN: DAY_COUNT * U_SECONDS_DAY // U_SECONDS}

        return period_dict

    @external(readonly=True)
    def get_project_amounts(self) -> dict:
        """
        :return: A dict of amount with the proposal status
        """
        _status_list = [self._PENDING, self._ACTIVE, self._PAUSED, self._COMPLETED, self._DISQUALIFIED]
        _pending_amount = 0
        _active_amount = 0
        _paused_amount = 0
        _completed_amount = 0
        _disqualified_amount = 0
        for status in range(0, len(_status_list)):
            _amount = 0
            for keys in self.get_proposals_keys_by_status(_status_list[status]):
                _amount += self._get_proposal_details(keys)[self._TOTAL_BUDGET]

            if status == 0:
                _pending_amount = _amount
            elif status == 1:
                _active_amount = _amount
            elif status == 2:
                _paused_amount = _amount
            elif status == 3:
                _completed_amount = _amount
            elif status == 4:
                _disqualified_amount = _amount

        _amount_dict = {_status_list[0]: {self._AMOUNT: _pending_amount,
                                          "_count": len(self.get_proposals_keys_by_status(_status_list[0]))},
                        _status_list[1]: {self._AMOUNT: _active_amount,
                                          "_count": len(self.get_proposals_keys_by_status(_status_list[1]))},
                        _status_list[2]: {self._AMOUNT: _paused_amount,
                                          "_count": len(self.get_proposals_keys_by_status(_status_list[2]))},
                        _status_list[3]: {self._AMOUNT: _completed_amount,
                                          "_count": len(self.get_proposals_keys_by_status(_status_list[3]))},
                        _status_list[4]: {self._AMOUNT: _disqualified_amount,
                                          "_count": len(self.get_proposals_keys_by_status(_status_list[4]))}}

        return _amount_dict

    @external(readonly=True)
    def get_contributors(self) -> list:
        """
        Returns the list of all contributors address who've submitted proposals to CPS
        :return: List of contributors
        """

        _contributors_list = []

        for address in self.contributors:
            if address not in _contributors_list:
                _contributors_list.append(address)

        return _contributors_list

    @external(readonly=True)
    def get_sponsors_record(self) -> dict:
        """

        :return: dict of P-Reps with their sponsored project counts
        """
        _proposals_keys = []
        _sponsors_list = []

        for a in self.get_proposals_keys_by_status(self._ACTIVE):
            _proposals_keys.append(a)

        for pa in self.get_proposals_keys_by_status(self._PAUSED):
            _proposals_keys.append(pa)

        for c in self.get_proposals_keys_by_status(self._COMPLETED):
            _proposals_keys.append(c)

        for sponsors in _proposals_keys:
            _proposal_details = self._get_proposal_details(sponsors)
            _sponsors_list.append(str(_proposal_details[self._SPONSOR_ADDRESS]))

        sponsors_dict = {i: _sponsors_list.count(i) for i in _sponsors_list}

        return sponsors_dict

    @external(readonly=True)
    def get_proposal_details(self, _status: str, _wallet_address: Address = ZERO_WALLET_ADDRESS, _start_index: int = 0,
                             _end_index: int = 20) -> dict:
        if _status not in self.STATUS_TYPE:
            return {-1: "Not a valid status."}

        _proposals_list = []
        _proposals_keys = self.get_proposals_keys_by_status(_status)

        if _end_index - _start_index > 50:
            return {-1: "Page length must not be greater than 50."}
        if _start_index < 0:
            _start_index = 0
        count = len(_proposals_keys)

        _range = range(_start_index, count if _end_index > count else _end_index)

        for _keys in _range:
            _proposal_details = self._get_proposal_details(_proposals_keys[_keys])
            _proposal_details[self._TOTAL_VOTERS] = len(self.main_preps)

            if _status == self._SPONSOR_PENDING:
                if _proposal_details[self._CONTRIBUTOR_ADDRESS] == _wallet_address:
                    _proposals_list.append(_proposal_details)

                count = len(_proposals_list)

            elif _proposal_details[self._STATUS] == _status:
                _proposals_list.append(_proposal_details)

        return {"data": _proposals_list, "count": count}

    @external(readonly=True)
    def get_active_proposals(self, _wallet_address: Address) -> list:
        """
        Returns the list of all all active or paused proposal from that address
        :param _wallet_address : wallet address of the user
        :return: list
        """

        _proposal_titles = []
        _proposals_hashes = self.proposals_key_list

        for proposals in _proposals_hashes:
            _proposal_details = self._get_proposal_details(proposals)
            prefix = self.proposal_prefix(proposals)
            if _proposal_details[self._STATUS] == self._ACTIVE or _proposal_details[self._STATUS] == self._PAUSED:
                if _proposal_details[self._CONTRIBUTOR_ADDRESS] == _wallet_address:
                    _report_keys = self.proposals[prefix].progress_reports
                    _project_duration = int(_proposal_details[self._PROJECT_DURATION])
                    _approved_reports_count = int(_proposal_details[self._APPROVED_REPORTS])
                    _report = True
                    _last_progress_report = False

                    for report in _report_keys:
                        if self._get_progress_reports_details(report)[self._STATUS] == self._WAITING:
                            _report = False
                    if _project_duration - _approved_reports_count == 1:
                        _last_progress_report = True
                    _proposals_details = {self._PROJECT_TITLE: _proposal_details[self._PROJECT_TITLE],
                                          self._IPFS_HASH: proposals,
                                          "new_progress_report": _report,
                                          "last_progress_report": _last_progress_report}
                    _proposal_titles.append(_proposals_details)

        return _proposal_titles

    @external(readonly=True)
    def get_proposal_detail_by_wallet(self, _wallet_address: Address) -> dict:
        """
        Returns a dict of proposals of provided status
        :param _wallet_address : user Signing in
        :type _wallet_address : str


        :return: List of all proposals_details
        """

        if _wallet_address == "":
            return {"Message": "Enter wallet address."}

        _proposals_list = []
        _proposals_keys = self.proposals_key_list

        for _keys in range(0, len(_proposals_keys)):
            _proposal_details = self._get_proposal_details(_proposals_keys[_keys])
            _proposal_details[self._TOTAL_VOTERS] = len(self.main_preps)
            if _proposal_details[self._CONTRIBUTOR_ADDRESS] == _wallet_address:
                _proposals_list.append(_proposal_details)

        _proposals_dict_list = {"data": _proposals_list, "count": len(_proposals_list)}
        return _proposals_dict_list

    @external(readonly=True)
    def get_progress_reports(self, _status: str, _start_index: int = 0, _end_index: int = 20) -> dict:
        """
        Returns all the progress report submitted of given _status
        :param _status : status in ['_approved','_waiting','_progress_report_rejected']
        :type _status : str
        :param _start_index : first index
        :type _start_index : int
        :param _end_index : last index
        :type _end_index : int

        :return : Progress reports with details
        :rtype : dict
        """

        if _status not in self.PROGRESS_REPORT_STATUS_TYPE:
            return {-1: f"{self.address} : -> Not a valid status"}

        _progress_report_list = []
        _progress_keys = self.progress_report_status[_status]

        if _end_index - _start_index > 50:
            return {-1: "Page length must not be greater than 50."}
        if _start_index < 0:
            _start_index = 0
        count = len(_progress_keys)
        _range = range(_start_index, count if _end_index > count else _end_index)

        for reports in _range:
            prefix = self.progress_report_prefix(_progress_keys[reports])
            _ipfs_key = self.progress_reports[prefix].ipfs_hash.get()

            proposal_details = self._get_proposal_details(_ipfs_key)
            progressDetails = self._get_progress_reports_details(_progress_keys[reports])
            progressDetails[self._TOTAL_VOTERS] = len(self.main_preps)

            if progressDetails[self._STATUS] == _status:
                progressDetails[self._PROJECT_TITLE] = proposal_details[self._PROJECT_TITLE]
                progressDetails[self._CONTRIBUTOR_ADDRESS] = proposal_details[self._CONTRIBUTOR_ADDRESS]
                _progress_report_list.append(progressDetails)

        progress_report_dict = {"data": _progress_report_list, "count": count}
        return progress_report_dict

    @external(readonly=True)
    def get_progress_reports_by_proposal(self, _ipfs_key: str) -> dict:
        """
        Returns all the progress reports for a specific project
        :param _ipfs_key : project key i.e. proposal ipfs hash
        :type _ipfs_key : str

        :return : List of all progress report with status
        :rtype : dict
        """

        prefix = self.proposal_prefix(_ipfs_key)
        _report_keys = self.proposals[prefix].progress_reports
        proposal_details = self._get_proposal_details(_ipfs_key)
        _progress_reports = []

        for reports in _report_keys:
            _progress_report = self._get_progress_reports_details(reports)
            _progress_report[self._TOTAL_VOTERS] = len(self.main_preps)
            _progress_report[self._PROJECT_TITLE] = proposal_details[self._PROJECT_TITLE]
            _progress_report[self._CONTRIBUTOR_ADDRESS] = proposal_details[self._CONTRIBUTOR_ADDRESS]
            _progress_reports.append(_progress_report)

        return {"data": _progress_reports, "count": len(_report_keys)}

    @external(readonly=True)
    def get_sponsors_requests(self, _status: str, _sponsor_address: Address, _start_index: int = 0,
                              _end_index: int = 20) -> dict:
        """
        Returns all the sponsored requests for given sponsor address
        :param _status : status in ['_sponsor_pending','_approved','_rejected','_disqualified']
        :type _status : str
        :param _sponsor_address: Sponsor P-Rep address
        :type _sponsor_address: str
        :param _start_index: first index
        :param _end_index: last index

        :return: List of all proposals_details
        :rtype: dict
        """

        _sponsors_request = []
        _proposals_keys = []

        if _status not in [self._APPROVED, self._SPONSOR_PENDING, self._REJECTED, self._DISQUALIFIED]:
            return {-1: f"{self.address} : {self.get_sponsors_requests.__name__} -> Not valid status."}

        if _status == self._APPROVED:
            for pa in self.get_proposals_keys_by_status(self._PENDING):
                _proposals_keys.append(pa)

            for ac in self.get_proposals_keys_by_status(self._ACTIVE):
                _proposals_keys.append(ac)

            for pa in self.get_proposals_keys_by_status(self._PAUSED):
                _proposals_keys.append(pa)

            for com in self.get_proposals_keys_by_status(self._COMPLETED):
                _proposals_keys.append(com)

        else:
            _proposals_keys = self.get_proposals_keys_by_status(_status)

        if _start_index < 0:
            _start_index = 0
        if _end_index - _start_index > 50:
            return {-1: f"{self.address} :-> "
                        f"Page length must not be greater than 50."}

        start = _end_index * _start_index
        count = len(_proposals_keys)

        if start > count:
            return {}

        end = _end_index * (_start_index + 1)
        _range = range(start, count if end > count else end)

        for _keys in _range:
            _proposal_details = self._get_proposal_details(_proposals_keys[_keys])
            _proposal_details[self._TOTAL_VOTERS] = len(self.main_preps)
            if _proposal_details[self._SPONSOR_ADDRESS] == _sponsor_address:
                _sponsors_request.append(_proposal_details)

        _sponsors_dict = {"data": _sponsors_request, "count": len(_sponsors_request)}

        return _sponsors_dict

    @external(readonly=True)
    def get_remaining_project(self, _project_type: str, _wallet_address: Address) -> list:
        """
        Returns remaining projects and progress reports to vote on the current voting period
        :param _project_type: "proposal" or "progress_report" which type, remaining votes need to be checked
        :type _project_type: str
        :param _wallet_address: Wallet Address of the P-Rep
        :type _wallet_address: str
        :return: list of details of proposal or progress report what they need to vote on the same voting period
        """
        _remaining_proposals = []
        _remaining_progress_report = []
        if _project_type == "proposal":
            _proposal_keys = self.get_proposals_keys_by_status(self._PENDING)

            for _ipfs_key in _proposal_keys:
                prefix = self.proposal_prefix(_ipfs_key)
                _voters_list = self.proposals[prefix].voters_list

                if _wallet_address not in _voters_list:
                    _proposal_details = self._get_proposal_details(_ipfs_key)
                    _proposal_details[self._TOTAL_VOTERS] = len(self.main_preps)
                    _remaining_proposals.append(_proposal_details)

            return _remaining_proposals

        if _project_type == "progress_report":
            for _report_key in self._waiting:
                prefix = self.progress_report_prefix(_report_key)
                _voters_list = self.progress_reports[prefix].voters_list

                if _wallet_address not in _voters_list:
                    _progress_reports_details = self._get_progress_reports_details(_report_key)
                    _progress_reports_details[self._TOTAL_VOTERS] = len(self.main_preps)
                    _remaining_progress_report.append(_progress_reports_details)

            return _remaining_progress_report

    @external(readonly=True)
    def get_vote_result(self, _ipfs_key: str) -> dict:
        """
        Get vote results by proposal
        :param _ipfs_key : proposal ipfs key
        :type _ipfs_key : str

        :return: Vote status of given _ipfs_key
        :rtype : dict
        """

        _proposal_details = self._get_proposal_details(_ipfs_key)
        prefix = self.proposal_prefix(_ipfs_key)

        _voters_list = self.proposals[prefix].voters_list
        _approved_voters_list = self.proposals[prefix].approve_voters
        _rejected_voters_list = self.proposals[prefix].reject_voters

        _vote_status = []

        if not _voters_list:
            return {"data": _vote_status, "approve_voters": _proposal_details['approve_voters'],
                    "reject_voters": _proposal_details['reject_voters'],
                    "total_voters": len(self.main_preps),
                    "approved_votes": _proposal_details['approved_votes'],
                    "rejected_votes": _proposal_details['rejected_votes'],
                    "total_votes": _proposal_details['total_votes']}

        else:
            for voters in _voters_list:
                if voters in _approved_voters_list:
                    _voters = {self._ADDRESS: voters,
                               self._VOTE: self._APPROVE}
                elif voters in _rejected_voters_list:
                    _voters = {self._ADDRESS: voters,
                               self._VOTE: self._REJECT}
                else:
                    _voters = {self._ADDRESS: voters,
                               self._VOTE: self._ABSTAIN}

                _vote_status.append(_voters)

            return {"data": _vote_status, "approve_voters": _proposal_details['approve_voters'],
                    "reject_voters": _proposal_details['reject_voters'],
                    "total_voters": len(self.main_preps),
                    "approved_votes": _proposal_details['approved_votes'],
                    "rejected_votes": _proposal_details['rejected_votes'],
                    "total_votes": _proposal_details['total_votes']}

    @external(readonly=True)
    def get_progress_report_result(self, _report_key: str) -> dict:
        """
        Get vote results by progress report
        :param _report_key : progress report ipfs key
        :type _report_key : str

        :return: Vote status of given _report_key
        :rtype : dict
        """
        _proposal_details = self._get_progress_reports_details(_report_key)
        prefix = self.progress_report_prefix(_report_key)

        _voters_list = self.progress_reports[prefix].voters_list
        _approved_voters_list = self.progress_reports[prefix].approve_voters
        _rejected_voters_list = self.progress_reports[prefix].reject_voters
        _vote_status = []

        if not _voters_list:
            return {"data": _vote_status, "approve_voters": _proposal_details['approve_voters'],
                    "reject_voters": _proposal_details['reject_voters'],
                    "total_voters": len(self.main_preps),
                    "approved_votes": _proposal_details['approved_votes'],
                    "rejected_votes": _proposal_details['rejected_votes'],
                    "total_votes": _proposal_details['total_votes']}

        for voters in _voters_list:
            if voters in _approved_voters_list:
                _voters = {self._ADDRESS: voters,
                           self._VOTE: self._APPROVE}
            else:
                _voters = {self._ADDRESS: voters,
                           self._VOTE: self._REJECT}
            _vote_status.append(_voters)
        return {"data": _vote_status, "approve_voters": _proposal_details['approve_voters'],
                "reject_voters": _proposal_details['reject_voters'],
                "total_voters": len(self.main_preps),
                "approved_votes": _proposal_details['approved_votes'],
                "rejected_votes": _proposal_details['rejected_votes'],
                "total_votes": _proposal_details['total_votes']}

    @external(readonly=True)
    def get_budget_adjustment_vote_result(self, _report_key: str) -> dict:
        """
        Get budget adjustment vote results
        :param _report_key : progress report ipfs key
        :type _report_key : str

        :return: Vote status of given _report_key
        :rtype : dict
        """

        _proposal_details = self._get_progress_reports_details(_report_key)
        prefix = self.progress_report_prefix(_report_key)

        _voters_list = self.progress_reports[prefix].voters_list
        _approved_voters_list = self.progress_reports[prefix].budget_approve_voters
        _rejected_voters_list = self.progress_reports[prefix].budget_reject_voters
        _vote_status = []

        for voters in _voters_list:
            if voters in _approved_voters_list:
                _voters = {self._ADDRESS: voters,
                           self._VOTE: self._APPROVE}
            elif voters in _rejected_voters_list:
                _voters = {self._ADDRESS: voters,
                           self._VOTE: self._REJECT}
            else:
                _voters = {self._ADDRESS: voters,
                           self._VOTE: "not voted"}

            _vote_status.append(_voters)

        return {"data": _vote_status, "approve_voters": _proposal_details['budget_approve_voters'],
                "reject_voters": _proposal_details['budget_reject_voters'],
                "total_voters": len(self.main_preps),
                "approved_votes": _proposal_details['budget_approved_votes'],
                "rejected_votes": _proposal_details['budget_rejected_votes'],
                "total_votes": _proposal_details['total_votes']}

    @external
    def update_period(self):
        """
        Update Period after ending of the Allocated BlockTime for each period.
        :return:
        """
        _current_day = self.now() // U_SECONDS_DAY
        if _current_day <= self.next_block.get():
            self.PeriodNotUpdate(f"Period Update Fail. {self.address} : -> Current Day : {_current_day}, "
                                 f"Next Changing  : {self.next_block.get()}")

        else:
            self.set_PReps()
            if self.period_name.get() == APPLICATION_PERIOD:
                self.period_name.set(VOTING_PERIOD)
                self.next_block.set(_current_day + DAY_COUNT)
                self._update_application_result()

            else:
                self.period_name.set(APPLICATION_PERIOD)
                self.next_block.set(_current_day + DAY_COUNT)
                self._update_proposals_result()
                self._check_progress_report_submission()
                self._update_progress_report_result()
                self._update_denylist_preps()
                self.PeriodUpdate("Period Updated to Application Period.")

    def _update_application_result(self):
        """
        While Updating from the application period check if there are enough preps (7)
        and check the active proposals have submitted any progress report or not.
        :return:
        """
        if len(self.main_preps) < MINIMUM_PREPS:
            self.period_name.set(APPLICATION_PERIOD)
            self.PeriodUpdate("Period Updated back to Application Period due to less Registered P-Reps Count")

        else:
            for x in range(0, len(self._active)):
                if self._active[x] not in self.active_proposals:
                    self.active_proposals.put(self._active[x])

            for x in range(0, len(self._paused)):
                if self._paused[x] not in self.active_proposals:
                    self.active_proposals.put(self._paused[x])
            self.PeriodUpdate("Period Updated to Voting Period")

    def _update_proposals_result(self):
        """
        Calculate the votes and update the proposals status on the end of the voting period.
        :return:
        """
        _pending_proposals = []
        for proposals in range(0, len(self._pending)):
            _pending_proposals.append(self._pending[proposals])
        for proposal in range(0, len(_pending_proposals)):
            _proposal_details = self._get_proposal_details(_pending_proposals[proposal])
            prefix = self.proposal_prefix(_pending_proposals[proposal])

            _title = _proposal_details[self._PROJECT_TITLE]

            _sponsor_address = _proposal_details[self._SPONSOR_ADDRESS]
            _contributor_address = _proposal_details[self._CONTRIBUTOR_ADDRESS]
            _total_budget = int(_proposal_details[self._TOTAL_BUDGET])
            _period_count = int(_proposal_details[self._PROJECT_DURATION])
            _sponsor_deposit_amount = int(_proposal_details['sponsor_deposit_amount'])
            _approve_voters = int(_proposal_details["approve_voters"])
            _approved_votes = int(_proposal_details["approved_votes"])
            _total_votes = int(_proposal_details[self._TOTAL_VOTES])
            _total_voters = len(self.main_preps)

            _voters_list = self._get_voters_list(_pending_proposals[proposal])
            _main_preps_list = ArrayDBUtils.arraydb_to_list(self.main_preps)
            _not_voters = [addr for addr in _main_preps_list + _voters_list if
                           addr not in _main_preps_list or addr not in _voters_list]

            for prep in _not_voters:
                if prep not in self.inactive_preps:
                    self.inactive_preps.put(prep)

            if _total_voters == 0 or _total_votes == 0:
                self._update_proposal_status(_pending_proposals[proposal], self._REJECTED)

            elif _approve_voters / _total_voters >= MAJORITY and _approved_votes / _total_votes >= MAJORITY:
                self._update_proposal_status(_pending_proposals[proposal], self._ACTIVE)
                self.sponsors.put(_sponsor_address)
                self.proposals[prefix].sponsor_deposit_status.set(BOND_APPROVED)

                cpf_treasury_score = self.create_interface_score(self.cpf_score.get(), CPF_TREASURY_INTERFACE)
                cpf_treasury_score.transfer_proposal_fund_to_cps_treasury(_pending_proposals[proposal], _period_count,
                                                                          _sponsor_address, _contributor_address,
                                                                          _total_budget)

            else:
                self._update_proposal_status(_pending_proposals[proposal], self._REJECTED)
                self._remove_contributor(_contributor_address)
                self.proposals[prefix].sponsor_deposit_status.set(BOND_RETURNED)
                try:
                    self.icx.transfer(_sponsor_address, _sponsor_deposit_amount)
                    self.SponsorBondReturned(_sponsor_address,
                                             f'{_sponsor_deposit_amount // 10 ** 18} ICX returned to sponsor address.')
                except BaseException as e:
                    revert(f"{self.address} : -> Network problem. Sending back Sponsor Deposit fund. {e}")

    def _update_progress_report_result(self):
        """
        Calculate votes for the progress reports and update the status and get the Installment and Sponsor
        Reward is the progress report is accepted.
        :return:
        """
        _waiting_progress_reports = []
        for proposals in range(0, len(self._waiting)):
            _waiting_progress_reports.append(self._waiting[proposals])

        for reports in range(0, len(_waiting_progress_reports)):
            _reports = _waiting_progress_reports[reports]
            _report_result = self._get_progress_reports_details(_reports)

            _ipfs_hash = _report_result[self._IPFS_HASH]
            proposalPrefix = self.proposal_prefix(_ipfs_hash)
            _proposal_details = self._get_proposal_details(_ipfs_hash)
            _proposal_status = _proposal_details[self._STATUS]
            _project_duration = int(_proposal_details[self._PROJECT_DURATION])
            _approved_reports_count = int(_proposal_details[self._APPROVED_REPORTS])
            _sponsor_address = _proposal_details[self._SPONSOR_ADDRESS]
            _contributor_address = _proposal_details[self._CONTRIBUTOR_ADDRESS]
            _completed = int(_proposal_details[self._PERCENTAGE_COMPLETED])
            _budget_adjustment = int(_report_result[self._BUDGET_ADJUSTMENT])

            _approve_voters = int(_report_result["approve_voters"])
            _reject_voters = int(_report_result["reject_voters"])
            _approved_votes = int(_report_result["approved_votes"])
            _rejected_votes = int(_report_result["rejected_votes"])
            _total_votes = int(_report_result["total_votes"])
            _total_voters = len(self.main_preps)

            _voters_list = self._get_voters_list(_reports)
            _main_preps_list = ArrayDBUtils.arraydb_to_list(self.main_preps)
            _not_voters = [addr for addr in _main_preps_list + _voters_list if
                           addr not in _main_preps_list or addr not in _voters_list]

            for prep in _not_voters:
                if prep not in self.inactive_preps:
                    self.inactive_preps.put(prep)

            if _budget_adjustment == 1:
                self._update_budget_adjustments(_reports)

            cps_treasury_score = self.create_interface_score(self.cps_treasury_score.get(), CPS_TREASURY_INTERFACE)
            cpf_treasury_score = self.create_interface_score(self.cpf_score.get(), CPF_TREASURY_INTERFACE)

            if _approve_voters / _total_voters >= MAJORITY and _approved_votes / _total_votes >= MAJORITY:
                self._update_progress_report_status(_reports, self._APPROVED)
                _approved_reports_count += 1

                if _approved_reports_count == _project_duration:
                    if _completed == 100:
                        self._update_proposal_status(_ipfs_hash, self._COMPLETED)

                elif _proposal_status == self._PAUSED:
                    self._update_proposal_status(_ipfs_hash, self._ACTIVE)

                self.proposals[proposalPrefix].approved_reports.set(_approved_reports_count)
                cps_treasury_score.send_installment_to_contributor(_ipfs_hash)
                cps_treasury_score.send_reward_to_sponsor(_ipfs_hash)

            elif _reject_voters / _total_voters >= MAJORITY and _rejected_votes / _total_votes >= MAJORITY:
                self._update_progress_report_status(_reports, self._PROGRESS_REPORT_REJECTED)

                if _proposal_status == self._ACTIVE:
                    self._update_proposal_status(_ipfs_hash, self._PAUSED)

                elif _proposal_status == self._PAUSED:
                    self._update_proposal_status(_ipfs_hash, self._DISQUALIFIED)

                    cps_treasury_score.disqualify_project(_ipfs_hash)
                    self._remove_contributor(_contributor_address)
                    self._remove_sponsor(_sponsor_address)
                    self.proposals[proposalPrefix].sponsor_deposit_status.set(BOND_CANCELLED)
                    _sponsor_deposit_amount = _proposal_details['sponsor_deposit_amount']

                    cpf_treasury_score.icx(_sponsor_deposit_amount).return_fund_amount(_sponsor_address)
                    self.SponsorBondReturned(self.cpf_score.get(),
                                             f'Project Disqualified. {_sponsor_deposit_amount // 10 ** 18} ICX '
                                             f'returned to CPF Treasury Address.')

            else:
                self._update_progress_report_status(_reports, self._PROGRESS_REPORT_REJECTED)
                if _proposal_status == self._ACTIVE:
                    self._update_proposal_status(_ipfs_hash, self._PAUSED)

                elif _proposal_status == self._PAUSED:
                    self._update_proposal_status(_ipfs_hash, self._DISQUALIFIED)
                    cps_treasury_score.disqualify_project(_ipfs_hash)

                    self._remove_contributor(_contributor_address)
                    self._remove_sponsor(Address.from_string(_sponsor_address))

                    self.proposals[proposalPrefix].sponsor_deposit_status.set(BOND_CANCELLED)
                    _sponsor_deposit_amount = _proposal_details['sponsor_deposit_amount']
                    cpf_treasury_score.icx(_sponsor_deposit_amount).return_fund_amount(_sponsor_address)
                    self.SponsorBondReturned(self.cpf_score.get(),
                                             f'Project Disqualified. {_sponsor_deposit_amount // 10 ** 18} ICX '
                                             f'returned to CPF Treasury Address.')

    def _check_progress_report_submission(self):
        """
        Check if all active and paused proposals submits the progress report
        :return:
        """
        cps_treasury_score = self.create_interface_score(self.cps_treasury_score.get(), CPS_TREASURY_INTERFACE)
        cpf_treasury_score = self.create_interface_score(self.cpf_score.get(), CPF_TREASURY_INTERFACE)

        for _ipfs_hash in self.active_proposals:
            proposalPrefix = self.proposal_prefix(_ipfs_hash)
            _proposal_details = self._get_proposal_details(_ipfs_hash)
            _proposal_status = _proposal_details[self._STATUS]
            _sponsor_address = _proposal_details[self._SPONSOR_ADDRESS]
            _contributor_address = _proposal_details[self._CONTRIBUTOR_ADDRESS]

            for checker in self.get_active_proposals(_contributor_address):
                if checker['new_progress_report'] is True:
                    if _proposal_status == self._ACTIVE:
                        self._update_proposal_status(_ipfs_hash, self._PAUSED)

                    elif _proposal_status == self._PAUSED:
                        self._update_proposal_status(_ipfs_hash, self._DISQUALIFIED)
                        cps_treasury_score.disqualify_project(_ipfs_hash)

                        self._remove_contributor(_contributor_address)
                        self._remove_sponsor(_sponsor_address)

                        self.proposals[proposalPrefix].sponsor_deposit_status.set(BOND_CANCELLED)
                        _sponsor_deposit_amount = _proposal_details['sponsor_deposit_amount']
                        cpf_treasury_score.icx(_sponsor_deposit_amount).return_fund_amount(_sponsor_address)
                        self.SponsorBondReturned(self.cpf_score.get(),
                                                 f'Project Disqualified. {_sponsor_deposit_amount // 10 ** 18} ICX '
                                                 f'returned to CPF Treasury Address.')

    def _update_budget_adjustments(self, _budget_key: str):
        """
        Update the budget amount and added month time if the budget adjustment application is approved by majority.
        :return:
        """

        _report_result = self._get_progress_reports_details(_budget_key)
        _report_hash = _report_result[self._REPORT_HASH]
        _prefix = self.progress_report_prefix(_budget_key)

        _vote_result = self.get_budget_adjustment_vote_result(_budget_key)
        _approve_voters = int(_vote_result["approve_voters"])
        _total_voters = int(_vote_result["total_voters"])
        _approved_votes = int(_vote_result["approved_votes"])
        _total_votes = int(_vote_result["total_votes"])

        if _approve_voters / _total_voters >= MAJORITY and _approved_votes / _total_votes >= MAJORITY:
            _ipfs_hash = _report_result[self._IPFS_HASH]
            proposal_prefix = self.proposal_prefix(_ipfs_hash)
            _period_count = self.proposals[proposal_prefix].project_duration.get()
            _total_budget = self.proposals[proposal_prefix].total_budget.get()
            _additional_duration = _report_result[self._ADDITIONAL_DURATION]
            _additional_budget = _report_result[self._ADDITIONAL_BUDGET]

            self.proposals[proposal_prefix].project_duration.set(_period_count + _additional_duration)
            self.proposals[proposal_prefix].total_budget.set(_total_budget + _additional_budget)

            self.progress_reports[_prefix].budget_adjustment_status.set(self._APPROVED)

            cpf_treasury_score = self.create_interface_score(self.cpf_score.get(), CPF_TREASURY_INTERFACE)
            cpf_treasury_score.update_proposal_fund(_ipfs_hash, _additional_budget, _additional_duration)

        else:
            self.progress_reports[_prefix].budget_adjustment_status.set(self._REJECTED)

    def _update_denylist_preps(self):
        """
        Add a Registered P-Rep to DenyList is they miss voting on the voting period.
        :return:
        """

        for _prep in self.inactive_preps:
            _data_out = self.main_preps.pop()
            if _data_out != _prep:
                for prep in range(0, len(self.main_preps)):
                    if self.main_preps[prep] == _prep:
                        self.main_preps[prep] = _data_out

            self.denylist.put(_prep)
            if self.preps_denylist[str(_prep)] == "":
                self.preps_denylist[str(_prep)] = "Denylist for once."
            elif self.preps_denylist[str(_prep)] == "Denylist for once.":
                self.preps_denylist[str(_prep)] = "Denylist for twice."
            else:
                self.preps_denylist[str(_prep)] = "Denylist for more than twice."

            self.PRepPenalty(_prep, "P-Rep added to Denylist.")

        # Clear all data from the ArrayDB
        ArrayDBUtils.array_db_clear(self.inactive_preps)
