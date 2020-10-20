from iconservice import *
from .checkers import *

# ================================================
#  Consts
# ================================================
# TAG
TAG = 'CPS_Score'
# ICX Multiplier
_MULTIPLIER = 10 ** 18
# Period Interval Time
_BLOCKS_COUNT = 300
# SYSTEM SCORE Address
ZERO_SCORE_ADDRESS = Address.from_string('cx0000000000000000000000000000000000000000')

# BURN COIN ADDRESS
ZERO_WALLET_ADDRESS = Address.from_string('hx0000000000000000000000000000000000000000')


class InterfaceSystemScore(InterfaceScore):
    @interface
    def getPReps(self, start_ranking: int, end_ranking: int) -> list: pass

    @interface
    def getMainPReps(self) -> dict: pass

    @interface
    def getPRepTerm(self) -> dict: pass


class CPS_Score(IconScoreBase):
    PERIOD_TYPE = ["Application Period", "Voting Period"]

    _STATUS = "_status"
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

    _MAIN_PREPS = "_main_preps"
    _ALL_PREPS = "_all_preps"

    _PROJECT_TITLE = "_proposal_title"
    _BUDGET = "budget"
    _TOTALVOTES = "totalStaked"
    _TIMESTAMP = '_timestamp'
    _SPONSOR_ADDRESS = "_sponsor_address"
    _CONTRIBUTOR_ADDRESS = "_contributor_address"
    _TX_HASH = "_tx_hash"
    _IPFS_HASH = "_ipfs_hash"
    _IPFS_KEY = "_ipfs_key"

    _PROJECT_REPORT_TITLE = "_project_report_title"
    _ADJUSTMENT_AMOUNT = "_adjustment_amount"
    _REMAINING_TIME = "remaining_time"
    _BUDGET_APPROVALS_KEY_LIST = "budget_approvals_key_list"
    _BUDGET_APPROVALS_VOTERS = "budget_approvals_voters"

    _INITIAL_BLOCK = "_initial_block"
    _PERIOD_DETAILS = "_period_details"
    _PERIOD_NAME = "_period_name"
    _APPLICATION_PERIOD = "application_period"
    _VOTING_PERIOD = "voting_period"
    _LASTBLOCK = "last_block"
    _CURRENTBLOCK = "_current_block"
    _NEXTBLOCK = "_next_block"
    _ADMINS = "_admins"
    _PREPS_DENYLIST = "preps_denylist"

    _CONTRIBUTORS = "_contributors"
    _SPONSORS = "_sponsors"
    _VOTE_DETAILS = "vote_details"
    _VOTERS_DETAILS = "voters_details"
    _VOTERS_LIST = "voters_list"
    _REPORTS_VOTE_DETAILS = "reports_vote_details"
    _REPORTS_VOTERS_DETAILS = "reports_voters_details"
    _REPORTS_VOTERS_LIST = "reports_voters_list"
    _PROPOSALS_BY_HASH = "_proposals_by_hash"
    _PROPOSALS_DETAILS = "_proposal_details"
    _PROPOSALS_STATUS = "_proposal_status"
    _PROPOSALS_KEYS = "_proposal_keys"
    _PROPOSALS_KEY_LIST = '_proposals_key_list'
    _PROGRESS_KEY_LIST = '_progress_key_list'
    _PROGRESS_REPORT_DETAILS = "_progress_report_details"
    _PROGRESS_REPORT_KEYS = "_progress_report_keys"
    _BUDGET_VOTERS_LIST = "budget_voters_list"
    _REPORT_KEY = "_report_key"
    _SPONSOR_DEPOSIT = "sponsor_deposit"
    _DEPOSIT_AMOUNT = "deposit_amount"
    _APPROVE_VOTE = "approved"
    _REJECT_VOTE = "rejected"
    _ABSTAIN_VOTE = "abstained"
    _TOTAL_COUNT = "total_count"
    _APPROVE_COUNT = "approve_count"
    _REJECT_COUNT = "reject_count"
    _ABSTAIN_COUNT = "abstain_count"
    _VOTERS = "voters"
    _VOTE = "vote"
    _STAKE_WEIGHT = "stake_weight"
    _ADDRESS = "address"

    _TOTAL_STAKE = "total_stake"

    _PREP_DETAILS = "_prep_details"
    _ICON_SCORE = "_icon_score"
    _CPS_TREASURY_SCORE = "_cps_treasury_score"
    _CPF_SCORE = "_cpf_score"

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
    def PRepPenalty(self, _sender_address: str, _notes: str):
        pass

    def __init__(self, db: IconScoreDatabase) -> None:
        super().__init__(db)

        self._system_score = self.create_interface_score(ZERO_SCORE_ADDRESS, InterfaceSystemScore)

        self.initial_block = VarDB(self._INITIAL_BLOCK, db, value_type=int)
        self.total_stake = VarDB(self._TOTAL_STAKE, db, value_type=Address)
        self._cps_treasury_score = VarDB(self._CPS_TREASURY_SCORE, db, value_type=Address)
        self._cpf_score = VarDB(self._CPF_SCORE, db, value_type=Address)
        self.period_name = VarDB(self._PERIOD_NAME, db, value_type=str)
        self.next_block = VarDB(self._NEXTBLOCK, db, value_type=int)

        self.admins = ArrayDB(self._ADMINS, db, value_type=Address)
        self.contributors = ArrayDB(self._CONTRIBUTORS, db, value_type=Address)
        self.sponsors = ArrayDB(self._SPONSORS, db, value_type=Address)
        self.voters = ArrayDB(self._VOTERS, db, value_type=Address)
        self.preps_denylist = ArrayDB(self._PREPS_DENYLIST, db, value_type=Address)

        self._sponsor_pending = ArrayDB(self._SPONSOR_PENDING, db, value_type=str)
        self._pending = ArrayDB(self._PENDING, db, value_type=str)
        self._active = ArrayDB(self._ACTIVE, db, value_type=str)
        self._paused = ArrayDB(self._PAUSED, db, value_type=str)
        self._completed = ArrayDB(self._COMPLETED, db, value_type=str)
        self._rejected = ArrayDB(self._REJECTED, db, value_type=str)
        self._disqualified = ArrayDB(self._DISQUALIFIED, db, value_type=str)
        self._waiting = ArrayDB(self._WAITING, db, value_type=str)
        self._approved = ArrayDB(self._APPROVED, db, value_type=str)
        self._progress_rejected = ArrayDB(self._REJECTED, db, value_type=str)

        self.proposals_status = {self._SPONSOR_PENDING: self._sponsor_pending,
                                 self._PENDING: self._pending,
                                 self._ACTIVE: self._active,
                                 self._PAUSED: self._paused,
                                 self._COMPLETED: self._completed,
                                 self._REJECTED: self._rejected,
                                 self._DISQUALIFIED: self._disqualified}

        self.progress_report_status = {self._WAITING: self._waiting,
                                       self._APPROVED: self._approved,
                                       self._REJECTED: self._progress_rejected}

        self._main_preps = ArrayDB(self._MAIN_PREPS, db, value_type=str)
        self._all_preps = ArrayDB(self._ALL_PREPS, db, value_type=str)
        self._proposals_key_list = ArrayDB(self._PROPOSALS_KEY_LIST, db, value_type=str)
        self._progress_key_list = ArrayDB(self._PROGRESS_KEY_LIST, db, value_type=str)
        self.budget_approvals_key_list = ArrayDB(self._BUDGET_APPROVALS_KEY_LIST, db, value_type=str)
        self.proposals_txHash = ArrayDB(self._PROPOSALS_BY_HASH, db, value_type=str)

        self.prep_details = DictDB(self._PREP_DETAILS, db, value_type=str, depth=2)
        self.vote_details = DictDB(self._VOTE_DETAILS, db, value_type=int, depth=2)
        self.voters_list = DictDB(self._VOTERS_LIST, db, value_type=str, depth=2)
        self.voters_details = DictDB(self._VOTERS_DETAILS, db, value_type=str, depth=3)
        self.report_voters_details = DictDB(self._REPORTS_VOTERS_DETAILS, db, value_type=int, depth=2)
        self.report_voters_list = DictDB(self._REPORTS_VOTERS_LIST, db, value_type=str, depth=2)
        self.report_vote_details = DictDB(self._REPORTS_VOTE_DETAILS, db, value_type=str, depth=3)
        self.budget_voters_list = DictDB(self._BUDGET_VOTERS_LIST, db, value_type=str, depth=2)
        self.budget_approvals_voters = DictDB(self._BUDGET_APPROVALS_VOTERS, db, value_type=str, depth=3)
        self.sponsor_deposit = DictDB(self._SPONSOR_DEPOSIT, db, value_type=str, depth=2)
        self.progress_report_keys = DictDB(self._PROGRESS_REPORT_KEYS, db, value_type=str)
        self.proposal_details = DictDB(self._PROPOSALS_DETAILS, db, value_type=str, depth=2)
        self.progress_report_details = DictDB(self._PROGRESS_REPORT_DETAILS, db, value_type=str, depth=3)

    def on_install(self) -> None:
        super().on_install()

    def on_update(self) -> None:
        super().on_update()

    @external(readonly=True)
    def name(self) -> str:
        return "CPS_SCORE"

    def _prep_only(self) -> None:
        """
        Check for confirming if the sender is the owner of contract
        :return:
        """
        if str(self.msg.sender) not in self._all_preps:
            revert("Only a Top 100 P-Rep can call this method")

    @payable
    def fallback(self):
        revert('Payments can only be sent using _submitProposal method.')

    def check_period(self):
        if self.next_block.get() < self.block_height:
            revert("Update of period required.")

    @only_owner
    @external
    def set_cps_treasury_score(self, _score: Address) -> None:
        """
        Sets the cps treasury score address. Only owner can set the address.
        :param _score: Address of the cps treasury score address
        :type _score: :class:`iconservice.base.address.Address`
        :return:
        """
        self._cps_treasury_score.set(_score)

    @external(readonly=True)
    def get_cps_treasury_score(self) -> Address:
        """
        Returns the cps treasury score address
        :return: cps treasury score address
        :rtype: :class:`iconservice.base.address.Address`
        """
        return self._cps_treasury_score.get()

    @only_owner
    @external
    def set_cpf_score(self, _score: Address) -> None:
        """
        Sets the cps treasury score address. Only owner can set the address.
        :param _score: Address of the cps treasury score address
        :type _score: :class:`iconservice.base.address.Address`
        :return:
        """
        self._cpf_score.set(_score)

    @external(readonly=True)
    def get_cpf_score(self) -> Address:
        """
        Returns the cps treasury score address
        :return: cps treasury score address
        :rtype: :class:`iconservice.base.address.Address`
        """
        return self._cpf_score.get()

    @only_owner
    @external
    def set_PReps(self) -> None:
        """
        set the main P-Reps' addresses
        :return:
        """

        _prep_list = self.get_preps_address()

        for preps in self._all_preps:
            if str(preps) in _prep_list:
                self._main_preps.put(preps)

    @external
    def clear_all_preps(self, _address: str):
        self.prep_details[_address]["delegated"] = "0"

    @only_owner
    @external
    def add_PReps(self, _name: str, _address: str, _delegated: int = 0) -> None:
        """
        add P-Rep address with details
        :return:
        """
        if _address not in self._all_preps:
            self._all_preps.put(_address)

            self.prep_details[_address]["name"] = _name
            self.prep_details[_address]["delegated"] = str(_delegated)

    def get_preps_address(self) -> list:
        """
        Returns the all Main P-Reps and SubP-Reps details for the term
        :return: all Main P-Reps and SubP-Reps full details
        """
        _preps_list = []
        _all_preps = self._system_score.getPRepTerm()['preps']
        for _prep in range(0, len(_all_preps)):
            _preps_list.append(_all_preps[_prep]['address'])

        return _preps_list

    @external(readonly=True)
    def get_preps(self) -> list:
        """
        Returns the all P-Reps who can be active in this period
        :return: P-Rep address list
        """
        _preps = []
        for prep in self._all_preps:
            _preps.append({"name": self.prep_details[prep]["name"],
                           "address": prep,
                           "delegated": int(self.prep_details[prep]["delegated"])})
        return _preps

    @external(readonly=True)
    def _login_prep(self, _address: str) -> bool:
        """
        Checks the logged in user is P-Rep or not.
        :return : bool
        """

        if _address in self._all_preps:
            return True

        else:
            return False

    def get_stake(self, _address: str) -> int:
        """
        get the total stake weight of given address
        :param _address : P-Rep Address
        :return : total delegated amount (loop)
        """

        # _all_preps = self._system_score.getPRepTerm()['preps']
        # for _prep in range(0, len(_all_preps)):
        #     if _prep == _address:
        #         return int(_all_preps[_prep]['delegated'])

        for _prep in self._all_preps:
            if _prep == _address:
                return int(self.prep_details[_prep]['delegated'])

    @only_owner
    @external
    def _add_admin(self, _address: str):
        """
        Adds the admins
        :return :
        """
        _admin_list = self.admins

        if _address not in self.admins:
            self.admins.put(Address.from_string(_address))

    @external
    def unregister_prep(self) -> None:
        """
        Unregister a registered P-Rep from CPS.
        :return:
        """

        _address = str(self.msg.sender)

        if _address not in self._main_preps:
            revert("P-Rep is not registered yet.")

        _data_out = self._main_preps.pop()
        if _data_out != _address:
            for prep in range(0, len(self._main_preps)):
                if self._main_preps[prep] == _address:
                    self._main_preps[prep] = _data_out

    def prep_deny(self, _address: str) -> None:
        """
        Add a registered P-Rep to Denylist if they miss a voting.
        :param _address: Registered P-Rep address
        :type _address:str
        :return:
        """

        if _address not in self._main_preps:
            revert("P-Rep is not registered yet.")

        _data_out = self._main_preps.pop()
        if _data_out != _address:
            for prep in range(0, len(self._main_preps)):
                if self._main_preps[prep] == _address:
                    self._main_preps[prep] = _data_out

        self.preps_denylist.put(_address)
        self.PRepPenalty(_address, "P-Rep added to Denylist.")

    @only_owner
    @external
    def set_initialBlock(self, _block_height: int) -> None:
        """
        To set the initial block of application period to start (once only)
        :_block_height : the initial block to be set
        :return:
        """
        self.initial_block.set(_block_height)

        self.next_block.set(self.initial_block.get() + _BLOCKS_COUNT)
        self.period_name.set("Application Period")

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
                       self._PERIOD_NAME: self.period_name.get()}

        return period_dict

    @application_period
    @external
    @payable
    def _submitProposal(self, _title: str, _total_budget: int, sponsor_address: str, _ipfs_hash: str, _ipfs_key: str,
                        _ipfs_link: str) -> None:
        """
        User to Submit a proposal
        :param _title : Project Title
        :type _title : str
        :param _total_budget : Total Proposed Budget for the project
        :type _total_budget : int
        :param sponsor_address : Selected P-Rep address to 10% Sponsor bond for the project.
        :type sponsor_address : str
        :param _ipfs_hash : IPFS Hash for the submission
        :type _ipfs_hash : str
        :param _ipfs_key: IPFS Key for the Project
        :type _ipfs_key : str
        :param _ipfs_link : Link for retrieving the details submitted
        :type _ipfs_link : str
        """
        _contributor_address = self.msg.sender
        if _contributor_address.is_contract:
            revert("Contract Address not supported.")

        if sponsor_address not in self._all_preps:
            revert("Sponsor P-Rep not a Top 100 P-Rep.")

        if self.msg.value != 50 * _MULTIPLIER:
            revert("Deposit 50 ICX to submit a proposal.")
        _timestamp = self.now()
        _tx_hash = str(bytes.hex(self.tx.hash))

        if _ipfs_key not in self._proposals_key_list:
            self.proposals_txHash.put(_tx_hash)
            self._proposals_key_list.put(_ipfs_key)

            self.proposal_details[_ipfs_key][self._PROJECT_TITLE] = _title
            self.proposal_details[_ipfs_key][self._CONTRIBUTOR_ADDRESS] = str(_contributor_address)
            self.proposal_details[_ipfs_key][self._SPONSOR_ADDRESS] = sponsor_address
            self.proposal_details[_ipfs_key][self._BUDGET] = str(_total_budget)
            self.proposal_details[_ipfs_key][self._TIMESTAMP] = str(_timestamp)
            self.proposal_details[_ipfs_key][self._TX_HASH] = _tx_hash
            self.proposal_details[_ipfs_key][self._IPFS_HASH] = _ipfs_hash
            self.proposal_details[_ipfs_key][self._STATUS] = self._SPONSOR_PENDING

            self._sponsor_pending.put(_ipfs_key)

            if _contributor_address not in self.contributors:
                self.contributors.put(_contributor_address)

            self.ProposalSubmitted(_contributor_address, self.address, "Successfully submitted a Proposal.")
            self.icx.transfer(_contributor_address, self.msg.value)
            self.TokenBurn(_contributor_address, self.address, f"{self.msg.value} ICX transferred to burn.")

        else:
            revert("Hash already Exists")

    @application_period
    @external
    @payable
    def _submitProgressReport(self, _ipfs_hash: str, _ipfs_key: str, _report_key: str, _progress_report_title: str,
                              _ipfs_link: str, _budget_adjustment: bool, _adjustment_value: int = 0) -> None:
        """
        User to Submit a Progress report for the active proposal
        :param _ipfs_hash : IPFS Hash for the submission
        :type _ipfs_hash : str
        :param _ipfs_key: IPFS Key for the submission
        :type _ipfs_key : str
        :param _report_key: IPFS Key for the progress report submission
        :type _ipfs_key : str
        :param _ipfs_link : Link for retrieving the details submitted
        :type _ipfs_link : str
        :param _progress_report_title : Progress report title
        :type _progress_report_title : str
        :param _budget_adjustment : If there is any budget adjustment application is submitted or not
        :type _budget_adjustment : bool
        :param _adjustment_value : if any budget adjustment value is available
        :type _adjustment_value : int
        """

        _contributor_address = self.msg.sender
        if _contributor_address.is_contract:
            revert("Contract Address not supported.")

        _timestamp = self.now()
        _tx_hash = str(bytes.hex(self.tx.hash))

        if self.proposal_details[_ipfs_key][self._STATUS] == self._ACTIVE or \
                self.proposal_details[_ipfs_key][self._STATUS] == self._PAUSED:
            self.progress_report_details[_ipfs_key][_report_key][self._STATUS] = self._WAITING
            self.progress_report_details[_ipfs_key][_report_key][self._PROJECT_REPORT_TITLE] = _progress_report_title
            self.progress_report_details[_ipfs_key][_report_key][self._IPFS_HASH] = _ipfs_hash
            self.progress_report_details[_ipfs_key][_report_key][self._ADJUSTMENT_AMOUNT] = _adjustment_value
            self.progress_report_details[_ipfs_key][_report_key][self._TX_HASH] = _tx_hash
            self.progress_report_details[_ipfs_key][_report_key][self._TIMESTAMP] = str(_timestamp)

            self._waiting.put(_report_key)

            if _ipfs_key not in self._progress_key_list:
                self._progress_key_list.put(_ipfs_key)
            prev_ReportKey = self.progress_report_keys[_ipfs_key]
            self.progress_report_keys[_ipfs_key] = str(prev_ReportKey) + "," + _report_key

            if _adjustment_value != 0:
                if _report_key not in self.budget_approvals_key_list:
                    self.budget_approvals_key_list.put(_report_key)

            self.ProgressReportSubmitted(_contributor_address, self.address,
                                         f'{_progress_report_title} --> Progress Report Submitted Successfully.')

        else:
            revert("NO ACTIVE/PAUSED Project found for this Key.")

    @application_period
    @external
    @payable
    def _approve_sponsor(self, _ipfs_key: str) -> None:
        """
        Selected Sponsor P-Rep to approve the requested proposal for CPS
        :param _ipfs_key : proposal ipfs key
        :type _ipfs_key : str
        """
        _status = self.proposal_details[_ipfs_key][self._STATUS]
        _sponsor = self.proposal_details[_ipfs_key][self._SPONSOR_ADDRESS]

        if str(self.msg.sender) not in self._all_preps:
            revert("Not a P-Rep.")

        if str(self.msg.sender) != _sponsor:
            revert("Not a valid Sponsor.")

        if _status == self._SPONSOR_PENDING:
            _budget = self.proposal_details[_ipfs_key][self._BUDGET]

            if self.msg.value != (int(_budget) * _MULTIPLIER) / 10:
                revert("Deposit 10% of the total budget of the project.")

            self.proposal_details[_ipfs_key][self._STATUS] = self._PENDING
            self.proposal_details[_ipfs_key][self._TIMESTAMP] = str(self.now())

            _data_out = self.proposals_status[_status].pop()
            if _data_out != _ipfs_key:
                for p in range(len(self.proposals_status[_status])):
                    if self.proposals_status[_status][p] == _ipfs_key:
                        self.proposals_status[_status][p] = _data_out

            self._pending.put(_ipfs_key)
            if self.msg.sender not in self.sponsors:
                self.sponsors.put(self.msg.sender)

            self.sponsor_deposit[_ipfs_key][self._SPONSOR_ADDRESS] = str(self.msg.sender)
            self.sponsor_deposit[_ipfs_key][self._DEPOSIT_AMOUNT] = str(self.msg.value)
            self.sponsor_deposit[_ipfs_key][self._TIMESTAMP] = str(self.now())
            self.sponsor_deposit[_ipfs_key][self._CONTRIBUTOR_ADDRESS] = self.proposal_details[_ipfs_key][
                self._CONTRIBUTOR_ADDRESS]
            self.SponsorBondReceived(self.msg.sender, self.address, "Sponsor Bond Received.")

    @application_period
    @external
    def _reject_sponsor(self, _ipfs_key: str) -> None:
        """
        Selected Sponsor P-Rep to reject the requested proposal for CPS
        :param _ipfs_key : proposal ipfs key
        :type _ipfs_key : str
        """
        _status = self.proposal_details[_ipfs_key][self._STATUS]

        if _status == self._SPONSOR_PENDING:
            self.proposal_details[_ipfs_key][self._STATUS] = self._REJECTED
            self.proposal_details[_ipfs_key][self._TIMESTAMP] = str(self.now())

            _data_out = self.proposals_status[_status].pop()
            if _data_out != _ipfs_key:
                for p in range(len(self.proposals_status[_status])):
                    if self.proposals_status[_status][p] == _ipfs_key:
                        self.proposals_status[_status][p] = _data_out

            self._rejected.put(_ipfs_key)

    @voting_period
    @external
    def _vote_proposal(self, _ipfs_key: str, _vote: str, _vote_reason: str = "") -> None:
        """
        P-Rep(s) voting for a proposal to be approved or not
        :param _ipfs_key : proposal ipfs key
        :type _ipfs_key : str
        :param _vote: vote in [_approve,_reject,_abstain]
        :type _vote : str
        :param _vote_reason : Any specific reason behind the vote
        :type _vote_reason : str
        """
        self._prep_only()
        _sponsor = self.proposal_details[_ipfs_key][self._SPONSOR_ADDRESS]
        if str(self.msg.sender) == _sponsor:
            revert("Can't vote self sponsored proposal.")

        _status = self.proposal_details[_ipfs_key][self._STATUS]

        _voters_list = str(self.voters_list[_ipfs_key][self._VOTERS])
        _voters = _voters_list.split(",")

        if str(self.msg.sender) in _voters:
            revert("Can't Vote double.")

        if _status == self._PENDING:
            self.vote_details[_ipfs_key][self._TOTALVOTES] += self.get_stake(str(self.msg.sender))

            if self.voters_list[_ipfs_key][self._VOTERS] == "":
                self.voters_list[_ipfs_key][self._VOTERS] = str(self.msg.sender)
            else:
                self.voters_list[_ipfs_key][self._VOTERS] += "," + str(self.msg.sender)

            self.voters_details[_ipfs_key][str(self.msg.sender)][self._VOTE] = _vote
            self.voters_details[_ipfs_key][str(self.msg.sender)][self._STAKE_WEIGHT] = str(self.get_stake(
                str(self.msg.sender)))
            self.voters_details[_ipfs_key][str(self.msg.sender)][self._TIMESTAMP] = str(self.now())

    @voting_period
    @external
    def _vote_progress_report(self, _ipfs_key: str, _report_key: str, _vote: str, _budget_adjustment_vote: str = "",
                              _vote_reason: str = "", ) -> None:
        """
        P-Rep(s) voting for a progress report of all active proposals
        :param _ipfs_key : proposal ipfs key
        :type _ipfs_key : str
        :param _report_key : progress report ipfs key
        :type _report_key : str
        :param _vote : voting in [_approve,_reject]
        :type _vote : str
        :param _vote_reason : Any specific reason behind the vote
        :type _vote_reason : str
        """
        self._prep_only()
        _sponsor = self.proposal_details[_ipfs_key][self._SPONSOR_ADDRESS]
        if str(self.msg.sender) == _sponsor:
            revert("Can't vote your sponsored proposal.")

        _voters_list = str(self.report_voters_list[_report_key][self._VOTERS])
        _voters = _voters_list.split(",")

        if str(self.msg.sender) in _voters:
            revert("Can't Vote double.")

        if self.progress_report_details[_ipfs_key][_report_key][self._STATUS] == self._WAITING:
            self.report_voters_details[_report_key][self._TOTALVOTES] = self.get_stake(str(self.msg.sender))

            if self.report_voters_list[_report_key][self._VOTERS] == "":
                self.report_voters_list[_report_key][self._VOTERS] = str(self.msg.sender)
            else:
                self.report_voters_list[_report_key][self._VOTERS] += "," + str(self.msg.sender)

            self.report_vote_details[_report_key][str(self.msg.sender)][self._VOTE] = _vote
            self.report_vote_details[_report_key][str(self.msg.sender)][self._STAKE_WEIGHT] = str(self.get_stake(
                str(self.msg.sender)))
            self.report_vote_details[_report_key][str(self.msg.sender)][self._TIMESTAMP] = str(self.now())

            if _report_key in self.budget_approvals_key_list:
                if self.budget_voters_list[_report_key][self._VOTERS] == "":
                    self.budget_voters_list[_report_key][self._VOTERS] = str(self.msg.sender)
                else:
                    self.budget_voters_list[_report_key][self._VOTERS] += "," + str(self.msg.sender)
                self.budget_approvals_voters[_report_key][str(self.msg.sender)][self._VOTE] = _vote
                self.budget_approvals_voters[_report_key][str(self.msg.sender)][self._STAKE_WEIGHT] = str(
                    self.get_stake(
                        str(self.msg.sender)))
                self.budget_approvals_voters[_report_key][str(self.msg.sender)][self._TIMESTAMP] = str(self.now())

    @external(readonly=True)
    def get_progress_reports(self, _status: str, _address: str, _start_index: int = 0, _end_index: int = 20) -> dict:
        """
        Returns all the progress report submitted of given _status
        :param _status : status in ['_active','_waiting','_rejected']
        :type _status : str
        :param _address : address of logged user
        :type _address : str
        :param _start_index : first index
        :type _start_index : int
        :param _end_index : last index
        :type _end_index : int

        :return : Progress reports with details
        :rtype : dict
        """

        _progress_report_list = []
        _progress_keys = self._progress_key_list

        _active_len = len(self.progress_report_status[_status])
        if _start_index < 0:
            _start_index = 0
        if _end_index > _active_len:
            _end_index = _active_len

        for reports in range(_start_index, _end_index):
            stringKeys = str(self.progress_report_keys[_progress_keys[reports]])
            _report_key_list = stringKeys.split(',')
            for report in _report_key_list:
                if self.progress_report_details[_progress_keys[reports]][report][self._STATUS] == _status:
                    _progress_reports_details = {
                        self._STATUS: self.progress_report_details[_progress_keys[reports]][report][self._STATUS],
                        self._PROJECT_TITLE: self.proposal_details[_progress_keys[reports]][self._PROJECT_TITLE],
                        self._PROJECT_REPORT_TITLE: self.progress_report_details[_progress_keys[reports]][report][
                            self._PROJECT_REPORT_TITLE],
                        self._CONTRIBUTOR_ADDRESS: self.proposal_details[_progress_keys[reports]][
                            self._CONTRIBUTOR_ADDRESS],
                        self._TIMESTAMP: self.progress_report_details[_progress_keys[reports]][report][
                            self._TIMESTAMP],
                        self._IPFS_HASH: self.progress_report_details[_progress_keys[reports]][report][
                            self._IPFS_HASH],
                        self._REPORT_KEY: report,
                        self._IPFS_KEY: _progress_keys[reports]}
                    _progress_report_list.append(_progress_reports_details)

        progress_report_dict = {"data": _progress_report_list, "count": len(_progress_report_list)}
        return progress_report_dict

    @external(readonly=True)
    def get_progress_reports_by_proposal(self, _ipfs_key: str) -> dict:
        """
        Returns all the progress reports for a specific project
        :param _ipfs_key : project key
        :type _ipfs_key : str

        :return : List of all progress report with status
        :rtype : dict
        """

        _report_keys = str(self.progress_report_keys[_ipfs_key])
        _reports = _report_keys.split(",")
        _progress_reports = []

        for reports in _reports:
            _progress_report = {
                self._PROJECT_REPORT_TITLE: self.progress_report_details[_ipfs_key][reports][
                    self._PROJECT_REPORT_TITLE],
                self._STATUS: self.progress_report_details[_ipfs_key][reports][self._STATUS],
                self._TIMESTAMP: int(self.progress_report_details[_ipfs_key][reports][self._TIMESTAMP])}
            _progress_reports.append(_progress_report)

        return {"data": _progress_reports}

    @external(readonly=True)
    def get_proposal_details(self, _status: str, _wallet_address: str = "", _start_index: int = 0,
                             _end_index: int = 20) -> dict:
        """
        Returns a dict of proposals of provided status
        :param _status : status in ['_active','_pending','_rejected','_completed','_disqualified','_sponsor_pending']
        :type _status : str
        :param _wallet_address : user Signing in
        :type _wallet_address : str
        :param _start_index : first index
        :type _start_index : int
        :param _end_index : last index
        :type _end_index : int


        :return: List of all proposals_details
        """

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
            if self.proposal_details[_proposals_keys[_keys]][self._STATUS] == _status:
                if _status == self._SPONSOR_PENDING:
                    if _wallet_address == "":
                        return {"Message": "Enter wallet address."}
                    if self.proposal_details[_proposals_keys[_keys]][self._CONTRIBUTOR_ADDRESS] == _wallet_address:
                        _proposals_details = {
                            self._STATUS: self.proposal_details[_proposals_keys[_keys]][self._STATUS],
                            self._PROJECT_TITLE: self.proposal_details[_proposals_keys[_keys]][
                                self._PROJECT_TITLE],
                            self._CONTRIBUTOR_ADDRESS: self.proposal_details[_proposals_keys[_keys]][
                                self._CONTRIBUTOR_ADDRESS],
                            self._BUDGET: int(
                                self.proposal_details[_proposals_keys[_keys]][self._BUDGET]),
                            self._TIMESTAMP: int(
                                self.proposal_details[_proposals_keys[_keys]][self._TIMESTAMP]),
                            self._IPFS_HASH: self.proposal_details[_proposals_keys[_keys]][
                                self._IPFS_HASH],
                            self._IPFS_KEY: _proposals_keys[_keys]}
                        _proposals_list.append(_proposals_details)
                else:
                    _proposals_details = {
                        self._STATUS: self.proposal_details[_proposals_keys[_keys]][self._STATUS],
                        self._PROJECT_TITLE: self.proposal_details[_proposals_keys[_keys]][
                            self._PROJECT_TITLE],
                        self._CONTRIBUTOR_ADDRESS: self.proposal_details[_proposals_keys[_keys]][
                            self._CONTRIBUTOR_ADDRESS],
                        self._BUDGET: int(
                            self.proposal_details[_proposals_keys[_keys]][self._BUDGET]),
                        self._TIMESTAMP: int(
                            self.proposal_details[_proposals_keys[_keys]][self._TIMESTAMP]),
                        self._IPFS_HASH: self.proposal_details[_proposals_keys[_keys]][
                            self._IPFS_HASH],
                        self._IPFS_KEY: _proposals_keys[_keys]}
                    _proposals_list.append(_proposals_details)

        _proposals_dict_list = {"data": _proposals_list, "count": len(_proposals_list)}
        return _proposals_dict_list

    @external(readonly=True)
    def _get_active_proposals(self, _wallet_address: str) -> list:
        """
        Returns the list of all all active or paused proposal from that address
        :param _wallet_address : wallet address of the user
        :return: list
        """

        _proposal_titles = []
        _proposals_hashes = self._proposals_key_list

        for proposals in _proposals_hashes:
            if self.proposal_details[proposals][self._STATUS] == self._ACTIVE or \
                    self.proposal_details[proposals][self._STATUS] == self._PAUSED:
                if self.proposal_details[proposals][self._CONTRIBUTOR_ADDRESS] == _wallet_address:
                    _proposals_details = {self._PROJECT_TITLE: self.proposal_details[proposals][self._PROJECT_TITLE],
                                          self._IPFS_KEY: proposals}
                    _proposal_titles.append(_proposals_details)

        return _proposal_titles

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
    def get_sponsors(self) -> list:
        """
        Returns the list of all sponsors address who've accepted to sponsor the project
        :return: List of sponsors
        """

        _sponsors_list = []
        for address in self.sponsors:
            _sponsors_list.append(address)

        return _sponsors_list

    @external(readonly=True)
    def get_proposals_keys_by_status(self, _status: str) -> list:
        """
        Returns the numbers of proposal by status
        :return: count of proposal
        """
        if _status not in self.STATUS_TYPE:
            revert(f"Not a valid status.")

        _list = []

        for x in self.proposals_status[_status]:
            _list.append(x)

        return _list

    @external(readonly=True)
    def get_sponsors_requests(self, _status: str, _sponsor_address: str = "", _start_index: int = 0,
                              _end_index: int = 20) -> dict:
        """
        Returns all the address available in the contract either registered or unregistered
        :param _status : status in ['_active','_pending','_rejected','_completed','_disqualified','_sponsor_pending']
        :type _status : str
        :param _start_index: first index
        :param _end_index: last index
        :param _sponsor_address: user Signing in

        :return: List of all proposals_details
        :rtype: dict
        """

        _sponsors_request = []
        _proposals_keys = self.get_proposals_keys_by_status(_status)

        if _start_index < 0:
            _start_index = 0
        if _end_index - _start_index > 50:
            revert("Page length must not be greater than 50.")

        start = _end_index * _start_index
        count = len(_proposals_keys)

        if start > count:
            return {}

        end = _end_index * (_start_index + 1)
        _range = range(start, count if end > count else end)

        for _keys in _range:
            if self.proposal_details[_proposals_keys[_keys]][self._STATUS] == _status:
                if _status == self._SPONSOR_PENDING:
                    if _sponsor_address == "":
                        revert("Wallet address is required")

                    if self.proposal_details[_proposals_keys[_keys]][self._SPONSOR_ADDRESS] == _sponsor_address:
                        _proposals_details = {
                            self._STATUS: self.proposal_details[_proposals_keys[_keys]][self._STATUS],
                            self._PROJECT_TITLE: self.proposal_details[_proposals_keys[_keys]][
                                self._PROJECT_TITLE],
                            self._CONTRIBUTOR_ADDRESS: self.proposal_details[_proposals_keys[_keys]][
                                self._CONTRIBUTOR_ADDRESS],
                            self._BUDGET: int(
                                self.proposal_details[_proposals_keys[_keys]][self._BUDGET]),
                            self._TIMESTAMP: int(
                                self.proposal_details[_proposals_keys[_keys]][self._TIMESTAMP]),
                            self._IPFS_HASH: self.proposal_details[_proposals_keys[_keys]][
                                self._IPFS_HASH],
                            self._IPFS_KEY: _proposals_keys[_keys]}
                        _sponsors_request.append(_proposals_details)

                else:
                    _proposals_details = {
                        self._STATUS: self.proposal_details[_proposals_keys[_keys]][self._STATUS],
                        self._PROJECT_TITLE: self.proposal_details[_proposals_keys[_keys]][
                            self._PROJECT_TITLE],
                        self._CONTRIBUTOR_ADDRESS: self.proposal_details[_proposals_keys[_keys]][
                            self._CONTRIBUTOR_ADDRESS],
                        self._BUDGET: int(
                            self.proposal_details[_proposals_keys[_keys]][self._BUDGET]),
                        self._TIMESTAMP: int(
                            self.proposal_details[_proposals_keys[_keys]][self._TIMESTAMP]),
                        self._IPFS_HASH: self.proposal_details[_proposals_keys[_keys]][
                            self._IPFS_HASH],
                        self._IPFS_KEY: _proposals_keys[_keys]}
                    _sponsors_request.append(_proposals_details)

        _sponsors_dict = {"data": _sponsors_request, "count": len(_sponsors_request)}

        return _sponsors_dict

    @external(readonly=True)
    def get_vote_result(self, _ipfs_key: str) -> dict:
        """
        Get vote results by proposal
        :param _ipfs_key : proposal ipfs key
        :type _ipfs_key : str

        :return: Vote status of given _ipfs_key
        :rtype : dict
        """

        _voters_list = str(self.voters_list[_ipfs_key][self._VOTERS])
        _voters = _voters_list.split(",")
        _vote_status = []

        approved_votes = 0

        for voters in _voters:
            _voters = {self._ADDRESS: voters,
                       self._VOTE: self.voters_details[_ipfs_key][voters][self._VOTE],
                       self._TIMESTAMP: int(self.voters_details[_ipfs_key][voters][self._TIMESTAMP])}

            if self.voters_details[_ipfs_key][voters][self._VOTE] == "_approve":
                approved_votes += int(self.voters_details[_ipfs_key][voters][self._STAKE_WEIGHT])
            _vote_status.append(_voters)

        return {"data": _vote_status, "approved_votes": approved_votes,
                "total_votes": int(self.vote_details[_ipfs_key][self._TOTALVOTES]), "voters_count": len(_vote_status),
                "total_voters": len(self._main_preps)}

    @external(readonly=True)
    def get_progress_report_result(self, _report_key: str) -> dict:
        """
        Get vote results by proposal
        :param _report_key : progress report ipfs key
        :type _report_key : str

        :return: Vote status of given _report_key
        :rtype : dict
        """
        _voters_list = str(self.report_voters_list[_report_key][self._VOTERS])
        _voters = _voters_list.split(",")
        _vote_status = []

        approved_votes = 0

        for voters in _voters:
            _voters = {self._ADDRESS: voters,
                       self._VOTE: self.report_vote_details[_report_key][voters][self._VOTE],
                       self._TIMESTAMP: int(self.report_vote_details[_report_key][voters][self._TIMESTAMP])}

            if self.report_vote_details[_report_key][voters][self._VOTE] == "_approve":
                approved_votes += int(self.report_vote_details[_report_key][voters][self._STAKE_WEIGHT])
            _vote_status.append(_voters)

        return {"data": _vote_status, "approved_votes": approved_votes,
                "total_votes": self.report_voters_details[_report_key][self._TOTALVOTES],
                "voters_count": len(_vote_status), "total_voters": len(self._main_preps)}

    @external
    def update_period(self):
        if self.block_height <= self.next_block.get():
            revert(f"Current Block : {self.block_height}, Next Block : {self.next_block.get()}")

        if self.period_name.get() == "Application Period":
            self.period_name.set("Voting Period")
            self.next_block.set(self.next_block.get() + _BLOCKS_COUNT)

        else:
            self.period_name.set("Application Period")
            self.next_block.set(self.next_block.get() + _BLOCKS_COUNT)
            self.update_voting_result()

    def update_application_result(self):
        pass

    def update_voting_result(self):
        pass
