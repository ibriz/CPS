from iconservice import *

# ICX Multiplier
MULTIPLIER = 10 ** 18
TAG = "CPF_TREASURY"


class CPS_TREASURY_INTERFACE(InterfaceScore):
    @interface
    def deposit_proposal_fund(self, _proposals: TypedDict): pass

    @interface
    def update_proposal_fund(self, _ipfs_key: str, _added_budget: int, _added_sponsor_reward: int,
                             _total_installment_count: int): pass


class CPSScoreInterface(InterfaceScore):
    @interface
    def get_admins(self) -> list:
        pass


class DEX_INTERFACE(InterfaceScore):
    @interface
    def getPrice(self, _id: int) -> int: pass


class TokenInterface(InterfaceScore):
    @interface
    def transfer(self, _to: Address, _value: int, _data: bytes = None) -> None: pass

    @interface
    def decimals(self) -> int: pass

    @interface
    def balanceOf(self, _owner: Address) -> int: pass


class CPF_TREASURY(IconScoreBase):
    _PROPOSAL_BUDGETS = '_proposals_budgets'
    _PROPOSALS_KEYS = '_proposals_keys'

    _CPS_TREASURY_SCORE = "_cps_treasury_score"
    _CPS_SCORE = "_cps_score"

    TREASURY_FUND = "treasury_fund"
    _IPFS_HASH = "_ipfs_hash"
    _TOTAL_BUDGET = '_budget_transfer'

    @eventlog(indexed=1)
    def ProposalFundTransferred(self, _ipfs_key: str, note: str):
        pass

    @eventlog(indexed=1)
    def ProposalDisqualified(self, _ipfs_key: str, note: str):
        pass

    @eventlog(indexed=1)
    def FundReceived(self, _sender_address: Address, note: str):
        pass

    @eventlog(indexed=1)
    def FundReturned(self, _sponsor_address: Address, note: str):
        pass

    @eventlog(indexed=1)
    def FundBurned(self, note: str):
        pass

    def __init__(self, db: IconScoreDatabase) -> None:
        super().__init__(db)
        self._proposals_keys = ArrayDB(self._PROPOSALS_KEYS, db, value_type=str)
        self._proposal_budgets = DictDB(self._PROPOSAL_BUDGETS, db, value_type=int, depth=1)

        self.treasury_fund = VarDB(self.TREASURY_FUND, db, value_type=int)

        self._cps_treasury_score = VarDB(self._CPS_TREASURY_SCORE, db, value_type=Address)
        self._cps_score = VarDB(self._CPS_SCORE, db, value_type=Address)

        self.balanced_dollar = VarDB(self.BALANCED_DOLLAR, db, value_type=Address)
        self.dex_score = VarDB(self.DEX_SCORE, db, value_type=Address)
        self.staking_score = VarDB(self.STAKING_SCORE, db, value_type=Address)
        self.sicx_score = VarDB(self.SICX_SCORE, db, value_type=Address)

    def on_install(self, amount: int = 1_000_000 * MULTIPLIER) -> None:
        super().on_install()
        self.treasury_fund.set(amount)

    def on_update(self) -> None:
        super().on_update()

    @external(readonly=True)
    def name(self) -> str:
        return "CPF_TREASURY_SCORE"

    def _validate_owner(self):
        if self.msg.sender != self.owner:
            revert(f"{TAG} : Only owner can call this method.")

    def _validate_owner_score(self, _score: Address):
        self._validate_owner()
        if not _score.is_contract:
            revert(f"{TAG} : Target({_score}) is not SCORE.")

    def _validate_cps_score(self):
        if self.msg.sender != self._cps_score.get():
            revert(f"{TAG} : Only CPS({self._cps_score.get()}) SCORE can send fund using this method.")

    def _validate_cps_treasury_score(self):
        if self.msg.sender != self._cps_treasury_score.get():
            revert(
                f"{TAG} : Only CPS Treasury({self._cps_treasury_score.get()}) SCORE can send fund using this method.")

    @payable
    def fallback(self):
        revert(f"{TAG} : ICX can only be sent using add_fund() method.")

    @external
    def set_maximum_treasury_fund(self, _value: int) -> None:
        """
        Set the maximum Treasury fund. Default 1M ICX
        :param _value: Value in Loop
        :type _value : int
        :return:
        """
        self._validate_owner()
        self.treasury_fund.set(_value)

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
    def set_cps_treasury_score(self, _score: Address) -> None:
        """
        Sets the cps treasury score address. Only owner can set the address.
        :param _score: Address of the cps treasury score address
        :type _score: :class:`iconservice.base.address.Address`
        :return:
        """
        self._validate_owner_score(_score)
        self._cps_treasury_score.set(_score)

    @external(readonly=True)
    def get_cps_treasury_score(self) -> Address:
        """
        Returns the cps treasury score address
        :return: cps treasury score address
        :rtype: :class:`iconservice.base.address.Address`
        """
        return self._cps_treasury_score.get()

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

    @external
    def set_staking_score(self, _score: Address) -> None:
        """
        Sets the cps treasury score address. Only owner can set the address.
        :param _score: Address of the cps treasury score address
        :type _score: :class:`iconservice.base.address.Address`
        :return:
        """
        self._validate_owner_score(_score)
        self.staking_score.set(_score)

    @external
    def set_sicx_score(self, _score: Address) -> None:
        """
        Sets the cps treasury score address. Only owner can set the address.
        :param _score: Address of the cps treasury score address
        :type _score: :class:`iconservice.base.address.Address`
        :return:
        """
        self._validate_owner_score(_score)
        self.sicx_score.set(_score)

    @external
    def set_dex_score(self, _score: Address) -> None:
        """
        Sets the Balanced DEX score address. Only owner can set the address.
        :param _score: Address of the cps treasury score address
        :type _score: :class:`iconservice.base.address.Address`
        :return:
        """
        self._validate_owner_score(_score)
        self.dex_score.set(_score)

    @external(readonly=True)
    def get_dex_score(self) -> Address:
        """
        Returns the Balanced DEX Score Address
        :return: cps treasury score address
        :rtype: :class:`iconservice.base.address.Address`
        """
        return self.dex_score.get()

    @external(readonly=True)
    def get_bnusd_score(self) -> Address:
        """
        Returns the Balanced Dollars score address
        :return: cps treasury score address
        :rtype: :class:`iconservice.base.address.Address`
        """
        return self.balanced_dollar.get()

    @external(readonly=True)
    def get_staking_score(self) -> Address:
        """
        Returns the Staking score address
        :return: cps treasury score address
        :rtype: :class:`iconservice.base.address.Address`
        """
        return self.staking_score.get()

    @external(readonly=True)
    def get_sicx_score(self) -> Address:
        """
        Returns the sICX score address
        :return: cps treasury score address
        :rtype: :class:`iconservice.base.address.Address`
        """
        return self.sicx_score.get()

    def _burn(self, amount: int) -> None:
        """
        Burn ICX method
        :param amount: integer amount to burn
        :return: none
        """
        try:
            sys_interface = self.create_interface_score(SYSTEM_SCORE_ADDRESS, InterfaceSystemScore)
            sys_interface.icx(amount).burn()
        except Exception as e:
            revert(f"{TAG} : Network problem while Burning {amount} ICX. Exception: {e}.")

    @external(readonly=True)
    def get_total_funds(self) -> dict:
        """
        Get total amount of fund on the SCORE
        :return: integer value of amount
        """
        bnusd_score = self.create_interface_score(self.balanced_dollar.get(), TokenInterface)
        return {ICX: self.icx.get_balance(self.address),
                BNUSD: bnusd_score.balanceOf(self.address)}

    @external(readonly=True)
    def get_remaining_swap_amount(self) -> dict:
        """
        Get total amount of fund on the SCORE
        :return: integer value of amount
        """
        total_funds = self.get_total_funds()
        maxCap = self.treasury_fund_bnusd.get()
        return {'maxCap': maxCap,
                'remainingToSwap': maxCap - total_funds.get(BNUSD)}

    @external
    @payable
    def return_fund_amount(self, _address: Address, _from: Address = None, _flag: str = ICX, _value: int = 0) -> None:
        """
        After the Project is disqualified. The Sponsor bond deposit is transferred to CPF Treasury Fund.
        :param _from:
        :param _value:
        :param _flag: Token Name
        :param _address: Sponsor P-Rep Address
        :return: None
        """

        self._validate_cps_score(_from)
        self._burn_extra_fund()
        self.FundReturned(_address, "Sponsor Bond Returned to Treasury.")

    @external
    def transfer_proposal_fund_to_cps_treasury(self, _ipfs_key: str, _total_installment_count: int,
                                               _sponsor_address: Address, _contributor_address: Address,
                                               token_flag: str, _total_budget: int) -> None:
        """
        Sends the Allocated budget of a proposal after being passed from 2/3 of the  P-Rep to the CPF Treasury
        Score to a certain proposal key
        :param _ipfs_key: IPFS Hash key for the proposal
        :param _total_installment_count: Total Month count of the project
        :param _sponsor_address: Sponsor P-Rep Address
        :param _contributor_address: Contributor Address
        :param token_flag: Token Name
        :param _total_budget: Total Budget for the Project.
        :return:
        """

        self._validate_cps_score()
        ix = self._proposals_keys_index[_ipfs_key]
        if ix != 0:
            revert(f'{TAG}: Project already exists. Invalid IPFS Hash.')

        # Calculating sponsor reward for sponsor(2%) and total budget for contributor
        _sponsor_reward = _total_budget * 2 // 100
        total_transfer = _total_budget + _sponsor_reward

        bnusd_score = self.create_interface_score(self.balanced_dollar.get(), TokenInterface)

        balanceOf = bnusd_score.balanceOf(self.address)
        if balanceOf < total_transfer:
            revert(f"{TAG} : Not enough fund {balanceOf} in treasury.")

        if token_flag != BNUSD:
            revert(f'{TAG}: {token_flag} is not supported. Only {BNUSD} token available.')

        self._proposals_keys.put(_ipfs_key)
        self._proposals_keys_index[_ipfs_key] = len(self._proposals_keys)
        self._proposal_budgets[_ipfs_key] = total_transfer

        # Required Params for the deposit_proposal_fund method for CPS_Treasury Score
        params = {"method": "deposit_proposal_fund",
                  "params": {"ipfs_hash": _ipfs_key,
                             "project_duration": _total_installment_count,
                             "sponsor_address": str(_sponsor_address),
                             "contributor_address": str(_contributor_address),
                             "total_budget": _total_budget,
                             "sponsor_reward": _sponsor_reward,
                             "token": token_flag}}

        try:
            _data = json_dumps(params).encode("utf-8")
            bnusd_score.transfer(self._cps_treasury_score.get(), total_transfer, _data)

            self.ProposalFundTransferred(_ipfs_key, f"Successfully transferred {total_transfer} "
                                                    f"{token_flag} to CPF Treasury.")

        except BaseException as e:
            revert(f"{TAG} : Network problem. Sending proposal funds. {e}")

    @external
    def update_proposal_fund(self, _ipfs_key: str, _flag: str = ICX, _added_budget: int = 0,
                             _total_installment_count: int = 0) -> None:
        """
        Update the proposal fund after the budget adjustment voting is passed by majority of P-Reps
        :param _ipfs_key: Proposal IPFS Hash Key
        :param _added_budget: New added Budget
        :param _total_installment_count: Added Month Count
        :return:
        """

        self._validate_cps_score()

        # sponsor reward (2%)
        _sponsor_reward = _added_budget * 2 // 100
        total_transfer = _added_budget + _sponsor_reward

        if self._proposals_keys_index[_ipfs_key] == 0:
            revert(f"{TAG} : IPFS key doesn't exist")

        self._proposal_budgets[_ipfs_key] += total_transfer
        funds = self.get_total_funds()
        try:
            if _flag == ICX:
                if funds.get(ICX) < total_transfer:
                    revert(f"{TAG} : Not enough {total_transfer} ICX fund in treasury.")
                cps_treasury_score = self.create_interface_score(self._cps_treasury_score.get(),
                                                                 CPS_TREASURY_INTERFACE)
                cps_treasury_score.icx(total_transfer).update_proposal_fund(_ipfs_key, _added_budget,
                                                                            _sponsor_reward,
                                                                            _total_installment_count)
            elif _flag == BNUSD:
                if funds.get(BNUSD) < total_transfer:
                    revert(f'{TAG}: Not enough {total_transfer} BNUSD on treasury.')
                params = {"method": "budget_adjustment",
                          "params": {"_ipfs_key": _ipfs_key,
                                     "_added_budget": _added_budget,
                                     "_added_sponsor_reward": _sponsor_reward,
                                     "_added_installment_count": _total_installment_count}}
                _data = json_dumps(params).encode("utf-8")
                bnusd_score = self.create_interface_score(self.balanced_dollar.get(), TokenInterface)
                bnusd_score.transfer(self._cps_treasury_score.get(), total_transfer, _data)
            else:
                revert(f'{TAG}: {_flag} is not supported.')
            self.ProposalFundTransferred(_ipfs_key, f"Successfully transferred {total_transfer} to CPS Treasury")
        except BaseException as e:
            revert(f"{TAG} : Network problem. Sending proposal funds. {e}")

    @external
    @payable
    def disqualify_proposal_fund(self, _ipfs_key: str) -> None:
        """
        After being approved by the majority of the P-Rep votes, if the contributor failed to submit the progress
        report as their milestones, the project will be disqualified after being rejected the two progress reports.
        :param _ipfs_key: Proposal IPFS Hash
        :return:
        """
        self._validate_cps_treasury_score()

        if _ipfs_key in self._proposals_keys:
            _budget = self._proposal_budgets[_ipfs_key]
            self._proposal_budgets[_ipfs_key] = _budget - self.msg.value
            self._burn_extra_fund()

            self.ProposalDisqualified(_ipfs_key, f"Proposal disqualified. "
                                                 f"{self.msg.value} returned back to Treasury")
        else:
            revert(f"{TAG} : IPFS key doesn't exist")

    @external
    @payable
    def add_fund(self) -> None:
        """
        Add fund to the treasury Account
        :return:
        """
        self._burn_extra_fund()
        self.FundReceived(self.msg.sender, f"Treasury Fund {self.msg.value} Received.")

    def _burn_extra_fund(self):
        """
        Burning the extra amount above the maximum threshold of CPF
        :return:
        """
        amounts = self.get_total_funds()
        icx_amount = amounts.get(ICX)
        bnusd_amount = amounts.get(BNUSD)
        _extra_amount_icx = icx_amount - self.treasury_fund.get()
        if _extra_amount_icx > 0:
            self._burn(_extra_amount_icx)

        _extra_amount_bnusd = bnusd_amount - self.treasury_fund_bnusd.get()
        if _extra_amount_bnusd > 0:
            self._swap_tokens(self.get_bnusd_score(), self.get_sicx_score(), _extra_amount_bnusd)

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
            _proposal_detail = {self._TOTAL_BUDGET: self._proposal_budgets[_proposals_keys[_keys]],
                                self._IPFS_HASH: _proposals_keys[_keys]}
            _proposals_details_list.append(_proposal_detail)

        _proposals_dict_list = {"data": _proposals_details_list, "count": count}
        return _proposals_dict_list

    def _swap_tokens(self, _from: Address, _to: Address, _amount: int):
        from_score = self.create_interface_score(_from, TokenInterface)
        _data = json_dumps({"method": "_swap", "params": {"toToken": str(_to)}}).encode("utf-8")
        from_score.transfer(self.dex_score.get(), _amount, _data)

    @external
    def swap_tokens(self, _count: int) -> None:
        self._validate_cps_score()
        dex = self.create_interface_score(self.dex_score.get(), DEX_INTERFACE)
        sicx_score = self.create_interface_score(self.sicx_score.get(), TokenInterface)
        sicxBnusdPrice: int = dex.getPrice(2)
        bnUSDRemainingToSwap = self.get_remaining_swap_amount().get('remainingToSwap')
        sicxBalance = sicx_score.balanceOf(self.address)

        if bnUSDRemainingToSwap < 10 * 10 ** 18:
            self.swap_state.set(2)

        try:
            if self.swap_state.get() == 0:
                remainingSICXToSwap = (bnUSDRemainingToSwap // sicxBnusdPrice) * 10 ** 18 - sicxBalance
                self._swap_icx_sicx(dex, remainingSICXToSwap, sicxBalance)
                self.swap_state.set(1)
                self.swap_count.set(0)
            elif self.swap_state.get() == 1:
                count_swap = self.swap_count.get()
                remainingSICXToSwap = (bnUSDRemainingToSwap // (sicxBnusdPrice * (_count - count_swap))) * 10 ** 18

                self._swap_icx_sicx(dex, remainingSICXToSwap, sicxBalance)
                self._swap_tokens(self.get_sicx_score(), self.get_bnusd_score(), remainingSICXToSwap)
                self.swap_count.set(count_swap + 1)
        except Exception as e:
            revert(f'{TAG}: Error Swapping tokens. {e}')

    def _swap_icx_sicx(self, dex, remainingSICXToSwap, sicxBalance):
        sicxICXPrice: int = dex.getPrice(1)
        icxSicxBalance = (remainingSICXToSwap * 10 ** 18) // sicxICXPrice
        if self.icx.get_balance(self.address) < icxSicxBalance * 120 // 100:
            revert(f'{TAG}: Not enough ICX.')
        if sicxBalance < remainingSICXToSwap:
            self.icx.transfer(self.staking_score.get(), icxSicxBalance * 120 // 100)

    @external
    def reset_swap_state(self):
        self._validate_cps_score()
        self.swap_state.set(0)

    @external
    def tokenFallback(self, _from: Address, _value: int, _data: bytes):
        if _data != b'None':
            unpacked_data = json_loads(_data.decode('utf-8'))
        else:
            unpacked_data = {}

        bnusd = self.balanced_dollar.get()
        staking = self.sicx_score.get()
        if self.msg.sender not in [staking, bnusd]:
            revert(f'{TAG}: Only {bnusd} and sICX can send tokens to CPF Treasury.')

        if self.msg.sender == staking:
            if _from == self.get_dex_score():
                from_score = self.create_interface_score(self.msg.sender, TokenInterface)
                _data = json_dumps({"method": "_swap_icx"}).encode("utf-8")
                from_score.transfer(self.dex_score.get(), _value, _data)

        else:
            if _from == self._cps_score.get():
                if unpacked_data['method'] == 'return_fund_amount':
                    _sponsor_address = Address.from_string(unpacked_data['params']['sponsor_address'])
                    self.return_fund_amount(_sponsor_address, _from, BNUSD, _value)
                elif unpacked_data['method'] == 'burn_amount':
                    self._swap_tokens(self.msg.sender, self.get_sicx_score(), _value)
                else:
                    revert(f"{TAG}: Not supported method {unpacked_data['method']}")
            if _from == self._cps_treasury_score.get():
                if unpacked_data['method'] == 'disqualify_project':
                    ipfs_key = unpacked_data['params']['ipfs_key']
                    self.disqualify_proposal_fund(ipfs_key, _value, BNUSD, _from)
                else:
                    revert(f"{TAG}: Not supported method {unpacked_data['method']}")

    @payable
    def fallback(self):
        if self.msg.sender == self.dex_score.get():
            self._burn(self.msg.value)

        else:
            revert(f'{TAG}: Please send fund using add_fund().')

    @external
    def update_project_index(self):
        self._validate_admins()
        for _ix in range(0, len(self._proposals_keys)):
            _ipfs_hash = self._proposals_keys[_ix]
            self._proposals_keys_index[_ipfs_hash] = _ix + 1
