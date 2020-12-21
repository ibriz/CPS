from iconservice import *

_MULTIPLIER = 10 ** 18
ZERO_WALLET_ADDRESS = Address.from_string('hx0000000000000000000000000000000000000000')


class CPS_TREASURY_INTERFACE(InterfaceScore):
    @interface
    def deposit_proposal_fund(self, _ipfs_key: str, _total_installment_count: int, _sponsor_address: Address,
                              _contributor_address: Address, _total_budget: int): pass

    @interface
    def update_proposal_fund(self, _ipfs_key: str, _added_budget: int, _sponsor_reward: int,
                             _total_installment_count: int): pass


class CPF(IconScoreBase):
    _PROPOSALS_DETAILS = '_proposals_details'
    _PROPOSALS_KEYS = '_proposals_keys'

    _CPS_TREASURY_SCORE = "_cps_treasury_score"
    _CPS_SCORE = "_cps_score"

    TREASURY_FUND = "treasury_fund"

    _IPFS_KEY = "_ipfs_key"
    _TOTAL_INSTALLMENT_COUNT = "_total_installment_count"
    _TOTAL_BUDGET = '_total_budget'
    _SPONSOR_ADDRESS = '_sponsor_address'
    _SPONSOR_REWARD = '_sponsor_reward'
    _CONTRIBUTOR_ADDRESS = "_contributor_address"
    _STATUS = "_status"

    _ACTIVE = "active"
    _DISQUALIFIED = "disqualified"

    @eventlog(indexed=3)
    def ProposalFundTransferred(self, _ipfs_key: str, _total_budget: int, note: str):
        pass

    @eventlog(indexed=2)
    def ProposalDisqualified(self, _ipfs_key: str, note: str):
        pass

    @eventlog(indexed=3)
    def FundReceived(self, score_address: Address, _sender_address: Address, note: str):
        pass

    @eventlog(indexed=3)
    def FundReturned(self, score_address: Address, _sponsor_address: Address, note: str):
        pass

    @eventlog(indexed=2)
    def FundBurned(self, score_address: Address, note: str):
        pass

    def __init__(self, db: IconScoreDatabase) -> None:
        super().__init__(db)
        self._proposals_keys = ArrayDB(self._PROPOSALS_KEYS, db, value_type=str)
        self._proposals_details = DictDB(self._PROPOSALS_DETAILS, db, value_type=str, depth=2)

        self.treasury_fund = VarDB(self.TREASURY_FUND, db, value_type=int)

        self._cps_treasury_score = VarDB(self._CPS_TREASURY_SCORE, db, value_type=Address)
        self._cps_score = VarDB(self._CPS_SCORE, db, value_type=Address)

    def on_install(self) -> None:
        self.treasury_fund.set(1000000 * _MULTIPLIER)
        super().on_install()

    def on_update(self) -> None:
        super().on_update()

    @external(readonly=True)
    def name(self) -> str:
        return "CPF_TREASURY_SCORE"

    @external
    def set_maximum_treasury_fund(self, _value: int) -> None:
        """
        Set the maximum Treasury fund. Default 1M ICX
        :param _value: Value in ICX
        :type _value : int
        :return:
        """
        if self.msg.sender != self.owner:
            revert(f"{self.address} : Only owner can call this method.")
        self.treasury_fund.set(_value * _MULTIPLIER)

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
    def set_cps_treasury_score(self, _score: Address) -> None:
        """
        Sets the cps treasury score address. Only owner can set the address.
        :param _score: Address of the cps treasury score address
        :type _score: :class:`iconservice.base.address.Address`
        :return:
        """
        if self.msg.sender == self.owner and _score.is_contract:
            self._cps_treasury_score.set(_score)

    @external(readonly=True)
    def get_cps_treasury_score(self) -> Address:
        """
        Returns the cps treasury score address
        :return: cps treasury score address
        :rtype: :class:`iconservice.base.address.Address`
        """
        return self._cps_treasury_score.get()

    @external(readonly=True)
    def get_total_fund(self) -> int:
        return self.icx.get_balance(self.address)

    @external
    @payable
    def return_fund_amount(self, _address: Address) -> None:
        """
        After the Project is disqualified. The Sponsor bond deposit is transferred to CPF Treasury Fund.
        :param _address: Sponsor P-Rep Address
        :return: None
        """
        if self.icx.get_balance(self.address) > self.treasury_fund.get():
            _extra_amount = self.icx.get_balance(self.address) - self.treasury_fund.get()
            self.icx.transfer(ZERO_WALLET_ADDRESS, _extra_amount)
        self.FundReturned(self.address, _address, "Sponsor Bond Returned to Treasury.")

    @external
    def transfer_proposal_fund_to_cps_treasury(self, _ipfs_key: str, _total_installment_count: int,
                                               _sponsor_address: Address, _contributor_address: Address,
                                               _total_budget: int) -> None:
        """
        Sends the Allocated budget of a proposal after being passed from 2/3 of the  P-Rep to the CPF Treasury
        Score to a certain proposal key
        :param _ipfs_key: IPFS Hash key for the proposal
        :param _total_installment_count: Total Month count of the project
        :param _sponsor_address: Sponsor P-Rep Address
        :param _contributor_address: Contributor Address
        :param _total_budget: Total Budget for the Project.
        :return:
        """

        if self.msg.sender != self._cps_score.get():
            revert(f"{self.address} : Can't be called by other account. Only CPS Score can call this method.")

        _total_budget = _total_budget * _MULTIPLIER
        _sponsor_reward = _total_budget // 50
        total_transfer = _total_budget + _sponsor_reward

        if self.icx.get_balance(self.address) < total_transfer:
            revert('Not enough fund in treasury.')

        if _ipfs_key not in self._proposals_keys:
            self._proposals_keys.put(_ipfs_key)
            self._proposals_details[_ipfs_key][self._TOTAL_INSTALLMENT_COUNT] = str(_total_installment_count)
            self._proposals_details[_ipfs_key][self._SPONSOR_ADDRESS] = str(_sponsor_address)
            self._proposals_details[_ipfs_key][self._CONTRIBUTOR_ADDRESS] = str(_contributor_address)
            self._proposals_details[_ipfs_key][self._TOTAL_BUDGET] = str(_total_budget)
            self._proposals_details[_ipfs_key][self._SPONSOR_REWARD] = str(_sponsor_reward)
            self._proposals_details[_ipfs_key][self._STATUS] = self._ACTIVE

            try:
                cps_treasury_score = self.create_interface_score(self._cps_treasury_score.get(), CPS_TREASURY_INTERFACE)
                cps_treasury_score.icx(total_transfer).deposit_proposal_fund(_ipfs_key, _total_installment_count,
                                                                             _sponsor_address, _contributor_address,
                                                                             _total_budget)

                self.ProposalFundTransferred(_ipfs_key, _total_budget, f"Successfully transferred {total_transfer} ICX "
                                                                       f"to CPF Treasury.")
            except BaseException as e:
                revert(f"Network problem. Sending proposal funds. {e}")
        else:
            revert("IPFS key already Exists")

    @external
    def update_proposal_fund(self, _ipfs_key: str, _added_budget: int = 0, _total_installment_count: int = 0) -> None:
        """
        Update the proposal fund after the budget adjustment voting is passed by majority of P-Reps
        :param _ipfs_key: Proposal IPFS Hash Key
        :param _added_budget: New added Budget
        :param _total_installment_count: Added Month Count
        :return:
        """

        if self.msg.sender != self._cps_score.get():
            revert(f"{self.address} : Can't be called by other account. Only CPS Score can call this method. ")

        if self._proposals_details[_ipfs_key][self._STATUS] != self._ACTIVE:
            revert('The project isn\'t in active state')

        _total_added_budget = _added_budget * _MULTIPLIER
        _sponsor_reward = _total_added_budget // 50
        total_transfer = _total_added_budget + _sponsor_reward

        if self.icx.get_balance(self.address) < total_transfer:
            revert('Not enough fund in treasury.')

        if _ipfs_key in self._proposals_keys:
            self._proposals_details[_ipfs_key][self._TOTAL_BUDGET] = str(int(self._proposals_details[_ipfs_key][
                                                                                 self._TOTAL_BUDGET]) + _total_added_budget)
            self._proposals_details[_ipfs_key][self._TOTAL_INSTALLMENT_COUNT] = str(
                int(self._proposals_details[_ipfs_key][self._TOTAL_INSTALLMENT_COUNT]) + _total_installment_count)

            try:
                cps_treasury_score = self.create_interface_score(self._cps_treasury_score.get(), CPS_TREASURY_INTERFACE)
                cps_treasury_score.icx(total_transfer).update_proposal_fund(_ipfs_key, _total_added_budget,
                                                                            _sponsor_reward, _total_installment_count)
                self.ProposalFundTransferred(_ipfs_key, _added_budget, "ICX Successfully updated fund")
            except BaseException as e:
                revert(f"Network problem. Sending proposal funds. {e}")
        else:
            revert("IPFS key doesn't exist")

    @external
    @payable
    def disqualify_proposal_fund(self, _ipfs_key: str) -> None:
        """
        After being approved by the majority of the P-Rep votes, if the contributor failed to submit the progress
        report as their milestones, the project will be disqualified after being rejected the two progress reports.
        :param _ipfs_key: Proposal IPFS Hash
        :return:
        """
        if self.msg.sender != self._cps_treasury_score.get():
            revert(f"{self.address} : Can't be called by other account. Only CPS Treasury can send the fund. ")

        if _ipfs_key in self._proposals_keys:
            self._proposals_details[_ipfs_key][self._STATUS] = self._DISQUALIFIED
            _budget = int(self._proposals_details[_ipfs_key][self._TOTAL_BUDGET])
            self._proposals_details[_ipfs_key][self._TOTAL_BUDGET] = str(_budget - int(self.msg.value))

            self.ProposalDisqualified(_ipfs_key, "Proposal disqualified.")
        else:
            revert("IPFS key doesn't exist")

    @external(readonly=True)
    def get_proposals_details(self, _start_index: int = 0, _end_index: int = 20) -> dict:
        """
        Returns all Proposal fund records
        :return: List of all _proposals_details
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
                                self._CONTRIBUTOR_ADDRESS: self._proposals_details[_proposals_keys[_keys]][
                                    self._CONTRIBUTOR_ADDRESS],
                                self._SPONSOR_ADDRESS: self._proposals_details[_proposals_keys[_keys]][
                                    self._CONTRIBUTOR_ADDRESS],
                                self._TOTAL_BUDGET: self._proposals_details[_proposals_keys[_keys]][self._TOTAL_BUDGET],
                                self._TOTAL_INSTALLMENT_COUNT: self._proposals_details[_proposals_keys[_keys]][
                                    self._TOTAL_INSTALLMENT_COUNT],
                                self._SPONSOR_REWARD: self._proposals_details[_proposals_keys[_keys]][
                                    self._SPONSOR_REWARD],
                                self._IPFS_KEY: _proposals_keys[_keys]}
            _proposals_details_list.append(_proposal_detail)

        _proposals_dict_list = {"data": _proposals_details_list, "count": len(_proposals_details_list)}
        return _proposals_dict_list

    @external
    @payable
    def add_fund(self):
        """
        Add fund to the treasury Account
        :return:
        """
        current_balance = self.icx.get_balance(self.address)

        if current_balance > self.treasury_fund.get():
            _extra_amount = current_balance - self.treasury_fund.get()
            self.icx.transfer(ZERO_WALLET_ADDRESS, _extra_amount)
        self.FundReceived(self.address, self.msg.sender, f"Treasury Fund {self.msg.value} Received.")
