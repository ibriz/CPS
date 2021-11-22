from iconservice import *
from .proposal_data import *

PROPOSAL_DB_PREFIX = b'proposal'
TAG = "CPS_TREASURY"
ICX = "ICX"
bnUSD = "bnUSD"


class ProposalAttributes(TypedDict):
    ipfs_hash: str
    project_duration: int
    total_budget: int
    sponsor_reward: int
    token: str
    contributor_address: str
    sponsor_address: str


class CPF_TREASURY_INTERFACE(InterfaceScore):
    @interface
    def disqualify_proposal_fund(self, _ipfs_key: str):
        pass


class CPSScoreInterface(InterfaceScore):
    @interface
    def is_admin(self, _address: Address) -> bool:
        pass


class TokenInterface(InterfaceScore):
    @interface
    def transfer(self, _to: Address, _value: int, _data: bytes = None) -> None: pass


class CPS_TREASURY(IconScoreBase):
    ID = 'id'
    _PROPOSALS_KEYS = "_proposals_keys"
    PROPOSALS_KEY_LIST_INDEX = 'proposals_key_list_index'
    _FUND_RECORD = "fund_record"
    INSTALLMENT_FUND_RECORD = 'installment_fund_record'

    _TOTAL_INSTALLMENT_COUNT = "_total_installment_count"
    _TOTAL_TIMES_INSTALLMENT_PAID = "_total_times_installment_paid"
    _TOTAL_TIMES_REWARD_PAID = "_total_times_reward_paid"
    _TOTAL_INSTALLMENT_PAID = "_total_installment_paid"
    _TOTAL_REWARD_PAID = "_total_reward_paid"
    _INSTALLMENT_AMOUNT = "installment_amount"
    _SPONSOR_BOND_AMOUNT = "sponsor_bond_amount"

    _CPS_SCORE = "_cps_score"
    _CPF_TREASURY_SCORE = "_cpf_treasury_score"
    BALANCED_DOLLAR = 'balanced_dollar'

    _SPONSOR_ADDRESS = 'sponsor_address'
    _CONTRIBUTOR_ADDRESS = "contributor_address"
    _STATUS = "status"
    _IPFS_HASH = "ipfs_hash"
    _SPONSOR_REWARD = "sponsor_reward"
    _TOTAL_BUDGET = "total_budget"

    _ACTIVE = "active"
    _DISQUALIFIED = "disqualified"
    _COMPLETED = "completed"

    @eventlog(indexed=1)
    def ProposalFundDeposited(self, _ipfs_key: str, note: str):
        pass

    @eventlog(indexed=1)
    def ProposalFundSent(self, _receiver_address: Address, _fund: int, note: str):
        pass

    @eventlog(indexed=1)
    def ProposalFundWithdrawn(self, _receiver_address: Address, note: str):
        pass

    @eventlog(indexed=1)
    def ProposalDisqualified(self, _ipfs_key: str, note: str):
        pass

    def __init__(self, db: IconScoreDatabase) -> None:
        super().__init__(db)

        self.id = VarDB(self.ID, db, value_type=str)
        self.proposals = ProposalDataDB(db)

        self._proposals_keys = ArrayDB(self._PROPOSALS_KEYS, db, value_type=str)
        self.proposals_key_list_index = DictDB(self.PROPOSALS_KEY_LIST_INDEX, db, value_type=int)
        self._fund_record = DictDB(self._FUND_RECORD, db, value_type=int)
        self.installment_fund_record = DictDB(self.INSTALLMENT_FUND_RECORD, db, value_type=int, depth=2)

        self._cpf_treasury_score = VarDB(self._CPF_TREASURY_SCORE, db, value_type=Address)
        self._cps_score = VarDB(self._CPS_SCORE, db, value_type=Address)
        self.balanced_dollar = VarDB(self.BALANCED_DOLLAR, db, value_type=Address)

    def on_install(self) -> None:
        super().on_install()

    def on_update(self) -> None:
        super().on_update()

    def _proposal_exists(self, _ipfs_key: str) -> bool:
        return _ipfs_key in self.proposals_key_list_index

    @external(readonly=True)
    def name(self) -> str:
        """
        :return: SCORE Name
        :rtype: str
        """
        return TAG

    @payable
    def fallback(self):
        revert(f"{TAG} : ICX can only be sent by CPF Treasury Score.")

    def set_id(self, _val: str):
        self.id.set(_val)

    def get_id(self) -> str:
        return self.id.get()

    def proposal_prefix(self, _proposal_key: str) -> bytes:
        return b'|'.join([PROPOSAL_DB_PREFIX, self.id.get().encode(), _proposal_key.encode()])

    def _validate_admins(self):
        cps_score = self.create_interface_score(self._cps_score.get(), CPSScoreInterface)
        if not cps_score.is_admin(self.msg.sender):
            revert(f"{TAG} : Only Admins can call this method.")

    def _validate_owner(self):
        if self.msg.sender != self.owner:
            revert(f"{TAG} :Only owner can call this method.")

    def _validate_owner_score(self, _score: Address):
        self._validate_owner()
        if not _score.is_contract:
            revert(f"{TAG} :Target({_score}) is not SCORE.")

    def _validate_cps_score(self):
        if self.msg.sender != self._cps_score.get():
            revert(f"{TAG} :Only CPS({self._cps_score.get()}) SCORE can send fund using this method.")

    def _validate_cpf_treasury_score(self):
        if self.msg.sender != self._cpf_treasury_score.get():
            revert(
                f"{TAG} :Only CPF Treasury({self._cpf_treasury_score.get()}) SCORE can send fund using this method.")

    def _add_record(self, _proposal: ProposalAttributes) -> None:
        proposal_data_obj = createProposalDataObject(_proposal)
        ipfs_hash = proposal_data_obj.ipfs_hash
        if not self._proposal_exists(ipfs_hash):
            self._proposals_keys.put(ipfs_hash)
            prefix = self.proposal_prefix(ipfs_hash)
            addDataToProposalDB(prefix, self.proposals, proposal_data_obj)
            self.proposals_key_list_index[ipfs_hash] = len(self._proposals_keys) - 1

        else:
            revert(f"{TAG} : Already have this project.")

    def _get_projects(self, _proposal_key: str) -> dict:
        prefix = self.proposal_prefix(_proposal_key)
        _proposal_details = getDataFromProposalDB(prefix, self.proposals)
        return _proposal_details

    @external
    def set_cps_score(self, _score: Address) -> None:
        """
        Sets the cps score address. Only owner can set the address.
        :param _score: Address of the cps score address
        :type _score: :class:`iconservice.base.address.Address`
        :return:
        """
        self._validate_owner_score(_score)
        self._cps_score.set(_score)

    @external(readonly=True)
    def get_cps_score(self) -> Address:
        """
        Returns the cps score address
        :return: cps score address
        :rtype: :class:`iconservice.base.address.Address`
        """
        return self._cps_score.get()

    @external
    def set_cpf_treasury_score(self, _score: Address) -> None:
        """
        Sets the cpf treasury score address. Only owner can set the address.
        :param _score: Address of the cpf treasury score address
        :type _score: :class:`iconservice.base.address.Address`
        :return:
        """
        self._validate_owner_score(_score)
        self._cpf_treasury_score.set(_score)

    @external(readonly=True)
    def get_cpf_treasury_score(self) -> Address:
        """
        Returns the cpf treasury score address
        :return: cpf treasury score address
        :rtype: :class:`iconservice.base.address.Address`
        """
        return self._cpf_treasury_score.get()

    @external
    def set_bnUSD_score(self, _score: Address) -> None:
        """
        Sets the cps treasury score address. Only owner can set the address.
        :param _score: Address of the cps treasury score address
        :type _score: :class:`iconservice.base.address.Address`
        :return:
        """
        self._validate_owner_score(_score)
        self.balanced_dollar.set(_score)

    @external(readonly=True)
    def get_bnUSD_score(self) -> Address:
        """
        Returns the bnusd score address
        :return: bnusd score address
        :rtype: :class:`iconservice.base.address.Address`
        """
        return self.balanced_dollar.get()

    @external(readonly=True)
    def get_contributor_projected_fund(self, _wallet_address: Address) -> dict:
        """
        Return the projected amount to be obtained on the end of voting period
        :param _wallet_address: wallet address of the contributor
        :return:
        """
        _total_amount_to_be_paid_icx = 0
        _total_amount_to_be_paid_bnusd = 0
        project_details = []
        for _ipfs_key in self._proposals_keys:
            prefix = self.proposal_prefix(_ipfs_key)
            prefix_ = self.proposals[prefix]
            if prefix_.status.get() != self._DISQUALIFIED:
                if prefix_.contributor_address.get() == _wallet_address:
                    _total_installment = prefix_.project_duration.get()
                    _total_paid_count = _total_installment - prefix_.installment_count.get()
                    if _total_paid_count < _total_installment:
                        _flag = prefix_.token.get()
                        _total_budget = prefix_.total_budget.get()
                        _total_paid_amount = prefix_.withdraw_amount.get()

                        project_details.append({self._IPFS_HASH: _ipfs_key,
                                                self._TOTAL_BUDGET: f'{_total_budget} {_flag}',
                                                self._TOTAL_INSTALLMENT_PAID: f'{_total_paid_amount} {_flag}',
                                                self._TOTAL_INSTALLMENT_COUNT: _total_installment,
                                                self._TOTAL_TIMES_INSTALLMENT_PAID: _total_paid_count,
                                                self._INSTALLMENT_AMOUNT: f'{_total_budget // _total_installment} {_flag}'})
                        if _flag == ICX:
                            _total_amount_to_be_paid_icx += _total_budget // _total_installment
                        else:
                            _total_amount_to_be_paid_bnusd += _total_budget // _total_installment

        installment_fund_record = self.installment_fund_record[str(_wallet_address)]
        return {"data": project_details,
                "project_count": len(project_details),
                "total_amount": {ICX: _total_amount_to_be_paid_icx, bnUSD: _total_amount_to_be_paid_bnusd},
                "withdraw_amount_icx": installment_fund_record[ICX],
                "withdraw_amount_bnusd": installment_fund_record[bnUSD]}

    @external(readonly=True)
    def get_sponsor_projected_fund(self, _wallet_address: Address) -> dict:
        """
        Return the projected sponsor reward to be obtained on the end of voting period
        :param _wallet_address: wallet address of the sponsor p-rep
        :return:
        """
        _total_amount_to_be_paid_icx = 0
        _total_amount_to_be_paid_bnusd = 0
        _total_sponsor_bond_icx, _total_sponsor_bond_bnusd = 0, 0
        projects_details = []
        for _ipfs_key in self._proposals_keys:
            prefix = self.proposal_prefix(_ipfs_key)
            prefix_ = self.proposals[prefix]
            if prefix_.status.get() != self._DISQUALIFIED:
                if prefix_.sponsor_address.get() == _wallet_address:
                    _total_installment = prefix_.project_duration.get()
                    _total_paid_count = _total_installment - prefix_.sponsor_reward_count.get()
                    if _total_paid_count < _total_installment:
                        _flag = prefix_.token.get()
                        _total_budget = prefix_.sponsor_reward.get()
                        _total_paid_amount = prefix_.sponsor_withdraw_amount.get()
                        _deposited_sponsor_bond = prefix_.total_budget.get() // 10

                        projects_details.append({self._IPFS_HASH: _ipfs_key,
                                                 self._TOTAL_BUDGET: f'{_total_budget} {_flag}',
                                                 self._TOTAL_INSTALLMENT_PAID: f'{_total_paid_amount} {_flag}',
                                                 self._TOTAL_INSTALLMENT_COUNT: _total_installment,
                                                 self._TOTAL_TIMES_INSTALLMENT_PAID: _total_paid_count,
                                                 self._INSTALLMENT_AMOUNT: f'{_total_budget // _total_installment} {_flag}',
                                                 self._SPONSOR_BOND_AMOUNT: f'{_deposited_sponsor_bond} {_flag}'})
                        if _flag == ICX:
                            _total_amount_to_be_paid_icx += _total_budget // _total_installment
                            _total_sponsor_bond_icx += _deposited_sponsor_bond
                        else:
                            _total_amount_to_be_paid_bnusd += _total_budget // _total_installment
                            _total_sponsor_bond_bnusd += _deposited_sponsor_bond

        installment_fund_record = self.installment_fund_record[str(_wallet_address)]
        return {"data": projects_details,
                "project_count": len(projects_details),
                "total_amount": {ICX: _total_amount_to_be_paid_icx, bnUSD: _total_amount_to_be_paid_bnusd},
                "withdraw_amount_icx": installment_fund_record[ICX],
                "withdraw_amount_bnusd": installment_fund_record[bnUSD],
                "total_sponsor_bond": {ICX: _total_sponsor_bond_icx, bnUSD: _total_sponsor_bond_bnusd}}

    def _deposit_proposal_fund(self, _proposals: ProposalAttributes, _value: int = 0) -> None:
        """
        Treasury Score sending the amount to the CPS Treasury Score
        :ipfs_hash: Proposal IPFS HASH key
        :project_duration: Total Duration month count
        :sponsor_address: Sponsor P-Rep Address
        :contributor_address: Contributor Address
        :total_budget: Total Budget for the project (LOOP)
        :sponsor_reward: Reward for the Sponsor (Loop)
        """

        proposal_key = _proposals.copy()
        proposal_key[self._STATUS] = self._ACTIVE

        self._add_record(proposal_key)
        self.ProposalFundDeposited(proposal_key[self._IPFS_HASH],
                                   f"Received {proposal_key} {_value} {bnUSD} fund from CPF.")

    @external
    @payable
    def update_proposal_fund(self, _ipfs_key: str, _added_budget: int = 0, _added_sponsor_reward: int = 0,
                             _added_installment_count: int = 0) -> None:
        """
        After the budget adjustment is successfully approved. The added budget will be transferred from CPF
        :param _added_sponsor_reward: After budget adjustment, 2% of the total fund added for sponsor

        :param _ipfs_key: Proposal IPFS HASH key
        :param _added_budget: added budget
        :type _added_budget: int
        :param _added_installment_count: Added duration in month
        :type _added_installment_count: int
        :return:
        """

        if not self._proposal_exists(_ipfs_key):
            revert(f'{TAG}: Invalid IPFS Hash.')
        prefix = self.proposal_prefix(_ipfs_key)
        _proposal_prefix = self.proposals[prefix]
        _total_budget: int = _proposal_prefix.total_budget.get()
        _sponsor_reward: int = _proposal_prefix.sponsor_reward.get()
        _total_duration: int = _proposal_prefix.project_duration.get()
        _remaining_amount: int = _proposal_prefix.remaining_amount.get()
        _sponsor_remaining_amount: int = _proposal_prefix.sponsor_remaining_amount.get()
        installment_count: int = _proposal_prefix.installment_count.get()
        sponsor_reward_count: int = _proposal_prefix.sponsor_reward_count.get()
        flag = _proposal_prefix.token.get()

        _proposal_prefix.total_budget.set(_total_budget + _added_budget)
        _proposal_prefix.sponsor_reward.set(_sponsor_reward + _added_sponsor_reward)
        _proposal_prefix.project_duration.set(_total_duration + _added_installment_count)
        _proposal_prefix.remaining_amount.set(_remaining_amount + _added_budget)
        _proposal_prefix.sponsor_remaining_amount.set(_sponsor_remaining_amount + _added_sponsor_reward)
        _proposal_prefix.installment_count.set(installment_count + _added_installment_count)
        _proposal_prefix.sponsor_reward_count.set(sponsor_reward_count + _added_installment_count)

        self.ProposalFundDeposited(_ipfs_key, f"{_ipfs_key} : Added Budget : {_added_budget} {flag} and Added Time: "
                                              f"{_added_installment_count} Successfully")

    @external
    def send_installment_to_contributor(self, _ipfs_key: str) -> None:
        """
        Installment of the Proposal is send to the contributor after the progress report is approved by majority
        registered P-Rep(s)
        :param _ipfs_key: Proposal IPFS HASH key
        :return:
        """
        self._validate_cps_score()

        if not self._proposal_exists(_ipfs_key):
            revert(f'{TAG}: Invalid IPFS Hash.')

        prefix = self.proposal_prefix(_ipfs_key)
        proposal = self.proposals[prefix]

        _installment_count: int = proposal.installment_count.get()
        withdraw_amount: int = proposal.withdraw_amount.get()
        remaining_amount: int = proposal.remaining_amount.get()
        contributor_address: 'Address' = proposal.contributor_address.get()
        flag: str = proposal.token.get()  # ICX/BNUSD

        # Calculating Installment Amount and adding to Wallet Address
        try:
            if _installment_count == 1:
                _installment_amount = remaining_amount
            else:
                _installment_amount = remaining_amount // _installment_count
            new_installment_count = _installment_count - 1
            proposal.installment_count.set(new_installment_count)
            proposal.remaining_amount.set(remaining_amount - _installment_amount)
            proposal.withdraw_amount.set(withdraw_amount + _installment_amount)
            self.installment_fund_record[str(contributor_address)][flag] += _installment_amount

            self.ProposalFundSent(contributor_address, f"New installment {_installment_amount} {flag} sent to "
                                                       f"contributors address.")

            if new_installment_count == 0:
                proposal.status.set(self._COMPLETED)

        except Exception:
            revert(f'{TAG}: Network problem. Sending project funds to contributor.')

    @external
    def send_reward_to_sponsor(self, _ipfs_key: str) -> None:
        """
        Installment of the Sponsor Reward is send to the Sponsor P-Rep after the Proposal's progress report is
        approved by majority registered P-Rep(s)
        :param _ipfs_key: Proposal IPFS HASH key
        :return:
        """
        self._validate_cps_score()

        if not self._proposal_exists(_ipfs_key):
            revert(f'{TAG}: Invalid IPFS Hash.')

        prefix = self.proposal_prefix(_ipfs_key)
        proposals = self.proposals[prefix]

        _sponsor_reward_count: int = proposals.sponsor_reward_count.get()
        _sponsor_withdraw_amount: int = proposals.sponsor_withdraw_amount.get()
        _sponsor_remaining_amount: int = proposals.sponsor_remaining_amount.get()
        _sponsor_address: 'Address' = proposals.sponsor_address.get()
        flag: str = proposals.token.get()  # ICX/BNUSD

        # Calculating Installment Amount and adding to Wallet Address
        try:
            if _sponsor_reward_count == 1:
                _installment_amount = _sponsor_remaining_amount
            else:
                _installment_amount = _sponsor_remaining_amount // _sponsor_reward_count
            new_sponsor_reward_count = _sponsor_reward_count - 1
            proposals.sponsor_reward_count.set(new_sponsor_reward_count)
            proposals.sponsor_withdraw_amount.set(_sponsor_withdraw_amount + _installment_amount)
            proposals.sponsor_remaining_amount.set(_sponsor_remaining_amount - _installment_amount)
            self.installment_fund_record[str(_sponsor_address)][flag] += _installment_amount

            self.ProposalFundSent(_sponsor_address, f"New installment {_installment_amount} {flag} sent to "
                                                    f"sponsor address.")

            if new_sponsor_reward_count == 0:
                proposals.status.set(self._COMPLETED)
        except Exception:
            revert(f"{TAG} : Network problem. Sending project funds to sponsor.")

    @external
    def disqualify_project(self, _ipfs_key: str) -> None:
        """
        In case, Contributor fails to pass the progress report twice in a row, the project get disqualified.
        The remaining amount of the project is sent back to the CPF.
        :param _ipfs_key: Proposal IPFS HASH key
        """
        self._validate_cps_score()

        if not self._proposal_exists(_ipfs_key):
            revert(f'{TAG}: Project not found. Invalid IPFS Hash.')

        prefix = self.proposal_prefix(_ipfs_key)
        proposals = self.proposals[prefix]

        # Set Proposal status to disqualified
        proposals.status.set(self._DISQUALIFIED)

        _total_budget = proposals.total_budget.get()
        _withdraw_amount = proposals.withdraw_amount.get()
        _sponsor_reward = proposals.sponsor_reward.get()
        _sponsor_withdraw_amount = proposals.sponsor_withdraw_amount.get()
        token_flag = proposals.token.get()

        _remaining_budget = _total_budget - _withdraw_amount
        _remaining_reward = _sponsor_reward - _sponsor_withdraw_amount
        total_return_amount = _remaining_budget + _remaining_reward

        # return remaining fund amount to the CPF
        try:
            if token_flag == ICX:
                cpf_treasury_score = self.create_interface_score(self._cpf_treasury_score.get(),
                                                                 CPF_TREASURY_INTERFACE)
                cpf_treasury_score.icx(total_return_amount).disqualify_proposal_fund(_ipfs_key)
            elif token_flag == bnUSD:
                _data = json_dumps({"method": "disqualify_project",
                                    "params": {"ipfs_key": _ipfs_key}}).encode()
                bnusd_score = self.create_interface_score(self.balanced_dollar.get(), TokenInterface)
                bnusd_score.transfer(self._cpf_treasury_score.get(), total_return_amount, _data)

            else:
                revert(f'{TAG}: Not supported token.')

            self.ProposalDisqualified(_ipfs_key, f"{_ipfs_key}, Proposal disqualified")
        except Exception:
            revert(f"{TAG} : Network problem. Sending proposal funds to CPF after project disqualification.")

    @external
    def claim_reward(self) -> None:
        """
        Claim he reward or the installment amount
        """
        installment_fund_record = self.installment_fund_record[str(self.msg.sender)]
        _available_amount_icx = installment_fund_record[ICX]
        _available_amount_bnusd = installment_fund_record[bnUSD]
        if _available_amount_icx > 0:
            try:
                # set the remaining fund 0
                installment_fund_record[ICX] = 0

                self.icx.transfer(self.msg.sender, _available_amount_icx)
                self.ProposalFundWithdrawn(self.msg.sender,
                                           f"{_available_amount_icx} {ICX} withdrawn to {self.msg.sender}")
            except Exception:
                revert(f"{TAG} : Network problem while claiming Reward.")

        elif _available_amount_bnusd > 0:
            try:
                # set the remaining fund 0
                installment_fund_record[bnUSD] = 0

                bnusd_score = self.create_interface_score(self.balanced_dollar.get(), TokenInterface)
                bnusd_score.transfer(self.msg.sender, _available_amount_bnusd)
                self.ProposalFundWithdrawn(self.msg.sender,
                                           f"{_available_amount_bnusd} {bnUSD} withdrawn to {self.msg.sender}")
            except Exception as e:
                revert(f"{TAG} : Network problem while claiming Reward. {e}")

        else:
            revert(f"{TAG} :Claim Reward Fails. Available Amount(ICX) = {_available_amount_icx} and "
                   f"Available Amount (bnUSD): {_available_amount_bnusd}")

    @external
    def update_project_flag(self) -> None:
        self._validate_admins()
        for _ix in range(len(self._proposals_keys)):
            _ipfs_hash = self._proposals_keys[_ix]
            self.proposals_key_list_index[_ipfs_hash] = _ix
            proposalPrefix = self.proposal_prefix(_ipfs_hash)
            _prefix = self.proposals[proposalPrefix]
            _prefix.token.set(ICX)

            _address = _prefix.contributor_address.get()
            sp_address = _prefix.sponsor_address.get()
            if self.installment_fund_record[str(_address)][ICX] == 0:
                self.installment_fund_record[str(_address)][ICX] = self._fund_record[str(_address)]
                del self._fund_record[str(_address)]
            if self.installment_fund_record[str(sp_address)][ICX] == 0:
                self.installment_fund_record[str(sp_address)][ICX] = self._fund_record[str(sp_address)]
                del self._fund_record[str(sp_address)]

    @external
    def tokenFallback(self, _from: Address, _value: int, _data: bytes):
        if _from != self._cpf_treasury_score.get():
            revert(f'{TAG}: Only Receiving from {self._cpf_treasury_score.get()}, {_from}')

        unpacked_data = json_loads(_data.decode('utf-8'))
        method = unpacked_data["method"]

        if method == "deposit_proposal_fund":
            self._deposit_proposal_fund(unpacked_data["params"], _value)

        elif method == "budget_adjustment":
            _params = unpacked_data["params"]
            ipfs_key = _params['_ipfs_key']
            added_budget = _params['_added_budget']
            added_sponsor_reward = _params['_added_sponsor_reward']
            added_installment_count = _params['_added_installment_count']

            self.update_proposal_fund(ipfs_key, added_budget, added_sponsor_reward, added_installment_count)
        else:
            revert(f'{TAG}: {method} Not a valid method.')
