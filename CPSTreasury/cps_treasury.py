from iconservice import *

_MULTIPLIER = 10 ** 18


class CPF_TREASURY_INTERFACE(InterfaceScore):
    @interface
    def disqualify_proposal_fund(self, _ipfs_key: str):
        pass


class CPS_TREASURY(IconScoreBase):
    _PROPOSALS_KEYS = "_proposals_keys"
    _PROPOSALS_DETAILS = "_proposals_details"

    _TOTAL_INSTALLMENT_COUNT = "_total_installment_count"

    _TOTAL_TIMES_INSTALLMENT_PAID = "_total_times_installment_paid"
    _TOTAL_TIMES_REWARD_PAID = "_total_times_reward_paid"

    _CPS_SCORE = "_cps_score"
    _CPF_TREASURY_SCORE = "_cpf_treasury_score"

    _TOTAL_BUDGET = "_total_budget"
    _TOTAL_INSTALLMENT_PAID = "_total_installment_paid"
    _TOTAL_REWARD_PAID = "_total_reward_paid"
    _SPONSOR_ADDRESS = '_sponsor_address'
    _CONTRIBUTOR_ADDRESS = "_contributor_address"
    _STATUS = "_status"
    _IPFS_KEY = "_ipfs_key"
    _SPONSOR_REWARD = "_sponsor_reward"
    _INSTALLMENT_AMOUNT = "installment_amount"
    _PROPOSALS_AMOUNTS = "proposal_amounts"

    _ACTIVE = "active"
    _PAUSED = "paused"
    _DISQUALIFIED = "disqualified"

    @eventlog(indexed=3)
    def ProposalFundDeposited(self, _ipfs_key: str, _total_budget: int, note: str):
        pass

    @eventlog(indexed=3)
    def ProposalFundSent(self, _receiver_address: Address, _fund: int, note: str):
        pass

    @eventlog(indexed=2)
    def ProposalDisqualified(self, _ipfs_key: str, note: str):
        pass

    def __init__(self, db: IconScoreDatabase) -> None:
        super().__init__(db)
        self._proposals_keys = ArrayDB(self._PROPOSALS_KEYS, db, value_type=str)
        self._proposals_details = DictDB(self._PROPOSALS_DETAILS, db, value_type=str, depth=2)

        self._cpf_treasury_score = VarDB(self._CPF_TREASURY_SCORE, db, value_type=Address)
        self._cps_score = VarDB(self._CPS_SCORE, db, value_type=Address)

    def on_install(self) -> None:
        super().on_install()

    def on_update(self) -> None:
        super().on_update()

    @external(readonly=True)
    def name(self) -> str:
        """
        :return: SCORE Name
        :rtype: str
        """
        return "CPS_TREASURY_SCORE"

    @external
    def set_cps_score(self, _score: Address) -> None:
        """
        Sets the cps score address. Only owner can set the address.
        :param _score: Address of the cps score address
        :type _score: :class:`iconservice.base.address.Address`
        :return:
        """
        if self.msg.sender == self.owner and _score.is_contract:
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
        if self.msg.sender == self.owner and _score.is_contract:
            self._cpf_treasury_score.set(_score)

    @external(readonly=True)
    def get_cpf_treasury_score(self) -> Address:
        """
        Returns the cpf treasury score address
        :return: cpf treasury score address
        :rtype: :class:`iconservice.base.address.Address`
        """
        return self._cpf_treasury_score.get()

    @external(readonly=True)
    def get_contributor_projected_fund(self, _wallet_address: Address) -> dict:
        """
        Return the projected amount to be obtained on the end of voting period
        :param _wallet_address: wallet address of the contributor
        :return:
        """
        _total_amount_to_be_paid = 0
        _installment_amount = []
        for _ipfs_key in self._proposals_keys:
            if self._proposals_details[_ipfs_key][self._CONTRIBUTOR_ADDRESS] == str(_wallet_address):
                _total_installment = int(self._proposals_details[_ipfs_key][self._TOTAL_INSTALLMENT_COUNT])
                _total_paid_count = int(self._proposals_details[_ipfs_key][self._TOTAL_TIMES_INSTALLMENT_PAID])
                if _total_paid_count < _total_installment:
                    _total_budget = int(self._proposals_details[_ipfs_key][self._TOTAL_BUDGET])
                    _total_paid_amount = int(self._proposals_details[_ipfs_key][self._TOTAL_INSTALLMENT_PAID])

                    _installment_amount.append({self._TOTAL_BUDGET: _total_budget,
                                                self._TOTAL_INSTALLMENT_PAID: _total_paid_amount,
                                                self._TOTAL_TIMES_INSTALLMENT_PAID: _total_paid_count,
                                                self._INSTALLMENT_AMOUNT: _total_budget / _total_installment})
                    _total_amount_to_be_paid += _total_budget / _total_installment

        return {"data": _installment_amount,
                "project_count": len(_installment_amount),
                "total_amount": _total_amount_to_be_paid}

    @external(readonly=True)
    def get_sponsor_projected_fund(self, _wallet_address: Address) -> dict:
        """
        Return the projected sponsor reward to be obtained on the end of voting period
        :param _wallet_address: wallet address of the sponsor p-rep
        :return:
        """
        _total_amount_to_be_paid = 0
        _total_sponsor_bond = 0
        _installment_amount = []
        for _ipfs_key in self._proposals_keys:
            if self._proposals_details[_ipfs_key][self._SPONSOR_ADDRESS] == str(_wallet_address):
                _total_installment = int(self._proposals_details[_ipfs_key][self._TOTAL_INSTALLMENT_COUNT])
                _total_paid_count = int(self._proposals_details[_ipfs_key][self._TOTAL_TIMES_REWARD_PAID])
                if _total_paid_count < _total_installment:
                    _total_reward = int(self._proposals_details[_ipfs_key][self._SPONSOR_REWARD])
                    _total_paid_amount = int(self._proposals_details[_ipfs_key][self._TOTAL_REWARD_PAID])
                    _deposited_sponsor_bond = int(self._proposals_details[_ipfs_key][self._TOTAL_BUDGET]) // 10

                    _installment_amount.append({self._SPONSOR_REWARD: _total_reward,
                                                self._TOTAL_REWARD_PAID: _total_paid_amount,
                                                self._TOTAL_TIMES_REWARD_PAID: _total_paid_count,
                                                self._INSTALLMENT_AMOUNT: _total_reward / _total_installment})
                    _total_amount_to_be_paid += _total_reward / _total_installment
                    _total_sponsor_bond += _deposited_sponsor_bond

        return {"data": _installment_amount,
                "project_count": len(_installment_amount),
                "total_amount": _total_amount_to_be_paid,
                "total_sponsor_bond": _total_sponsor_bond}

    @external
    @payable
    def deposit_proposal_fund(self, _ipfs_key: str, _total_installment_count: int, _sponsor_address: Address,
                              _contributor_address: Address, _total_budget: int) -> None:
        """
        Treasury Score sending the amount to the CPS Treasury Score
        :param _ipfs_key: Proposal IPFS HASH key
        :param _total_installment_count: Total Duration month count
        :param _sponsor_address: Sponsor P-Rep Address
        :param _contributor_address: Contributor Address
        :param _total_budget: Total Budget for the project
        :type _total_budget: ICX Loop
        :return:
        """
        if self.msg.sender != self._cpf_treasury_score.get():
            revert(f"{self.address} : Can't be called by other account. Only CPF "
                   f"Treasury Score can send amount to this method. ")

        if _ipfs_key not in self._proposals_keys:
            self._proposals_keys.put(_ipfs_key)
            self._proposals_details[_ipfs_key][self._TOTAL_INSTALLMENT_COUNT] = str(_total_installment_count)
            self._proposals_details[_ipfs_key][self._TOTAL_BUDGET] = str(_total_budget)
            self._proposals_details[_ipfs_key][self._SPONSOR_REWARD] = str(self.msg.value - _total_budget)
            self._proposals_details[_ipfs_key][self._TOTAL_INSTALLMENT_PAID] = str(0)
            self._proposals_details[_ipfs_key][self._TOTAL_TIMES_INSTALLMENT_PAID] = str(0)
            self._proposals_details[_ipfs_key][self._TOTAL_TIMES_REWARD_PAID] = str(0)
            self._proposals_details[_ipfs_key][self._TOTAL_REWARD_PAID] = str(0)
            self._proposals_details[_ipfs_key][self._SPONSOR_ADDRESS] = str(_sponsor_address)
            self._proposals_details[_ipfs_key][self._CONTRIBUTOR_ADDRESS] = str(_contributor_address)
            self._proposals_details[_ipfs_key][self._STATUS] = self._ACTIVE

            self.ProposalFundDeposited(_ipfs_key, _total_budget, f"Received {self.msg.value} ICX fund from CPF.")
        else:
            revert("IPFS key already Exists")

    @external
    @payable
    def update_proposal_fund(self, _ipfs_key: str, _added_budget: int = 0, _added_installment_count: int = 0) -> None:
        """
        After the budget adjustment is successfully approved. The added budget will be transferred from CPF
        :param _ipfs_key: Proposal IPFS HASH key
        :param _added_budget: added budget
        :type _added_budget: int
        :param _added_installment_count: Added duration in month
        :type _added_installment_count: int
        :return:
        """
        if self.msg.sender != self._cpf_treasury_score.get():
            revert(f"{self.address} : Can't be called by other account. Only CPF "
                   f"Treasury Score can send amount to this method. ")
        if _ipfs_key in self._proposals_keys:
            if self._proposals_details[_ipfs_key][self._STATUS] == self._DISQUALIFIED:
                revert('The project has been disqualified.')

            self._proposals_details[_ipfs_key][self._TOTAL_BUDGET] = str(
                int(self._proposals_details[_ipfs_key][self._TOTAL_BUDGET]) + _added_budget)

            self._proposals_details[_ipfs_key][self._SPONSOR_REWARD] = str(
                int(self._proposals_details[_ipfs_key][self._SPONSOR_REWARD]) + int(self.msg.value) - _added_budget)

            self._proposals_details[_ipfs_key][self._TOTAL_INSTALLMENT_COUNT] = str(
                int(self._proposals_details[_ipfs_key][self._TOTAL_INSTALLMENT_COUNT]) + _added_installment_count
            )

            self.ProposalFundDeposited(_ipfs_key, _added_budget, f"{_ipfs_key} : Added Budget : "
                                                                 f"{_added_budget} Successfully")
        else:
            revert("IPFS key doesn't exist")

    @external
    def send_installment_to_contributor(self, _ipfs_key: str) -> None:
        """
        Installment of the Proposal is send to the contributor after the progress report is approved by majority
        registered P-Rep(s)
        :param _ipfs_key: Proposal IPFS HASH key
        :return:
        """
        if _ipfs_key in self._proposals_keys:
            contributor_address = self._proposals_details[_ipfs_key][self._CONTRIBUTOR_ADDRESS]
            _total_budget = int(self._proposals_details[_ipfs_key][self._TOTAL_BUDGET])
            _total_installment_paid = int(self._proposals_details[_ipfs_key][self._TOTAL_INSTALLMENT_PAID])
            _total_installment_count = int(self._proposals_details[_ipfs_key][self._TOTAL_INSTALLMENT_COUNT])
            _total_paid_count = int(self._proposals_details[_ipfs_key][self._TOTAL_TIMES_INSTALLMENT_PAID])
            try:
                amount = (_total_budget - _total_installment_paid) // (_total_installment_count - _total_paid_count)

                self._proposals_details[_ipfs_key][self._TOTAL_INSTALLMENT_PAID] = str(_total_installment_paid + amount)
                self._proposals_details[_ipfs_key][self._TOTAL_TIMES_INSTALLMENT_PAID] = str(_total_paid_count + 1)
                self.icx.transfer(Address.from_string(contributor_address), amount)

                self.ProposalFundSent(Address.from_string(contributor_address), amount,
                                      f"Installment No. {_total_paid_count + 1} transferred to contributor")
            except BaseException as e:
                revert(f'Network problem. Sending project funds. {e}')

    @external
    def send_reward_to_sponsor(self, _ipfs_key: str) -> None:
        """
        Installment of the Sponsor Reward is send to the Sponsor P-Rep after the Proposal's progress report is
        approved by majority registered P-Rep(s)
        :param _ipfs_key: Proposal IPFS HASH key
        :return:
        """
        if _ipfs_key in self._proposals_keys:
            try:
                sponsor_address = self._proposals_details[_ipfs_key][self._SPONSOR_ADDRESS]
                sponsor_reward = int(self._proposals_details[_ipfs_key][self._SPONSOR_REWARD])
                total_reward_paid = int(self._proposals_details[_ipfs_key][self._TOTAL_REWARD_PAID])
                _total_count = int(self._proposals_details[_ipfs_key][self._TOTAL_INSTALLMENT_COUNT])
                _total_paid_count = int(self._proposals_details[_ipfs_key][self._TOTAL_TIMES_REWARD_PAID])
                amount = (sponsor_reward - total_reward_paid) // (_total_count - _total_paid_count)

                self._proposals_details[_ipfs_key][self._TOTAL_REWARD_PAID] = str(total_reward_paid + amount)
                self._proposals_details[_ipfs_key][self._TOTAL_TIMES_REWARD_PAID] = str(_total_paid_count + 1)
                self.icx.transfer(Address.from_string(sponsor_address), amount)

                self.ProposalFundSent(Address.from_string(sponsor_address), amount,
                                      f"Sponsor Reward No. {_total_paid_count + 1} transferred to Sponsor.")
            except BaseException as e:
                revert(f'Network problem. Sending project funds. {e}')

    @external
    def disqualify_project(self, _ipfs_key: str) -> None:
        """
        In case, Contributor fails to pass the progress report twice in a row, the project get disqualified.
        The remaining amount of the project is sent back to the CPF.
        :param _ipfs_key: Proposal IPFS HASH key
        """

        if _ipfs_key in self._proposals_keys:
            self._proposals_details[_ipfs_key][self._STATUS] = self._DISQUALIFIED
            self._proposals_details[_ipfs_key][self._TOTAL_BUDGET] = self._proposals_details[_ipfs_key][
                self._TOTAL_INSTALLMENT_PAID]

            total_disqualified_budget = int(self._proposals_details[_ipfs_key][self._TOTAL_BUDGET]) - int(
                self._proposals_details[_ipfs_key][self._TOTAL_INSTALLMENT_PAID])
            total_disqualified_reward = int(self._proposals_details[_ipfs_key][self._SPONSOR_REWARD]) - int(
                self._proposals_details[_ipfs_key][self._TOTAL_REWARD_PAID])
            # return remaining fund amount to the CPF
            try:
                cpf_treasury_score = self.create_interface_score(self._cpf_treasury_score.get(), CPF_TREASURY_INTERFACE)
                cpf_treasury_score.icx(total_disqualified_budget + total_disqualified_reward).disqualify_proposal_fund(
                    _ipfs_key)

                self.ProposalDisqualified(_ipfs_key, "Proposal disqualified")
            except BaseException as e:
                revert(f"Network problem. Sending proposal funds. {e}")
        else:
            revert("IPFS key doesn't exist")

    @external(readonly=True)
    def get_proposals_details_list(self, _start_index: int = 0, _end_index: int = 20) -> dict:
        """
            Returns all proposal fund records
            :return: List of all project_funds_list
        """

        _proposals_details_list = []
        _proposals_keys = self._proposals_keys

        if _end_index - _start_index > 50:
            return {-1: "Page length must not be greater than 50."}
        if _start_index < 0:
            _start_index = 0
        count = len(_proposals_keys)

        _range = range(_start_index, count if _end_index > count else _end_index)

        for _keys in _range:
            _proposal_detail = {self._STATUS: self._proposals_details[_proposals_keys[_keys]][self._STATUS],
                                self._CONTRIBUTOR_ADDRESS: self._proposals_details[_keys][
                                    self._CONTRIBUTOR_ADDRESS],
                                self._TOTAL_BUDGET: self._proposals_details[_proposals_keys[_keys]][self._TOTAL_BUDGET],
                                self._SPONSOR_ADDRESS: self._proposals_details[_proposals_keys[_keys]][
                                    self._CONTRIBUTOR_ADDRESS],
                                self._TOTAL_INSTALLMENT_COUNT: self._proposals_details[_proposals_keys[_keys]][
                                    self._TOTAL_INSTALLMENT_COUNT],
                                self._TOTAL_TIMES_INSTALLMENT_PAID: self._proposals_details[_proposals_keys[_keys]][
                                    self._TOTAL_TIMES_INSTALLMENT_PAID],
                                self._SPONSOR_REWARD: self._proposals_details[_proposals_keys[_keys]][
                                    self._SPONSOR_REWARD],
                                self._TOTAL_INSTALLMENT_PAID: self._proposals_details[_proposals_keys[_keys]][
                                    self._TOTAL_INSTALLMENT_PAID],
                                self._IPFS_KEY: _proposals_keys[_keys]}
            _proposals_details_list.append(_proposal_detail)

        _proposals_dict_list = {"data": _proposals_details_list, "count": len(_proposals_details_list)}
        return _proposals_dict_list
