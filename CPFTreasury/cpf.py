from iconservice import *
from . import rlp
from .rlp import sedes

ZERO_WALLET_ADDRESS = Address.from_string('hx0000000000000000000000000000000000000000')


def icx(value: int) -> int:
    return value * 10 ** 18


class CPS_TREASURY_INTERFACE(InterfaceScore):
    @interface
    def deposit_proposal_fund(self, _ipfs_key: str, _total_installment_count: int, _sponsor_address: Address,
                              _contributor_address: Address, _total_budget: int): pass

    @interface
    def update_proposal_fund(self, _ipfs_key: str, _added_budget: int, _sponsor_reward: int,
                             _total_installment_count: int): pass


class Proposal(object):
    _FIELDS = (int, int, int, Address, Address, str)
    _TOTAL_INSTALLMENT_COUNT = 0
    _TOTAL_BUDGET = 1
    _SPONSOR_REWARD = 2
    _SPONSOR = 3
    _CONTRIBUTOR = 4
    _STATUS = 5

    def __init__(self,
                 ipfs_key: str,
                 total_installment_count: int,
                 total_budget: int,
                 sponsor_reward: int,
                 sponsor: Address,
                 contributor: Address,
                 status: str):
        self._ipfs_key = ipfs_key
        self.total_installment_count = total_installment_count
        self.total_budget = total_budget
        self.sponsor_reward = sponsor_reward
        self._sponsor = sponsor
        self._contributor = contributor
        self.status = status

    @property
    def ipfs_key(self) -> str:
        return self._ipfs_key

    @property
    def sponsor(self) -> Address:
        return self._sponsor

    @property
    def contributor(self) -> Address:
        return self._contributor

    def _to_tuple(self):
        return (
            self.total_installment_count,
            self.total_budget,
            self.sponsor_reward,
            self._sponsor,
            self._contributor,
            self.status
        )

    def to_dict(self):
        return {
            "status": self.status,
            "contributor": self._contributor,
            "sponsor": self._sponsor,
            "totalBudget": self.total_budget,
            "totalInstallmentCount": self.total_installment_count,
            "sponsorReward": self.sponsor_reward,
            "ipfsKey": self._ipfs_key,
        }

    @classmethod
    def from_bytes(cls, ipfs_key: str, data: bytes) -> 'Proposal':
        """Create a proposal from rlp-encoded data

        :param ipfs_key:
        :param data: rlp-encoded data
        :return:
        """

        ret = rlp.decode(data, sedes.List(cls._FIELDS))
        return cls(
            ipfs_key=ipfs_key,
            total_installment_count=ret[cls._TOTAL_INSTALLMENT_COUNT],
            total_budget=ret[cls._TOTAL_BUDGET],
            sponsor_reward=ret[cls._SPONSOR_REWARD],
            sponsor=ret[cls._SPONSOR],
            contributor=ret[cls._CONTRIBUTOR],
            status=ret[cls._STATUS],
        )

    def to_bytes(self) -> bytes:
        return rlp.encode(self._to_tuple())


class CPF(IconScoreBase):
    _PROPOSALS_KEYS = '_proposals_keys'
    _PROPOSALS = 'proposals'

    _CPS_TREASURY_SCORE = "_cps_treasury_score"
    _CPS_SCORE = "_cps_score"

    TREASURY_FUND = "treasury_fund"

    _ACTIVE = "active"
    _DISQUALIFIED = "disqualified"

    @eventlog(indexed=1)
    def ProposalFundTransferred(self, _ipfs_key: str, _total_budget: int, note: str):
        pass

    @eventlog(indexed=1)
    def ProposalDisqualified(self, _ipfs_key: str, note: str):
        pass

    @eventlog(indexed=1)
    def FundReceived(self, _sender_address: Address, amount: int, note: str):
        pass

    @eventlog(indexed=1)
    def FundReturned(self, _sponsor_address: Address, amount: int, note: str):
        pass

    @eventlog
    def FundBurned(self, note: str):
        pass

    def __init__(self, db: IconScoreDatabase) -> None:
        super().__init__(db)
        self._proposals_keys = ArrayDB(self._PROPOSALS_KEYS, db, value_type=str)
        self._proposals = DictDB(self._PROPOSALS, db, value_type=bytes)

        self.treasury_fund = VarDB(self.TREASURY_FUND, db, value_type=int)

        self._cps_treasury_score = VarDB(self._CPS_TREASURY_SCORE, db, value_type=Address)
        self._cps_score = VarDB(self._CPS_SCORE, db, value_type=Address)

    def on_install(self) -> None:
        super().on_install()
        self.treasury_fund.set(icx(1000000))

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
        self.treasury_fund.set(icx(_value))

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
        # TODO: self.msg.sender checking is needed: sponsor? owner? cps_score?
        extra_amount = self.icx.get_balance(self.address) - self.treasury_fund.get()
        if extra_amount > 0:
            self._burn(extra_amount)

        self.FundReturned(_address, self.msg.value, "Sponsor Bond Returned to Treasury.")

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

        _total_budget = icx(_total_budget)
        _sponsor_reward = _total_budget // 50
        total_transfer = _total_budget + _sponsor_reward

        if self.icx.get_balance(self.address) < total_transfer:
            revert('Not enough fund in treasury.')

        if _ipfs_key not in self._proposals:
            proposal = Proposal(
                ipfs_key=_ipfs_key,
                total_installment_count=_total_installment_count,
                total_budget=_total_budget,
                sponsor_reward=_sponsor_reward,
                sponsor=_sponsor_address,
                contributor=_contributor_address,
                status=self._ACTIVE
            )
            self._proposals[_ipfs_key] = proposal.to_bytes()
            self._proposals_keys.put(_ipfs_key)

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

        data: bytes = self._proposals[_ipfs_key]
        if data is None:
            revert("IPFS key doesn't exist")

        proposal = Proposal.from_bytes(_ipfs_key, data)
        if proposal.status != self._ACTIVE:
            revert('The project isn\'t in active state')

        _total_added_budget = icx(_added_budget)
        _sponsor_reward = _total_added_budget // 50
        total_transfer = _total_added_budget + _sponsor_reward

        if self.icx.get_balance(self.address) < total_transfer:
            revert('Not enough fund in treasury.')

        proposal.total_budget += _total_added_budget
        proposal.total_installment_count += _total_installment_count
        proposal.sponsor_reward += _sponsor_reward
        self._proposals[_ipfs_key] = proposal.to_bytes()

        try:
            cps_treasury_score = self.create_interface_score(self._cps_treasury_score.get(), CPS_TREASURY_INTERFACE)
            cps_treasury_score.icx(total_transfer).update_proposal_fund(_ipfs_key, _total_added_budget,
                                                                        _sponsor_reward, _total_installment_count)
            self.ProposalFundTransferred(_ipfs_key, _added_budget, "ICX Successfully updated fund")
        except BaseException as e:
            revert(f"Network problem. Sending proposal funds. {e}")

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

        data = self._proposals[_ipfs_key]
        if data is None:
            revert("IPFS key doesn't exist")

        proposal = Proposal.from_bytes(_ipfs_key, data)
        proposal.status = self._DISQUALIFIED
        proposal.total_budget -= self.msg.value

        self._proposals[_ipfs_key] = proposal.to_bytes()
        self.ProposalDisqualified(_ipfs_key, "Proposal disqualified.")

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

        for i in _range:
            ipfs_key = _proposals_keys[i]
            proposal = Proposal.from_bytes(ipfs_key, self._proposals[ipfs_key])
            _proposals_details_list.append(proposal.to_dict())

        return {
            "data": _proposals_details_list,
            "count": len(_proposals_details_list)
        }

    @external
    @payable
    def add_fund(self):
        """
        Add fund to the treasury Account
        :return:
        """
        extra_amount = self.icx.get_balance(self.address) - self.treasury_fund.get()
        if extra_amount > 0:
            self._burn(extra_amount)

        self.FundReceived(self.msg.sender, self.msg.value, f"Treasury Fund {self.msg.value} Received.")

    def _burn(self, amount: int):
        self.icx.transfer(ZERO_WALLET_ADDRESS, amount)
