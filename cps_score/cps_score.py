from .utils.checkers import *
from .db.progress_report_data import *
from .db.proposal_data import *
from .utils.consts import *
from .utils.interfaces import *
from .utils.utils import *
from iconservice import *


def to_loop(value: int) -> int:
    return value * 10 ** 18


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

    @eventlog(indexed=1)
    def ProposalSubmitted(self, _sender_address: Address, note: str):
        pass

    @eventlog(indexed=1)
    def TokenBurn(self, _sender_address: Address, note: str):
        pass

    @eventlog(indexed=1)
    def ProgressReportSubmitted(self, _sender_address: Address, _project_title: str):
        pass

    @eventlog(indexed=1)
    def SponsorBondReceived(self, _sender_address: Address, _notes: str):
        pass

    @eventlog(indexed=1)
    def SponsorBondRejected(self, _sender_address: Address, _notes: str):
        pass

    @eventlog(indexed=1)
    def VotedSuccessfully(self, _sender_address: Address, _notes: str):
        pass

    @eventlog(indexed=1)
    def PRepPenalty(self, _prep_address: Address, _notes: str):
        pass

    @eventlog(indexed=1)
    def UnRegisterPRep(self, _sender_address: Address, _notes: str):
        pass

    @eventlog(indexed=1)
    def RegisterPRep(self, _sender_address: Address, _notes: str):
        pass

    @eventlog(indexed=1)
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

        self.cps_treasury_score = VarDB(CPS_TREASURY_SCORE, db, value_type=Address)
        self.cpf_score = VarDB(CPF_SCORE, db, value_type=Address)

        self.initial_block = VarDB(INITIAL_BLOCK, db, value_type=int)
        self.period_name = VarDB(PERIOD_NAME, db, value_type=str)
        self.previous_period_name = VarDB(PREVIOUS_PERIOD_NAME, db, value_type=str)
        self.next_block = VarDB(NEXTBLOCK, db, value_type=int)

        self.valid_preps = ArrayDB(MAIN_PREPS, db, value_type=Address)
        self.unregistered_preps = ArrayDB(UNREGISTERED_PREPS, db, value_type=Address)
        self.registered_preps = ArrayDB(REGISTERED_PREPS, db, value_type=Address)
        self.inactive_preps = ArrayDB(INACTIVE_PREPS, db, value_type=Address)
        self.denylist = ArrayDB(DENYLIST, db, value_type=Address)

        self.penalty_amount = ArrayDB(PENALTY_AMOUNT, db, value_type=int)
        self.preps_denylist = DictDB(PREPS_DENYLIST, db, value_type=str)

        self.proposals_key_list = ArrayDB(PROPOSALS_KEY_LIST, db, value_type=str)
        self.progress_key_list = ArrayDB(PROGRESS_KEY_LIST, db, value_type=str)
        self.budget_approvals_list = ArrayDB(BUDGET_APPROVALS_LIST, db, value_type=str)

        self.active_proposals = ArrayDB(ACTIVE_PROPOSALS, db, value_type=str)
        self.voting_proposals = ArrayDB(VOTING_PROPOSALS, db, value_type=str)
        self.voting_progress_reports = ArrayDB(VOTING_PROGRESS_REPORTS, db, value_type=str)

        self.contributors = ArrayDB(CONTRIBUTORS, db, value_type=Address)
        self.sponsors = ArrayDB(SPONSORS, db, value_type=Address)
        self.admins = ArrayDB(ADMINS, db, value_type=Address)

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

        self._waiting_progress_reports = ArrayDB(self._WAITING, db, value_type=str)
        self._approved_progress_reports = ArrayDB(self._APPROVED, db, value_type=str)
        self._progress_rejected = ArrayDB(self._PROGRESS_REPORT_REJECTED, db, value_type=str)
        self.progress_report_status = {self._WAITING: self._waiting_progress_reports,
                                       self._APPROVED: self._approved_progress_reports,
                                       self._PROGRESS_REPORT_REJECTED: self._progress_rejected}

    def on_install(self) -> None:
        self.admins.put(self.owner)
        super().on_install()

    def on_update(self) -> None:
        super().on_update()

    @external(readonly=True)
    def name(self) -> str:
        """
        :return: SCORE Name
        :rtype: str
        """
        return "CPS_SCORE"

    def only_admin(self):
        if self.msg.sender not in self.admins:
            revert(f"{self.address} : Only Admins can call this method.")

    def set_id(self, _val: str):
        self.id.set(_val)

    def get_id(self) -> str:
        return self.id.get()

    def proposal_prefix(self, _proposal_key: str) -> bytes:
        return b'|'.join([PROPOSAL_DB_PREFIX, self.id.get().encode(), _proposal_key.encode()])

    def progress_report_prefix(self, _progress_key: str) -> bytes:
        return b'|'.join([PROGRESS_REPORT_DB_PREFIX, self.id.get().encode(), _progress_key.encode()])

    def _validate_admins(self):
        if self.msg.sender not in self.admins:
            revert(f"{TAG} : Only Admins can call this method.")

    def _validate_admin_score(self, _score: Address):
        self._validate_admins()
        if not _score.is_contract:
            revert(f"{TAG} : Target({_score}) is not SCORE.")

    @payable
    def fallback(self):
        revert(f'{self.address} :ICX can only be sent while submitting a proposal or paying the penalty.')

    def _burn(self, amount: int) -> None:
        """
        Burn ICX method
        :param amount: integer amount to burn
        :return: none
        """
        try:
            self.icx.transfer(ZERO_WALLET_ADDRESS, amount)
            self.TokenBurn(self.msg.sender, f"{self.msg.value} ICX transferred to burn wallet address.")
        except BaseException as e:
            revert(f"{self.address} : Network problem. Sending proposal funds. {e}")

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
            ArrayDBUtils.remove_array_item(self.admins, _address)

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
        ArrayDBUtils.array_db_clear(self.valid_preps)
        _prep_list = self._get_preps_address()

        for prep in _prep_list:
            if prep not in self.denylist:
                if prep not in self.unregistered_preps:
                    if prep in self.registered_preps:
                        self.valid_preps.put(prep)

    @external
    def unregister_prep(self) -> None:
        """
        Unregister a registered P-Rep from CPS.
        :return:
        """

        if self.msg.sender not in self.valid_preps and self.msg.sender not in self.registered_preps:
            revert(f"{self.address} : P-Rep is not registered yet.")

        ArrayDBUtils.remove_array_item(self.valid_preps, self.msg.sender)
        ArrayDBUtils.remove_array_item(self.registered_preps, self.msg.sender)

        self.unregistered_preps.put(self.msg.sender)
        self.UnRegisterPRep(self.msg.sender, f'{self.msg.sender} has ben unregistered successfully.')

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
            revert(f"{self.address} : P-Rep is already registered.")

        if _address in self.denylist:
            revert(f"{self.address} : You are in denylist. To register, You've to pay Penalty.")

        if _address in self.unregistered_preps:
            ArrayDBUtils.remove_array_item(self.unregistered_preps, _address)

        self.registered_preps.put(_address)

        if self.period_name.get() == APPLICATION_PERIOD:
            self.valid_preps.put(_address)
            self.RegisterPRep(self.msg.sender, 'P-Rep Registered.')

    def _remove_sponsor(self, _address: Address) -> None:
        """
        remove Sponsor from the sponsor list
        :param _address: Address of the Sponsor
        :type _address: Address
        :return:
        """
        if _address in self.sponsors:
            ArrayDBUtils.remove_array_item(self.sponsors, _address)

    def _remove_contributor(self, _address: Address) -> None:
        """
        remove contributor address from the sponsor list
        :param _address: Address of the contributor
        :type _address: Address
        :return:
        """
        if _address in self.contributors:
            ArrayDBUtils.remove_array_item(self.contributors, _address)

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

    def _update_proposal_status(self, _proposal_key: str, _status: str) -> None:
        prefix = self.proposal_prefix(_proposal_key)
        _current_status = self.proposals[prefix].status.get()
        self.proposals[prefix].timestamp.set(self.now())
        self.proposals[prefix].status.set(_status)

        ArrayDBUtils.remove_array_item(self.proposals_status[_current_status], _proposal_key)
        self.proposals_status[_status].put(_proposal_key)

    def _add_proposals(self, _proposal: ProposalAttributes) -> None:
        proposal_data_obj = createProposalDataObject(_proposal)
        if not self._check_proposal(proposal_data_obj.ipfs_hash):
            self.proposals_key_list.put(proposal_data_obj.ipfs_hash)
            prefix = self.proposal_prefix(proposal_data_obj.ipfs_hash)
            addDataToProposalDB(prefix, self.proposals, proposal_data_obj)
        else:
            revert(f"{TAG} : Proposal Hash Already Exists.")

    def _get_proposal_details(self, _proposal_key: str) -> dict:
        prefix = self.proposal_prefix(_proposal_key)
        _proposal_details = getDataFromProposalDB(prefix, self.proposals)
        return _proposal_details

    def _update_progress_report_status(self, progress_report_key: str, _status: str) -> None:
        prefix = self.progress_report_prefix(progress_report_key)
        _current_status = self.progress_reports[prefix].status.get()
        self.progress_reports[prefix].timestamp.set(self.now())
        self.progress_reports[prefix].status.set(_status)

        ArrayDBUtils.remove_array_item(self.proposals_status[_current_status], progress_report_key)
        self.progress_report_status[_status].put(progress_report_key)

    def _add_progress_report(self, _progress_report: ProgressReportAttributes) -> None:
        progress_report_obj = createProgressDataObject(_progress_report)
        if progress_report_obj.report_hash not in self._get_progress_keys():
            self._add_new_progress_report_key(progress_report_obj.ipfs_hash, progress_report_obj.report_hash)
            prefix = self.progress_report_prefix(progress_report_obj.report_hash)
            addDataToProgressReportDB(prefix, self.progress_reports, progress_report_obj)
        else:
            revert(f"{TAG} : Report Hash Already Exists.")

    def _get_progress_reports_details(self, _progress_hash: str) -> dict:
        prefix = self.progress_report_prefix(_progress_hash)
        response = getDataFromProgressReportDB(prefix, self.progress_reports)
        return response

    @external
    @payable
    def submit_proposal(self, _proposals: ProposalAttributes) -> None:
        """
        Submits a proposal, with ipfs_hash
        :param _proposals: dict of the necessary params to be stored
        :return:
        """
        self.update_period()
        if self.period_name.get() != APPLICATION_PERIOD:
            revert(f"{self.address} : Proposals can only be submitted on Application Period")

        proposal_key = _proposals.copy()

        # TODO
        if self.msg.sender.is_contract:
            revert(f"{self.address} : Contract Address not supported.")

        if proposal_key[PROJECT_DURATION] > MAX_PROJECT_PERIOD:
            revert(f'{self.address} : Maximum Project Duration exceeds 6 months.')

        if to_loop(proposal_key[TOTAL_BUDGET]) > self.get_remaining_fund():
            revert(f'{self.address} : Budget Exceeds than Treasury Amount. '
                   f'{self.get_remaining_fund()}')

        if proposal_key[SPONSOR_ADDRESS] not in self.valid_preps:
            revert(f"{self.address} : Sponsor P-Rep not a Top 100 P-Rep.")

        if self.msg.value != to_loop(SUBMISSION_FEE):
            revert(f"{self.address} : Deposit 50 ICX to submit a proposal.")

        proposal_key.pop(IPFS_LINK, None)
        proposal_key[TIMESTAMP] = self.now()
        proposal_key[STATUS] = self._SPONSOR_PENDING
        proposal_key[CONTRIBUTOR_ADDRESS] = self.msg.sender
        proposal_key[TX_HASH] = bytes.hex(self.tx.hash)
        proposal_key[PERCENTAGE_COMPLETED] = 0

        self._add_proposals(proposal_key)
        self._sponsor_pending.put(proposal_key[IPFS_HASH])
        self.contributors.put(self.msg.sender)
        self.ProposalSubmitted(self.msg.sender, "Successfully submitted a Proposal.")
        self._burn(self.msg.value)

    @external
    def submit_progress_report(self, _progress_report: ProgressReportAttributes) -> None:
        """
        Submits a progress report, with ipfs_hash and report hash
        :param _progress_report: TypedDict of the necessary params to be stored
        :return:
        """
        self.update_period()
        if self.period_name.get() != APPLICATION_PERIOD:
            revert(f"{self.address} : Progress Reports can only be submitted on Application Period")

        # TODO
        if self.msg.sender.is_contract:
            revert(f"{self.address} : Contract Address not supported.")

        _progress = _progress_report.copy()
        _ipfs_hash = _progress[IPFS_HASH]
        prefix = self.proposal_prefix(_ipfs_hash)
        _prefix = self.proposals[prefix]

        if self.msg.sender != _prefix.contributor_address.get():
            revert(f"{self.address} : Sorry, You are not the contributor for this project.")

        if _ipfs_hash not in self.get_proposal_keys():
            revert(f"{self.address} : Sorry, Project not found.")

        if _prefix.submit_progress_report.get():
            revert(f"{TAG} : Progress Report is already submitted this cycle.")

        _progress.pop(PERCENTAGE_COMPLETED, None)
        _progress[STATUS] = self._WAITING
        _progress[TIMESTAMP] = self.now()
        _progress[TX_HASH] = bytes.hex(self.tx.hash)
        _progress[BUDGET_ADJUSTMENT_STATUS] = "N/A"

        if _progress[BUDGET_ADJUSTMENT]:
            if not _prefix.percentage_completed.get():
                if to_loop(_progress[ADDITIONAL_BUDGET]) > self.get_remaining_fund():
                    revert(f"{self.address} : Additional Budget Exceeds than Treasury Amount. "
                           f"{self.get_remaining_fund() // MULTIPLIER} ICX")
                self.budget_approvals_list.put(_progress[REPORT_HASH])
                _progress[BUDGET_ADJUSTMENT_STATUS] = self._PENDING
                _prefix.budget_adjustment.set(True)
            else:
                revert(f"{TAG} : Budget Adjustment Already submitted for this proposal.")

        if 0 <= _progress[PERCENTAGE_COMPLETED] <= 100:
            _prefix.percentage_completed.set(_progress[PERCENTAGE_COMPLETED])
        else:
            revert(f'{self.address} : Not valid percentage value.')
        _prefix.submit_progress_report.set(True)

        self._add_progress_report(_progress)
        self._waiting_progress_reports.put(_progress[REPORT_HASH])

        self.ProgressReportSubmitted(self.msg.sender, f'{_progress[PROGRESS_REPORT_TITLE]} --> Progress '
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

    @external
    @payable
    def sponsor_vote(self, _ipfs_key: str, _vote: str, _vote_reason: str) -> None:
        """
        Selected Sponsor P-Rep to approve the requested proposal for CPS
        :param _vote: Vote from Sponsor [_accept,_reject]
        :param _vote_reason : Reason behind the _vote
        :param _ipfs_key : proposal ipfs hash
        :type _ipfs_key : str
        """
        self.update_period()
        if self.period_name.get() != APPLICATION_PERIOD:
            revert(f"{self.address} : Sponsorship Voting can only be done on Application Period")

        _proposal_details = self._get_proposal_details(_ipfs_key)
        _status = _proposal_details[STATUS]
        _sponsor = _proposal_details[SPONSOR_ADDRESS]
        _contributor_address = _proposal_details[CONTRIBUTOR_ADDRESS]

        if self.msg.sender not in self.valid_preps:
            revert(f"{self.address} : Not a P-Rep.")

        if self.msg.sender != _sponsor:
            revert(f"{self.address} : Not a valid Sponsor.")

        if _vote == ACCEPT:
            if _status == self._SPONSOR_PENDING:
                _budget: int = _proposal_details[TOTAL_BUDGET]

                if self.msg.value != to_loop(_budget) // 10:
                    revert(f"{self.address} : Deposit 10% of the total budget of the project.")

                self._update_proposal_status(_ipfs_key, self._PENDING)

                prefix = self.proposal_prefix(_ipfs_key)
                self.proposals[prefix].sponsor_deposit_amount.set(self.msg.value)
                self.proposals[prefix].sponsored_timestamp.set(self.now())
                self.proposals[prefix].sponsor_deposit_status.set(BOND_RECEIVED)
                self.proposals[prefix].sponsor_vote_reason.set(_vote_reason.encode())

                self.SponsorBondReceived(self.msg.sender, f"Sponsor Bond Received from {self.msg.sender}.")
        else:
            self._remove_contributor(_contributor_address)
            self._update_proposal_status(_ipfs_key, self._REJECTED)
            self.SponsorBondRejected(self.msg.sender,
                                     f"Sponsor Bond Rejected for project {_proposal_details[PROJECT_TITLE]}.")

    @external
    def vote_proposal(self, _ipfs_key: str, _vote: str, _vote_reason: str) -> None:
        """
        P-Rep(s) voting for a proposal to be approved or not
        :param _ipfs_key : proposal ipfs hash
        :type _ipfs_key : str
        :param _vote: vote in [_approve,_reject,_abstain]
        :type _vote : str
        :param _vote_reason : Any specific reason behind the vote
        :type _vote_reason : str
        """
        self.update_period()
        if self.period_name.get() != VOTING_PERIOD:
            revert(f"{self.address} : Voting can only be done on Voting Period")

        if self.msg.sender not in self.valid_preps:
            revert(f"{self.address} : Voting can only be done by registered P-Reps")

        if _vote not in [APPROVE, REJECT, ABSTAIN]:
            revert(f'{self.address} : Vote should be on _approve, _reject or _abstain')

        _proposal_details = self._get_proposal_details(_ipfs_key)
        _status = _proposal_details[STATUS]
        prefix = self.proposal_prefix(_ipfs_key)
        proposals_prefix_ = self.proposals[prefix]
        _voters_list = proposals_prefix_.voters_list

        if self.msg.sender in _voters_list:
            revert(f"{self.address} : Already voted on this Proposal.")

        if _status == self._PENDING:
            _voter_stake = self._get_stake(self.msg.sender)
            _total_votes: int = _proposal_details['total_votes']
            _approved_votes: int = _proposal_details['approved_votes']
            _rejected_votes: int = _proposal_details['rejected_votes']

            proposals_prefix_.total_votes.set(_total_votes + _voter_stake)
            proposals_prefix_.voters_list.put(self.msg.sender)
            proposals_prefix_.voters_reasons.put(_vote_reason.encode())

            if _vote == APPROVE:
                proposals_prefix_.approve_voters.put(self.msg.sender)
                proposals_prefix_.approved_votes.set(_approved_votes + _voter_stake)
            elif _vote == REJECT:
                proposals_prefix_.reject_voters.put(self.msg.sender)
                proposals_prefix_.rejected_votes.set(_rejected_votes + _voter_stake)

            self.VotedSuccessfully(self.msg.sender, f"Proposal Vote for {_proposal_details[PROJECT_TITLE]} Successful.")

    @external
    def vote_progress_report(self, _ipfs_key: str, _report_key: str, _vote: str, _vote_reason: str,
                             _budget_adjustment_vote: str = "") -> None:
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

        self.update_period()
        if self.period_name.get() != VOTING_PERIOD:
            revert(f"{self.address} : Voting can only be done on Voting Period")

        if self.msg.sender not in self.valid_preps:
            revert(f"{self.address} : Voting can only be done only by Top 100 P-Reps")

        _progress_report_details = self._get_progress_reports_details(_report_key)
        _status = _progress_report_details[STATUS]
        prefix = self.progress_report_prefix(_report_key)
        reports_prefix_ = self.progress_reports[prefix]
        _voters_list = reports_prefix_.voters_list

        if self.msg.sender in _voters_list:
            revert(f"{self.address} : Already Voted on this proposal.")

        if _status == self._WAITING:
            _voter_stake: int = self._get_stake(self.msg.sender)
            _total_votes: int = _progress_report_details['total_votes']
            _approved_votes: int = _progress_report_details['approved_votes']
            _rejected_votes: int = _progress_report_details['rejected_votes']

            reports_prefix_.total_votes.set(_total_votes + _voter_stake)
            reports_prefix_.voters_list.put(self.msg.sender)
            reports_prefix_.voters_reasons.put(_vote_reason.encode())

            if _vote == APPROVE:
                reports_prefix_.approve_voters.put(self.msg.sender)
                reports_prefix_.approved_votes.set(_approved_votes + _voter_stake)
            elif _vote == REJECT:
                reports_prefix_.reject_voters.put(self.msg.sender)
                reports_prefix_.rejected_votes.set(_rejected_votes + _voter_stake)

            if _report_key in self.budget_approvals_list:
                if _budget_adjustment_vote == APPROVE:
                    reports_prefix_.budget_approve_voters.put(self.msg.sender)
                    reports_prefix_.budget_approved_votes.set(_approved_votes + _voter_stake)
                elif _budget_adjustment_vote == REJECT:
                    reports_prefix_.budget_reject_voters.put(self.msg.sender)
                    reports_prefix_.budget_rejected_votes.set(_rejected_votes + _voter_stake)

            self.VotedSuccessfully(self.msg.sender, f"Progress Report Vote for "
                                                    f"{_progress_report_details[PROGRESS_REPORT_TITLE]} Successful.")

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
            self.penalty_amount.put(to_loop(amount))

    @payable
    @external
    def pay_prep_penalty(self):
        """
        To remove the address from denylist
        :return:
        """
        self.update_period()
        if self.period_name.get() != APPLICATION_PERIOD:
            revert(f"{self.address} : Paying Penalty can only be done on Application Period")

        if self.msg.sender not in self.denylist:
            revert(f"{self.address} : {self.msg.sender} not in denylist.")

        _penalty_amount = self._get_penalty_amount(self.msg.sender)

        if self.msg.value != _penalty_amount:
            revert(f"{self.address} :  Please pay Penalty amount of {_penalty_amount} ICX to register as a P-Rep.")

        ArrayDBUtils.remove_array_item(self.denylist, self.msg.sender)

        self.valid_preps.put(self.msg.sender)
        self._burn(self.msg.value)
        self.PRepPenalty(self.msg.sender,
                         f"{self.msg.value} ICX Penalty Received. P-Rep removed from Denylist.")

    @only_owner
    @external
    def set_initialBlock(self) -> None:
        """
        To set the initial block of application period to start (once only)

        :return: None
        """
        self.set_PReps()

        self.initial_block.set(self.block_height)
        self.next_block.set(self.block_height + BLOCKS_DAY_COUNT * DAY_COUNT)
        self.period_name.set(APPLICATION_PERIOD)
        self.previous_period_name.set("None")

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

            if _address in self.valid_preps:
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
        for prep in self.valid_preps:
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

        _remaining_time = (self.next_block.get() - self.block_height) * 2
        if _remaining_time < 0:
            _remaining_time = 0

        period_dict = {CURRENTBLOCK: self.block_height,
                       NEXTBLOCK: self.next_block.get(),
                       REMAINING_TIME: _remaining_time,
                       PERIOD_NAME: self.period_name.get(),
                       PREVIOUS_PERIOD_NAME: self.previous_period_name.get(),
                       PERIOD_SPAN: BLOCKS_DAY_COUNT * DAY_COUNT * 2}

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
                _amount += self._get_proposal_details(keys)[TOTAL_BUDGET]

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

        _amount_dict = {_status_list[0]: {AMOUNT: _pending_amount,
                                          "_count": len(self.get_proposals_keys_by_status(_status_list[0]))},
                        _status_list[1]: {AMOUNT: _active_amount,
                                          "_count": len(self.get_proposals_keys_by_status(_status_list[1]))},
                        _status_list[2]: {AMOUNT: _paused_amount,
                                          "_count": len(self.get_proposals_keys_by_status(_status_list[2]))},
                        _status_list[3]: {AMOUNT: _completed_amount,
                                          "_count": len(self.get_proposals_keys_by_status(_status_list[3]))},
                        _status_list[4]: {AMOUNT: _disqualified_amount,
                                          "_count": len(self.get_proposals_keys_by_status(_status_list[4]))}}

        return _amount_dict

    @external(readonly=True)
    def get_contributors(self, _start_index: int = 0, _end_index: int = 50) -> list:
        """
        Returns the list of all contributors address who've submitted proposals to CPS
        :return: List of contributors
        """

        _contributors_list = []

        if _end_index - _start_index > 100:
            return ["Page length must not be greater than 50."]
        if _start_index < 0:
            _start_index = 0
        count = len(self.contributors)
        end = count if _end_index > count else _end_index

        for address in range(_start_index, end):
            if address not in _contributors_list:
                _contributors_list.append(self.contributors[address])

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
            _sponsors_list.append(str(_proposal_details[SPONSOR_ADDRESS]))

        sponsors_dict = {i: _sponsors_list.count(i) for i in _sponsors_list}

        return sponsors_dict

    @external(readonly=True)
    def get_proposal_details(self, _status: str, _wallet_address: Address = None, _start_index: int = 0,
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
            _proposal_details[TOTAL_VOTERS] = len(self.valid_preps)

            if _status == self._SPONSOR_PENDING:
                if _proposal_details[CONTRIBUTOR_ADDRESS] == _wallet_address:
                    _proposals_list.append(_proposal_details)

                count = len(_proposals_list)

            elif _proposal_details[STATUS] == _status:
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
            if _proposal_details[STATUS] == self._ACTIVE or _proposal_details[STATUS] == self._PAUSED:
                if _proposal_details[CONTRIBUTOR_ADDRESS] == _wallet_address:
                    _report_keys = self.proposals[prefix].progress_reports
                    _project_duration: int = _proposal_details[PROJECT_DURATION]
                    _approved_reports_count: int = _proposal_details[APPROVED_REPORTS]
                    _report = True
                    _last_progress_report = False

                    for report in _report_keys:
                        if self._get_progress_reports_details(report)[STATUS] == self._WAITING:
                            _report = False
                    if _project_duration - _approved_reports_count == 1:
                        _last_progress_report = True
                    _proposals_details = {PROJECT_TITLE: _proposal_details[PROJECT_TITLE],
                                          IPFS_HASH: proposals,
                                          "new_progress_report": _report,
                                          "last_progress_report": _last_progress_report}
                    _proposal_titles.append(_proposals_details)

        return _proposal_titles

    @external(readonly=True)
    def get_proposal_detail_by_wallet(self, _wallet_address: Address) -> dict:
        """
        Returns a dict of proposals of provided status
        :param _wallet_address : user Signing in
        :type _wallet_address : 'iconservice.base.address'

        :return: List of all proposals_details
        """

        if _wallet_address == "":
            return {"Message": "Enter wallet address."}

        _proposals_list = []
        _proposals_keys = self.proposals_key_list

        for _keys in range(0, len(_proposals_keys)):
            _proposal_details = self._get_proposal_details(_proposals_keys[_keys])
            _proposal_details[TOTAL_VOTERS] = len(self.valid_preps)
            if _proposal_details[CONTRIBUTOR_ADDRESS] == _wallet_address:
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
            return {-1: f"{self.address} : Not a valid status"}

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
            progressDetails[TOTAL_VOTERS] = len(self.valid_preps)

            if progressDetails[STATUS] == _status:
                progressDetails[PROJECT_TITLE] = proposal_details[PROJECT_TITLE]
                progressDetails[CONTRIBUTOR_ADDRESS] = proposal_details[CONTRIBUTOR_ADDRESS]
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
            _progress_report[TOTAL_VOTERS] = len(self.valid_preps)
            _progress_report[PROJECT_TITLE] = proposal_details[PROJECT_TITLE]
            _progress_report[CONTRIBUTOR_ADDRESS] = proposal_details[CONTRIBUTOR_ADDRESS]
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
            return {-1: f"{self.address} : Not valid status."}

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
            return {-1: f"{self.address} : Page length must not be greater than 50."}

        start = _end_index * _start_index
        count = len(_proposals_keys)

        if start > count:
            return {}

        end = _end_index * (_start_index + 1)
        _range = range(start, count if end > count else end)

        for _keys in _range:
            _proposal_details = self._get_proposal_details(_proposals_keys[_keys])
            _proposal_details[TOTAL_VOTERS] = len(self.valid_preps)
            if _proposal_details[SPONSOR_ADDRESS] == _sponsor_address:
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
                    _proposal_details[TOTAL_VOTERS] = len(self.valid_preps)
                    _remaining_proposals.append(_proposal_details)

            return _remaining_proposals

        if _project_type == PROGRESS_REPORT:
            for _report_key in self._waiting_progress_reports:
                prefix = self.progress_report_prefix(_report_key)
                _voters_list = self.progress_reports[prefix].voters_list

                if _wallet_address not in _voters_list:
                    _progress_reports_details = self._get_progress_reports_details(_report_key)
                    _progress_reports_details[TOTAL_VOTERS] = len(self.valid_preps)
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
        proposals_prefix_ = self.proposals[prefix]

        _voters_list = proposals_prefix_.voters_list
        _approved_voters_list = proposals_prefix_.approve_voters
        _rejected_voters_list = proposals_prefix_.reject_voters

        _vote_status = []

        if not _voters_list:
            return {"data": _vote_status, "approve_voters": _proposal_details['approve_voters'],
                    "reject_voters": _proposal_details['reject_voters'],
                    "total_voters": len(self.valid_preps),
                    "approved_votes": _proposal_details['approved_votes'],
                    "rejected_votes": _proposal_details['rejected_votes'],
                    "total_votes": _proposal_details['total_votes']}

        else:
            for voters in range(0, len(_voters_list)):
                if _voters_list[voters] in _approved_voters_list:
                    _voters = {ADDRESS: _voters_list[voters],
                               PREP_NAME: self._get_prep_name(_voters_list[voters]),
                               VOTE_REASON: proposals_prefix_.voters_reasons[voters].decode('utf-8'),
                               VOTE: APPROVE}

                elif _voters_list[voters] in _rejected_voters_list:
                    _voters = {ADDRESS: _voters_list[voters],
                               PREP_NAME: self._get_prep_name(_voters_list[voters]),
                               VOTE_REASON: proposals_prefix_.voters_reasons[voters].decode('utf-8'),
                               VOTE: REJECT}
                else:
                    _voters = {ADDRESS: _voters_list[voters],
                               PREP_NAME: self._get_prep_name(_voters_list[voters]),
                               VOTE_REASON: proposals_prefix_.voters_reasons[voters].decode('utf-8'),
                               VOTE: ABSTAIN}

                _vote_status.append(_voters)

            return {"data": _vote_status, "approve_voters": _proposal_details['approve_voters'],
                    "reject_voters": _proposal_details['reject_voters'],
                    "total_voters": len(self.valid_preps),
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
        reports_prefix_ = self.progress_reports[prefix]

        _voters_list = reports_prefix_.voters_list
        _approved_voters_list = reports_prefix_.approve_voters
        _rejected_voters_list = reports_prefix_.reject_voters
        _vote_status = []

        if not _voters_list:
            return {"data": _vote_status, "approve_voters": _proposal_details['approve_voters'],
                    "reject_voters": _proposal_details['reject_voters'],
                    "total_voters": len(self.valid_preps),
                    "approved_votes": _proposal_details['approved_votes'],
                    "rejected_votes": _proposal_details['rejected_votes'],
                    "total_votes": _proposal_details['total_votes']}

        # Differentiating the P-Rep(s) votes according to their votes
        for voters in range(0, len(_voters_list)):
            if _voters_list[voters] in _approved_voters_list:
                _voters = {ADDRESS: _voters_list[voters],
                           PREP_NAME: self._get_prep_name(_voters_list[voters]),
                           VOTE_REASON: reports_prefix_.voters_reasons[voters].decode('utf-8'),
                           VOTE: APPROVE}
            else:
                _voters = {ADDRESS: _voters_list[voters],
                           PREP_NAME: self._get_prep_name(_voters_list[voters]),
                           VOTE_REASON: reports_prefix_.voters_reasons[voters].decode('utf-8'),
                           VOTE: REJECT}
            _vote_status.append(_voters)

        return {"data": _vote_status, "approve_voters": _proposal_details['approve_voters'],
                "reject_voters": _proposal_details['reject_voters'],
                "total_voters": len(self.valid_preps),
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
        reports_prefix_ = self.progress_reports[prefix]

        _voters_list = reports_prefix_.voters_list
        _approved_voters_list = reports_prefix_.budget_approve_voters
        _rejected_voters_list = reports_prefix_.budget_reject_voters
        _vote_status = []

        for voters in range(0, len(_voters_list)):
            if _voters_list[voters] in _approved_voters_list:
                _voters = {ADDRESS: _voters_list[voters],
                           PREP_NAME: self._get_prep_name(_voters_list[voters]),
                           VOTE_REASON: reports_prefix_.voters_reasons[voters].decode('utf-8'),
                           VOTE: APPROVE}

            elif _voters_list[voters] in _rejected_voters_list:
                _voters = {ADDRESS: _voters_list[voters],
                           PREP_NAME: self._get_prep_name(_voters_list[voters]),
                           VOTE_REASON: reports_prefix_.voters_reasons[voters].decode('utf-8'),
                           VOTE: REJECT}

            else:
                _voters = {ADDRESS: _voters_list[voters],
                           PREP_NAME: self._get_prep_name(_voters_list[voters]),
                           VOTE_REASON: reports_prefix_.voters_reasons[voters].decode('utf-8'),
                           VOTE: "not voted"}

            _vote_status.append(_voters)

        return {"data": _vote_status, "approve_voters": _proposal_details['budget_approve_voters'],
                "reject_voters": _proposal_details['budget_reject_voters'],
                "total_voters": len(self.valid_preps),
                "approved_votes": _proposal_details['budget_approved_votes'],
                "rejected_votes": _proposal_details['budget_rejected_votes'],
                "total_votes": _proposal_details['total_votes']}

    @external
    def update_period(self):
        """
        Update Period after ending of the Allocated BlockTime for each period.
        :return:
        """
        _current_block = self.block_height
        if _current_block <= self.next_block.get():
            self.PeriodNotUpdate(f"Period Update Fail. {self.address} : Current Block : {_current_block}, "
                                 f"Next Changing  : {self.next_block.get()}")

        else:
            if self.period_name.get() == APPLICATION_PERIOD:
                self.period_name.set(VOTING_PERIOD)
                self.previous_period_name.set(APPLICATION_PERIOD)
                self.next_block.set(_current_block + BLOCKS_DAY_COUNT * DAY_COUNT)
                self._update_application_result()

            else:
                self.period_name.set(APPLICATION_PERIOD)
                self.previous_period_name.set(VOTING_PERIOD)
                self.next_block.set(_current_block + BLOCKS_DAY_COUNT * DAY_COUNT)
                self._update_proposals_result()
                self._check_progress_report_submission()
                self._update_progress_report_result()
                self._update_denylist_preps()
                self.PeriodUpdate("Period Updated to Application Period.")
        self.set_PReps()

    def _update_application_result(self):
        """
        While Updating from the application period check if there are enough preps (7)
        and check the active proposals have submitted any progress report or not.
        :return:
        """
        # Check if there are minimum number of P-Reps registered or not.
        if len(self.valid_preps) < MINIMUM_PREPS:
            self.period_name.set(APPLICATION_PERIOD)
            self.PeriodUpdate("Period Updated back to Application Period due to less Registered P-Reps Count")

        else:
            # Adding all the active and paused Proposals to check if they submitted any progress report or not
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

            _title = _proposal_details[PROJECT_TITLE]
            _sponsor_address = _proposal_details[SPONSOR_ADDRESS]
            _contributor_address = _proposal_details[CONTRIBUTOR_ADDRESS]
            _total_budget: int = _proposal_details[TOTAL_BUDGET]
            _period_count: int = _proposal_details[PROJECT_DURATION]
            _sponsor_deposit_amount: int = _proposal_details['sponsor_deposit_amount']
            _approve_voters: int = _proposal_details["approve_voters"]
            _approved_votes: int = _proposal_details["approved_votes"]
            _total_votes: int = _proposal_details[TOTAL_VOTES]
            _total_voters = len(self.valid_preps)

            # All voters for this Proposal
            _voters_list = ArrayDBUtils.arraydb_to_list(self.proposals[prefix].voters_list)
            # All valid P-Rep list
            _valid_preps_list = ArrayDBUtils.arraydb_to_list(self.valid_preps)
            # Getting the list of P-Rep who did not vote on.
            _not_voters = [addr for addr in _valid_preps_list + _voters_list if
                           addr not in _valid_preps_list or addr not in _voters_list]

            # Adding the non voters to inactive P-Reps ArrayDB
            for prep in _not_voters:
                if prep not in self.inactive_preps:
                    self.inactive_preps.put(prep)

            if _total_voters == 0 or _total_votes == 0 or len(self.valid_preps) < MINIMUM_PREPS:
                self._update_proposal_status(_pending_proposals[proposal], self._REJECTED)

            elif _approve_voters / _total_voters >= MAJORITY and _approved_votes / _total_votes >= MAJORITY:
                self._update_proposal_status(_pending_proposals[proposal], self._ACTIVE)
                self.sponsors.put(_sponsor_address)
                self.proposals[prefix].sponsor_deposit_status.set(BOND_APPROVED)

                cpf_treasury_score = self.create_interface_score(self.cpf_score.get(), CPF_TREASURY_INTERFACE)

                # After the proposal is being accepted, it requests CPF to send amount to CPS_Treasury
                cpf_treasury_score.transfer_proposal_fund_to_cps_treasury(_pending_proposals[proposal], _period_count,
                                                                          _sponsor_address, _contributor_address,
                                                                          _total_budget)

            else:
                self._update_proposal_status(_pending_proposals[proposal], self._REJECTED)
                self._remove_contributor(_contributor_address)
                self.proposals[prefix].sponsor_deposit_status.set(BOND_RETURNED)

                # Returning back the Sponsor Bond to the sponsor address
                try:
                    self.icx.transfer(_sponsor_address, _sponsor_deposit_amount)
                    self.SponsorBondReturned(_sponsor_address,
                                             f'{_sponsor_deposit_amount // 10 ** 18} ICX returned to sponsor address.')
                except BaseException as e:
                    revert(f"{self.address} : Network problem. Sending back Sponsor Deposit fund. {e}")

    def _update_progress_report_result(self):
        """
        Calculate votes for the progress reports and update the status and get the Installment and Sponsor
        Reward is the progress report is accepted.
        :return:
        """
        waiting_progress_reports = []
        for proposals in range(0, len(self._waiting_progress_reports)):
            waiting_progress_reports.append(self._waiting_progress_reports[proposals])

        for reports in range(0, len(waiting_progress_reports)):
            _reports = waiting_progress_reports[reports]
            _report_result = self._get_progress_reports_details(_reports)
            progress_prefix = self.progress_report_prefix(_reports)

            _ipfs_hash = _report_result[IPFS_HASH]
            proposal_prefix = self.proposal_prefix(_ipfs_hash)
            _proposal_details = self._get_proposal_details(_ipfs_hash)

            self.proposals[proposal_prefix].submit_progress_report.set(False)

            _proposal_status = _proposal_details[STATUS]
            _project_duration: int = _proposal_details[PROJECT_DURATION]
            _approved_reports_count: int = _proposal_details[APPROVED_REPORTS]
            _sponsor_address: 'Address' = _proposal_details[SPONSOR_ADDRESS]
            _contributor_address: 'Address' = _proposal_details[CONTRIBUTOR_ADDRESS]
            _completed: int = _proposal_details[PERCENTAGE_COMPLETED]
            _budget_adjustment: int = _report_result[BUDGET_ADJUSTMENT]

            _approve_voters: int = _report_result["approve_voters"]
            _reject_voters: int = _report_result["reject_voters"]
            _approved_votes: int = _report_result["approved_votes"]
            _rejected_votes: int = _report_result["rejected_votes"]
            _total_votes: int = _report_result["total_votes"]
            _total_voters = len(self.valid_preps)

            # Getting all voters for this progress report
            _voters_list = ArrayDBUtils.arraydb_to_list(self.progress_reports[progress_prefix].voters_list)
            # Getting list of all valid-registered P-Reps
            _main_preps_list = ArrayDBUtils.arraydb_to_list(self.valid_preps)
            # Getting a list of non voters (_main_preps_list - _voters_list)
            _not_voters = [addr for addr in _main_preps_list + _voters_list if
                           addr not in _main_preps_list or addr not in _voters_list]

            for prep in _not_voters:
                if prep not in self.inactive_preps:
                    self.inactive_preps.put(prep)

            # If a progress report have any budget_adjustment, then it checks the budget adjustment first
            if _budget_adjustment == 1:
                self._update_budget_adjustments(_reports)

            cps_treasury_score = self.create_interface_score(self.cps_treasury_score.get(), CPS_TREASURY_INTERFACE)
            cpf_treasury_score = self.create_interface_score(self.cpf_score.get(), CPF_TREASURY_INTERFACE)

            if _approve_voters / _total_voters >= MAJORITY and _approved_votes / _total_votes >= MAJORITY:
                self._update_progress_report_status(_reports, self._APPROVED)
                _approved_reports_count += 1

                if _approved_reports_count == _project_duration:
                    self._update_proposal_status(_ipfs_hash, self._COMPLETED)

                elif _proposal_status == self._PAUSED:
                    self._update_proposal_status(_ipfs_hash, self._ACTIVE)

                self.proposals[proposal_prefix].approved_reports.set(_approved_reports_count)
                # Request CPS Treasury to add some installment amount to the contributor address
                cps_treasury_score.send_installment_to_contributor(_ipfs_hash)
                # Request CPS Treasury to add some sponsor reward amount to the sponsor address
                cps_treasury_score.send_reward_to_sponsor(_ipfs_hash)

            else:
                self._update_progress_report_status(_reports, self._PROGRESS_REPORT_REJECTED)
                if _proposal_status == self._ACTIVE:
                    self._update_proposal_status(_ipfs_hash, self._PAUSED)

                elif _proposal_status == self._PAUSED:
                    self._update_proposal_status(_ipfs_hash, self._DISQUALIFIED)
                    cps_treasury_score.disqualify_project(_ipfs_hash)

                    self._remove_contributor(_contributor_address)
                    self._remove_sponsor(_sponsor_address)

                    self.proposals[proposal_prefix].sponsor_deposit_status.set(BOND_CANCELLED)
                    _sponsor_deposit_amount: int = _proposal_details['sponsor_deposit_amount']

                    # Transferring the sponsor bond deposit to CPF after the project being disqualified
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
            _proposal_status = _proposal_details[STATUS]
            _sponsor_address = _proposal_details[SPONSOR_ADDRESS]
            _contributor_address = _proposal_details[CONTRIBUTOR_ADDRESS]

            for checker in self.get_active_proposals(_contributor_address):
                if checker['new_progress_report']:
                    if _proposal_status == self._ACTIVE:
                        self._update_proposal_status(_ipfs_hash, self._PAUSED)

                    elif _proposal_status == self._PAUSED:
                        self._update_proposal_status(_ipfs_hash, self._DISQUALIFIED)
                        cps_treasury_score.disqualify_project(_ipfs_hash)

                        self._remove_contributor(_contributor_address)
                        self._remove_sponsor(_sponsor_address)

                        self.proposals[proposalPrefix].sponsor_deposit_status.set(BOND_CANCELLED)
                        _sponsor_deposit_amount: int = _proposal_details['sponsor_deposit_amount']

                        # Transferring the sponsor bond deposit to CPF after the project being disqualified
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
        _report_hash = _report_result[REPORT_HASH]
        _prefix = self.progress_report_prefix(_budget_key)

        _vote_result = self.get_budget_adjustment_vote_result(_budget_key)
        _approve_voters: int = _vote_result["approve_voters"]
        _total_voters: int = _vote_result["total_voters"]
        _approved_votes: int = _vote_result["approved_votes"]
        _total_votes: int = _vote_result["total_votes"]

        if _approve_voters / _total_voters >= MAJORITY and _approved_votes / _total_votes >= MAJORITY:
            _ipfs_hash = _report_result[IPFS_HASH]
            proposal_prefix = self.proposal_prefix(_ipfs_hash)
            proposals = self.proposals[proposal_prefix]

            _period_count = proposals.project_duration.get()
            _total_budget = proposals.total_budget.get()
            _additional_duration = _report_result[ADDITIONAL_DURATION]
            _additional_budget = _report_result[ADDITIONAL_BUDGET]

            proposals.project_duration.set(_period_count + _additional_duration)
            proposals.total_budget.set(_total_budget + _additional_budget)
            self.progress_reports[_prefix].budget_adjustment_status.set(self._APPROVED)

            cpf_treasury_score = self.create_interface_score(self.cpf_score.get(), CPF_TREASURY_INTERFACE)

            # After the budget adjustment is approved, Request new added fund to CPF
            cpf_treasury_score.update_proposal_fund(_ipfs_hash, _additional_budget, _additional_duration)

        else:
            self.progress_reports[_prefix].budget_adjustment_status.set(self._REJECTED)

    def _update_denylist_preps(self):
        """
        Add a Registered P-Rep to DenyList is they miss voting on the voting period.
        :return:
        """

        for _prep in self.inactive_preps:
            ArrayDBUtils.remove_array_item(self.registered_preps, _prep)
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
