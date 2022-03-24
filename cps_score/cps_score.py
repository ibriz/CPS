from .utils.checkers import *
from .db.progress_report_data import *
from .db.proposal_data import *
from .utils.consts import *
from .utils.interfaces import *
from .utils.utils import *
from iconservice import *


def to_loop(value: int) -> int:
    return value * MULTIPLIER


class ProposalAttributes(TypedDict):
    ipfs_hash: str
    project_title: str
    project_duration: int
    total_budget: int
    token: str
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

    SPONSOR_BOND_RETURN = 'sponsor_bond_return'

    @eventlog(indexed=1)
    def ProposalSubmitted(self, _sender_address: Address, note: str):
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
    def SponsorBondClaimed(self, _receiver_address: Address, _fund: int, note: str):
        pass

    @eventlog(indexed=1)
    def PriorityVote(self, _address: Address, note: str):
        pass

    def __init__(self, db: IconScoreDatabase) -> None:
        super().__init__(db)

        self.system_score = self.create_interface_score(ZERO_SCORE_ADDRESS, InterfaceSystemScore)

        self.id = VarDB(self.ID, db, str)
        self.proposals = ProposalDataDB(db)
        self.progress_reports = ProgressReportDataDB(db)

        self.cps_treasury_score = VarDB(CPS_TREASURY_SCORE, db, value_type=Address)
        self.cpf_score = VarDB(CPF_SCORE, db, value_type=Address)
        self.balanced_dollar = VarDB(BALANCED_DOLLAR, db, value_type=Address)

        self.initial_block = VarDB(INITIAL_BLOCK, db, value_type=int)
        self.period_name = VarDB(PERIOD_NAME, db, value_type=str)
        self.previous_period_name = VarDB(PREVIOUS_PERIOD_NAME, db, value_type=str)
        self.next_block = VarDB(NEXTBLOCK, db, value_type=int)
        self.update_period_index = VarDB(UPDATE_PERIOD_INDEX, db, value_type=int)

        self.valid_preps = ArrayDB(MAIN_PREPS, db, value_type=Address)
        self.unregistered_preps = ArrayDB(UNREGISTERED_PREPS, db, value_type=Address)
        self.registered_preps = ArrayDB(REGISTERED_PREPS, db, value_type=Address)
        self.inactive_preps = ArrayDB(INACTIVE_PREPS, db, value_type=Address)
        self.denylist = ArrayDB(DENYLIST, db, value_type=Address)

        self.penalty_amount = ArrayDB(PENALTY_AMOUNT, db, value_type=int)
        self.preps_denylist_status = DictDB(PREPS_DENYLIST_STATUS, db, value_type=int)

        self.proposals_key_list = ArrayDB(PROPOSALS_KEY_LIST, db, value_type=str)
        self.proposals_key_list_index = DictDB(PROPOSALS_KEY_LIST_INDEX, db, value_type=int)
        self.progress_key_list = ArrayDB(PROGRESS_KEY_LIST, db, value_type=str)
        self.progress_key_list_index = DictDB(PROGRESS_KEY_LIST_INDEX, db, value_type=int)
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

        self.sponsor_bond_return = DictDB(self.SPONSOR_BOND_RETURN, db, value_type=int, depth=2)

        self.delegation_snapshot = DictDB(DELEGATION_SNAPSHOT, db, value_type=int)
        self.max_delegation = VarDB(MAX_DELEGATION, db, value_type=int)

        self.proposal_fees = VarDB(PROPOSAL_FEES, db, value_type=int)
        self.swap_block_height = VarDB(SWAP_BLOCK_HEIGHT, db, value_type=int)
        self.swap_count = VarDB(SWAP_COUNT, db, value_type=int)

        self.proposal_rank = DictDB(PROPOSAL_RANK, db, value_type=int)
        self.priority_voted_preps = ArrayDB(PRIORITY_VOTED_PREPS, db, value_type=Address)
        self.maintenance = VarDB(MAINTENANCE, db, value_type=bool)
        self.budgetAdjustment = VarDB(BUDGETADJUSTMENT, db, value_type=bool)

    def on_install(self) -> None:
        super().on_install()
        self.admins.put(self.owner)
        for _ in range(3):
            self.penalty_amount.put(0)

    def on_update(self) -> None:
        super().on_update()
        self.proposal_fees.set(0)
        self.budgetAdjustment.set(False)

    def _proposal_key_exists(self, key: str) -> bool:
        return key in self.proposals_key_list_index

    def _progress_key_exists(self, key: str) -> bool:
        return key in self.progress_key_list_index

    @external(readonly=True)
    def name(self) -> str:
        """
        :return: SCORE Name
        :rtype: str
        """
        return TAG

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

    def _check_maintenance(self):
        if self.maintenance.get():
            revert(f'{TAG}: Maintenance mode is on. Will resume soon.')

    @external(readonly=True)
    def is_admin(self, _address: Address) -> bool:
        return _address in self.admins

    @external
    def toggle_maintenance(self):
        self._validate_admins()
        self.maintenance.set(not self.maintenance.get())

    @payable
    def fallback(self):
        revert(f"{TAG} :ICX can only be sent while submitting a proposal or paying the penalty.")

    def _burn(self, amount: int, token: Address = SYSTEM_SCORE_ADDRESS) -> None:
        """
        Burn ICX method
        :param amount: ICX LOOP amount to burn
        :return: none
        """
        try:
            if token == SYSTEM_SCORE_ADDRESS:
                sys_interface = self.create_interface_score(SYSTEM_SCORE_ADDRESS, InterfaceSystemScore)
                sys_interface.icx(amount).burn()
            elif token == self.balanced_dollar.get():
                bnusd_score = self.create_interface_score(token, TokenInterface)
                _data = json_dumps({"method": "burn_amount"}).encode()
                bnusd_score.transfer(self.cpf_score.get(), amount, _data)
            else:
                revert(f'{TAG}: Not a supported token.')
        except Exception as e:
            revert(f"{TAG} : Network problem. Burning Funds. {token},{amount}. Exception: {e}")

    @only_owner
    @external
    def add_admin(self, _address: Address) -> None:
        """
        Add Admins for the CPS
        :param _address: Wallet Address for admin
        :type _address: Address
        """
        if _address not in self.admins:
            self.admins.put(_address)

    @only_owner
    @external
    def remove_admin(self, _address: Address) -> None:
        """
        Remove admin from the list
        :param _address: Admin wallet address
        :type _address: Address
        :return:
        """
        if _address == self.owner:
            revert(f"{TAG}: Owner cannot be removed from the admin list.")
        ArrayDBUtils.remove_array_item(self.admins, _address)

    @external
    def set_cps_treasury_score(self, _score: Address) -> None:
        """
        Sets the cps treasury score address. Only owner can set the address.
        :param _score: Address of the cps treasury score address
        :type _score: :class:`iconservice.base.address.Address`
        :return:
        """
        self._validate_admin_score(_score)
        self.cps_treasury_score.set(_score)

    @external
    def set_cpf_treasury_score(self, _score: Address) -> None:
        """
        Sets the cpf treasury score address. Only owner can set the address.
        :param _score: Address of the cpf treasury score address
        :type _score: :class:`iconservice.base.address.Address`
        :return:
        """
        self._validate_admin_score(_score)
        self.cpf_score.set(_score)

    @external
    def set_bnUSD_score(self, _score: Address) -> None:
        """
        Sets the Balanced Dollar score address. Only owner can set the address.
        :param _score: Address of the Balanced Dollar score address
        :type _score: :class:`iconservice.base.address.Address`
        :return:
        """
        self._validate_admin_score(_score)
        self.balanced_dollar.set(_score)

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
        :param _address: P-Rep address
        :type _address: Address
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
        :type _address: Address
        :return : total delegated amount (loop)
        :rtype: int
        """

        _all_preps = self.system_score.getPRepTerm()['preps']
        for _prep in range(0, len(_all_preps)):
            prep_info = _all_preps[_prep]
            if prep_info['address'] == _address:
                return prep_info.get('power')

    def set_PReps(self) -> None:
        """
        Set the list of P-Reps' address for the period
        :return:
        """
        ArrayDBUtils.array_db_clear(self.valid_preps)
        _prep_list = self._get_preps_address()

        for prep in _prep_list:
            if prep not in self.denylist and prep not in self.unregistered_preps:
                if prep in self.registered_preps:
                    self.valid_preps.put(prep)

    @external
    def unregister_prep(self) -> None:
        """
        Unregister a registered P-Rep from CPS.
        :return:
        """
        self._check_maintenance()
        self.update_period()

        if self.msg.sender not in self.valid_preps and self.msg.sender not in self.registered_preps:
            revert(f"{TAG} : P-Rep is not registered yet.")

        if self.period_name.get() != APPLICATION_PERIOD:
            revert(f"{TAG} : P-Reps can only be unregister on Application Period")

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
        self._check_maintenance()
        self.update_period()

        _address = self.msg.sender
        _prep_list = self._get_preps_address()

        if _address not in _prep_list:
            revert(f"{TAG} : Not a P-Rep")

        if _address in self.registered_preps:
            revert(f"{TAG} : P-Rep is already registered.")

        if _address in self.denylist:
            revert(f"{TAG} : You are in denylist. To register, You've to pay Penalty.")

        if _address in self.unregistered_preps:
            ArrayDBUtils.remove_array_item(self.unregistered_preps, _address)

        self.registered_preps.put(_address)
        self.RegisterPRep(self.msg.sender, 'P-Rep Registered.')

        if self.period_name.get() == APPLICATION_PERIOD:
            self.valid_preps.put(_address)

    def _remove_sponsor(self, _address: Address) -> None:
        """
        remove Sponsor from the sponsor list
        :param _address: Address of the Sponsor
        :type _address: Address
        :return: None
        """
        if _address in self.sponsors:
            ArrayDBUtils.remove_array_item(self.sponsors, _address)
        else:
            revert(f'{TAG}: {_address} not on sponsor list.')

    def _remove_contributor(self, _address: Address) -> None:
        """
        remove contributor address from the sponsor list
        :param _address: Address of the contributor
        :type _address: Address
        :return: None
        """
        if _address in self.contributors:
            ArrayDBUtils.remove_array_item(self.contributors, _address)
        else:
            revert(f'{TAG}: {_address} not on contributor list.')

    def _get_proposal_keys(self) -> list:
        """
        Returns a list of proposal ipfs hash
        :return: list of proposal keys
        :rtype: list
        """
        return [item for item in self.proposals_key_list]

    def _get_progress_keys(self) -> list:
        """
        Return a list of progress reports ipfs hash
        :return: list of progress report ipfs hash
        :rtype: list
        """
        return [item for item in self.progress_key_list]

    def _get_penalty_amount(self, _address: Address) -> int:
        """
        Get a denylist payment amount for the given address.
        Amount Depends on how many time they have been on denylist.
        :param _address: Address of the Denied P-Rep
        :type _address: Address
        :return: integer bnUSD amount for Penalty
        """
        count = self.preps_denylist_status[str(_address)]
        if count == 0:
            revert(f"{TAG} : {_address} does not need to pay penalty")

        idx = count - 1 if count < 3 else 2
        amount: int = self.penalty_amount[idx]
        delegation_amount = self._get_stake(_address)
        penalty_amount = (delegation_amount * amount) // self.max_delegation.get()
        return penalty_amount

    def _update_proposal_status(self, _proposal_key: str, _status: str) -> None:
        """
        updates the status of proposals
        :param _proposal_key: ipfs hash of the proposal
        :type _proposal_key: str
        :param _status: new status of the proposal
        :type _status: str
        :return:
        """
        prefix = self.proposal_prefix(_proposal_key)
        _current_status = self.proposals[prefix].status.get()
        self.proposals[prefix].timestamp.set(self.now())
        self.proposals[prefix].status.set(_status)

        ArrayDBUtils.remove_array_item(self.proposals_status[_current_status], _proposal_key)
        self.proposals_status[_status].put(_proposal_key)

    def _add_proposals(self, _proposal: ProposalAttributes) -> None:
        """
        adds proposals to proposalDB when proposal is submitted by the contributor
        :param _proposal: dict of proposalAttributes
        :type _proposal: ProposalAttributes
        :return:
        """
        proposal_data_obj = createProposalDataObject(_proposal)
        ipfs_hash = proposal_data_obj.ipfs_hash
        if not self._proposal_key_exists(ipfs_hash):
            self.proposals_key_list.put(ipfs_hash)
            prefix = self.proposal_prefix(ipfs_hash)
            addDataToProposalDB(prefix, self.proposals, proposal_data_obj)
            self.proposals_key_list_index[ipfs_hash] = len(self.proposals_key_list) - 1
        else:
            revert(f"{TAG} : Proposal Hash Already Exists.")

    def _get_proposal_details(self, _proposal_key: str) -> dict:
        """
        returns the details of a proposal of the given proposal key
        :param _proposal_key: ipfs hash of the proposal
        :type _proposal_key: str
        :return:
        """
        prefix = self.proposal_prefix(_proposal_key)
        _proposal_details = getDataFromProposalDB(prefix, self.proposals)
        return _proposal_details

    def _add_new_progress_report_key(self, proposal_key: str, progress_key: str) -> None:
        """
        puts new progress report key
        :param proposal_key: ipfs hash of the proposal
        :type proposal_key: str
        :param progress_key: report hash of the progress report
        :type progress_key: str
        :return:
        """
        self.progress_key_list.put(progress_key)
        prefix = self.proposal_prefix(proposal_key)
        if progress_key not in self.proposals[prefix].progress_reports:
            self.proposals[prefix].progress_reports.put(progress_key)
        else:
            revert(f"{TAG}: Progress report {progress_key} already exists.")

    def _update_progress_report_status(self, progress_report_key: str, _status: str) -> None:
        """
        Updates the status of progress reports
        :param progress_report_key: Report hash of the progress report
        :type progress_report_key: str
        :param _status: new status of the progress report
        :type _status: str
        :return:
        """
        prefix = self.progress_report_prefix(progress_report_key)
        _current_status = self.progress_reports[prefix].status.get()
        self.progress_reports[prefix].timestamp.set(self.now())
        self.progress_reports[prefix].status.set(_status)

        ArrayDBUtils.remove_array_item(self.progress_report_status[_current_status], progress_report_key)
        self.progress_report_status[_status].put(progress_report_key)

    def _add_progress_report(self, _progress_report: ProgressReportAttributes) -> None:
        """
        adds progress report once the progress report is submitted by the contributor
        :param _progress_report: dict of progressReportAttributes
        :type _progress_report: ProgressReportAttributes
        :return: None
        """
        progress_report_obj = createProgressDataObject(_progress_report)
        report_hash = progress_report_obj.report_hash
        if not self._progress_key_exists(report_hash):
            self._add_new_progress_report_key(progress_report_obj.ipfs_hash, report_hash)
            prefix = self.progress_report_prefix(report_hash)
            addDataToProgressReportDB(prefix, self.progress_reports, progress_report_obj)
            self.progress_key_list_index[report_hash] = len(self.progress_key_list) - 1
        else:
            revert(f"{TAG} : Report Hash Already Exists.")

    def _get_progress_reports_details(self, _progress_hash: str) -> dict:
        """
        returns the deatils of progress report of given progress report hash
        :param _progress_hash: report hash of the progress report
        :type _progress_hash: str
        :return: progress reports details
        :rtype: dict
        """
        prefix = self.progress_report_prefix(_progress_hash)
        response = getDataFromProgressReportDB(prefix, self.progress_reports)
        return response

    @external
    @payable
    def submit_proposal(self, _proposals: ProposalAttributes) -> None:
        """
        Submits a proposal, with ipfs_hash
        :param _proposals: dict of the necessary params to be stored
        :type _proposals: ProposalAttributes
        :return:
        """
        self._check_maintenance()
        self.update_period()
        if self.period_name.get() == VOTING_PERIOD:
            revert(f"{TAG} : Proposals can only be submitted on Application Period")

        proposal_key = _proposals.copy()

        # TODO
        if self.msg.sender.is_contract:
            revert(f"{TAG} : Contract Address not supported.")

        if proposal_key[PROJECT_DURATION] > MAX_PROJECT_PERIOD:
            revert(f"{TAG} : Maximum Project Duration exceeds {MAX_PROJECT_PERIOD} months.")

        budget_ = to_loop(proposal_key[TOTAL_BUDGET])

        max_cap_bnusd: int = self._get_max_cap_bnusd()
        if budget_ > max_cap_bnusd:
            revert(f'{TAG}: {budget_} is greater than MAX CAP {max_cap_bnusd}')

        if proposal_key[SPONSOR_ADDRESS] not in self.valid_preps:
            revert(f"{TAG} : Sponsor P-Rep not a Top 100 P-Rep.")

        if self.msg.value != to_loop(APPLICATION_FEE):
            revert(f"{TAG} : Deposit {APPLICATION_FEE} to submit a proposal.")

        _token_flag = proposal_key.get('token')
        if _token_flag != bnUSD:
            revert(f"{TAG}: {_token_flag} Not a supported token.")

        proposal_key.pop(IPFS_LINK, None)
        proposal_key[TIMESTAMP] = self.now()
        proposal_key[STATUS] = self._SPONSOR_PENDING
        proposal_key[CONTRIBUTOR_ADDRESS] = self.msg.sender
        proposal_key[TX_HASH] = bytes.hex(self.tx.hash)
        proposal_key[PERCENTAGE_COMPLETED] = 0
        proposal_key[TOTAL_BUDGET] = budget_

        self._add_proposals(proposal_key)
        self._sponsor_pending.put(proposal_key[IPFS_HASH])
        self.contributors.put(self.msg.sender)
        self.ProposalSubmitted(self.msg.sender, "Successfully submitted a Proposal.")
        self._swap_bnusd_token()

        half_of_proposal_fee = self.msg.value // 2
        self.proposal_fees.set(self.proposal_fees.get() + half_of_proposal_fee)
        self._burn(half_of_proposal_fee)

    @external
    def submit_progress_report(self, _progress_report: ProgressReportAttributes) -> None:
        """
        Submits a progress report, with ipfs_hash and report hash
        :param _progress_report: TypedDict of the necessary params to be stored
        :type _progress_report: ProgressReportAttributes
        :return:
        """
        self._check_maintenance()
        self.update_period()
        if self.period_name.get() != APPLICATION_PERIOD:
            revert(f"{TAG} : Progress Reports can only be submitted on Application Period")

        # TODO
        if self.msg.sender.is_contract:
            revert(f"{TAG} : Contract Address not supported.")

        _progress = _progress_report.copy()
        _ipfs_hash = _progress[IPFS_HASH]
        prefix = self.proposal_prefix(_ipfs_hash)
        _prefix = self.proposals[prefix]
        flag: str = _prefix.token.get()

        if flag == ICX:
            revert(f'{TAG}: {ICX} Not supported anymore.')

        if self.msg.sender != _prefix.contributor_address.get():
            revert(f"{TAG} : Sorry, You are not the contributor for this project.")

        if _prefix.status.get() not in [self._ACTIVE, self._PAUSED]:
            revert(f"{TAG} : Sorry, Active Project not found.")

        if _prefix.submit_progress_report.get():
            revert(f"{TAG} : Progress Report is already submitted this cycle.")

        _progress[STATUS] = self._WAITING
        _progress[TIMESTAMP] = self.now()
        _progress[TX_HASH] = bytes.hex(self.tx.hash)
        _progress[BUDGET_ADJUSTMENT_STATUS] = "N/A"
        _progress[ADDITIONAL_BUDGET] = to_loop(_progress[ADDITIONAL_BUDGET])

        if _progress[BUDGET_ADJUSTMENT]:
            if not self.getBudgetAdjustmentFeature():
                revert(f"{TAG}: Budget Adjustment feature is disabled for the moment.")
            # Check if budget adjustment is already submitted or not
            if not _prefix.budget_adjustment.get():
                if _progress[ADDITIONAL_DURATION] + _prefix.project_duration.get() > MAX_PROJECT_PERIOD:
                    revert(f'{TAG}: Maximum period for a project is {MAX_PROJECT_PERIOD} months.')
                self.budget_approvals_list.put(_progress[REPORT_HASH])
                _progress[BUDGET_ADJUSTMENT_STATUS] = self._PENDING
                _prefix.budget_adjustment.set(True)
            else:
                revert(f"{TAG} : Budget Adjustment Already submitted for this proposal.")

        if 0 <= _progress[PERCENTAGE_COMPLETED] <= 100:
            _prefix.percentage_completed.set(_progress[PERCENTAGE_COMPLETED])
        else:
            revert(f"{TAG} : Not valid percentage value.")
        _progress.pop(PERCENTAGE_COMPLETED, None)
        _prefix.submit_progress_report.set(True)

        self._add_progress_report(_progress)
        self._waiting_progress_reports.put(_progress[REPORT_HASH])

        self._swap_bnusd_token()
        self.ProgressReportSubmitted(self.msg.sender, f'{_progress[PROGRESS_REPORT_TITLE]} --> Progress '
                                                      f'Report Submitted Successfully.')

    @external(readonly=True)
    def get_proposals_keys_by_status(self, _status: str) -> list:
        """
        Returns the proposal keys of proposal by status
        :param _status: status in [_SPONSOR_PENDING, _PENDING, _ACTIVE, _PAUSED, _DISQUALIFIED, _REJECTED, _COMPLETED]
        :type _status: str
        :return: list of keys of given status
        :rtype: list
        """
        if _status not in self.STATUS_TYPE:
            return [f"{TAG} : Not a valid status."]

        return [x for x in self.proposals_status[_status]]

    def _sponsor_vote(self, _ipfs_key: str, _vote: str, _vote_reason: str, _from: Address, _value: int = 0) -> None:
        """
        Selected Sponsor P-Rep to approve the requested proposal for CPS
        :param _vote: Vote from Sponsor [_accept,_reject]
        :type _vote: str
        :param _vote_reason : Reason behind the _vote
        :type _vote_reason: str
        :param _ipfs_key : proposal ipfs hash
        :type _ipfs_key : str
        :param _from : Sponsor Address
        :type _from: Address
        :param _value: bnUSD transferred
        :type _value: int
        """
        self._check_maintenance()
        self.update_period()
        if self.period_name.get() != APPLICATION_PERIOD:
            revert(f"{TAG} : Sponsor Vote can only be done on Application Period")

        self._swap_bnusd_token()

        _proposal_details = self._get_proposal_details(_ipfs_key)
        _status = _proposal_details[STATUS]
        _sponsor = _proposal_details[SPONSOR_ADDRESS]
        _token = _proposal_details['token']
        _contributor_address = _proposal_details[CONTRIBUTOR_ADDRESS]

        if _from not in self.valid_preps:
            revert(f"{TAG} : Not a P-Rep.")

        if _from != _sponsor:
            revert(f"{TAG} : Not a valid Sponsor.")

        if _vote not in [ACCEPT, REJECT]:
            revert(f'{TAG}: Not a valid vote.')

        if _vote == ACCEPT:
            if _status == self._SPONSOR_PENDING:
                _budget: int = _proposal_details[TOTAL_BUDGET]
                if _token != bnUSD:
                    revert(f'{TAG}: Only {bnUSD} supported.')

                if _value != _budget // 10:
                    revert(f"{TAG} : Deposit 10% of the total budget of the project.")

                self._update_proposal_status(_ipfs_key, self._PENDING)

                prefix = self.proposal_prefix(_ipfs_key)
                self.proposals[prefix].sponsor_deposit_amount.set(_value)
                self.proposals[prefix].sponsored_timestamp.set(self.now())
                self.proposals[prefix].sponsor_deposit_status.set(BOND_RECEIVED)
                self.proposals[prefix].sponsor_vote_reason.set(_vote_reason.encode())

                self.SponsorBondReceived(_from, f"Sponsor Bond Received from {_from}.")
            else:
                revert(f'{TAG}: Sponsor can be only approve sponsorship for Pending proposals.')
        else:
            self._remove_contributor(_contributor_address)
            self._update_proposal_status(_ipfs_key, self._REJECTED)
            # Return 50% of fees back to contributor
            self.icx.transfer(_contributor_address, to_loop(APPLICATION_FEE) // 2)

            self.SponsorBondRejected(_from,
                                     f"Sponsor Bond Rejected for project {_proposal_details[PROJECT_TITLE]}.")

    @external(readonly=True)
    def getBudgetAdjustmentFeature(self) -> bool:
        return self.budgetAdjustment.get()

    @external
    def toggleBudgetAdjustmentFeature(self):
        self.budgetAdjustment.set(not self.budgetAdjustment.get())

    @external(readonly=True)
    def checkPriorityVoting(self, _prep: Address) -> bool:
        return _prep in self.priority_voted_preps

    @external(readonly=True)
    def sortPriorityProposals(self) -> list:
        sorted_proposals = sorted(self.getPriorityVoteResult().items(), key=lambda item: item[1], reverse=True)
        return [k for k, v in sorted_proposals]

    @external(readonly=True)
    def getPriorityVoteResult(self) -> dict:
        return {
            _prop: self.proposal_rank[_prop]
            for _prop in self._pending
        }

    @external
    def votePriority(self, _proposals: List[str]):
        if self.msg.sender not in self.valid_preps:
            revert(f"{TAG} : Voting can only be done by registered P-Reps")
        if self.checkPriorityVoting(self.msg.sender):
            revert(f'{TAG}: Already voted for Priority Ranking.')

        self.priority_voted_preps.put(self.msg.sender)
        for proposal in range(len(_proposals)):
            proposal_ = _proposals[proposal]
            if proposal_ not in self._pending:
                revert(f"{TAG}: {proposal_} not in pending state.")
            self.proposal_rank[proposal_] += len(_proposals) - proposal

        self.PriorityVote(self.msg.sender, "Priority voting done successfully.")

    @external
    def vote_proposal(self, _ipfs_key: str, _vote: str, _vote_reason: str, _vote_change: bool = False) -> None:
        """
        P-Rep(s) voting for a proposal to be approved or not
        :param _ipfs_key : proposal ipfs hash
        :type _ipfs_key : str
        :param _vote: vote in [_approve,_reject,_abstain]
        :type _vote : str
        :param _vote_reason : Any specific reason behind the vote
        :type _vote_reason : str
        :param _vote_change: Option if user want to change the vote
        :type _vote_change: bool
        """
        self._check_maintenance()
        self.update_period()
        if self.period_name.get() != VOTING_PERIOD:
            revert(f"{TAG} : Proposals can be voted only on Voting Period.")

        if self.msg.sender not in self.valid_preps:
            revert(f"{TAG} : Voting can only be done by registered P-Reps")

        if _vote not in [APPROVE, REJECT, ABSTAIN]:
            revert(f"{TAG} : Vote should be on _approve, _reject or _abstain")

        _proposal_details = self._get_proposal_details(_ipfs_key)
        _status = _proposal_details[STATUS]
        prefix = self.proposal_prefix(_ipfs_key)
        proposals_prefix_ = self.proposals[prefix]
        _voters_list = proposals_prefix_.voters_list

        if not _vote_change and self.msg.sender in _voters_list:
            revert(f"{TAG} : Already voted on this Proposal.")

        if _status == self._PENDING:
            _voter_stake: int = self.delegation_snapshot[self.msg.sender]
            _total_votes: int = _proposal_details[TOTAL_VOTES]
            _approved_votes: int = _proposal_details[APPROVED_VOTES]
            _rejected_votes: int = _proposal_details[REJECTED_VOTES]

            if _proposal_details[TOTAL_VOTERS] == 0:
                proposals_prefix_.total_voters.set(len(self.valid_preps))

            voter_index_db = proposals_prefix_.voters_list_index[self.msg.sender]
            if not _vote_change:
                proposals_prefix_.total_votes.set(_total_votes + _voter_stake)
                proposals_prefix_.voters_list.put(self.msg.sender)
                voter_index_db['index'] = len(proposals_prefix_.voters_list)
                proposals_prefix_.voters_reasons.put(_vote_reason.encode())

            else:
                if voter_index_db['change_vote'] == VOTED:
                    revert(f'{TAG}: Vote change can be done only once.')
                voter_index_db['change_vote'] = VOTED
                _index = voter_index_db['index']
                vote_index = voter_index_db['vote']
                proposals_prefix_.voters_reasons[_index - 1] = _vote_reason.encode()
                if vote_index == APPROVE_:
                    ArrayDBUtils.remove_array_item(proposals_prefix_.approve_voters, self.msg.sender)
                    proposals_prefix_.approved_votes.set(_approved_votes - _voter_stake)
                elif vote_index == REJECT_:
                    ArrayDBUtils.remove_array_item(proposals_prefix_.reject_voters, self.msg.sender)
                    proposals_prefix_.rejected_votes.set(_rejected_votes - _voter_stake)

                _approved_votes: int = proposals_prefix_.approved_votes.get()
                _rejected_votes: int = proposals_prefix_.rejected_votes.get()

            if _vote == APPROVE:
                proposals_prefix_.approve_voters.put(self.msg.sender)
                voter_index_db['vote'] = APPROVE_
                proposals_prefix_.approved_votes.set(_approved_votes + _voter_stake)
            elif _vote == REJECT:
                proposals_prefix_.reject_voters.put(self.msg.sender)
                voter_index_db['vote'] = REJECT_
                proposals_prefix_.rejected_votes.set(_rejected_votes + _voter_stake)
            else:
                voter_index_db['vote'] = ABSTAIN_

        else:
            revert(f'{TAG}: Proposal must be done in Voting state.')

        self.VotedSuccessfully(self.msg.sender, f"Proposal Vote for "
                                                f"{_proposal_details[PROJECT_TITLE]} Successful.")
        self._swap_bnusd_token()

    @external
    def vote_progress_report(self, _ipfs_key: str, _report_key: str, _vote: str, _vote_reason: str,
                             _budget_adjustment_vote: str = "", _vote_change: bool = False) -> None:
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
        :param _vote_change: Option if user want to change the vote
        :type _vote_change: bool
        """
        self._check_maintenance()
        self.update_period()
        if self.period_name.get() != VOTING_PERIOD:
            revert(f"{TAG} : Progress Reports can be voted only on Voting Period.")

        if self.msg.sender not in self.valid_preps:
            revert(f"{TAG} : Voting can only be done only by Registered P-Reps")

        _progress_report_details = self._get_progress_reports_details(_report_key)
        _status = _progress_report_details[STATUS]
        prefix = self.progress_report_prefix(_report_key)
        reports_prefix_ = self.progress_reports[prefix]
        _voters_list = reports_prefix_.voters_list

        self._swap_bnusd_token()

        if not _vote_change and self.msg.sender in _voters_list:
            revert(f"{TAG} : Already Voted on this proposal.")

        if _status == self._WAITING:
            _voter_stake = self.delegation_snapshot[self.msg.sender]
            _total_votes: int = _progress_report_details[TOTAL_VOTES]
            _approved_votes: int = _progress_report_details[APPROVED_VOTES]
            _rejected_votes: int = _progress_report_details[REJECTED_VOTES]

            if _progress_report_details[TOTAL_VOTERS] == 0:
                reports_prefix_.total_voters.set(len(self.valid_preps))

            voter_index_db = reports_prefix_.voters_list_index[self.msg.sender]
            if not _vote_change:
                reports_prefix_.total_votes.set(_total_votes + _voter_stake)
                reports_prefix_.voters_list.put(self.msg.sender)
                voter_index_db['index'] = len(reports_prefix_.voters_list)
                reports_prefix_.voters_reasons.put(_vote_reason.encode())

            else:
                if voter_index_db['change_vote'] == VOTED:
                    revert(f'{TAG}: Vote change can be done only once.')
                voter_index_db['change_vote'] = VOTED
                _index = voter_index_db['index']
                vote_index = voter_index_db['vote']
                reports_prefix_.voters_reasons[_index - 1] = _vote_reason.encode()
                if vote_index == APPROVE_:
                    ArrayDBUtils.remove_array_item(reports_prefix_.approve_voters, self.msg.sender)
                    reports_prefix_.approved_votes.set(_approved_votes - _voter_stake)
                elif vote_index == REJECT_:
                    ArrayDBUtils.remove_array_item(reports_prefix_.reject_voters, self.msg.sender)
                    reports_prefix_.rejected_votes.set(_rejected_votes - _voter_stake)

                if _report_key in self.budget_approvals_list:
                    _budget_approved_votes: int = _progress_report_details[BUDGET_APPROVED_VOTES]
                    _budget_rejected_votes: int = _progress_report_details[BUDGET_REJECTED_VOTES]
                    budget_vote_index = reports_prefix_.budget_voters_list_index[self.msg.sender]['vote']
                    if budget_vote_index == APPROVE_:
                        ArrayDBUtils.remove_array_item(reports_prefix_.budget_approve_voters, self.msg.sender)
                        reports_prefix_.budget_approved_votes.set(_budget_approved_votes - _voter_stake)
                    elif budget_vote_index == REJECT_:
                        ArrayDBUtils.remove_array_item(reports_prefix_.budget_reject_voters, self.msg.sender)
                        reports_prefix_.budget_rejected_votes.set(_budget_rejected_votes - _voter_stake)
                    else:
                        revert(f'{TAG}: Choose option {APPROVE} or {REJECT} for budget adjustment.')

                _approved_votes: int = reports_prefix_.approved_votes.get()
                _rejected_votes: int = reports_prefix_.rejected_votes.get()

            if _vote == APPROVE:
                reports_prefix_.approve_voters.put(self.msg.sender)
                voter_index_db['vote'] = APPROVE_
                reports_prefix_.approved_votes.set(_approved_votes + _voter_stake)
            elif _vote == REJECT:
                reports_prefix_.reject_voters.put(self.msg.sender)
                voter_index_db['vote'] = REJECT_
                reports_prefix_.rejected_votes.set(_rejected_votes + _voter_stake)
            else:
                revert(f'{TAG}: {_vote} is not valid. Please select {APPROVE} or {REJECT}. ')

            if _report_key in self.budget_approvals_list:
                _budget_approved_votes: int = reports_prefix_.budget_approved_votes.get()
                _budget_rejected_votes: int = reports_prefix_.budget_rejected_votes.get()
                if _budget_adjustment_vote == APPROVE:
                    reports_prefix_.budget_approve_voters.put(self.msg.sender)
                    reports_prefix_.budget_voters_list_index[self.msg.sender]['vote'] = APPROVE_
                    reports_prefix_.budget_approved_votes.set(_budget_approved_votes + _voter_stake)
                elif _budget_adjustment_vote == REJECT:
                    reports_prefix_.budget_reject_voters.put(self.msg.sender)
                    reports_prefix_.budget_voters_list_index[self.msg.sender]['vote'] = REJECT_
                    reports_prefix_.budget_rejected_votes.set(_budget_rejected_votes + _voter_stake)
                else:
                    revert(f'{TAG}: Choose option {APPROVE} or {REJECT} for budget adjustment.')

            self.VotedSuccessfully(self.msg.sender, f"Progress Report Vote for "
                                                    f"{_progress_report_details[PROGRESS_REPORT_TITLE]} Successful.")

        else:
            revert(f'{TAG}: Progress report can be voted only for Waiting status.')

    @external
    def set_prep_penalty_amount(self, _penalty: List[int]) -> None:
        """
        Sets the Penalty amount for the registered P-Rep(s) missing to vote on voting period.
        Only owner can set the address.
        :param _penalty: Penalty Amount Lists
        :type _penalty: List of int
        :return:
        """
        self._check_maintenance()
        self._validate_admins()

        if len(_penalty) != 3:
            revert(f"{TAG} : Exactly 3 Penalty amount Required.")
        for i, amount in enumerate(_penalty):
            if amount < 0:
                revert(f"{TAG} : Invalid amount({amount})")
            self.penalty_amount[i] = to_loop(amount)

    def _pay_prep_penalty(self, _from: Address, _value: int) -> None:
        """
        to remove address from deny list
        :param _from: prep address
        :type _from: Address
        :param _value: penalty amount
        :type _value: int
        :return:
        """
        self._check_maintenance()
        self.update_period()
        if self.period_name.get() != APPLICATION_PERIOD:
            revert(f"{TAG} : Penalty can only be paid on Application Period")

        if _from not in self.denylist:
            revert(f"{TAG} : {_from} not in denylist.")

        _penalty_amount = self._get_penalty_amount(_from)

        if _value != _penalty_amount:
            revert(f"{TAG} :  Please pay Penalty amount of {_penalty_amount} to register as a P-Rep.")

        ArrayDBUtils.remove_array_item(self.denylist, _from)

        self.registered_preps.put(_from)
        self.valid_preps.put(_from)
        self._burn(_value, self.balanced_dollar.get())
        self.PRepPenalty(_from, f"{_value} {bnUSD} Penalty Received. P-Rep removed from Denylist.")

    @external
    def set_initialBlock(self) -> None:
        """
        To set the initial block of application period to start (once only)

        :return: None
        """
        self._validate_admins()
        self.set_PReps()

        self.initial_block.set(self.block_height)
        self.next_block.set(self.block_height + BLOCKS_DAY_COUNT * DAY_COUNT)
        self.period_name.set(APPLICATION_PERIOD)
        self.previous_period_name.set("None")

    @external(readonly=True)
    def check_change_vote(self, _address: Address, _ipfs_hash: str, _proposal_type: str) -> int:
        """
        returns if vote has been changed by the prep
        :param _address: prep address
        :type _address: Address
        :param _ipfs_hash: ipfs hash of proposal or report hash of progress report
        :type _ipfs_hash: str
        :param _proposal_type: one of proposal or progress_report
        :type _proposal_type: str
        :return:
        """
        if _proposal_type == "proposal":
            prefix = self.proposal_prefix(_ipfs_hash)
            prefix_ = self.proposals[prefix]
            return prefix_.voters_list_index[_address]['change_vote']
        elif _proposal_type == "progress_report":
            prefix = self.progress_report_prefix(_ipfs_hash)
            prefix_ = self.progress_reports[prefix]
            return prefix_.voters_list_index[_address]['change_vote']
        else:
            return 0

    @external(readonly=True)
    def login_prep(self, _address: Address) -> dict:
        """
        Checks the logged in user is P-Rep or not.
        :return: dict of logged in information
        :rtype: dict
        """

        _login_dict = {}
        _all_preps = self._get_preps_address()

        if _address in _all_preps:
            _login_dict["isPRep"] = True

            if _address in self.unregistered_preps:
                _login_dict["isRegistered"] = False
                _login_dict["payPenalty"] = False
                _login_dict["votingPRep"] = False

            if _address in self.denylist:
                _login_dict["isRegistered"] = False
                _login_dict["payPenalty"] = True
                _login_dict["votingPRep"] = False

                _login_dict["penaltyAmount"] = self._get_penalty_amount(_address)

            # If a P-Rep registers on Voting period, P-Rep status will be registered.
            if _address in self.registered_preps:
                _login_dict["isRegistered"] = True
                _login_dict["payPenalty"] = False
                _login_dict["votingPRep"] = False

                if _address in self.valid_preps:
                    _login_dict["votingPRep"] = True

        else:
            _login_dict["isPRep"] = False
            _login_dict["isRegistered"] = False
            _login_dict["payPenalty"] = False
            _login_dict["votingPRep"] = False

        return _login_dict

    @external(readonly=True)
    def get_admins(self) -> list:
        """
        returns admin address of the CPS
        :return: list of admins
        :rtype: list
        """
        return [_address for _address in self.admins]

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
        Returns the cpf treasury score address
        :return: cpf treasury score address
        :rtype: :class:`iconservice.base.address.Address`
        """
        return self.cpf_score.get()

    @external(readonly=True)
    def get_bnUSD_score(self) -> Address:
        """
        Returns the balanced dollar score address
        :return: bnUSD score address
        :rtype: :class:`iconservice.base.address.Address`
        """
        return self.balanced_dollar.get()

    @external(readonly=True)
    def get_remaining_fund(self) -> dict:
        """
        Returns the remaining Treasury amount on CPF Score
        :return: Return amount on CPF Treasury amount ICX and bnUSD
        :rtype: dict
        """
        cpf_treasury_score = self.create_interface_score(self.cpf_score.get(), CPF_TREASURY_INTERFACE)
        return cpf_treasury_score.get_total_funds()

    @external(readonly=True)
    def get_PReps(self) -> list:
        """
        Returns the all P-Reps who can be active in this period
        :return: P-Rep address list
        :rtype: list
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
        Returns the P-Reps in deny list
        :return: list of P-Rep denylist
        :rtype: list
        """
        return [_address for _address in self.denylist]

    @external(readonly=True)
    def get_maintenance_mode(self) -> bool:
        return self.maintenance.get()

    @external(readonly=True)
    def get_period_status(self) -> dict:
        """
        To get the period status
        :return: dict of status
        :rtype: dict
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
        Returns different amounts in the proposal according to status
        :return: A dict of amount with the proposal status
        :rtype: dict
        """
        _status_list = [self._PENDING, self._ACTIVE, self._PAUSED, self._COMPLETED, self._DISQUALIFIED]
        _pending_amount_icx = 0
        _active_amount_icx = 0
        _paused_amount_icx = 0
        _completed_amount_icx = 0
        _disqualified_amount_icx = 0

        _pending_amount_bnusd = 0
        _active_amount_bnusd = 0
        _paused_amount_bnusd = 0
        _completed_amount_bnusd = 0
        _disqualified_amount_bnusd = 0
        for status in range(0, len(_status_list)):
            _amount_icx = 0
            _amount_bnusd = 0
            for keys in self.get_proposals_keys_by_status(_status_list[status]):
                proposal_details = self._get_proposal_details(keys)
                if proposal_details.get('token') == ICX:
                    _amount_icx += proposal_details[TOTAL_BUDGET]
                else:
                    _amount_bnusd += proposal_details[TOTAL_BUDGET]

            if status == 0:
                _pending_amount_icx = _amount_icx
                _pending_amount_bnusd = _amount_bnusd
            elif status == 1:
                _active_amount_icx = _amount_icx
                _active_amount_bnusd = _amount_bnusd
            elif status == 2:
                _paused_amount_icx = _amount_icx
                _paused_amount_bnusd = _amount_bnusd
            elif status == 3:
                _completed_amount_icx = _amount_icx
                _completed_amount_bnusd = _amount_bnusd
            elif status == 4:
                _disqualified_amount_icx = _amount_icx
                _disqualified_amount_bnusd = _amount_bnusd

        _amount_dict = {_status_list[0]: {AMOUNT: {ICX: _pending_amount_icx, bnUSD: _pending_amount_bnusd},
                                          "_count": len(self.get_proposals_keys_by_status(_status_list[0]))},
                        _status_list[1]: {AMOUNT: {ICX: _active_amount_icx, bnUSD: _active_amount_bnusd},
                                          "_count": len(self.get_proposals_keys_by_status(_status_list[1]))},
                        _status_list[2]: {AMOUNT: {ICX: _paused_amount_icx, bnUSD: _paused_amount_bnusd},
                                          "_count": len(self.get_proposals_keys_by_status(_status_list[2]))},
                        _status_list[3]: {AMOUNT: {ICX: _completed_amount_icx, bnUSD: _completed_amount_bnusd},
                                          "_count": len(self.get_proposals_keys_by_status(_status_list[3]))},
                        _status_list[4]: {AMOUNT: {ICX: _disqualified_amount_icx, bnUSD: _disqualified_amount_bnusd},
                                          "_count": len(self.get_proposals_keys_by_status(_status_list[4]))}}

        return _amount_dict

    @external(readonly=True)
    def get_contributors(self, _start_index: int = 0, _end_index: int = 50) -> list:
        """
        Returns the list of all contributors address who've submitted proposals to CPS
        :param _start_index:
        :type _start_index: int
        :param _end_index:
        :type _end_index: int
        :return: List of contributors
        :rtype: list
        """

        _contributors_list = []

        if _end_index - _start_index > 100:
            return ["Page length must not be greater than 50."]
        if _start_index < 0:
            _start_index = 0
        count = len(self.contributors)
        end = count if _end_index > count else _end_index

        for i in range(_start_index, end):
            address = self.contributors[i]
            if address not in _contributors_list:
                _contributors_list.append(address)

        return _contributors_list

    @external(readonly=True)
    def get_sponsors_record(self) -> dict:
        """
        :return: dict of P-Reps with their sponsored project counts
        :rtype: dict
        """
        _proposals_keys = []
        _sponsors_list = []
        sponsors_dict = {}

        for a in self.get_proposals_keys_by_status(self._ACTIVE):
            _proposals_keys.append(a)

        for pa in self.get_proposals_keys_by_status(self._PAUSED):
            _proposals_keys.append(pa)

        for c in self.get_proposals_keys_by_status(self._COMPLETED):
            _proposals_keys.append(c)

        for sponsors in _proposals_keys:
            _proposal_details = self._get_proposal_details(sponsors)
            sponsor_address = str(_proposal_details[SPONSOR_ADDRESS])
            sponsors_dict[sponsor_address] = sponsors_dict.get(sponsor_address, 0) + 1

        return sponsors_dict

    @external(readonly=True)
    def get_proposal_details(self, _status: str, _wallet_address: Address = None, _start_index: int = 0,
                             _end_index: int = 20) -> dict:
        """
        Returns the proposal details of all the proposals of given status
        :param _status: project status of the projects
        :type _status: str
        :param _wallet_address: contributor address
        :type _wallet_address: Address
        :param _start_index:
        :type _start_index: int
        :param _end_index:
        :type _end_index: int
        :return: dict of proposal details
        :rtype: dict
        """
        if _status not in self.STATUS_TYPE:
            return {"message": "Not a valid status."}

        _proposals_list = []
        _proposals_keys = self.get_proposals_keys_by_status(_status)

        if _end_index - _start_index > 50:
            return {"message": "Page length must not be greater than 50."}
        if _start_index < 0:
            _start_index = 0
        count = len(_proposals_keys)

        _range = range(_start_index, count if _end_index > count else _end_index)

        for _keys in _range:
            _proposal_details = self._get_proposal_details(_proposals_keys[_keys])

            if _status == self._SPONSOR_PENDING:
                if _proposal_details[CONTRIBUTOR_ADDRESS] == _wallet_address:
                    _proposals_list.append(_proposal_details)

                count = len(_proposals_list)

            elif _proposal_details[STATUS] == _status:
                _proposals_list.append(_proposal_details)

        return {DATA: _proposals_list, COUNT: count}

    @external(readonly=True)
    def get_proposal_details_by_hash(self, _ipfs_key: str) -> dict:
        """
        Returns all the progress reports for a specific project
        :param _ipfs_key : project key i.e. proposal ipfs hash
        :type _ipfs_key : str

        :return : List of all progress report with status
        :rtype : dict
        """
        return self._get_proposal_details(_ipfs_key)

    @external(readonly=True)
    def get_active_proposals(self, _wallet_address: Address) -> list:
        """
        Returns the list of all all active or paused proposal from that address
        :param _wallet_address : wallet address of the contributor
        :type _wallet_address: Address
        :return: list of active proposals of a contributor
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
                    _last_progress_report = False

                    if _project_duration - _approved_reports_count == 1:
                        _last_progress_report = True
                    _proposals_details = {PROJECT_TITLE: _proposal_details[PROJECT_TITLE],
                                          IPFS_HASH: proposals,
                                          NEW_PROGRESS_REPORT: self.proposals[prefix].submit_progress_report.get(),
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

        _proposals_list = []
        _proposals_keys = self.proposals_key_list

        for _keys in range(0, len(_proposals_keys)):
            _proposal_details = self._get_proposal_details(_proposals_keys[_keys])
            if _proposal_details[CONTRIBUTOR_ADDRESS] == _wallet_address:
                _proposals_list.append(_proposal_details)

        _proposals_dict_list = {DATA: _proposals_list, COUNT: len(_proposals_list)}
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
            return {"message": f"{TAG} : Not a valid status"}

        _progress_report_list = []
        _progress_keys = self.progress_report_status[_status]

        if _end_index - _start_index > 50:
            return {"message": "Page length must not be greater than 50."}
        if _start_index < 0:
            _start_index = 0
        count = len(_progress_keys)
        _range = range(_start_index, count if _end_index > count else _end_index)

        for reports in _range:
            prefix = self.progress_report_prefix(_progress_keys[reports])
            _ipfs_key = self.progress_reports[prefix].ipfs_hash.get()

            progressDetails = self._get_progress_reports_details(_progress_keys[reports])
            if progressDetails[STATUS] == _status:
                proposal_details = self._get_proposal_details(_ipfs_key)
                progressDetails[PROJECT_TITLE] = proposal_details[PROJECT_TITLE]
                progressDetails[CONTRIBUTOR_ADDRESS] = proposal_details[CONTRIBUTOR_ADDRESS]
                _progress_report_list.append(progressDetails)

        progress_report_dict = {DATA: _progress_report_list, COUNT: count}
        return progress_report_dict

    @external(readonly=True)
    def get_progress_reports_by_hash(self, _report_key: str) -> dict:
        """
        Returns all the progress reports for a specific project
        :param _report_key : project key i.e. progress report ipfs hash
        :type _report_key : str

        :return : List of all progress report with status
        :rtype : dict
        """
        if not self._progress_key_exists(_report_key):
            return {"message": f"{TAG} : Not a valid IPFS Hash for Progress Report"}

        progressDetails = self._get_progress_reports_details(_report_key)
        _ipfs_hash = progressDetails.get(IPFS_HASH)
        proposal_details = self._get_proposal_details(_ipfs_hash)
        progressDetails[PROJECT_TITLE] = proposal_details.get(PROJECT_TITLE)
        progressDetails[CONTRIBUTOR_ADDRESS] = proposal_details.get(CONTRIBUTOR_ADDRESS)

        return progressDetails

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
            _progress_report[PROJECT_TITLE] = proposal_details[PROJECT_TITLE]
            _progress_report[CONTRIBUTOR_ADDRESS] = proposal_details[CONTRIBUTOR_ADDRESS]
            _progress_reports.append(_progress_report)

        return {DATA: _progress_reports, COUNT: len(_report_keys)}

    @external(readonly=True)
    def get_sponsors_requests(self, _status: str, _sponsor_address: Address, _start_index: int = 0,
                              _end_index: int = 50) -> dict:
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
            return {"message": f"{TAG} : Not valid status."}

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
            return {"message": f"{TAG} : Page length must not be greater than 50."}

        start = _end_index * _start_index
        count = len(_proposals_keys)

        if start > count:
            return {}

        end = _end_index * (_start_index + 1)
        _range = range(start, count if end > count else end)
        sponsor_amount_icx, sponsor_amount_bnusd = 0, 0

        for _keys in _range:
            _proposal_details = self._get_proposal_details(_proposals_keys[_keys])
            if _proposal_details[SPONSOR_ADDRESS] == _sponsor_address:
                status = _proposal_details.get("sponsor_deposit_status")
                if status == BOND_APPROVED:
                    if _proposal_details.get("token") == ICX:
                        sponsor_amount_icx += _proposal_details.get("sponsor_deposit_amount")
                    elif _proposal_details.get("token") == bnUSD:
                        sponsor_amount_bnusd += _proposal_details.get("sponsor_deposit_amount")

                _sponsors_request.append(_proposal_details)

        _sponsors_dict = {DATA: _sponsors_request, COUNT: len(_sponsors_request),
                          SPONSOR_DEPOSIT_AMOUNT: {ICX: sponsor_amount_icx, bnUSD: sponsor_amount_bnusd}}

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
        if _project_type == PROPOSAL:
            _proposal_keys = self.get_proposals_keys_by_status(self._PENDING)

            for _ipfs_key in _proposal_keys:
                prefix = self.proposal_prefix(_ipfs_key)
                _voters_list = self.proposals[prefix].voters_list

                if _wallet_address not in _voters_list:
                    _proposal_details = self._get_proposal_details(_ipfs_key)
                    _remaining_proposals.append(_proposal_details)

            return _remaining_proposals

        if _project_type == PROGRESS_REPORTS:
            for _report_key in self._waiting_progress_reports:
                prefix = self.progress_report_prefix(_report_key)
                _voters_list = self.progress_reports[prefix].voters_list

                if _wallet_address not in _voters_list:
                    _progress_reports_details = self._get_progress_reports_details(_report_key)
                    _ipfs_hash = _progress_reports_details.get(IPFS_HASH)
                    _progress_reports_details[PROJECT_TITLE] = self._get_proposal_details(_ipfs_hash).get(PROJECT_TITLE)
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

        for i, voter in enumerate(_voters_list):
            if voter in _approved_voters_list:
                vote = APPROVE
            elif voter in _rejected_voters_list:
                vote = REJECT
            else:
                vote = ABSTAIN

            reason = proposals_prefix_.voters_reasons[i]
            reason = "" if reason is None else reason.decode('utf-8')

            _voters = {ADDRESS: voter,
                       PREP_NAME: self._get_prep_name(voter),
                       VOTE_REASON: reason,
                       VOTE: vote}
            _vote_status.append(_voters)

        return {DATA: _vote_status, APPROVE_VOTERS: _proposal_details[APPROVE_VOTERS],
                REJECT_VOTERS: _proposal_details[REJECT_VOTERS],
                TOTAL_VOTERS: _proposal_details[TOTAL_VOTERS],
                APPROVED_VOTES: _proposal_details[APPROVED_VOTES],
                REJECTED_VOTES: _proposal_details[REJECTED_VOTES],
                TOTAL_VOTES: _proposal_details[TOTAL_VOTES]}

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

        # Differentiating the P-Rep(s) votes according to their votes
        for i, voter in enumerate(_voters_list):
            vote = APPROVE if voter in _approved_voters_list else REJECT
            reason = reports_prefix_.voters_reasons[i]
            reason = "" if reason is None else reason.decode('utf-8')

            _voters = {ADDRESS: voter,
                       PREP_NAME: self._get_prep_name(voter),
                       VOTE_REASON: reason,
                       VOTE: vote}
            _vote_status.append(_voters)

        return {DATA: _vote_status, APPROVE_VOTERS: _proposal_details[APPROVE_VOTERS],
                REJECT_VOTERS: _proposal_details[REJECT_VOTERS],
                TOTAL_VOTERS: _proposal_details[TOTAL_VOTERS],
                APPROVED_VOTES: _proposal_details[APPROVED_VOTES],
                REJECTED_VOTES: _proposal_details[REJECTED_VOTES],
                TOTAL_VOTES: _proposal_details[TOTAL_VOTES]}

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

        for i, voter in enumerate(_voters_list):
            if voter in _approved_voters_list:
                vote = APPROVE
            elif voter in _rejected_voters_list:
                vote = REJECT
            else:
                vote = "not voted"

            reason = reports_prefix_.voters_reasons[i]
            reason = "" if reason is None else reason.decode('utf-8')
            _voters = {ADDRESS: voter,
                       PREP_NAME: self._get_prep_name(voter),
                       VOTE_REASON: reason,
                       VOTE: vote}
            _vote_status.append(_voters)

        return {DATA: _vote_status, APPROVE_VOTERS: _proposal_details[BUDGET_APPROVE_VOTERS],
                REJECT_VOTERS: _proposal_details[BUDGET_REJECT_VOTERS],
                TOTAL_VOTERS: _proposal_details[TOTAL_VOTERS],
                APPROVED_VOTES: _proposal_details[BUDGET_APPROVED_VOTES],
                REJECTED_VOTES: _proposal_details[BUDGET_REJECTED_VOTES],
                TOTAL_VOTES: _proposal_details[TOTAL_VOTES]}

    @external
    def update_period(self):
        """
        Update Period after ending of the Allocated BlockTime for each period.
        :return:
        """
        self._check_maintenance()
        _current_block = self.block_height
        if _current_block <= self.next_block.get():
            pass

        else:
            if self.period_name.get() == APPLICATION_PERIOD:
                self.period_name.set(VOTING_PERIOD)
                self.previous_period_name.set(APPLICATION_PERIOD)
                self.next_block.set(self.next_block.get() + BLOCKS_DAY_COUNT * DAY_COUNT)
                self._update_application_result()
                self.update_period_index.set(0)
                self.set_PReps()
                self._snapshot_delegations()

                active_proposals = len(self._pending) + len(self._waiting_progress_reports)
                self.swap_count.set(active_proposals * len(self.valid_preps))

            else:
                update_period_index = self.update_period_index.get()
                if update_period_index == 0:
                    self.period_name.set(TRANSITION_PERIOD)
                    self.previous_period_name.set(APPLICATION_PERIOD)
                    self.update_period_index.set(update_period_index + 1)
                    self._update_proposals_result()

                    self.PeriodUpdate(f"1/4. Period Updated to Transition Period. After all the calculations are "
                                      f"completed, Period will change to {APPLICATION_PERIOD}")
                elif update_period_index == 1:
                    self._check_progress_report_submission()
                    self.update_period_index.set(update_period_index + 1)
                    self.PeriodUpdate(f"2/4. Progress Reports Checks Completed.")
                elif update_period_index == 2:
                    self._update_progress_report_result()
                    self.update_period_index.set(update_period_index + 1)
                    self.PeriodUpdate(f"3/4. Progress Reports Calculations Completed.")
                else:
                    self._update_denylist_preps()
                    self.next_block.set(self.next_block.get() + BLOCKS_DAY_COUNT * DAY_COUNT)
                    self.period_name.set(APPLICATION_PERIOD)
                    self.previous_period_name.set(VOTING_PERIOD)
                    self.PeriodUpdate("4/4. Period Successfully Updated to Application Period.")
                    self.set_PReps()

                    active_proposals = len(self._active) + len(self._paused)

                    self.swap_count.set(active_proposals + active_proposals * len(self.valid_preps))
                    cpf_treasury_score = self.create_interface_score(self.cpf_score.get(), CPF_TREASURY_INTERFACE)
                    cpf_treasury_score.reset_swap_state()

                    ArrayDBUtils.array_db_clear(self.budget_approvals_list)
                    ArrayDBUtils.array_db_clear(self.active_proposals)
                    ArrayDBUtils.array_db_clear(self.priority_voted_preps)

                    # burn remaining proposal fees
                    self._burn(self.proposal_fees.get())
                    self.proposal_fees.set(0)

    def _update_application_result(self):
        """
        While Updating from the application period check if there are enough preps (7)
        and check the active proposals have submitted any progress report or not.
        :return: None
        """
        # Check if there are minimum number of P-Reps registered or not.
        if len(self.valid_preps) < MINIMUM_PREPS:
            self.period_name.set(APPLICATION_PERIOD)
            self.PeriodUpdate("Period Updated back to Application Period due to less Registered P-Reps Count")

        elif len(self.get_proposals_keys_by_status(self._PENDING)) == 0 and len(
                self.progress_report_status[self._WAITING]) == 0 and \
                len(self.active_proposals) + len(self._paused) == 0:
            # If there is no any voting proposals or Progress Reports then Application Period will restart
            self.period_name.set(APPLICATION_PERIOD)
            self.PeriodUpdate("Period Updated back to Application Period due not enough "
                              "Voting Proposals or Progress Reports.")

        elif len(self._pending) == 0 and len(self._waiting_progress_reports) == 0 and \
                len(self.active_proposals) + len(self._paused) > 0:
            for x in range(0, len(self._active)):
                act_prop = self._active[x]
                if act_prop not in self.active_proposals:
                    self.active_proposals.put(act_prop)

            for x in range(0, len(self._paused)):
                paused_prop = self._paused[x]
                if paused_prop not in self.active_proposals:
                    self.active_proposals.put(paused_prop)

            self._check_progress_report_submission()
            self.period_name.set(APPLICATION_PERIOD)
            self.PeriodUpdate("Period Updated back to Application Period due not enough "
                              "Voting Proposals or Progress Reports.")

        else:
            # Adding all the active and paused Proposals to check if they submitted any progress report or not
            for x in range(0, len(self._active)):
                act_prop = self._active[x]
                if act_prop not in self.active_proposals:
                    self.active_proposals.put(act_prop)

            for x in range(0, len(self._paused)):
                paused_prop = self._paused[x]
                if paused_prop not in self.active_proposals:
                    self.active_proposals.put(paused_prop)

            self.PeriodUpdate("Period Updated to Voting Period")

    def _update_proposals_result(self):
        """
        Calculate the votes and update the proposals status on the end of the voting period.
        :return:
        """
        cpf_treasury_score = self.create_interface_score(self.cpf_score.get(), CPF_TREASURY_INTERFACE)
        distribution_amount = self.get_remaining_fund()[bnUSD]

        proposals = self.sortPriorityProposals()
        for proposal_ in proposals:
            _proposal_details = self._get_proposal_details(proposal_)
            prefix = self.proposal_prefix(proposal_)

            _title = _proposal_details[PROJECT_TITLE]
            _sponsor_address: 'Address' = _proposal_details[SPONSOR_ADDRESS]
            _contributor_address: 'Address' = _proposal_details[CONTRIBUTOR_ADDRESS]
            _total_budget: int = _proposal_details[TOTAL_BUDGET]
            _period_count: int = _proposal_details[PROJECT_DURATION]
            _sponsor_deposit_amount: int = _proposal_details[SPONSOR_DEPOSIT_AMOUNT]
            _approve_voters: int = _proposal_details[APPROVE_VOTERS]
            _approved_votes: int = _proposal_details[APPROVED_VOTES]
            _total_votes: int = _proposal_details[TOTAL_VOTES]
            _total_voters: int = _proposal_details[TOTAL_VOTERS]
            flag: str = _proposal_details['token']

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
                self._update_proposal_status(proposal_, self._REJECTED)
                updated_status = self._REJECTED

            elif _approve_voters / _total_voters >= MAJORITY and _approved_votes / _total_votes >= MAJORITY:
                if (_total_budget * 102 // 100) < distribution_amount:
                    self._update_proposal_status(proposal_, self._ACTIVE)
                    updated_status = self._ACTIVE
                    self.sponsors.put(_sponsor_address)
                    self.proposals[prefix].sponsor_deposit_status.set(BOND_APPROVED)

                    # After the proposal is being accepted, it requests CPF to send amount to CPS_Treasury
                    cpf_treasury_score.transfer_proposal_fund_to_cps_treasury(proposal_,
                                                                              _period_count, _sponsor_address,
                                                                              _contributor_address, flag, _total_budget)
                    distribution_amount -= _total_budget

                else:
                    updated_status = self._PENDING
                    self.proposals[prefix].total_voters.set(0)
                    self.proposals[prefix].total_votes.set(0)
                    self.proposals[prefix].approved_votes.set(0)
                    self.proposals[prefix].rejected_votes.set(0)

                    ArrayDBUtils.array_db_clear(self.proposals[prefix].reject_voters)
                    ArrayDBUtils.array_db_clear(self.proposals[prefix].approve_voters)
                    ArrayDBUtils.array_db_clear(self.proposals[prefix].voters_list)
                    ArrayDBUtils.array_db_clear(self.proposals[prefix].voters_reasons)
                    for _prep in self.valid_preps:
                        prepVoteChange = self.proposals[prefix].voters_list_index[_prep]
                        prepVoteChange['vote'] = 0
                        prepVoteChange['index'] = 0
                        prepVoteChange['change_vote'] = 0

            else:
                self._update_proposal_status(proposal_, self._REJECTED)
                updated_status = self._REJECTED

            self.proposal_rank.remove(proposal_)
            if updated_status == self._REJECTED:
                self._remove_contributor(_contributor_address)
                self.proposals[prefix].sponsor_deposit_status.set(BOND_RETURNED)

                # Return 50% of fees back to contributor
                self.icx.transfer(_contributor_address, to_loop(APPLICATION_FEE) // 2)

                # Returning the Sponsor Bond to the sponsor address
                self.sponsor_bond_return[str(_sponsor_address)][flag] += _sponsor_deposit_amount
                self.SponsorBondReturned(_sponsor_address,
                                         f"{_sponsor_deposit_amount} returned to sponsor address.")

    def _update_progress_report_result(self):
        """
        Calculate votes for the progress reports and update the status and get the Installment and Sponsor
        Reward is the progress report is accepted.
        :return:
        """
        waiting_progress_reports = [item for item in self._waiting_progress_reports]

        for reports in range(0, len(waiting_progress_reports)):
            _reports = waiting_progress_reports[reports]
            _report_result = self._get_progress_reports_details(_reports)
            progress_prefix = self.progress_report_prefix(_reports)

            _ipfs_hash = _report_result[IPFS_HASH]
            proposal_prefix = self.proposal_prefix(_ipfs_hash)
            _proposal_details = self._get_proposal_details(_ipfs_hash)

            self.proposals[proposal_prefix].submit_progress_report.set(False)

            _proposal_status = _proposal_details[STATUS]
            _approved_reports_count: int = _proposal_details[APPROVED_REPORTS]
            _sponsor_address: 'Address' = _proposal_details[SPONSOR_ADDRESS]
            _contributor_address: 'Address' = _proposal_details[CONTRIBUTOR_ADDRESS]
            _completed: int = _proposal_details[PERCENTAGE_COMPLETED]
            _budget_adjustment: int = _report_result[BUDGET_ADJUSTMENT]
            _sponsor_deposit_amount: int = _proposal_details[SPONSOR_DEPOSIT_AMOUNT]
            flag: str = _proposal_details['token']

            _approve_voters: int = _report_result[APPROVE_VOTERS]
            _reject_voters: int = _report_result[REJECT_VOTERS]
            _approved_votes: int = _report_result[APPROVED_VOTES]
            _rejected_votes: int = _report_result[REJECTED_VOTES]
            _total_votes: int = _report_result[TOTAL_VOTES]
            _total_voters: int = _report_result[TOTAL_VOTERS]

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

            _project_duration: int = self.proposals[proposal_prefix].project_duration.get()
            cps_treasury_score = self.create_interface_score(self.cps_treasury_score.get(), CPS_TREASURY_INTERFACE)

            if _total_voters == 0 or _total_votes == 0 or len(self.valid_preps) < MINIMUM_PREPS:
                self._update_progress_report_status(_reports, self._PROGRESS_REPORT_REJECTED)
                updated_status = self._PROGRESS_REPORT_REJECTED

            elif _approve_voters / _total_voters >= MAJORITY and _approved_votes / _total_votes >= MAJORITY:
                self._update_progress_report_status(_reports, self._APPROVED)
                updated_status = self._APPROVED
                _approved_reports_count += 1

                if _approved_reports_count == _project_duration:
                    self._update_proposal_status(_ipfs_hash, self._COMPLETED)
                    # Transfer the Sponsor-Bond back to the Sponsor P-Rep after the project is completed.
                    self.sponsor_bond_return[str(_sponsor_address)][flag] += _sponsor_deposit_amount
                    self.proposals[proposal_prefix].sponsor_deposit_status.set(BOND_RETURNED)
                    self.SponsorBondReturned(_sponsor_address,
                                             f"{_sponsor_deposit_amount} {flag} returned to sponsor address.")

                elif _proposal_status == self._PAUSED:
                    self._update_proposal_status(_ipfs_hash, self._ACTIVE)

                self.proposals[proposal_prefix].approved_reports.set(_approved_reports_count)
                # Request CPS Treasury to add some installment amount to the contributor address
                cps_treasury_score.send_installment_to_contributor(_ipfs_hash)
                # Request CPS Treasury to add some sponsor reward amount to the sponsor address
                cps_treasury_score.send_reward_to_sponsor(_ipfs_hash)

            else:
                self._update_progress_report_status(_reports, self._PROGRESS_REPORT_REJECTED)
                updated_status = self._PROGRESS_REPORT_REJECTED

            if updated_status == self._PROGRESS_REPORT_REJECTED:
                if _proposal_status == self._ACTIVE:
                    self._update_proposal_status(_ipfs_hash, self._PAUSED)

                elif _proposal_status == self._PAUSED:
                    self._update_proposal_status(_ipfs_hash, self._DISQUALIFIED)
                    cps_treasury_score.disqualify_project(_ipfs_hash)

                    self._remove_contributor(_contributor_address)
                    self._remove_sponsor(_sponsor_address)

                    self.proposals[proposal_prefix].sponsor_deposit_status.set(BOND_CANCELLED)

                    # Transferring the sponsor bond deposit to CPF after the project being disqualified
                    self._disqualify_project(_sponsor_address, _sponsor_deposit_amount, flag)

    def _check_progress_report_submission(self):
        """
        Check if all active and paused proposals submits the progress report
        :return:
        """
        cps_treasury_score = self.create_interface_score(self.cps_treasury_score.get(), CPS_TREASURY_INTERFACE)

        for _ipfs_hash in self.active_proposals:
            proposalPrefix = self.proposal_prefix(_ipfs_hash)
            _prefix = self.proposals[proposalPrefix]

            _proposal_details = self._get_proposal_details(_ipfs_hash)
            _proposal_status = _proposal_details[STATUS]
            _sponsor_address: 'Address' = _proposal_details[SPONSOR_ADDRESS]
            _contributor_address: 'Address' = _proposal_details[CONTRIBUTOR_ADDRESS]
            flag: str = _proposal_details.get('token')

            if not _prefix.submit_progress_report.get():
                if _proposal_status == self._ACTIVE:
                    self._update_proposal_status(_ipfs_hash, self._PAUSED)

                elif _proposal_status == self._PAUSED:
                    self._update_proposal_status(_ipfs_hash, self._DISQUALIFIED)
                    cps_treasury_score.disqualify_project(_ipfs_hash)

                    self._remove_contributor(_contributor_address)
                    self._remove_sponsor(_sponsor_address)

                    _prefix.sponsor_deposit_status.set(BOND_CANCELLED)
                    _sponsor_deposit_amount: int = _proposal_details[SPONSOR_DEPOSIT_AMOUNT]

                    # Transferring the sponsor bond deposit to CPF after the project being disqualified
                    self._disqualify_project(_sponsor_address, _sponsor_deposit_amount, flag)

    def _update_budget_adjustments(self, _budget_key: str):
        """
        Update the budget amount and added month time if the budget adjustment application is approved by majority.
        :param _budget_key: report hash of the progress report
        :type _budget_key: str
        :return:
        """

        _report_result = self._get_progress_reports_details(_budget_key)
        _report_hash = _report_result[REPORT_HASH]
        _prefix = self.progress_report_prefix(_budget_key)

        _vote_result = self.get_budget_adjustment_vote_result(_budget_key)
        _approve_voters: int = _vote_result[APPROVE_VOTERS]
        _total_voters: int = _vote_result[TOTAL_VOTERS]
        _approved_votes: int = _vote_result[APPROVED_VOTES]
        _total_votes: int = _vote_result[TOTAL_VOTES]

        if _total_voters == 0 or _total_votes == 0 or len(self.valid_preps) < MINIMUM_PREPS:
            self.progress_reports[_prefix].budget_adjustment_status.set(self._REJECTED)

        elif _approve_voters / _total_voters >= MAJORITY and _approved_votes / _total_votes >= MAJORITY:
            _ipfs_hash = _report_result[IPFS_HASH]
            proposal_prefix = self.proposal_prefix(_ipfs_hash)
            proposals = self.proposals[proposal_prefix]
            token_flag: str = proposals.token.get()

            _period_count = proposals.project_duration.get()
            _total_budget = proposals.total_budget.get()
            _additional_duration = _report_result[ADDITIONAL_DURATION]
            _additional_budget = _report_result[ADDITIONAL_BUDGET]

            proposals.project_duration.set(_period_count + _additional_duration)
            proposals.total_budget.set(_total_budget + _additional_budget)
            self.progress_reports[_prefix].budget_adjustment_status.set(self._APPROVED)

            cpf_treasury_score = self.create_interface_score(self.cpf_score.get(), CPF_TREASURY_INTERFACE)

            # After the budget adjustment is approved, Request new added fund to CPF
            cpf_treasury_score.update_proposal_fund(_ipfs_hash, token_flag, _additional_budget, _additional_duration)

        else:
            self.progress_reports[_prefix].budget_adjustment_status.set(self._REJECTED)

    def _update_denylist_preps(self):
        """
        Add a Registered P-Rep to DenyList if they miss voting on the voting period.
        :return:
        """

        # All voters for this Proposal
        _voters_list = ArrayDBUtils.arraydb_to_list(self.priority_voted_preps)
        # All valid P-Rep list
        _valid_preps_list = ArrayDBUtils.arraydb_to_list(self.valid_preps)
        # Getting the list of P-Rep who did not vote on.
        _not_voters = [addr for addr in _valid_preps_list + _voters_list if
                       addr not in _valid_preps_list or addr not in _voters_list]

        # Adding the non voters to inactive P-Reps ArrayDB
        for prep in _not_voters:
            if prep not in self.inactive_preps:
                self.inactive_preps.put(prep)

        for _prep in self.inactive_preps:
            ArrayDBUtils.remove_array_item(self.registered_preps, _prep)

            self.denylist.put(_prep)
            count = self.preps_denylist_status[str(_prep)] + 1
            self.preps_denylist_status[str(_prep)] = count if count < 3 else 3

            self.PRepPenalty(_prep, "P-Rep added to Denylist.")

        # Clear all data from the ArrayDB
        ArrayDBUtils.array_db_clear(self.inactive_preps)

    @external
    def remove_denylist_preps(self):
        """
        Removes preps from deny list
        :return:
        """
        self._validate_admins()
        size = len(self.denylist)
        for _ in range(size):
            wallet: Address = self.denylist.pop()
            self.preps_denylist_status[str(wallet)] = 0

    @external
    def claim_sponsor_bond(self) -> None:
        """
        Claim the reward or the installment amount
        """
        _available_amount_icx = self.sponsor_bond_return[str(self.msg.sender)][ICX]
        _available_amount_bnusd = self.sponsor_bond_return[str(self.msg.sender)][bnUSD]
        if _available_amount_icx > 0:
            try:
                # set the remaining fund 0
                self.sponsor_bond_return[str(self.msg.sender)][ICX] = 0

                self.icx.transfer(self.msg.sender, _available_amount_icx)
                self.SponsorBondClaimed(self.msg.sender, _available_amount_icx,
                                        f"{_available_amount_icx} {ICX} withdrawn to {self.msg.sender}")
            except Exception as e:
                revert(f"{TAG} : Network problem. Claiming sponsor bond. {e}")

        elif _available_amount_bnusd > 0:
            try:
                # set the remaining fund 0
                self.sponsor_bond_return[str(self.msg.sender)][bnUSD] = 0

                bnusd_score = self.create_interface_score(self.balanced_dollar.get(), TokenInterface)
                bnusd_score.transfer(self.msg.sender, _available_amount_bnusd)
                self.SponsorBondClaimed(self.msg.sender, _available_amount_bnusd,
                                        f"{_available_amount_bnusd} {bnUSD} withdrawn to {self.msg.sender}")
            except Exception as e:
                revert(f"{TAG} : Network problem. Claiming sponsor bond. {e}")

        else:
            revert(f"{TAG} :Claim Reward Fails. Available Amounts are {_available_amount_icx} ICX and "
                   f"{_available_amount_bnusd} {bnUSD}.")

    @external(readonly=True)
    def check_claimable_sponsor_bond(self, _address: Address) -> dict:
        """
        Returns the sponsor bond claimable by the sponsor
        :param _address: sponsor address
        :type _address: Address
        :return: dict of claimable sponsor bond. ICX and bnUSD
        :rtype: dict
        """
        return {ICX: self.sponsor_bond_return[str(_address)][ICX],
                bnUSD: self.sponsor_bond_return[str(_address)][bnUSD]}

    @external
    def tokenFallback(self, _from: Address, _value: int, _data: bytes):
        """
        _data = {'method':methodName,params:{'key1':'value1'}}
        """
        unpacked_data = json_loads(_data.decode('utf-8'))

        bnusd = self.balanced_dollar.get()
        if self.msg.sender != bnusd:
            revert(f'{TAG}: Only {bnusd} can send {bnUSD} tokens to this contract.')

        method = unpacked_data["method"]
        params = unpacked_data["params"]

        if method == "sponsor_vote":
            _ipfs_hash = params[IPFS_HASH]
            _vote = params[VOTE]
            _vote_reason = params[VOTE_REASON]

            self._sponsor_vote(_ipfs_hash, _vote, _vote_reason, _from, _value)

        elif method == "pay_prep_penalty":
            self._pay_prep_penalty(_from, _value)
        else:
            revert(f'{TAG}: Token not received.')

    def _disqualify_project(self, _sponsor_address: Address, _sponsor_deposit_amount: int, flag: str):
        """
        disqualifies project and returns the fund amount to sponsor address if the proposal is rejected by majority of
        preps
        :param _sponsor_address: wallet address of sponsor
        :type _sponsor_address: Address
        :param _sponsor_deposit_amount: sponsor deposit amount
        :type _sponsor_deposit_amount: int
        :param flag: Token name
        :type flag: str
        :return:
        """
        cpf_score_address: Address = self.cpf_score.get()
        cpf_treasury_score = self.create_interface_score(cpf_score_address, CPF_TREASURY_INTERFACE)
        if flag == ICX:
            cpf_treasury_score.icx(_sponsor_deposit_amount).return_fund_amount(_sponsor_address)
        elif flag == bnUSD:
            _data = json_dumps({"method": "return_fund_amount",
                                "params": {"sponsor_address": str(_sponsor_address)}}).encode()
            bnusd_score = self.create_interface_score(self.balanced_dollar.get(), TokenInterface)
            bnusd_score.transfer(cpf_score_address, _sponsor_deposit_amount, _data)
        else:
            revert(f'{TAG}: Not supported token {flag}. ')
        self.SponsorBondReturned(cpf_score_address,
                                 f'Project Disqualified. {_sponsor_deposit_amount} {flag}'
                                 f'returned to CPF Treasury Address.')

    def _snapshot_delegations(self):
        """
        snapshots the delegation of each preps
        :return:
        """
        max_delegation = 0

        for preps in self.valid_preps:
            stake = self._get_stake(preps)
            self.delegation_snapshot[preps] = stake
            if stake > max_delegation:
                max_delegation = stake

        self.max_delegation.set(max_delegation)

    def _get_max_cap_bnusd(self) -> int:
        """
        Returns the maximum amount of bnUSD that can be in cpf treasury
        :return: maximum bnUSD amount that can be in cpf treasury
        :rtype: int
        """
        cpf_treasury_score = self.create_interface_score(self.cpf_score.get(), CPF_TREASURY_INTERFACE)
        return cpf_treasury_score.get_remaining_swap_amount().get('maxCap')

    def _swap_bnusd_token(self):
        """
        Swap sICX token with bnUSD after a certain block height in cpf treasury
        :return:
        """
        swapped_bh = self.swap_block_height.get()
        if swapped_bh < self.block_height:
            self.swap_block_height.set(swapped_bh + SWAP_BLOCK_DIFF)
            cpf_treasury_score = self.create_interface_score(self.cpf_score.get(), CPF_TREASURY_INTERFACE)
            cpf_treasury_score.swap_tokens(self.swap_count.get())

    @external
    def set_swap_count(self, _value: int):
        self._validate_admins()
        self.swap_count.set(_value)

    @external
    def update_next_block(self, _block_count: int):
        self._validate_admins()
        self.next_block.set(self.block_height + _block_count)
