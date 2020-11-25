from .utils.checkers import *
from .db.progress_report_data import *
from .db.proposal_data import *
from .utils.consts import *
from .utils.interfaces import *
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
    completed_percent: int


class CPS_Score(IconScoreBase):
    ID = 'id'

    _CPS_TREASURY_SCORE = "_cps_treasury_score"
    _CPF_SCORE = "_cpf_score"

    _INITIAL_BLOCK = "initial_block"
    _PERIOD_DETAILS = "_period_details"
    _PERIOD_NAME = "period_name"

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
    _INACTIVE_PREPS = "inactive_preps"
    _PROPOSALS_KEY_LIST = 'proposals_key_list'
    _PROGRESS_KEY_LIST = 'progress_key_list'
    _CONTRIBUTORS = "contributors"
    _SPONSORS = "sponsors"
    _BUDGET_APPROVALS_LIST = "budget_approvals_list"
    _PREP_DETAILS = "_prep_details"
    _SPONSOR_ADDRESS = 'sponsor_address'
    _TOTAL_BUDGET = 'total_budget'
    _ACTIVE_PROPOSALS = "active_proposals"
    _AMOUNT = "_total_amount"

    _PROJECT_TITLE = "project_title"
    _PROJECT_REPORT_TITLE = "project_report_title"
    _TOTALVOTES = "totalStaked"
    _TIMESTAMP = 'timestamp'
    _CONTRIBUTOR_ADDRESS = "contributor_address"
    _TX_HASH = "tx_hash"
    _IPFS_HASH = 'ipfs_hash'
    _REPORT_KEY = 'report_key'
    _REPORT_HASH = 'report_hash'
    _PERIOD_COUNT = 'period_count'
    _PERCENTAGE_COMPLETED = 'percentage_completed'
    _ADDITIONAL_BUDGET = 'additional_budget'
    _ADDITIONAL_DURATION = 'additional_duration'

    _PREPS_DENYLIST = "preps_denylist"
    _DENYLIST = "denylist"
    _PENALTY_AMOUNT = "penalty_amount"
    _STATUS = "status"
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
    PROGRESS_REPORT_STATUS_TYPE = [_APPROVED, _WAITING, _REJECTED]

    _APPROVE = "_approve"
    _REJECT = "_reject"
    _ABSTAIN = "_abstain"
    _ACCEPT = "_accept"
    _YES = "yes"
    _NO = "no"

    @eventlog(indexed=3)
    def ProposalSubmitted(self, _sender_address: Address, _score_address: Address, note: str):
        pass

    @eventlog(indexed=3)
    def TokenBurn(self, _sender_address: Address, _score_address: Address, note: str):
        pass

    @eventlog(indexed=3)
    def ProgressReportSubmitted(self, _sender_address: Address, _score_address: Address, _project_title: str):
        pass

    @eventlog(indexed=3)
    def SponsorBondReceived(self, _sender_address: Address, _score_address: Address, _notes: str):
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

    @eventlog(indexed=3)
    def SponsorBondReturned(self, _score_address: Address, _sender_address: Address, _notes: str):
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
        self.all_preps = ArrayDB(self._ALL_PREPS, db, value_type=Address)
        self.unregistered_preps = ArrayDB(self._UNREGISTERED_PREPS, db, value_type=Address)
        self.inactive_preps = ArrayDB(self._INACTIVE_PREPS, db, value_type=Address)

        self.prep_details = DictDB(self._PREP_DETAILS, db, value_type=str, depth=2)

        self.proposals_key_list = ArrayDB(self._PROPOSALS_KEY_LIST, db, value_type=str)
        self.progress_key_list = ArrayDB(self._PROGRESS_KEY_LIST, db, value_type=str)
        self.budget_approvals_list = ArrayDB(self._BUDGET_APPROVALS_LIST, db, value_type=str)

        self.active_proposals = ArrayDB(self._ACTIVE_PROPOSALS, db, value_type=str)

        self.contributors = ArrayDB(self._CONTRIBUTORS, db, value_type=Address)
        self.sponsors = ArrayDB(self._SPONSORS, db, value_type=Address)
        self.admins = ArrayDB(self._ADMINS, db, value_type=Address)

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
                                       self._REJECTED: self._progress_rejected}

        self.penalty_amount = ArrayDB(self._PENALTY_AMOUNT, db, value_type=int)

        self.denylist = ArrayDB(self._DENYLIST, db, value_type=str)
        self.preps_denylist = DictDB(self._PREPS_DENYLIST, db, value_type=str)

    def on_install(self) -> None:
        super().on_install()

    def on_update(self) -> None:
        super().on_update()

    @external(readonly=True)
    def name(self) -> str:
        return "CPS_SCORE"

    def only_admin(self):
        if self.msg.sender not in self.admins:
            revert(f"{self.address} : Only Admins can call this method.")

    def set_id(self, _val: str):
        self.id.set(_val)

    def get_id(self) -> str:
        return self.id.get()

    def proposalPrefix(self, _proposal_key: str) -> bytes:
        return b'|'.join([PROPOSAL_DB_PREFIX, self.id.get().encode(), _proposal_key.encode()])

    def progressReportPrefix(self, _progress_key: str) -> bytes:
        return b'|'.join([PROGRESS_REPORT_DB_PREFIX, self.id.get().encode(), _progress_key.encode()])

    @only_owner
    @external
    def set_admin(self, _address: Address):
        if _address not in self.admins:
            self.admins.put(_address)

    @only_owner
    @external
    def remove_admin(self, _address: Address):
        prep = self.admins.pop()
        if prep != _address:
            for x in range(0, len(self.admins)):
                if self.admins[x] == _address:
                    self.admins[x] = prep

    @only_owner
    @external
    def set_cps_treasury_score(self, _score: Address) -> None:
        """
        Sets the cps treasury score address. Only owner can set the address.
        :param _score: Address of the cps treasury score address
        :type _score: :class:`iconservice.base.address.Address`
        :return:
        """
        if _score.is_contract:
            self.cps_treasury_score.set(_score)

    @only_owner
    @external
    def set_cpf_score(self, _score: Address) -> None:
        """
        Sets the cps treasury score address. Only owner can set the address.
        :param _score: Address of the cps treasury score address
        :type _score: :class:`iconservice.base.address.Address`
        :return:
        """
        if _score.is_contract:
            self.cpf_score.set(_score)

    def _getPrepsAddress(self) -> list:
        """
        Returns the all Main P-Reps and SubP-Reps details for the term
        :return: all Main P-Reps and SubP-Reps full details
        """
        _preps_list = []
        # _all_preps = self._system_score.getPRepTerm()['preps']
        # for _prep in range(0, len(_all_preps)):
        #     _preps_list.append(_all_preps[_prep]['address'])

        for prep in self.main_preps:
            _preps_list.append(prep)

        return _preps_list

    def _get_stake(self, _address: Address) -> int:
        """
        get the total stake weight of given address
        :param _address : P-Rep Address
        :return : total delegated amount (loop)
        """

        # _all_preps = self._system_score.getPRepTerm()['preps']
        # for _prep in range(0, len(_all_preps)):
        #     if _prep == _address:
        #         return int(_all_preps[_prep]['delegated'])

        for _prep in self.all_preps:
            if _prep == _address:
                return int(self.prep_details[_prep]['delegated'])

    @only_owner
    @external
    def add_PReps(self, _name: str, _address: Address, _delegated: int = 0) -> None:
        """
        add P-Rep address with details
        :return:
        """
        if _address not in self.all_preps:
            self.all_preps.put(_address)

            self.prep_details[str(_address)]["name"] = _name
            self.prep_details[str(_address)]["delegated"] = str(_delegated)

    def set_PReps(self) -> None:
        """
        Set the list of P-Reps' address for the period
        :return:
        """
        # _prep_list = self.get_preps_address()
        #
        # for preps in self._all_preps:
        #     if str(preps) in _prep_list:
        #         self.main_preps.put(preps)

        for prep in range(0, len(self.main_preps)):
            self.main_preps.pop()

        for x in self.all_preps:
            if x not in self.denylist:
                if x not in self.unregistered_preps:
                    self.main_preps.put(x)

    @external
    def unregister_prep(self) -> None:
        """
        Unregister a registered P-Rep from CPS.
        :return:
        """

        if self.msg.sender not in self.main_preps:
            revert(f"{self.address} : {CPS_Score.unregister_prep.__name__} -> P-Rep is not registered yet.")

        _data_out = self.main_preps.pop()
        if _data_out != self.msg.sender:
            for prep in range(0, len(self.main_preps)):
                if self.main_preps[prep] == self.msg.sender:
                    self.main_preps[prep] = _data_out

        self.unregistered_preps.put(self.msg.sender)
        self.UnRegisterPRep(self.msg.sender, f'{self.msg.sender} has ben unregistered successfully.')

    @external
    def register_prep(self) -> None:
        """
        Unregister a registered P-Rep from CPS.
        :return:
        """

        _address = self.msg.sender

        if _address in self.main_preps:
            revert(f"{self.address} : {CPS_Score.register_prep.__name__} -> P-Rep is already registered.")

        if _address in self.denylist:
            revert(
                f"{self.address} : {CPS_Score.register_prep.__name__} -> You are in denylist. To register, You've to pay Penalty.")

        if _address in self.unregistered_preps:
            _data_out = self.main_preps.pop()
            if _data_out != _address:
                for prep in range(0, len(self.main_preps)):
                    if self.main_preps[prep] == _address:
                        self.main_preps[prep] = _data_out

        self.main_preps.put(_address)

    def _removeSponsor(self, _address: Address):
        sponsor_address = self.sponsors.pop()
        if sponsor_address != _address:
            for address in range(0, len(self.sponsors)):
                if self.sponsors[address] == _address:
                    self.sponsors[address] = sponsor_address

    def _check_proposal(self, _proposal_key: str):
        if _proposal_key not in self.get_proposal_keys():
            return False
        else:
            return True

    def _check_progress_report(self, _progress_key: str):
        if _progress_key not in self.get_progress_keys():
            return False
        else:
            return True

    def get_proposal_keys(self) -> list:
        proposals = []
        for item in self.proposals_key_list:
            proposals.append(item)
        return proposals

    def get_progress_keys(self) -> list:
        progress_reports = []
        for item in self.progress_key_list:
            progress_reports.append(item)
        return progress_reports

    def _getPenaltyAmount(self, _address: Address):
        if self.preps_denylist[str(self.msg.sender)] == "Denylist for once.":
            _penalty_amount = self.penalty_amount[0]
        elif self.preps_denylist[str(self.msg.sender)] == "Denylist for twice.":
            _penalty_amount = self.penalty_amount[1]
        else:
            _penalty_amount = self.penalty_amount[2]

        return _penalty_amount

    def _addNewProposal(self, _key: str):
        self.proposals_key_list.put(_key)

    def _updateProposalStatus(self, _proposal_key: str, _status: str):
        prefix = self.proposalPrefix(_proposal_key)
        _current_status = self.proposals[prefix].status.get()
        self.proposals[prefix].timestamp.set(self.now())
        self.proposals[prefix].status.set(_status)

        _data_out = self.proposals_status[_current_status].pop()
        if _data_out != _proposal_key:
            for p in range(0, len(self.proposals_status[_current_status])):
                if self.proposals_status[_current_status][p] == _proposal_key:
                    self.proposals_status[_current_status][p] = _data_out

        self.proposals_status[_status].put(_proposal_key)

    def _updatePercentageCompleted(self, _key: str, _percent_completed: int):
        prefix = self.proposalPrefix(_key)
        self.proposals[prefix].percentage_completed.set(_percent_completed)

    def _addProposals(self, _proposal: ProposalAttributes):
        proposal_data_obj = createProposalDataObject(_proposal)
        if not self._check_proposal(proposal_data_obj.proposal_hash):
            self._addNewProposal(proposal_data_obj.proposal_hash)
        prefix = self.proposalPrefix(proposal_data_obj.proposal_hash)
        addDataToProposalDB(prefix, self.proposals, proposal_data_obj)

    def _getProposalDetails(self, _proposal_key: str) -> dict:
        prefix = self.proposalPrefix(_proposal_key)
        _proposal_details = getDataFromProposalDB(prefix, self.proposals)
        return _proposal_details

    def _addNewProgressReportKey(self, proposal_key: str, progress_key: str):
        self.progress_key_list.put(progress_key)

        prefix = self.proposalPrefix(proposal_key)
        if proposal_key not in self.proposals[prefix].progress_reports:
            self.proposals[prefix].progress_reports.put(proposal_key)

    def _updateProgressReportStatus(self, progress_report_key: str, _status: str):
        prefix = self.progressReportPrefix(progress_report_key)
        _current_status = self.progress_reports[prefix].status.get()

        self.progress_reports[prefix].timestamp.set(self.now())
        self.progress_reports[prefix].status.set(_status)

        _data_out = self.progress_report_status[_current_status].pop()
        if _data_out != progress_report_key:
            for p in range(0, len(self.progress_report_status[_current_status])):
                if self.progress_report_status[_current_status][p] == progress_report_key:
                    self.progress_report_status[_current_status][p] = _data_out

        self.progress_report_status[_status].put(progress_report_key)

    def _addProgressReport(self, _progress_report: ProgressReportAttributes):
        progress_report_obj = createProgressDataObject(_progress_report)
        if not self._check_progress_report(progress_report_obj.report_hash):
            self._addNewProgressReportKey(progress_report_obj.proposal_key, progress_report_obj.report_hash)
        prefix = self.progressReportPrefix(progress_report_obj.report_hash)
        addDataToProgressReportDB(prefix, self.progress_reports, progress_report_obj)

    def _getProgressReportsDetails(self, _progress_hash: str) -> dict:
        prefix = self.progressReportPrefix(_progress_hash)
        response = getDataFromProgressReportDB(prefix, self.progress_reports)
        return response

    @external
    @payable
    def submit_proposal(self, _proposals: ProposalAttributes) -> None:
        _contributor_address = self.msg.sender
        if _contributor_address.is_contract:
            revert(f"{self.address} : {CPS_Score.submit_proposal.__name__} -> Contract Address not supported.")

        if _proposals[self._SPONSOR_ADDRESS] not in self.main_preps:
            revert(f"{self.address} : {CPS_Score.submit_proposal.__name__} -> Sponsor P-Rep not a Top 100 P-Rep.")

        if self.msg.value != 50 * MULTIPLIER:
            revert(f"{self.address} :{CPS_Score.submit_proposal.__name__} -> Deposit 50 ICX to submit a proposal.")

        _tx_hash = str(bytes.hex(self.tx.hash))
        proposal_key = _proposals.copy()
        proposal_key[self._TIMESTAMP] = self.now()
        proposal_key[self._STATUS] = self._SPONSOR_PENDING
        proposal_key[self._CONTRIBUTOR_ADDRESS] = self.msg.sender
        proposal_key[self._TX_HASH] = _tx_hash
        proposal_key[self._PERCENTAGE_COMPLETED] = 0
        self._addProposals(proposal_key)

        self._sponsor_pending.put(_proposals[self._IPFS_HASH])

        if _contributor_address not in self.contributors:
            self.contributors.put(_contributor_address)

        self.ProposalSubmitted(_contributor_address, self.address, "Successfully submitted a Proposal.")
        try:
            self.icx.transfer(_contributor_address, ZERO_WALLET_ADDRESS)
            self.TokenBurn(_contributor_address, self.address, f"{self.msg.value} ICX transferred to burn.")
        except BaseException as e:
            revert(f"{self.address} : {CPS_Score.submit_proposal.__name__} -> Network problem. "
                   f"Sending proposal funds. {e}")

    @external
    @payable
    def submit_progress_report(self, _progress_report: ProgressReportAttributes) -> None:
        _contributor_address = self.msg.sender
        if _contributor_address.is_contract:
            revert(f"{self.address} : {CPS_Score.submit_progress_report.__name__} -> Contract Address not supported.")

        if self.msg.sender != self._getProposalDetails(_progress_report[self._REPORT_HASH])['contributor_address']:
            revert(f"{self.address} : {CPS_Score.submit_progress_report.__name__} -> "
                   f"Sorry, You are not the contributor for this project.")

        _progress = _progress_report.copy()
        _percentage_completed = _progress_report[self._PERCENTAGE_COMPLETED]
        self._updatePercentageCompleted(_progress[self._IPFS_HASH], _percentage_completed)
        _progress.pop(self._PERCENTAGE_COMPLETED, None)
        _progress[self._STATUS] = self._WAITING
        _progress[self._TIMESTAMP] = self.now()
        _progress[self._TX_HASH] = str(bytes.hex(self.tx.hash))
        self._addProgressReport(_progress)
        self._waiting.put(_progress_report[self._REPORT_HASH])

        if _progress_report['budget_adjustment'] == '0x1':
            self.budget_approvals_list.put(_progress_report[self._REPORT_HASH])

        self.ProgressReportSubmitted(_contributor_address, self.address,
                                     f'{_progress_report["progress_report_title"]} --> Progress '
                                     f'Report Submitted Successfully.')

    @external(readonly=True)
    def get_proposals_keys_by_status(self, _status: str) -> list:
        """
        Returns the proposal keys of proposal by status
        :return: list of keys of given status
        :rtype: list
        """
        if _status not in self.STATUS_TYPE:
            return [f"{self.address} : {CPS_Score.submit_proposal.__name__} -> Not a valid status."]

        _list = []

        for x in self.proposals_status[_status]:
            _list.append(x)

        return _list

    @external
    @payable
    def sponsor_vote(self, _ipfs_key: str, _vote: str) -> None:
        """
        Selected Sponsor P-Rep to approve the requested proposal for CPS
        :param _vote: Vote from Sponsor [_accept,_reject]
        :param _ipfs_key : proposal ipfs hash
        :type _ipfs_key : str
        """

        _proposal_details = self._getProposalDetails(_ipfs_key)
        _status = _proposal_details[self._STATUS]
        _sponsor = _proposal_details[self._SPONSOR_ADDRESS]

        if self.msg.sender not in self.main_preps:
            revert(f"{self.address} : {CPS_Score.sponsor_vote.__name__} -> Not a P-Rep.")

        if self.msg.sender != _sponsor:
            revert(f"{self.address} : {CPS_Score.sponsor_vote.__name__} -> Not a valid Sponsor.")

        if _vote == self._ACCEPT:
            if _status == self._SPONSOR_PENDING:
                _budget = int(_proposal_details[self._TOTAL_BUDGET])

                if self.msg.value != (_budget * MULTIPLIER) / 10:
                    revert(f"{self.address} : {CPS_Score.sponsor_vote.__name__} -> "
                           f"Deposit 10% of the total budget of the project.")

                self._updateProposalStatus(_ipfs_key, self._PENDING)

                prefix = self.proposalPrefix(_ipfs_key)

                self.proposals[prefix].sponsor_deposit_amount.set(self.msg.value)
                self.proposals[prefix].sponsored_timestamp.set(self.now())
                self.proposals[prefix].sponsor_deposit_status.set("bond_received")

                self.SponsorBondReceived(self.msg.sender, self.address, "Sponsor Bond Received.")
        else:
            self._updateProposalStatus(_ipfs_key, self._REJECTED)
            self.SponsorBondRejected(self.msg.sender, "Sponsor Bond Rejected.")

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

        _proposal_details = self._getProposalDetails(_ipfs_key)
        _status = _proposal_details[self._STATUS]
        prefix = self.proposalPrefix(_ipfs_key)
        _voters_list = self.proposals[prefix].voters_list

        if self.msg.sender in _voters_list:
            revert(f"{self.address} : {CPS_Score.vote_proposal.__name__} -> Already voted on this Proposal.")

        if _status == self._PENDING:
            _voter_stake = self._get_stake(self.msg.sender)
            _total_votes = self.proposals[prefix].total_votes.get()
            _approved_votes = self.proposals[prefix].approved_votes.get()
            _rejected_votes = self.proposals[prefix].rejected_votes.get()

            _total_votes += _voter_stake
            self.proposals[prefix].total_votes.set(_total_votes)
            self.proposals[prefix].voters_list.put(self.msg.sender)

            if _vote == self._APPROVE:
                self.proposals[prefix].approve_voters.put(self.msg.sender)
                self.proposals[prefix].approved_votes.set(_approved_votes + _voter_stake)
            elif _vote == self._REJECT:
                self.proposals[prefix].reject_voters.put(self.msg.sender)
                self.proposals[prefix].rejected_votes.set(_rejected_votes + _voter_stake)

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
        :param _budget_adjustment_vote: Budget voting Adjustment
        :type _budget_adjustment_vote : str
        :param _vote_reason : Any specific reason behind the vote
        :type _vote_reason : str
        """

        _progress_report_details = self._getProgressReportsDetails(_report_key)
        _status = _progress_report_details[self._STATUS]
        prefix = self.progressReportPrefix(_report_key)
        _voters_list = self.progress_reports[prefix].voters_list

        if self.msg.sender in _voters_list:
            revert(f"{self.address} : {CPS_Score.vote_progress_report.__name__} -> Already Voted on this proposal.")

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
                if _budget_adjustment_vote == self._YES:
                    self.progress_reports[prefix].budget_approve_voters.put(self.msg.sender)
                    self.progress_reports[prefix].budget_approved_votes.set(_approved_votes + _voter_stake)
                elif _budget_adjustment_vote == self._NO:
                    self.progress_reports[prefix].budget_reject_voters.put(self.msg.sender)
                    self.progress_reports[prefix].budget_rejected_votes.set(_rejected_votes + _voter_stake)

    @only_owner
    @external
    def set_prep_penalty_amount(self, _penalty: List[int]) -> None:
        """
        Sets the Penalty amount for the registered P-Rep(s) missing to vote on voting period.
        Only owner can set the address.
        :param _penalty: Penalty Amount Lists
        :type _penalty: List of int

        :return:
        """

        for x in _penalty:
            self.penalty_amount.put(x)

    @payable
    @external
    def pay_prep_penalty(self):
        """
        To remove the address from denylist
        :return:
        """
        _address = self.msg.sender
        if _address not in self.denylist:
            revert(f"{self.address} : {CPS_Score.pay_prep_penalty.__name__} -> {_address} not in denylist.")

        _penalty_amount = self._getPenaltyAmount(_address)

        if self.msg.value != _penalty_amount:
            revert(f"{self.address} : {CPS_Score.submit_proposal.__name__} -> "
                   f"Please pay Penalty amount of {_penalty_amount} ICX to register as a P-Rep.")

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
            self.TokenBurn(self.msg.sender, ZERO_WALLET_ADDRESS,
                           f"{self.msg.value // 10 ** 18} ICX Burned from penalty deposit.")
        except BaseException as e:
            revert(f"{self.address} : {CPS_Score.pay_prep_penalty.__name__} -> Network problem. "
                   f"Sending proposal funds. {e}")

    @only_owner
    @external
    def set_initialBlock(self, _block_height: int) -> None:
        """
        To set the initial block of application period to start (once only)
        :_block_height : the initial block to be set
        :return:
        """

        self.set_PReps()
        if _block_height < self.block_height:
            _block_height = self.block_height
        self.initial_block.set(_block_height)

        self.next_block.set(self.initial_block.get() + BLOCKS_COUNT)
        # make constant to the period name
        self.period_name.set(APPLICATION_PERIOD)

    @external(readonly=True)
    def login_prep(self, _address: Address) -> dict:
        """
        Checks the logged in user is P-Rep or not.
        :return : dict of logged in information
        """

        _login_dict = {}

        if _address in self.all_preps:
            _login_dict["isPRep"] = True

            if _address in self.unregistered_preps:
                _login_dict["isRegistered"] = False
                _login_dict["payPenalty"] = False

            if _address in self.denylist:
                _login_dict["isRegistered"] = False
                _login_dict["payPenalty"] = True

                _penalty_amount = self._getPenaltyAmount(_address)

                _login_dict["penaltyAmount"] = _penalty_amount

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
        for x in self.admins:
            admins.append(x)

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
    def get_cpf_score(self) -> Address:
        """
        Returns the cps treasury score address
        :return: cps treasury score address
        :rtype: :class:`iconservice.base.address.Address`
        """
        return self.cpf_score.get()

    @external(readonly=True)
    def get_PReps(self) -> list:
        """
        Returns the all P-Reps who can be active in this period
        :return: P-Rep address list
        """
        _preps = []
        for prep in self.main_preps:
            _preps.append({"name": self.prep_details[prep]["name"],
                           "address": prep,
                           "delegated": int(self.prep_details[prep]["delegated"])})
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

        _remaining_blocks = self.next_block.get() - self.block_height
        if _remaining_blocks < 0:
            _remaining_blocks = 0
        period_dict = {self._CURRENTBLOCK: self.block_height,
                       self._NEXTBLOCK: self.next_block.get(),
                       self._REMAINING_TIME: _remaining_blocks * 2,
                       self._PERIOD_NAME: self.period_name.get(),
                       "period_span": BLOCKS_COUNT * 2}

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
                _amount += self._getProposalDetails(keys)[self._TOTAL_BUDGET]

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
            _proposal_details = self._getProposalDetails(_proposals_keys[sponsors])
            _sponsors_list.append(_proposal_details[self._SPONSOR_ADDRESS])

        sponsors_dict = {i: _sponsors_list.count(i) for i in _sponsors_list}

        return sponsors_dict

    @external(readonly=True)
    def get_proposal_details(self, _status: str, _wallet_address: Address = "", _start_index: int = 0,
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
            _proposal_details = self._getProposalDetails(_proposals_keys[_keys])
            if _status == self._SPONSOR_PENDING:
                if _wallet_address == _proposal_details[self._CONTRIBUTOR_ADDRESS]:
                    _proposals_list.append(_proposal_details)

            if _proposal_details[self._STATUS] == _status:
                _proposals_list.append(_proposal_details)

        return {"data": _proposals_list, "count": len(_proposals_list)}

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
            _proposal_details = self._getProposalDetails(proposals)
            prefix = self.proposalPrefix(proposals)
            if _proposal_details[self._STATUS] == self._ACTIVE or _proposal_details[self._STATUS] == self._PAUSED:
                if _proposal_details[self._CONTRIBUTOR_ADDRESS] == _wallet_address:
                    _report_keys = self.proposals[prefix].progress_reports
                    _report = True

                    for report in _report_keys:
                        if self._getProgressReportsDetails(_report_keys[report])[self._STATUS] == self._WAITING:
                            _report = False
                    _proposals_details = {self._PROJECT_TITLE: _proposal_details[self._PROJECT_TITLE],
                                          self._IPFS_HASH: proposals,
                                          "new_progress_report": _report}
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
            _proposal_details = self._getProposalDetails(_proposals_keys[_keys])
            if _proposal_details[self._CONTRIBUTOR_ADDRESS] == _wallet_address:
                _proposals_list.append(_proposal_details)

        _proposals_dict_list = {"data": _proposals_list, "count": len(_proposals_list)}
        return _proposals_dict_list

    @external(readonly=True)
    def get_progress_reports(self, _status: str, _start_index: int = 0, _end_index: int = 20) -> dict:
        """
        Returns all the progress report submitted of given _status
        :param _status : status in ['_approved','_waiting','_rejected']
        :type _status : str
        :param _start_index : first index
        :type _start_index : int
        :param _end_index : last index
        :type _end_index : int

        :return : Progress reports with details
        :rtype : dict
        """

        if _status not in self.PROGRESS_REPORT_STATUS_TYPE:
            return {-1: f"{self.address} : {CPS_Score.submit_proposal.__name__} -> Not a valid status"}

        _progress_report_list = []

        _active_projects = self.get_proposals_keys_by_status(self._ACTIVE)
        _paused_projects = self.get_proposals_keys_by_status(self._PAUSED)
        _progress_keys = _active_projects + _paused_projects
        _progress_report_len = len(_progress_keys)

        if _end_index - _start_index > 50:
            return {-1: "Page length must not be greater than 50."}
        if _start_index < 0:
            _start_index = 0
        count = _progress_report_len

        _range = range(_start_index, count if _end_index > count else _end_index)

        for reports in _range:
            prefix = self.proposalPrefix(_progress_keys[reports])
            proposal_details = self._getProposalDetails(_progress_keys[reports])
            _report_keys = self.proposals[prefix].progress_reports

            for report in _report_keys:
                progressDetails = self._getProgressReportsDetails(report)
                if progressDetails[self._STATUS] == _status:
                    progressDetails[self._PROJECT_TITLE] = proposal_details[self._PROJECT_TITLE],
                    progressDetails[self._CONTRIBUTOR_ADDRESS] = proposal_details[self._CONTRIBUTOR_ADDRESS],
                    _progress_report_list.append(progressDetails)

        progress_report_dict = {"data": _progress_report_list, "count": len(self.progress_key_list)}
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

        prefix = self.proposalPrefix(_ipfs_key)
        _report_keys = self.proposals[prefix].progress_reports
        proposal_details = self._getProposalDetails(_ipfs_key)
        _progress_reports = []

        for reports in _report_keys:
            _progress_report = self._getProgressReportsDetails(_report_keys[reports])
            _progress_report[self._PROJECT_TITLE] = proposal_details[self._PROJECT_TITLE]
            _progress_report[self._CONTRIBUTOR_ADDRESS] = proposal_details[self._CONTRIBUTOR_ADDRESS]
            _progress_reports.append(_progress_report)

        return {"data": _progress_reports}

    @external(readonly=True)
    def get_sponsors_requests(self, _status: str, _sponsor_address: str, _start_index: int = 0,
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
            return {-1: f"{self.address} : {CPS_Score.get_sponsors_requests.__name__} -> Not valid status."}

        if _status == self._APPROVED:
            for ac in self.get_proposals_keys_by_status(self._ACTIVE):
                _proposals_keys.append(ac)

            for pa in self.get_proposals_keys_by_status(self._PAUSED):
                _proposals_keys.append(pa)

            for com in self.get_proposals_keys_by_status(self._COMPLETED):
                _proposals_keys.append(com)

        elif _status == self._SPONSOR_PENDING:
            for ac in self.get_proposals_keys_by_status(self._SPONSOR_PENDING):
                _proposals_keys.append(ac)

            for pa in self.get_proposals_keys_by_status(self._PENDING):
                _proposals_keys.append(pa)

        else:
            _proposals_keys = self.get_proposals_keys_by_status(_status)

        if _start_index < 0:
            _start_index = 0
        if _end_index - _start_index > 50:
            return {-1: f"{self.address} : {CPS_Score.get_sponsors_requests.__name__} -> "
                        f"Page length must not be greater than 50."}

        start = _end_index * _start_index
        count = len(_proposals_keys)

        if start > count:
            return {}

        end = _end_index * (_start_index + 1)
        _range = range(start, count if end > count else end)

        for _keys in _range:
            _proposal_details = self._getProposalDetails(_proposals_keys[_keys])
            if _proposal_details[self._SPONSOR_ADDRESS] == _sponsor_address:
                if _status == self._APPROVED:
                    _sponsors_request.append(_proposal_details)

                elif _proposal_details[self._STATUS] == _status:
                    _sponsors_request.append(_proposal_details)

        _sponsors_dict = {"data": _sponsors_request, "count": len(_sponsors_request)}

        return _sponsors_dict

    @external(readonly=True)
    def get_remaining_project(self, _project_type: str, _wallet_address: str) -> list:
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
                prefix = self.proposalPrefix(_ipfs_key)
                _voters_list = self.proposals[prefix].voters_list

                if _wallet_address not in _voters_list:
                    _proposal_details = self._getProposalDetails(_ipfs_key)
                    _remaining_proposals.append(_proposal_details)

            return _remaining_proposals

        if _project_type == "progress_report":
            for _report_key in self._waiting:
                prefix = self.progressReportPrefix(_report_key)
                _voters_list = self.progress_reports[prefix].voters_list

                if _wallet_address not in _voters_list:
                    _progress_reports_details = self._getProgressReportsDetails(_report_key)
                    _progress_reports_details = _progress_reports_details
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

        _proposal_details = self._getProposalDetails(_ipfs_key)
        prefix = self.proposalPrefix(_ipfs_key)

        _voters_list = self.proposals[prefix].voters_list
        _approved_voters_list = self.proposals[prefix].approve_voters
        _rejected_voters_list = self.proposals[prefix].reject_voters
        _vote_status = []

        approved_votes = 0
        rejected_votes = 0
        _approve_voters = 0
        _reject_voters = 0

        if not _voters_list:
            return {"data": _vote_status, "approve_voters": _approve_voters, "reject_voters": _reject_voters,
                    "total_voters": len(self.main_preps), "approved_votes": approved_votes,
                    "rejected_votes": rejected_votes,
                    "total_votes": 0}

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
                    "reject_voters": _proposal_details['reject_voters'], "total_voters": len(self.main_preps),
                    "approved_votes": _proposal_details['approved_votes'],
                    "rejected_votes": _proposal_details['rejected_voters'],
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
        _proposal_details = self._getProgressReportsDetails(_report_key)
        prefix = self.progressReportPrefix(_report_key)

        _voters_list = self.progress_reports[prefix].voters_list
        _approved_voters_list = self.progress_reports[prefix].approve_voters
        _rejected_voters_list = self.progress_reports[prefix].reject_voters
        _vote_status = []

        approved_votes = 0
        rejected_votes = 0
        _approve_voters = 0
        _reject_voters = 0

        if not _voters_list:
            return {"data": _vote_status, "approve_voters": _approve_voters, "reject_voters": _reject_voters,
                    "total_voters": len(self.main_preps), "approved_votes": approved_votes,
                    "rejected_votes": rejected_votes,
                    "total_votes": 0}

        for voters in _voters_list:
            if voters in _approved_voters_list:
                _voters = {self._ADDRESS: voters,
                           self._VOTE: self._APPROVE}
            else:
                _voters = {self._ADDRESS: voters,
                           self._VOTE: self._REJECT}
        return {"data": _vote_status, "approve_voters": _proposal_details['approve_voters'],
                "reject_voters": _proposal_details['reject_voters'], "total_voters": len(self.main_preps),
                "approved_votes": _proposal_details['approved_votes'],
                "rejected_votes": _proposal_details['rejected_voters'],
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

        _proposal_details = self._getProgressReportsDetails(_report_key)
        prefix = self.progressReportPrefix(_report_key)

        _voters_list = self.progress_reports[prefix].voters_list
        _approved_voters_list = self.progress_reports[prefix].budget_approve_voters
        _rejected_voters_list = self.progress_reports[prefix].budget_reject_voters
        _vote_status = []

        approved_votes = 0
        rejected_votes = 0
        _approve_voters = 0
        _reject_voters = 0

        for voters in _voters_list:
            if voters in _approved_voters_list:
                _voters = {self._ADDRESS: voters,
                           self._VOTE: self._YES}
            elif voters in _rejected_voters_list:
                _voters = {self._ADDRESS: voters,
                           self._VOTE: self._NO}
            else:
                _voters = {self._ADDRESS: voters,
                           self._VOTE: "not voted"}

            _vote_status.append(_voters)

        return {"data": _vote_status, "approve_voters": _approve_voters, "reject_voters": _reject_voters,
                "total_voters": len(self.main_preps), "approved_votes": approved_votes,
                "rejected_votes": rejected_votes,
                "total_votes": len(_voters_list)}

    @external(readonly=True)
    def get_projected_fund(self, _wallet_address: Address) -> dict:
        """
        Returns projected fund to be disburse on end of voting period
        :param _wallet_address: wallet address of a contributor or sponsor
        :return: dict of project fund records with total amount to be paid at end of the voting period
        """
        cps_treasury_score = self.create_interface_score(self.cps_treasury_score.get(), CPS_TREASURY_INTERFACE)
        if _wallet_address in self.contributors:
            return cps_treasury_score.get_contributor_projected_fund(_wallet_address)

        if _wallet_address in self.sponsors:
            return cps_treasury_score.get_sponsor_projected_fund(_wallet_address)

    @external
    def update_period(self):
        """
        Update Period after ending of the Allocated BlockTime for each period.
        :return:
        """
        if self.block_height <= self.next_block.get():
            revert(f"{self.address} : {CPS_Score.update_period.__name__} -> Current Block : "
                   f"{self.block_height}, Next Block : {self.next_block.get()}")

        self.set_PReps()
        if self.period_name.get() == APPLICATION_PERIOD:
            self.period_name.set(VOTING_PERIOD)
            self.next_block.set(self.next_block.get() + BLOCKS_COUNT)
            self.update_application_result()

        else:
            self.period_name.set(APPLICATION_PERIOD)
            self.next_block.set(self.next_block.get() + BLOCKS_COUNT)
            self.update_proposals_result()
            self.update_budget_adjustments()
            self.update_progress_report_result()
            self.check_progress_report_submission()
            self.update_denylist_preps()

    def update_application_result(self):
        for x in range(0, len(self._active)):
            if self._active[x] not in self.active_proposals:
                self.active_proposals.put(self._active[x])

        for x in range(0, len(self._paused)):
            if self._paused[x] not in self.active_proposals:
                self.active_proposals.put(self._paused[x])

    def update_proposals_result(self):
        """
        Calculate the votes and update the proposals status on the end of the voting period.
        :return:
        """
        _pending_proposals = self._pending[:]
        for proposal in range(0, len(_pending_proposals)):
            _proposal_details = self._getProposalDetails(_pending_proposals[proposal])
            prefix = self.proposalPrefix(_pending_proposals[proposal])

            _period_count = _proposal_details[self._PERIOD_COUNT]
            _title = _proposal_details[self._PROJECT_TITLE]
            _sponsor_address = _proposal_details[self._SPONSOR_ADDRESS]
            _contributor_address = _proposal_details[self._CONTRIBUTOR_ADDRESS]
            _total_budget = _proposal_details[self._TOTAL_BUDGET]
            _sponsor_deposit_amount = _proposal_details['sponsor_deposit_amount']
            _approve_voters = _proposal_details["approve_voters"]
            _approved_votes = _proposal_details["approved_votes"]
            _total_votes = _proposal_details["total_votes"]
            _total_voters = _proposal_details["total_voters"]

            _voters_list = self.proposals[prefix].voters_list

            _all_preps = self._getPrepsAddress()
            _not_voters = list(set(self.main_preps) - set(_voters_list))
            for x in _not_voters:
                if x not in self.inactive_preps:
                    self.inactive_preps.put(x)

            if _total_voters == 0 or _total_votes == 0:
                self._updateProposalStatus(_pending_proposals[proposal], self._REJECTED)

            elif _approve_voters / _total_voters >= MAJORITY and _approved_votes / _total_votes >= MAJORITY:
                self._updateProposalStatus(_pending_proposals[proposal], self._ACTIVE)
                self.sponsors.put(_sponsor_address)

                self.proposals[prefix].sponsor_deposit_status = "bond_approved"

                cpf_treasury_score = self.create_interface_score(self.cpf_score.get(), CPF_TREASURY_INTERFACE)
                cpf_treasury_score.transfer_proposal_fund_to_cps_treasury(_pending_proposals[proposal], _period_count,
                                                                          _title, _sponsor_address,
                                                                          _contributor_address,
                                                                          _total_budget)

            else:
                self._updateProposalStatus(_pending_proposals[proposal], self._REJECTED)

                self.proposals[prefix].sponsor_deposit_status = "bond_rejected"
                try:
                    self.icx.transfer(_sponsor_address, _sponsor_deposit_amount)
                    self.SponsorBondReturned(self.address, _sponsor_address,
                                             f'{_sponsor_deposit_amount // 10 ** 18} ICX returned to sponsor address.')
                except BaseException as e:
                    revert(f"{self.address} : {CPS_Score.update_proposals_result.__name__} -> Network problem. "
                           f"Sending proposal funds. {e}")

    def update_progress_report_result(self):
        """
        Calculate votes for the progress reports and update the status and get the Installment and Sponsor
        Reward is the progress report is accepted.
        :return:
        """
        _waiting_progress_reports = self._waiting[:]
        for reports in range(0, len(_waiting_progress_reports)):
            _reports = _waiting_progress_reports[reports]
            _report_result = self._getProgressReportsDetails(_reports)
            prefix = self.progressReportPrefix(_reports)

            _ipfs_hash = _report_result['ipfs_hash']
            proposalPrefix = self.proposalPrefix(_ipfs_hash)
            _proposal_details = self._getProposalDetails(_ipfs_hash)
            _proposal_status = _proposal_details[self._STATUS]
            _sponsor_address = _proposal_details[self._SPONSOR_ADDRESS]
            _completed = _proposal_details[self._PERCENTAGE_COMPLETED]

            _approve_voters = _report_result["approve_voters"]
            _reject_voters = _report_result["reject_voters"]
            _approved_votes = _report_result["approved_votes"]
            _rejected_votes = _report_result["rejected_votes"]
            _total_votes = _report_result["total_votes"]
            _total_voters = _report_result["total_voters"]

            _voters_list = self.progress_reports[prefix].voters_list

            _all_preps = self._getPrepsAddress()
            _not_voters = list(set(self.main_preps) - set(_voters_list))
            for x in _not_voters:
                if x not in self.inactive_preps:
                    self.inactive_preps.put(x)

            cps_treasury_score = self.create_interface_score(self.cps_treasury_score.get(), CPS_TREASURY_INTERFACE)
            cpf_treasury_score = self.create_interface_score(self.cpf_score.get(), CPF_TREASURY_INTERFACE)

            if _approve_voters / _total_voters >= MAJORITY and _approved_votes / _total_votes >= MAJORITY:
                self._updateProgressReportStatus(_reports, self._APPROVED)

                if _completed == '0x100':
                    self._updateProposalStatus(_ipfs_hash, self._COMPLETED)

                if _proposal_status == self._PAUSED:
                    self._updateProposalStatus(_ipfs_hash, self._ACTIVE)

                cps_treasury_score.send_installment_to_contributor(_ipfs_hash)
                cps_treasury_score.send_reward_to_sponsor(_ipfs_hash)

            elif _reject_voters / _total_voters >= MAJORITY and _rejected_votes / _total_votes >= MAJORITY:
                self._updateProgressReportStatus(_reports, self._REJECTED)

                if _proposal_status == self._ACTIVE:
                    self._updateProposalStatus(_ipfs_hash, self._PAUSED)

                elif _proposal_status == self._PAUSED:
                    self._updateProposalStatus(_ipfs_hash, self._DISQUALIFIED)
                    cps_treasury_score.disqualify_project(_ipfs_hash)

                    self._removeSponsor(_sponsor_address)

                    self.proposals[proposalPrefix].sponsor_deposit_status = "bond_cancelled"
                    _sponsor_deposit_amount = _proposal_details['sponsor_deposit_amount']
                    cpf_treasury_score.icx(_sponsor_deposit_amount).return_fund_amount()
                    self.SponsorBondReturned(self.address, self.cpf_score.get(),
                                             f'Project Disqualified. {_sponsor_deposit_amount // 10 ** 18} ICX '
                                             f'returned to CPF Treasury Address.')

            else:
                if _proposal_status == self._ACTIVE:
                    self._updateProposalStatus(_ipfs_hash, self._PAUSED)

                elif _proposal_status == self._PAUSED:
                    self._updateProposalStatus(_ipfs_hash, self._DISQUALIFIED)
                    cps_treasury_score.disqualify_project(_ipfs_hash)

                    self._removeSponsor(_sponsor_address)

                    self.proposals[proposalPrefix].sponsor_deposit_status = "bond_cancelled"
                    _sponsor_deposit_amount = _proposal_details['sponsor_deposit_amount']
                    cpf_treasury_score.icx(_sponsor_deposit_amount).return_fund_amount()
                    self.SponsorBondReturned(self.address, self.cpf_score.get(),
                                             f'Project Disqualified. {_sponsor_deposit_amount // 10 ** 18} ICX '
                                             f'returned to CPF Treasury Address.')

                self._updateProgressReportStatus(_reports, self._REJECTED)

    def check_progress_report_submission(self):
        """
        Check if all active and paused proposals submits the progress report
        :return:
        """
        cps_treasury_score = self.create_interface_score(self.cps_treasury_score.get(), CPS_TREASURY_INTERFACE)
        cpf_treasury_score = self.create_interface_score(self.cpf_score.get(), CPF_TREASURY_INTERFACE)

        for _ipfs_hash in self.active_proposals:
            proposalPrefix = self.proposalPrefix(_ipfs_hash)
            _proposal_details = self._getProposalDetails(_ipfs_hash)
            _proposal_status = _proposal_details[self._STATUS]
            _sponsor_address = _proposal_details[self._SPONSOR_ADDRESS]

            if _proposal_status == self._ACTIVE:
                self._updateProposalStatus(_ipfs_hash, self._PAUSED)

            elif _proposal_status == self._PAUSED:
                self._updateProposalStatus(_ipfs_hash, self._DISQUALIFIED)
                cps_treasury_score.disqualify_project(_ipfs_hash)

                self._removeSponsor(_sponsor_address)

                self.proposals[proposalPrefix].sponsor_deposit_status = "bond_cancelled"
                _sponsor_deposit_amount = _proposal_details['sponsor_deposit_amount']
                cpf_treasury_score.icx(_sponsor_deposit_amount).return_fund_amount()
                self.SponsorBondReturned(self.address, self.cpf_score.get(),
                                         f'Project Disqualified. {_sponsor_deposit_amount // 10 ** 18} ICX '
                                         f'returned to CPF Treasury Address.')

    def update_budget_adjustments(self):
        """
        Update the budget amount and added month time if the budget adjustment application is approved by majority.
        :return:
        """
        for budget in range(0, len(self.budget_approvals_list)):
            _budget_key = self.budget_approvals_list.pop()
            _report_result = self._getProgressReportsDetails(_budget_key)

            _report_hash = _report_result['report_hash']

            _vote_result = self.get_budget_adjustment_vote_result(_budget_key)
            _approve_voters = int(_vote_result["approve_voters"])
            _total_voters = int(_vote_result["total_voters"])
            _approved_votes = int(_vote_result["approved_votes"])
            _total_votes = int(_vote_result["total_votes"])

            if _approve_voters / _total_voters >= MAJORITY and _approved_votes / _total_votes >= MAJORITY:
                _ipfs_hash = _report_result['ipfs_hash']
                prefix = self.proposalPrefix(_ipfs_hash)
                _period_count = self.proposals[prefix].project_duration.get()
                _total_budget = self.proposals[prefix].total_budget.get()
                _additional_duration = _report_result[self._ADDITIONAL_DURATION]
                _additional_budget = _report_result[self._ADDITIONAL_BUDGET]

                self.proposals[prefix].project_duration.set(_period_count + _additional_duration)
                self.proposals[prefix].total_budget.set(_total_budget + _additional_budget)

                cpf_treasury_score = self.create_interface_score(self.cpf_score.get(), CPF_TREASURY_INTERFACE)
                cpf_treasury_score.update_proposal_fund(_ipfs_hash, _additional_budget, _additional_duration)

    def update_denylist_preps(self):
        """
        Add a Registered P-Rep to DenyList is they miss voting on the voting period.
        :return:
        """

        for x in range(0, len(self.inactive_preps)):
            _prep = self.inactive_preps.pop()
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

            self.PRepPenalty(Address.from_string(_prep), "P-Rep added to Denylist.")
