from CPFTreasury.cpf_treasury import CPF_TREASURY
from tbears.libs.scoretest.score_test_case import ScoreTestCase
from iconservice import *
from iconservice import Address
import json
from unittest import mock


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
        self.initialize_accounts({self.test_account1: 100000 * 10 ** 18})

        self.cps_score_address = Address.from_string(f"cx{'1234' * 10}")
        self.cps_treasury_score = Address.from_string(f"cx{'3456' * 10}")
        self.cpf_treasury_score = Address.from_string(f"cx{'5678' * 10}")
        self.bnUSD_score = Address.from_string(f"cx{'7890' * 10}")
        self.sICX_score = Address.from_string(f"cx{'1985' * 10}")
        self.dex_score = Address.from_string(f"cx{'2000' * 10}")
        self.staking_score = Address.from_string(f"cx{'2001' * 10}")

        self.initialize_accounts({self.cpf_treasury_score: 100000 * 10 ** 18})


        self.test_contract_1 = Address.from_string(f"cx{'6789' * 10}")
        self.set_msg(self.test_account1)
        self.set_tx(self.test_account1)
        self.cpf_score = self.get_score_instance(CPF_TREASURY, self.test_account1,
                                                 on_install_params={}, score_address=self.cpf_treasury_score)

    def test_swap_bnusd_swap_state_is_zero(self):
        self.set_msg(self.test_account1)
        self.cpf_score.set_sicx_score(self.sICX_score)
        self.cpf_score.set_cps_score(self.cps_score_address)
        self.cpf_score.set_cps_treasury_score(self.cps_treasury_score)
        self.cpf_score.set_bnUSD_score(self.bnUSD_score)
        self.cpf_score.set_dex_score(self.dex_score)
        self.cpf_score.set_staking_score(self.staking_score)
        self.set_msg(self.cpf_score.address)
        self.cpf_score.treasury_fund_bnusd.set(5000*10**18)
        print(f'staking score: {self.cpf_score.get_staking_score()}')
        mock_object = CreateMockObject(self.cps_score_address, self.cpf_treasury_score, self.bnUSD_score,
                                       self.dex_score, self.sICX_score)
        with mock.patch.object(self.cpf_score, 'create_interface_score', wraps=mock_object.create):
            self.cpf_score.swap_tokens(0)
            self.assertEqual(self.cpf_score.swap_state.get(), 1)
            self.assertEqual(self.cpf_score.icx.get_balance(self.cpf_score.get_staking_score()), 4.68e+21)

    def test_swap_bnusd_swap_state_is_one(self):
        self.set_msg(self.test_account1)
        self.cpf_score.set_sicx_score(self.sICX_score)
        self.cpf_score.set_cps_score(self.cps_score_address)
        self.cpf_score.set_cps_treasury_score(self.cps_treasury_score)
        self.cpf_score.set_bnUSD_score(self.bnUSD_score)
        self.cpf_score.set_dex_score(self.dex_score)
        self.cpf_score.set_staking_score(self.staking_score)
        self.cpf_score.swap_state.set(1)

        self.set_msg(self.cpf_score.address)
        self.cpf_score.treasury_fund_bnusd.set(500000 * 10 ** 18)
        print(f'staking score: {self.cpf_score.get_staking_score()}')
        mock_object = CreateMockObject(self.cps_score_address, self.cpf_treasury_score, self.bnUSD_score,
                                       self.dex_score, self.sICX_score)
        with mock.patch.object(self.cpf_score, 'create_interface_score', wraps=mock_object.create):
            self.cpf_score.swap_tokens(0)
            print(self.cpf_score.swap_count.get())

    def test_swap_bnusd_swap_caller_not_cps_score(self):
        self.set_msg(self.test_account1)
        self.cpf_score.set_sicx_score(self.sICX_score)
        self.cpf_score.set_cps_score(self.cps_score_address)
        self.cpf_score.set_cps_treasury_score(self.cps_treasury_score)
        self.cpf_score.set_bnUSD_score(self.bnUSD_score)
        self.cpf_score.set_dex_score(self.dex_score)
        self.cpf_score.set_staking_score(self.staking_score)
        self.cpf_score.swap_state.set(1)

        self.set_msg(self.cpf_score.address)
        self.cpf_score.treasury_fund_bnusd.set(500000 * 10 ** 18)
        print(f'staking score: {self.cpf_score.get_staking_score()}')
        mock_object = CreateMockObject(self.cps_score_address, self.cpf_treasury_score, self.bnUSD_score,
                                       self.dex_score, self.sICX_score)
        with mock.patch.object(self.cpf_score, 'create_interface_score', wraps=mock_object.create):
            try:
                self.cpf_score.swap_tokens(0)
            except IconScoreException as err:
                self.assertIn(
                    'CPF_TREASURY : Only CPS(cx1234123412341234123412341234123412341234) SCORE can send fund using this method.', str(err))

    def test_update_project_index(self):
        self.set_msg(self.test_account3)
        mock_cps = MockCPSScore()
        with mock.patch.object(self.cpf_score, 'create_interface_score', return_value=mock_cps):
            self.cpf_score._proposals_keys.put('Proposal 1')
            self.cpf_score._proposals_keys.put('Proposal 2')
            self.cpf_score._proposals_keys.put('Proposal 3')
            proposal_list = list()
            proposal_list_index = list()
            self.cpf_score.update_project_index()
            for proposals in self.cpf_score._proposals_keys:
                proposal_list.append(proposals)
            for proposals in proposal_list:
                proposal_list_index.append(self.cpf_score._proposals_keys_index[proposals])
            print(proposal_list)
            print(proposal_list_index)


class CreateMockObject:
    def __init__(self, cps_address, cpfT_address, bnusd_address, dex_address, sicx_address):
        self.cps_address = cps_address
        self.cpfT_address = cpfT_address
        self.bnusd_address = bnusd_address
        self.dex_address = dex_address
        self.sicx_address = sicx_address

    def create(self, address, interface):
        class CPFMock:

            def return_fund_amount(self, sponsor_address):
                pass

        class CPSMock:
            def disqualify_project(self, ipfs_hash):
                pass

        class DexMock:
            def getPrice(self, value):
                return 1 * 10**18

        class sICX_mock:
            def balanceOf(self, address):
                return 1000 * 10**18

            def transfer(self, dex_score, amount, data):
                pass

        class bnUSD_mock:
            def balanceOf(self, address):
                return 10000 * 10**18

        if address == self.cps_address:
            return CPSMock()
        elif address == self.cpfT_address:
            return CPFMock()
        elif address == self.bnusd_address:
            return bnUSD_mock()
        elif address == self.dex_address:
            return DexMock()
        elif address == self.sicx_address:
            return sICX_mock()

