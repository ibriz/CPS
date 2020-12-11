from iconservice import *


class InterfaceSystemScore(InterfaceScore):
    @interface
    def getPReps(self, start_ranking: int, end_ranking: int) -> list: pass

    @interface
    def getMainPReps(self) -> dict: pass

    @interface
    def getPRepTerm(self) -> dict: pass


class CPF_TREASURY_INTERFACE(InterfaceScore):
    @interface
    def transfer_proposal_fund_to_cps_treasury(self, _ipfs_key: str, _total_installment_count: int,
                                               _sponsor_address: Address, _contributor_address: Address,
                                               _total_budget: int = 0) -> None: pass

    @interface
    def update_proposal_fund(self, _ipfs_key: str, _total_added_budget: int = 0,
                             _total_added_installment_count: int = 0) -> None: pass

    @interface
    def return_fund_amount(self, _address: Address) -> None: pass

    @interface
    def get_total_fund(self) -> int: pass


class CPS_TREASURY_INTERFACE(InterfaceScore):
    @interface
    def send_installment_to_contributor(self, _ipfs_key: str) -> None: pass

    @interface
    def send_reward_to_sponsor(self, _ipfs_key: str) -> None: pass

    @interface
    def disqualify_project(self, _ipfs_key: str) -> None: pass

    @interface
    def get_contributor_projected_fund(self, _wallet_address: Address) -> dict: pass

    @interface
    def get_sponsor_projected_fund(self, _wallet_address: Address) -> dict: pass
