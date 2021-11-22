from pprint import pprint

from cps_score.cps_score import CPS_Score
from cps_score.utils.checkers import SenderNotScoreOwnerError
from cps_score.utils.consts import BLOCKS_DAY_COUNT, DAY_COUNT, MAX_PROJECT_PERIOD, VOTING_PERIOD, APPLICATION_PERIOD, \
    ACCEPT, BOND_RECEIVED, REJECT, APPROVE, ABSTAIN, PROPOSAL, PROGRESS_REPORTS, TRANSITION_PERIOD, BOND_APPROVED, \
    BOND_RETURNED, bnUSD, ICX
from cps_score.utils.utils import ArrayDBUtils
from cps_score.db.proposal_data import ProposalData
from iconservice import *
from CPSTreasury.cps_treasury import CPS_TREASURY
from iconservice import Address
from collections import Counter
from tbears.libs.scoretest.score_test_case import ScoreTestCase
from iconservice.base.exception import IconScoreException, InvalidParamsException
import random
import json
from unittest import mock


class MockCPFScore:
    def get_total_fund(self):
        return 50 * 10 ** 18

    def transfer_proposal_fund_to_cps_treasury(self, _ipfs_key: str, _total_installment_count: int,
                                               _sponsor_address: Address, _contributor_address: Address,
                                               flag, _total_budget: int = 0):
        pass

    def reset_swap_count(self):
        pass

    def icx(self, sponsor_deposit_amount):
        pass

    def return_fund_amount(self, sponsor_address):
        pass

    def swap_tokens(self, swap_amount):
        pass


class MockCPSScore:
    def __init__(self):
        self.test_account3 = Address.from_string(f"hx{'1238' * 10}")

    def disqualify_project(self, ipfs_hash):
        pass

    def send_installment_to_contributor(self, _ipfs_hash):
        pass

    def send_reward_to_sponsor(self, ipfs_hash):
        pass

    def get_admins(self):
        return [self.test_account3]


class TestCPSScore(ScoreTestCase):
    def setUp(self):
        super().setUp()
        self.test_admin_account = Address.from_string(f"hx{'1574' * 10}")
        self.test_account3 = Address.from_string(f"hx{'1238' * 10}")
        self.test_account4 = Address.from_string(f"hx{'1237' * 10}")
        self.test_account5 = Address.from_string(f"hx{'1236' * 10}")
        self.test_account6 = Address.from_string(f"hx{'2365' * 10}")
        self.test_account7 = Address.from_string(f"hx{'6964' * 10}")

        self.initialize_accounts({self.test_admin_account: 12 * 10 ** 18})
        self.cps_score_address = Address.from_string(f"cx{'1234' * 10}")
        self.cps_treasury_score = Address.from_string(f"cx{'3456' * 10}")
        self.cpf_treasury_score = Address.from_string(f"cx{'5678' * 10}")
        self.bnUSD_score = Address.from_string(f"cx{'7890' * 10}")

        self.test_contract_1 = Address.from_string(f"cx{'6789' * 10}")
        self.set_msg(self.test_account1)
        self.set_tx(self.test_account1)
        self.cps_treasury = self.get_score_instance(CPS_TREASURY, self.test_account1,
                                                 on_install_params={}, score_address=self.cps_treasury_score)

    def test_update_project_flag(self):
        self.set_msg(self.test_account3)
        mock_cps = MockCPSScore()
        with mock.patch.object(self.cps_treasury, 'create_interface_score', return_value=mock_cps):
            self.cps_treasury._proposals_keys.put('Proposal 1')
            self.cps_treasury._proposals_keys.put('Proposal 2')
            self.cps_treasury._proposals_keys.put('Proposal 3')
            proposal_list = list()
            proposal_list_index = list()
            self.cps_treasury.update_project_flag('1')
            for proposals in self.cps_treasury._proposals_keys:
                proposal_list.append(proposals)
            for proposals in proposal_list:
                proposal_list_index.append(self.cps_treasury.proposals_key_list_index[proposals])
            print(proposal_list)
            print(proposal_list_index)