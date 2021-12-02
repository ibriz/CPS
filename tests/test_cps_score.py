from pprint import pprint

from cps_score.cps_score import CPS_Score
from cps_score.utils.checkers import SenderNotScoreOwnerError
from cps_score.utils.consts import BLOCKS_DAY_COUNT, DAY_COUNT, MAX_PROJECT_PERIOD, VOTING_PERIOD, APPLICATION_PERIOD, \
    ACCEPT, BOND_RECEIVED, REJECT, APPROVE, ABSTAIN, PROPOSAL, PROGRESS_REPORTS, TRANSITION_PERIOD, BOND_APPROVED, \
    BOND_RETURNED, bnUSD, ICX
from cps_score.utils.utils import ArrayDBUtils
from cps_score.db.proposal_data import ProposalData
from iconservice import *
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
        self.cps_score = self.get_score_instance(CPS_Score, self.test_account1,
                                                 on_install_params={}, score_address=self.cps_score_address)

    def test_add_admin_not_owner(self):
        try:
            self.cps_score.add_admin(self.test_admin_account)
        except SenderNotScoreOwnerError:
            self.assertTrue(True)
        else:
            self.assertTrue(False)

    def test_add_admin(self):
        self.set_msg(self.test_account1)
        self.cps_score.add_admin(self.test_admin_account)
        self.assertEqual(self.test_admin_account, self.cps_score.admins.get(-1))

    def test_remove_admin_not_owner(self):
        try:
            self.cps_score.remove_admin(self.test_admin_account)
        except SenderNotScoreOwnerError:
            self.assertTrue(True)
        else:
            self.assertTrue(False)

    def test_remove_admin_owner(self):
        self.set_msg(self.test_account1)
        print(self.cps_score.owner)
        print(self.test_account1)
        print(f'in array: {self.cps_score.admins.get()}')
        try:
            self.cps_score.remove_admin(self.test_account1)  # is passing should not pass
        except IconScoreException as err:
            self.assertIn('CPS_Score: Owner cannot be removed from the admin list.', str(err))
        else:
            raise
        print(f'in array: {self.cps_score.admins.get()}')

    def test_remove_admin(self):
        self.set_msg(self.test_account1)
        self.cps_score.add_admin(self.test_admin_account)
        self.assertEqual(self.test_admin_account, self.cps_score.admins.get(-1))

        self.set_msg(self.test_account1)
        self.cps_score.remove_admin(self.test_admin_account)
        self.assertFalse(self.test_admin_account is self.cps_score.admins.get(-1))

    def test_set_cps_treasury_score_not_owner(self):
        try:
            self.cps_score.set_cps_treasury_score(self.cps_treasury_score)
        except IconScoreException as err:
            self.assertIn('Only Admins can call this method.', str(err))
        else:
            raise

    def test_set_cps_treasury_score_not_score(self):
        self.set_msg(self.test_account1)
        try:
            self.cps_score.set_cps_treasury_score(self.test_account2)
        except IconScoreException as err:
            self.assertIn(f'CPS_Score : Target({str(self.test_account2)}) is not SCORE.', str(err))
        else:
            raise

    def _set_cps_treasury_score(self):
        self.set_msg(self.test_account1)
        self.cps_score.add_admin(self.test_admin_account)

        self.set_msg(self.test_admin_account)
        self.cps_score.set_cps_treasury_score(self.cps_treasury_score)

    def test_set_cps_treasury_score(self):
        self._set_cps_treasury_score()
        self.assertEqual(self.cps_treasury_score, self.cps_score.cps_treasury_score.get())

    def test_set_cpf_treasury_score_not_owner(self):
        try:
            self.cps_score.set_cpf_treasury_score(self.cpf_treasury_score)
        except IconScoreException as err:
            self.assertIn('Only Admins can call this method.', str(err))
        else:
            raise

    def test_set_cpf_treasury_score_not_score(self):
        self.set_msg(self.test_account1)
        try:
            self.cps_score.set_cpf_treasury_score(self.test_account2)
        except IconScoreException as err:
            self.assertIn(f'CPS_Score : Target({str(self.test_account2)}) is not SCORE.', str(err))

    def _set_cpf_treasury_score(self):
        self.set_msg(self.test_account1)
        self.cps_score.add_admin(self.test_admin_account)

        self.set_msg(self.test_admin_account)
        self.cps_score.set_cpf_treasury_score(self.cpf_treasury_score)

    def test_set_cpf_treasury_score(self):
        self._set_cpf_treasury_score()
        self.assertEqual(self.cpf_treasury_score, self.cps_score.cpf_score.get())

    def test_set_prep_penalty_amount_not_owner(self):
        try:
            self.cps_score.set_prep_penalty_amount([10, 20, 30])
        except IconScoreException as err:
            self.assertIn('Only Admins can call this method.', str(err))

    def test_set_prep_penalty_amount_not_three(self):
        self.set_msg(self.test_account1)
        self.cps_score.add_admin(self.test_admin_account)

        self.set_msg(self.test_admin_account)
        try:
            self.cps_score.set_prep_penalty_amount([10, 20])
        except IconScoreException as err:
            self.assertIn('CPS_Score : Exactly 3 Penalty amount Required.', str(err))

    def test_set_prep_penalty_amount_negative(self):
        self.set_msg(self.test_account1)
        self.cps_score.add_admin(self.test_admin_account)

        self.set_msg(self.test_admin_account)
        try:
            self.cps_score.set_prep_penalty_amount([10, 20, -30])
        except IconScoreException as err:
            self.assertIn('CPS_Score : Invalid amount(-30)', str(err))

    def test_set_prep_penalty_amount(self):
        self.set_msg(self.test_account1)
        self.cps_score.add_admin(self.test_admin_account)

        self.set_msg(self.test_admin_account)
        self.cps_score.set_prep_penalty_amount([10, 20, 30])
        penalty_amounts = list()
        multiplier = 10 ** 18
        for i in range(3):
            penalty_amounts.append(self.cps_score.penalty_amount.get(i))
        self.assertEqual(penalty_amounts, [10 * multiplier, 20 * multiplier, 30 * multiplier])

    def test_set_initial_block_not_owner(self):
        try:
            self.cps_score.set_initialBlock()
        except SenderNotScoreOwnerError:
            self.assertTrue(True)
        else:
            self.assertTrue(False)

    def test_set_initial_block(self):
        self.set_msg(self.test_account1)
        with mock.patch.object(self.cps_score, "set_PReps"):
            self.cps_score.set_initialBlock()
            block_height = self.cps_score.block_height
            self.assertEqual(block_height, self.cps_score.initial_block.get())
            self.assertEqual(block_height + BLOCKS_DAY_COUNT * DAY_COUNT, self.cps_score.next_block.get())
            self.assertEqual(APPLICATION_PERIOD, self.cps_score.period_name.get())
            self.assertEqual("None", self.cps_score.previous_period_name.get())

    def test_register_prep_address_not_in_prep_list(self):
        self.set_msg(self.test_account1)
        with mock.patch.object(self.cps_score, "_get_preps_address",
                               return_value=[self.test_account2, self.test_admin_account]):
            try:
                self.cps_score.register_prep()
            except IconScoreException as err:
                self.assertIn('CPS_Score : Not a P-Rep', str(err))
            else:
                raise

    def test_register_prep_address_already_in_registered_prep_list(self):
        self.set_msg(self.test_account1)
        self.cps_score.registered_preps.put(self.test_account1)
        with mock.patch.object(self.cps_score, "_get_preps_address",
                               return_value=[self.test_account1, self.test_account2, self.test_admin_account]):
            try:
                self.cps_score.register_prep()
            except IconScoreException as err:
                self.assertIn('CPS_Score : P-Rep is already registered.', str(err))
            else:
                raise

    def test_register_prep_address_in_deny_list(self):
        self.set_msg(self.test_account1)
        self.cps_score.denylist.put(self.test_account1)
        with mock.patch.object(self.cps_score, "_get_preps_address",
                               return_value=[self.test_account1, self.test_account2, self.test_admin_account]):
            try:
                self.cps_score.register_prep()
            except IconScoreException as err:
                self.assertIn('CPS_Score : You are in denylist. To register, You\'ve to pay Penalty.', str(err))
            else:
                raise

    def test_register_prep_address_not_in_unregistered_preps(self):
        self.set_msg(self.test_account1)
        with mock.patch.object(self.cps_score, "_get_preps_address",
                               return_value=[self.test_account1, self.test_account2, self.test_admin_account]):
            self.cps_score.register_prep()
            self.assertEqual(self.cps_score.registered_preps.get(), self.test_account1)

    def test_register_prep_address_in_unregistered_preps(self):
        self.set_msg(self.test_account1)
        self.cps_score.unregistered_preps.put(self.test_account1)
        self.cps_score.unregistered_preps.put(self.test_account2)
        with mock.patch.object(self.cps_score, "_get_preps_address",
                               return_value=[self.test_account1, self.test_account2, self.test_admin_account]):
            self.cps_score.register_prep()
            self.assertEqual(self.cps_score.unregistered_preps.get(), self.test_account2)
            self.assertEqual(self.cps_score.registered_preps.get(), self.test_account1)

    def test_register_prep_in_not_application_period(self):
        self.set_msg(self.test_account1)
        with mock.patch.object(self.cps_score, "_get_preps_address",
                               return_value=[self.test_account1, self.test_account2, self.test_admin_account]):
            self.cps_score.register_prep()
            self.assertEqual(self.cps_score.registered_preps.get(), self.test_account1)
            try:
                self.cps_score.valid_preps.get()
            except InvalidParamsException as err:
                self.assertIn('ArrayDB out of index', str(err))

    def test_register_prep_in_application_period(self):
        self.set_msg(self.test_account1)
        self.cps_score.period_name.set(APPLICATION_PERIOD)
        with mock.patch.object(self.cps_score, "_get_preps_address",
                               return_value=[self.test_account1, self.test_account2, self.test_admin_account]):
            self.cps_score.register_prep()
            self.assertEqual(self.cps_score.registered_preps.get(), self.test_account1)
            self.assertEqual(self.cps_score.valid_preps.get(), self.test_account1)

    def test_unregister_prep_not_registered(self):
        self.set_msg(self.test_account1)
        try:
            self.cps_score.unregister_prep()
        except IconScoreException as err:
            self.assertIn('CPS_Score : P-Rep is not registered yet.', str(err))

    def test_unregister_prep_not_in_application_period(self):
        self.set_msg(self.test_account1)
        self.cps_score.valid_preps.put(self.test_account1)
        try:
            self.cps_score.unregister_prep()
        except IconScoreException as err:
            self.assertIn('CPS_Score : P-Reps can only be unregister on Application Period', str(err))

    def test_unregister_prep(self):
        self.set_msg(self.test_account1)
        self.cps_score.valid_preps.put(self.test_account1)
        self.cps_score.registered_preps.put(self.test_account1)
        self.cps_score.period_name.set(APPLICATION_PERIOD)
        self.cps_score.unregister_prep()
        try:
            self.cps_score.valid_preps.get()
        except InvalidParamsException as err:  # empty list
            self.assertIn('ArrayDB out of index', str(err))
        try:
            self.cps_score.registered_preps.get()
        except InvalidParamsException as err:  # empty list
            self.assertIn('ArrayDB out of index', str(err))
        self.assertEqual(self.cps_score.unregistered_preps.get(), self.test_account1)

    def _set_valid_preps(self):
        self.cps_score.valid_preps.put(self.test_account1)
        self.cps_score.valid_preps.put(self.test_account2)
        self.cps_score.valid_preps.put(self.test_account3)
        self.cps_score.valid_preps.put(self.test_account4)
        self.cps_score.valid_preps.put(self.test_account5)
        self.cps_score.valid_preps.put(self.test_account6)
        self.cps_score.valid_preps.put(self.test_account7)

    def test_update_period_initially_APPLICATION_PREIOD_preps_less_than_minimum_preps(self):
        self._submit_progress_report()
        self.cps_score.period_name.set(APPLICATION_PERIOD)
        self.set_block(1, 10)
        self.cps_score.next_block.set(0)
        # self._set_valid_preps()
        print(len(self.cps_score.get_proposals_keys_by_status(self.cps_score._pending)))
        print(len(self.cps_score.progress_report_status[self.cps_score._WAITING]))
        next_block = self.cps_score.next_block.get()
        with mock.patch.object(self.cps_score, "set_PReps"):
            self.cps_score.update_period()
            self.assertEqual(self.cps_score.previous_period_name.get(), APPLICATION_PERIOD)
            self.assertEqual(self.cps_score.next_block.get(), next_block + BLOCKS_DAY_COUNT * DAY_COUNT)
            self.assertEqual(self.cps_score.update_period_index.get(), 0)
            self.assertEqual(self.cps_score.period_name.get(), APPLICATION_PERIOD)

    def test_update_period_initially_APPLICATION_PERIOD_not_enough_voting_proposals_or_progress_reports(self):
        self._submit_proposal()
        self.cps_score.period_name.set(APPLICATION_PERIOD)
        self.set_block(1, 10)
        self.cps_score.next_block.set(0)
        self._set_valid_preps()
        print(len(self.cps_score.get_proposals_keys_by_status(self.cps_score._PENDING)))
        print(len(self.cps_score.progress_report_status[self.cps_score._WAITING]))
        next_block = self.cps_score.next_block.get()
        with mock.patch.object(self.cps_score, "set_PReps"):
            self.cps_score.update_period()
            self.assertEqual(self.cps_score.previous_period_name.get(), APPLICATION_PERIOD)
            self.assertEqual(self.cps_score.next_block.get(), next_block + BLOCKS_DAY_COUNT * DAY_COUNT)
            self.assertEqual(self.cps_score.update_period_index.get(), 0)
            self.assertEqual(self.cps_score.period_name.get(), APPLICATION_PERIOD)

    def test_update_period_initially_APPLICATION_PERIOD(self):
        self._submit_progress_report()
        self._sponsor_vote(ACCEPT)
        self.cps_score.period_name.set(APPLICATION_PERIOD)
        self.set_block(1, 10)
        self.cps_score.next_block.set(0)
        self._set_valid_preps()
        print(len(self.cps_score.get_proposals_keys_by_status(self.cps_score._PENDING)))
        self.cps_score._update_proposal_status('Proposal 1', self.cps_score._ACTIVE)
        print(len(self.cps_score.progress_report_status[self.cps_score._WAITING]))
        next_block = self.cps_score.next_block.get()
        with mock.patch.object(self.cps_score, "set_PReps"):
            self.cps_score.update_period()
            self.assertEqual(self.cps_score.active_proposals.get(), self.cps_score._active[-1])
            self.assertEqual(self.cps_score.period_name.get(), VOTING_PERIOD)

    def test_update_period_initially_not_APPLICATION_PERIOD_update_period_index_is_ZERO(self):
        self._set_valid_preps()
        self._submit_proposal()
        self._vote_proposal_by_preps(APPROVE, self.test_account1)
        self._vote_proposal_by_preps(APPROVE, self.test_account2)
        self._vote_proposal_by_preps(APPROVE, self.test_account3)
        self._vote_proposal_by_preps(APPROVE, self.test_account4)
        self._vote_proposal_by_preps(APPROVE, self.test_account5)
        self._vote_proposal_by_preps(APPROVE, self.test_account6)
        self._vote_proposal_by_preps(APPROVE, self.test_account7)
        self._sponsor_vote(ACCEPT)
        self.cps_score.period_name.set(VOTING_PERIOD)
        self.set_block(1, 10)
        self.cps_score.next_block.set(0)
        cpf_score = MockCPFScore()
        prefix = self.cps_score.proposal_prefix('Proposal 1')
        print(len(self.cps_score.get_proposals_keys_by_status(self.cps_score._PENDING)))
        print(len(self.cps_score.progress_report_status[self.cps_score._WAITING]))
        update_period_index_before_updating_period = self.cps_score.update_period_index.get()
        with mock.patch.object(self.cps_score, "create_interface_score", return_value=cpf_score):
            self.cps_score.update_period()
            self.assertEqual(self.cps_score.period_name.get(), TRANSITION_PERIOD)
            self.assertEqual(self.cps_score.previous_period_name.get(), APPLICATION_PERIOD)
            self.assertEqual(self.cps_score.update_period_index.get(), update_period_index_before_updating_period + 1)
            pprint(self.cps_score._get_proposal_details('Proposal 1'))
            self.assertEqual(self.cps_score.get_proposals_keys_by_status(self.cps_score._ACTIVE), ['Proposal 1'])
            self.assertEqual(self.cps_score.sponsors.get(), self.test_account1)
            self.assertEqual(self.cps_score.proposals[prefix].sponsor_deposit_status.get(), BOND_APPROVED)

    def test_update_period_initially_not_APPLICATION_PERIOD_update_period_index_is_ZERO_no_voters(self):
        self._set_valid_preps()
        self._submit_proposal()
        self._sponsor_vote(ACCEPT)
        self.cps_score.period_name.set(VOTING_PERIOD)
        self.set_block(1, 10)
        self.cps_score.next_block.set(0)
        self.cps_score.update_period()
        self.assertEqual(self.cps_score.get_proposals_keys_by_status(self.cps_score._REJECTED), ['Proposal 1'])

    def test_update_period_initially_not_APPLICATION_PERIOD_update_period_index_is_ZERO_not_enough_preps(self):
        self._submit_proposal()
        self._vote_proposal_by_preps(APPROVE, self.test_account1)
        self._sponsor_vote(ACCEPT)
        self.cps_score.period_name.set(VOTING_PERIOD)
        self.set_block(1, 10)
        self.cps_score.next_block.set(0)
        self.cps_score.update_period()
        self.assertEqual(self.cps_score.get_proposals_keys_by_status(self.cps_score._REJECTED), ['Proposal 1'])

    def test_update_period_initially_not_APPLICATION_PERIOD_update_period_index_is_ZERO_not_enough_votes(self):
        self._set_valid_preps()
        self._submit_proposal()
        self._vote_proposal_by_preps(REJECT, self.test_account1)
        self._vote_proposal_by_preps(REJECT, self.test_account2)
        self._vote_proposal_by_preps(REJECT, self.test_account3)
        self._vote_proposal_by_preps(REJECT, self.test_account4)
        self._vote_proposal_by_preps(REJECT, self.test_account5)
        self._vote_proposal_by_preps(REJECT, self.test_account6)
        self._sponsor_vote(ACCEPT)
        self.cps_score.period_name.set(VOTING_PERIOD)
        self.set_block(1, 10)
        self.cps_score.next_block.set(0)
        prefix = self.cps_score.proposal_prefix('Proposal 1')
        self.cps_score.update_period()
        self.assertEqual(self.cps_score.get_proposals_keys_by_status(self.cps_score._REJECTED), ['Proposal 1'])
        try:
            self.cps_score.contributors.get()
        except InvalidParamsException as err:
            self.assertIn('ArrayDB out of index', str(err))
        self.assertEqual(self.cps_score.proposals[prefix].sponsor_deposit_status.get(), BOND_RETURNED)

    def test_update_period_update_period_index_is_ONE_progress_report_not_submitted_by_active_proposal(self):
        self._set_valid_preps()
        self._submit_proposal()
        self._sponsor_vote(ACCEPT)
        self.cps_score.period_name.set(VOTING_PERIOD)
        self.set_block(1, 10)
        self.cps_score.next_block.set(0)
        self.cps_score._update_proposal_status('Proposal 1', self.cps_score._ACTIVE)
        self.cps_score.active_proposals.put('Proposal 1')
        prefix = self.cps_score.proposal_prefix('Proposal 1')
        cps_treasury = MockCPSScore()
        cpf_treasury = MockCPFScore()
        print(self.cps_score.proposals[prefix].submit_progress_report.get())
        self.cps_score.update_period_index.set(1)
        with mock.patch.object(self.cps_score, "create_interface_score", return_value=cpf_treasury):
            with mock.patch.object(self.cps_score, "create_interface_score", return_value=cps_treasury):
                self.cps_score.update_period()
                self.assertEqual(self.cps_score.get_proposals_keys_by_status(self.cps_score._PAUSED), ['Proposal 1'])

    def test_update_period_update_period_index_is_ONE_progress_report_not_submitted_by_paused_proposal(self):
        self.cps_score.cps_treasury_score.set(self.cps_treasury_score)
        self.cps_score.cpf_score.set(self.cpf_treasury_score)
        self._set_valid_preps()
        self._submit_proposal()
        self._sponsor_vote(ACCEPT)
        self.cps_score.period_name.set(VOTING_PERIOD)
        self.set_block(1, 10)
        self.cps_score.next_block.set(0)
        self.cps_score._update_proposal_status('Proposal 1', self.cps_score._PAUSED)
        self.cps_score.active_proposals.put('Proposal 1')
        prefix = self.cps_score.proposal_prefix('Proposal 1')
        mock_object = CreateMockObject(self.cps_treasury_score, self.cpf_treasury_score, self.cpf_treasury_score)
        print(self.cps_score.proposals[prefix].submit_progress_report.get())
        self.cps_score.update_period_index.set(1)
        with mock.patch.object(self.cps_score, "create_interface_score", wraps=mock_object.create):
            self.cps_score.update_period()
            self.assertEqual(self.cps_score.get_proposals_keys_by_status(self.cps_score._DISQUALIFIED), ['Proposal 1'])

    def _vote_proposal_by_preps(self):
        self._submit_proposal()
        self._sponsor_vote(ACCEPT)
        preps_list = [self.test_account1, self.test_account2, self.test_account3, self.test_account4,
                      self.test_account5, self.test_account6, self.test_account7]
        self.cps_score.period_name.set(VOTING_PERIOD)
        for preps in preps_list:
            self.set_msg(preps)
            self.cps_score.valid_preps.put(preps)
            voter_stake = 100
            with mock.patch.object(self.cps_score, "_get_stake", return_value=voter_stake):
                self.cps_score.vote_proposal('Proposal 1', APPROVE, 'Reason')

    #
    #
    #
    #  readonly methods
    #
    #
    #

    def test_name(self):
        self.assertEqual(self.cps_score.name(), 'CPS_Score')

    def test_get_cps_treasury_score(self):
        self._set_cps_treasury_score()
        self.assertEqual(self.cps_score.cps_treasury_score.get(), self.cps_score.get_cps_treasury_score())

    def test_get_cpf_score(self):
        self._set_cpf_treasury_score()
        self.assertEqual(self.cps_score.cpf_score.get(), self.cps_score.get_cpf_treasury_score())

    def test_get_PReps(self):
        self.cps_score.valid_preps.put(self.test_account1)
        self.cps_score.valid_preps.put(self.test_account2)
        stake = 100
        expected_preps = [{'address': self.test_account1,
                           'delegated': stake,
                           'name': 'Prep'},
                          {'address': self.test_account2,
                           'delegated': stake,
                           'name': 'Prep'}]
        with mock.patch.object(self.cps_score, '_get_prep_name', return_value='Prep'):
            with mock.patch.object(self.cps_score, '_get_stake', return_value=stake):
                self.assertEqual(self.cps_score.get_PReps(), expected_preps)

    def test_get_deny_list(self):
        self.cps_score.denylist.put(self.test_account1)
        self.cps_score.denylist.put(self.test_account2)
        deny_list = list()
        for i in range(len(self.cps_score.denylist)):
            deny_list.append(self.cps_score.denylist.get(i))
        self.assertEqual(deny_list, self.cps_score.get_denylist())

    def test_get_period_status(self):
        self.cps_score.next_block.set(10)
        self.set_block(2, 10)
        self.cps_score.period_name.set(APPLICATION_PERIOD)
        self.cps_score.previous_period_name.set(VOTING_PERIOD)
        expected_period_status = {'current_block': self.cps_score.block_height,
                                  'next_block': self.cps_score.next_block.get(),
                                  'period_name': APPLICATION_PERIOD,
                                  'period_span': BLOCKS_DAY_COUNT * DAY_COUNT * 2,
                                  'previous_period_name': VOTING_PERIOD,
                                  'remaining_time': (self.cps_score.next_block.get() - self.cps_score.block_height) * 2}
        self.assertEqual(expected_period_status, self.cps_score.get_period_status())

    def test_get_project_amounts(self):
        self._submit_proposal()
        self._sponsor_vote(ACCEPT)
        expected_return_for_the_submitted_project = {
            '_active': {'_count': len(self.cps_score.get_proposals_keys_by_status(self.cps_score._ACTIVE)),
                        '_total_amount': 0},
            '_completed': {'_count': len(self.cps_score.get_proposals_keys_by_status(self.cps_score._COMPLETED)),
                           '_total_amount': 0},
            '_disqualified': {'_count': len(self.cps_score.get_proposals_keys_by_status(self.cps_score._DISQUALIFIED)),
                              '_total_amount': 0},
            '_paused': {'_count': len(self.cps_score.get_proposals_keys_by_status(self.cps_score._PAUSED)),
                        '_total_amount': 0},
            '_pending': {'_count': len(self.cps_score.get_proposals_keys_by_status(self.cps_score._PENDING)),
                         '_total_amount': 100000000000000000000}}
        # one proposal with pending status and budget 100
        self.assertEqual(self.cps_score.get_proposals_keys_by_status(self.cps_score._PENDING), ['Proposal 1'])
        self.assertEqual(self.cps_score.get_project_amounts(), expected_return_for_the_submitted_project)

    def test_get_proposals_key_by_status(self):
        self._submit_proposal()
        # self.assertEqual(self.cps_score.get_proposals_keys_by_status(self.cps_score._SPONSOR_PENDING), ['Proposal 1'])
        # self._sponsor_vote(REJECT)
        # self.assertEqual(self.cps_score.get_proposals_keys_by_status(self.cps_score._REJECTED), ['Proposal 1'])
        self._sponsor_vote(ACCEPT)
        self.assertEqual(self.cps_score.get_proposals_keys_by_status(self.cps_score._PENDING), ['Proposal 1'])

    def test_get_progress_reports_invalid_status_type(self):
        self.assertEqual(self.cps_score.get_progress_reports('not_waiting', 0, 50),
                         {-1: 'CPS_Score : Not a valid status'})

    def test_get_progress_reports_invalid_page_length(self):
        self._submit_progress_report()
        self.assertEqual(self.cps_score.get_progress_reports(self.cps_score._WAITING, 0, 100),
                         {-1: 'Page length must not be greater than 50.'})

    def test_get_progress_reports(self):
        self._submit_progress_report()
        expected_progress_report = {'count': len(self.cps_score.progress_report_status[self.cps_score._WAITING]),
                                    'data': [{'additional_budget': 100000000000000000000,
                                              'additional_month': 0,
                                              'approve_voters': 0,
                                              'approved_votes': 0,
                                              'budget_adjustment': True,
                                              'budget_adjustment_status': '_pending',
                                              'budget_approve_voters': 0,
                                              'budget_approved_votes': 0,
                                              'budget_reject_voters': 0,
                                              'budget_rejected_votes': 0,
                                              'contributor_address': self.test_account1,
                                              'ipfs_hash': 'Proposal 1',
                                              'progress_report_title': 'Progress Report 1',
                                              'project_title': 'Test Proposal',
                                              'reject_voters': 0,
                                              'rejected_votes': 0,
                                              'report_hash': 'Report 1',
                                              'status': '_waiting',
                                              'timestamp': self.cps_score.now(),
                                              'total_voters': 0,
                                              'total_votes': 0,
                                              'tx_hash': self.cps_score.tx.hash.hex()}]}
        self.assertEqual(self.cps_score.get_progress_reports(self.cps_score._WAITING, 0, 20), expected_progress_report)

    def test_get_progress_reports_by_proposals(self):
        self._submit_progress_report()
        prefix = self.cps_score.proposal_prefix('Proposal 1')
        expected_progress_report = {'count': len(self.cps_score.proposals[prefix].progress_reports),
                                    'data': [{'additional_budget': 100000000000000000000,
                                              'additional_month': 0,
                                              'approve_voters': 0,
                                              'approved_votes': 0,
                                              'budget_adjustment': True,
                                              'budget_adjustment_status': '_pending',
                                              'budget_approve_voters': 0,
                                              'budget_approved_votes': 0,
                                              'budget_reject_voters': 0,
                                              'budget_rejected_votes': 0,
                                              'contributor_address': self.test_account1,
                                              'ipfs_hash': 'Proposal 1',
                                              'progress_report_title': 'Progress Report 1',
                                              'project_title': 'Test Proposal',
                                              'reject_voters': 0,
                                              'rejected_votes': 0,
                                              'report_hash': 'Report 1',
                                              'status': '_waiting',
                                              'timestamp': self.cps_score.now(),
                                              'total_voters': 0,
                                              'total_votes': 0,
                                              'tx_hash': self.cps_score.tx.hash.hex()}]}
        self.assertEqual(self.cps_score.get_progress_reports_by_proposal('Proposal 1'), expected_progress_report)

    def test_get_proposal_detail_by_wallet(self):
        self._submit_proposal()
        expected_proposal_detail = {'count': len(self.cps_score.proposals_key_list),
                                    'data': [{'approve_voters': 0,
                                              'approved_reports': 0,
                                              'approved_votes': 0,
                                              'budget_adjustment': False,
                                              'contributor_address': self.test_account1,
                                              'ipfs_hash': 'Proposal 1',
                                              'percentage_completed': 0,
                                              'project_duration': 6,
                                              'project_title': 'Test Proposal',
                                              'reject_voters': 0,
                                              'rejected_votes': 0,
                                              'sponsor_address': self.test_account1,
                                              'sponsor_deposit_amount': 0,
                                              'sponsor_deposit_status': '',
                                              'sponsor_vote_reason': '',
                                              'sponsored_timestamp': 0,
                                              'status': '_sponsor_pending',
                                              'submit_progress_report': False,
                                              'timestamp': self.cps_score.now(),
                                              'total_budget': 100000000000000000000,
                                              'total_voters': 0,
                                              'total_votes': 0,
                                              'tx_hash': self.cps_score.tx.hash.hex()}]}
        self.assertEqual(self.cps_score.get_proposal_detail_by_wallet(self.test_account1), expected_proposal_detail)

    def test_get_contributors(self):
        self._submit_proposal()
        contributors_list = list()
        for i in range(len(self.cps_score.contributors)):
            contributors_list.append(self.cps_score.contributors[i])
        self.assertEqual(self.cps_score.get_contributors(), contributors_list)

    def test_get_sponsors_records(self):
        self._submit_progress_report()
        self.cps_score._update_proposal_status('Proposal 1', self.cps_score._ACTIVE)
        sponsor_record = {str(self.test_account1): 1}
        self.assertEqual(self.cps_score.get_sponsors_record(), sponsor_record)

    def test_get_sponsors_requests_invalid_status(self):
        self._submit_proposal()
        self.assertEqual(self.cps_score.get_sponsors_requests(self.cps_score._ACTIVE, self.test_account1, 0, 20),
                         {-1: 'CPS_Score : Not valid status.'})

    def test_get_sponsors_requests(self):
        self._submit_proposal()
        expected_requests = {'count': len(self.cps_score.get_proposals_keys_by_status(self.cps_score._SPONSOR_PENDING)),
                             'data': [{'approve_voters': 0,
                                       'approved_reports': 0,
                                       'approved_votes': 0,
                                       'budget_adjustment': False,
                                       'contributor_address': self.test_account1,
                                       'ipfs_hash': 'Proposal 1',
                                       'percentage_completed': 0,
                                       'project_duration': 6,
                                       'project_title': 'Test Proposal',
                                       'reject_voters': 0,
                                       'rejected_votes': 0,
                                       'sponsor_address': self.test_account1,
                                       'sponsor_deposit_amount': 0,
                                       'sponsor_deposit_status': '',
                                       'sponsor_vote_reason': '',
                                       'sponsored_timestamp': 0,
                                       'status': '_sponsor_pending',
                                       'submit_progress_report': False,
                                       'timestamp': self.cps_score.now(),
                                       'total_budget': 100000000000000000000,
                                       'total_voters': 0,
                                       'total_votes': 0,
                                       'tx_hash': self.cps_score.tx.hash.hex()}]}
        self.assertEqual(
            self.cps_score.get_sponsors_requests(self.cps_score._SPONSOR_PENDING, self.test_account1, 0, 20),
            expected_requests)

    def test_get_remaining_project_PROPOSAL(self):
        self._submit_proposal()
        self._sponsor_vote(ACCEPT)
        expected_remaining_projects = [{'approve_voters': 0,
                                        'approved_reports': 0,
                                        'approved_votes': 0,
                                        'budget_adjustment': False,
                                        'contributor_address': self.test_account1,
                                        'ipfs_hash': 'Proposal 1',
                                        'percentage_completed': 0,
                                        'project_duration': 6,
                                        'project_title': 'Test Proposal',
                                        'reject_voters': 0,
                                        'rejected_votes': 0,
                                        'sponsor_address': self.test_account1,
                                        'sponsor_deposit_amount': 10000000000000000000,
                                        'sponsor_deposit_status': 'bond_received',
                                        'sponsor_vote_reason': 'Reason',
                                        'sponsored_timestamp': self.cps_score.now(),
                                        'status': '_pending',
                                        'submit_progress_report': False,
                                        'timestamp': self.cps_score.now(),
                                        'total_budget': 100000000000000000000,
                                        'total_voters': 0,
                                        'total_votes': 0,
                                        'tx_hash': self.cps_score.tx.hash.hex()}]
        self.assertEqual(self.cps_score.get_remaining_project(PROPOSAL, self.test_account1),
                         expected_remaining_projects)

    def test_get_remaining_project_PROGRESS_REPORT(self):
        self._submit_progress_report()
        self._sponsor_vote(ACCEPT)
        expected_remaining_project = [{'additional_budget': 100000000000000000000,
                                       'additional_month': 0,
                                       'approve_voters': 0,
                                       'approved_votes': 0,
                                       'budget_adjustment': True,
                                       'budget_adjustment_status': '_pending',
                                       'budget_approve_voters': 0,
                                       'budget_approved_votes': 0,
                                       'budget_reject_voters': 0,
                                       'budget_rejected_votes': 0,
                                       'ipfs_hash': 'Proposal 1',
                                       'progress_report_title': 'Progress Report 1',
                                       'project_title': 'Test Proposal',
                                       'reject_voters': 0,
                                       'rejected_votes': 0,
                                       'report_hash': 'Report 1',
                                       'status': '_waiting',
                                       'timestamp': self.cps_score.now(),
                                       'total_voters': 0,
                                       'total_votes': 0,
                                       'tx_hash': self.cps_score.tx.hash.hex()}]
        pprint(self.cps_score.get_remaining_project(PROGRESS_REPORTS, self.test_account1))

    def test_get_budget_adjustment_vote_result_REJECT(self):
        self._vote_progress_report(APPROVE, REJECT)
        expected_budget_adjustment_vote_result = {'approve_voters': 0,
                                                  'approved_votes': 0,
                                                  'data': [{'address': self.test_account2,
                                                            'prep_name': 'Prep Name',
                                                            'vote': '_reject',
                                                            'vote_reason': 'Reason'}],
                                                  'reject_voters': 1,
                                                  'rejected_votes': 100,
                                                  'total_voters': 3,
                                                  'total_votes': 100}
        with mock.patch.object(self.cps_score, "_get_prep_name", return_value='Prep Name'):
            self.assertEqual(self.cps_score.get_budget_adjustment_vote_result('Report 1'),
                             expected_budget_adjustment_vote_result)

    def test_get_budget_adjustment_vote_result_APPROVE(self):
        self._vote_progress_report(APPROVE, APPROVE)
        expected_budget_adjustment_vote_result = {'approve_voters': 1,
                                                  'approved_votes': 100,
                                                  'data': [{'address': self.test_account2,
                                                            'prep_name': 'Prep Name',
                                                            'vote': '_approve',
                                                            'vote_reason': 'Reason'}],
                                                  'reject_voters': 0,
                                                  'rejected_votes': 0,
                                                  'total_voters': 3,
                                                  'total_votes': 100}
        with mock.patch.object(self.cps_score, "_get_prep_name", return_value='Prep Name'):
            self.assertEqual(self.cps_score.get_budget_adjustment_vote_result('Report 1'),
                             expected_budget_adjustment_vote_result)

    def test_get_progress_report_result_APPROVE(self):
        self._vote_progress_report(APPROVE, APPROVE)
        expected_progress_report_vote_result = {'approve_voters': 1,
                                                'approved_votes': 100,
                                                'data': [{'address': self.test_account2,
                                                          'prep_name': 'Prep Name',
                                                          'vote': '_approve',
                                                          'vote_reason': 'Reason'}],
                                                'reject_voters': 0,
                                                'rejected_votes': 0,
                                                'total_voters': 3,
                                                'total_votes': 100}
        with mock.patch.object(self.cps_score, "_get_prep_name", return_value='Prep Name'):
            self.assertEqual(self.cps_score.get_progress_report_result('Report 1'),
                             expected_progress_report_vote_result)

    def test_get_progress_report_result_REJECT(self):
        self._vote_progress_report(REJECT, APPROVE)
        expected_progress_report_vote_result = {'approve_voters': 0,
                                                'approved_votes': 0,
                                                'data': [{'address': self.test_account2,
                                                          'prep_name': 'Prep Name',
                                                          'vote': '_reject',
                                                          'vote_reason': 'Reason'}],
                                                'reject_voters': 1,
                                                'rejected_votes': 100,
                                                'total_voters': 3,
                                                'total_votes': 100}
        with mock.patch.object(self.cps_score, "_get_prep_name", return_value='Prep Name'):
            self.assertEqual(self.cps_score.get_progress_report_result('Report 1'),
                             expected_progress_report_vote_result)

    def test_get_vote_result_APPROVE(self):
        self._vote_proposal(APPROVE)
        expected_vote_result = {'approve_voters': 1,
                                'approved_votes': 100,
                                'data': [{'address': self.test_account2,
                                          'prep_name': 'Prep Name',
                                          'vote': '_approve',
                                          'vote_reason': 'Reason'}],
                                'reject_voters': 0,
                                'rejected_votes': 0,
                                'total_voters': 3,
                                'total_votes': 100}
        with mock.patch.object(self.cps_score, "_get_prep_name", return_value='Prep Name'):
            self.assertEqual(self.cps_score.get_vote_result('Proposal 1'), expected_vote_result)

    def test_get_vote_result_REJECT(self):
        self._vote_proposal(REJECT)
        expected_vote_result = {'approve_voters': 0,
                                'approved_votes': 0,
                                'data': [{'address': self.test_account2,
                                          'prep_name': 'Prep Name',
                                          'vote': '_reject',
                                          'vote_reason': 'Reason'}],
                                'reject_voters': 1,
                                'rejected_votes': 100,
                                'total_voters': 3,
                                'total_votes': 100}
        with mock.patch.object(self.cps_score, "_get_prep_name", return_value='Prep Name'):
            self.assertEqual(self.cps_score.get_vote_result('Proposal 1'), expected_vote_result)

    def test_get_proposal_details_invalid_status(self):
        self._submit_proposal()
        self.assertEqual(self.cps_score.get_proposal_details('invalid_status', self.test_account1, 0, 20),
                         {-1: 'Not a valid status.'})

    def test_get_proposal_details_invalid_page_length(self):
        self._submit_proposal()
        self.assertEqual(self.cps_score.get_proposal_details(
            self.cps_score._SPONSOR_PENDING, self.test_account1, 0, 51),
            {-1: 'Page length must not be greater than 50.'})

    def test_get_proposal_details(self):
        self._vote_proposal(APPROVE)
        expected_proposal_details = {'count': len(self.cps_score.get_proposals_keys_by_status(self.cps_score._PENDING)),
                                     'data': [{'approve_voters': 1,
                                               'approved_reports': 0,
                                               'approved_votes': 100,
                                               'budget_adjustment': False,
                                               'contributor_address': self.test_account1,
                                               'ipfs_hash': 'Proposal 1',
                                               'percentage_completed': 0,
                                               'project_duration': 6,
                                               'project_title': 'Test Proposal',
                                               'reject_voters': 0,
                                               'rejected_votes': 0,
                                               'sponsor_address': self.test_account1,
                                               'sponsor_deposit_amount': 10000000000000000000,
                                               'sponsor_deposit_status': 'bond_received',
                                               'sponsor_vote_reason': 'Reason',
                                               'sponsored_timestamp': self.cps_score.now(),
                                               'status': '_pending',
                                               'submit_progress_report': False,
                                               'timestamp': self.cps_score.now(),
                                               'total_budget': 100000000000000000000,
                                               'total_voters': 3,
                                               'total_votes': 100,
                                               'tx_hash': self.cps_score.tx.hash.hex()}]}
        self.assertEqual(self.cps_score.get_proposal_details(self.cps_score._PENDING, self.test_account1, 0, 20),
                         expected_proposal_details)

    def test_get_active_proposals(self):
        self._vote_proposal(APPROVE)
        prefix = self.cps_score.proposal_prefix('Proposal 1')
        self.cps_score._update_proposal_status('Proposal 1', self.cps_score._ACTIVE)
        expected_proposals = [{'project_title': 'Test Proposal', 'ipfs_hash': 'Proposal 1',
                               'new_progress_report': self.cps_score.proposals[prefix].submit_progress_report.get(),
                               'last_progress_report': False}]
        self.assertEqual(self.cps_score.get_active_proposals(self.test_account1), expected_proposals)

    def test_get_remaining_funds(self):
        cpf_score = MockCPFScore()
        with mock.patch.object(self.cps_score, "create_interface_score", return_value=cpf_score):
            self.assertEqual(self.cps_score.get_remaining_fund(), cpf_score.get_total_fund())

    def _submit_proposal_defalut_ipfs_hash(self, _ipfs_hash):
        self.set_msg(self.test_account1, 50 * 10 ** 18)
        self.cps_score.period_name.set(APPLICATION_PERIOD)
        self.cps_score.valid_preps.put(self.test_account1)
        proposal_parameters = {'ipfs_hash': _ipfs_hash,
                               'project_title': 'Test Proposal',
                               'project_duration': 3,
                               'total_budget': 3182,
                               'sponsor_address': self.test_account1,
                               'ipfs_link': 'test.link@link.com'}
        with mock.patch.object(self.cps_score, "get_remaining_fund", return_value=10000 * 10 ** 18):
            with mock.patch.object(self.cps_score, "_burn", return_value=lambda: None):
                self.cps_score.submit_proposal(proposal_parameters)

    def test_request_added_fund(self):
        self._submit_proposal_defalut_ipfs_hash('bafybeie5cifgwgu2x3guixgrs67miydug7ocyp6yia5kxv3imve6fthbs4')
        self.set_msg(self.test_account1, 3182 * 10 ** 17)
        self.cps_score.request_added_fund('bafybeie5cifgwgu2x3guixgrs67miydug7ocyp6yia5kxv3imve6fthbs4')
        pprint(
            self.cps_score.get_proposal_details_by_hash('bafybeie5cifgwgu2x3guixgrs67miydug7ocyp6yia5kxv3imve6fthbs4'))

    def test_claim_sponsor_bond(self):
        self.set_msg(self.test_account1)
        self.cps_score.claim_sponsor_bond()

    def test_send_remaining_funds(self):
        self.set_msg(self.test_account1)
        self.cps_score.add_admin(self.test_admin_account)
        self.set_msg(self.test_admin_account)
        self.cps_score.send_remaining_funds('Proposal 1')

    #
    #
    #
    #
    #
    # All the changed methods in the new update
    #
    #
    #
    #
    #

    def test_set_bnUSD_score_not_admin(self):
        try:
            self.cps_score.set_bnUSD_score(self.bnUSD_score)
        except IconScoreException as err:
            self.assertIn('CPS_Score : Only Admins can call this method.', str(err))
        else:
            raise

    def test_set_bnUSD_score(self):
        self.set_msg(self.test_account1)
        self.cps_score.set_bnUSD_score(self.bnUSD_score)
        self.assertEqual(self.cps_score.balanced_dollar.get(), self.bnUSD_score)

    def _set_bnUSD_score(self):
        self.set_msg(self.test_account1)
        self.cps_score.set_bnUSD_score(self.bnUSD_score)
        self.assertEqual(self.cps_score.balanced_dollar.get(), self.bnUSD_score)

    def test_submit_proposal_voting_period(self):
        self.set_msg(self.test_account1)
        self.cps_score.period_name.set(VOTING_PERIOD)
        proposal_parameters = {'ipfs_hash': 'Proposal 1',
                               'project_title': 'Test Proposal',
                               'project_duration': 6,
                               'total_budget': 1000,
                               'sponsor_address': self.test_account1,
                               'ipfs_link': 'test.link@link.com',
                               'token': bnUSD}
        try:
            self.cps_score.submit_proposal(proposal_parameters)
        except IconScoreException as err:
            self.assertIn('CPS_Score : Proposals can only be submitted on Application Period', str(err))

    def test_submit_proposal_transition_period(self):
        self.set_msg(self.test_account1, 50 * 10 ** 18)
        self.cps_score.period_name.set(TRANSITION_PERIOD)
        self.cps_score.valid_preps.put(self.test_account1)
        proposal_parameters = {'ipfs_hash': 'Proposal 1',
                               'project_title': 'Test Proposal',
                               'project_duration': MAX_PROJECT_PERIOD,
                               'total_budget': 100,
                               'sponsor_address': self.test_account1,
                               'ipfs_link': 'test.link@link.com',
                               'token': bnUSD}
        max_cap_bnUSD = 5000 * 10 ** 18
        with mock.patch.object(self.cps_score, "_get_max_cap_bnusd", return_value=max_cap_bnUSD):
            with mock.patch.object(self.cps_score, "_burn", return_alue=lambda: None):
                self.cps_score.submit_proposal(proposal_parameters)

    def test_submit_proposal_sender_is_contract(self):
        self.set_msg(self.test_contract_1)
        self.cps_score.period_name.set(APPLICATION_PERIOD)  # will pass even if period not set to application period??
        proposal_parameters = {'ipfs_hash': 'Proposal 1',
                               'project_title': 'Test Proposal',
                               'project_duration': 6,
                               'total_budget': 1000,
                               'sponsor_address': self.test_account1,
                               'ipfs_link': 'test.link@link.com',
                               'token': bnUSD}
        try:
            self.cps_score.submit_proposal(proposal_parameters)
        except IconScoreException as err:
            self.assertIn('CPS_Score : Contract Address not supported.', str(err))

    def test_submit_proposal_project_duration_greater_than_max_project_period(self):
        self.set_msg(self.test_account1)
        self.cps_score.period_name.set(APPLICATION_PERIOD)
        proposal_parameters = {'ipfs_hash': 'Proposal 1',
                               'project_title': 'Test Proposal',
                               'project_duration': MAX_PROJECT_PERIOD + 1,
                               'total_budget': 1000,
                               'sponsor_address': self.test_account1,
                               'ipfs_link': 'test.link@link.com',
                               'token': bnUSD}
        try:
            self.cps_score.submit_proposal(proposal_parameters)
        except IconScoreException as err:
            self.assertIn('CPS_Score : Maximum Project Duration exceeds 12 months.', str(err))

    def test_submit_proposal_project_budget_greater_than_remaining_fund(self):
        self.set_msg(self.test_account1)
        self.cps_score.period_name.set(APPLICATION_PERIOD)
        proposal_parameters = {'ipfs_hash': 'Proposal 1',
                               'project_title': 'Test Proposal',
                               'project_duration': MAX_PROJECT_PERIOD,
                               'total_budget': 1000,
                               'sponsor_address': self.test_account1,
                               'ipfs_link': 'test.link@link.com',
                               'token': bnUSD}
        max_cap_bnusd = 5000 * 10 ** 18
        with mock.patch.object(self.cps_score, "_get_max_cap_bnusd", return_value=max_cap_bnusd):
            try:
                self.cps_score.submit_proposal(proposal_parameters)
            except IconScoreException as err:
                print(str(err))

    def test_submit_proposal_sponsor_not_in_valid_preps(self):
        self.set_msg(self.test_account1)
        self.cps_score.period_name.set(APPLICATION_PERIOD)
        proposal_parameters = {'ipfs_hash': 'Proposal 1',
                               'project_title': 'Test Proposal',
                               'project_duration': MAX_PROJECT_PERIOD,
                               'total_budget': 100,
                               'sponsor_address': self.test_account1,
                               'ipfs_link': 'test.link@link.com',
                               'token': bnUSD}
        max_cap_bnUSD = 5000 * 10 ** 18
        with mock.patch.object(self.cps_score, "_get_max_cap_bnusd", return_value=max_cap_bnUSD):
            try:
                self.cps_score.submit_proposal(proposal_parameters)
            except IconScoreException as err:
                self.assertIn('CPS_Score : Sponsor P-Rep not a Top 100 P-Rep.', str(err))

    def test_submit_proposal_sender_value_not_equal_to_sponsor_fee(self):
        self.set_msg(self.test_account1, 49 * 10 ** 18)
        self.cps_score.period_name.set(APPLICATION_PERIOD)
        self.cps_score.valid_preps.put(self.test_account1)
        proposal_parameters = {'ipfs_hash': 'Proposal 1',
                               'project_title': 'Test Proposal',
                               'project_duration': MAX_PROJECT_PERIOD,
                               'total_budget': 100,
                               'sponsor_address': self.test_account1,
                               'ipfs_link': 'test.link@link.com',
                               'token': bnUSD}
        max_cap_bnUSD = 5000 * 10 ** 18
        with mock.patch.object(self.cps_score, "_get_max_cap_bnusd", return_value=max_cap_bnUSD):
            try:
                self.cps_score.submit_proposal(proposal_parameters)
            except IconScoreException as err:
                self.assertIn('CPS_Score : Deposit 50 to submit a proposal.', str(err))

    def test_submit_proposal_token_flag_none(self):
        self.set_msg(self.test_account1, 50 * 10 ** 18)
        self.cps_score.period_name.set(APPLICATION_PERIOD)
        self.cps_score.valid_preps.put(self.test_account1)
        proposal_parameters = {'ipfs_hash': 'Proposal 1',
                               'project_title': 'Test Proposal',
                               'project_duration': MAX_PROJECT_PERIOD,
                               'total_budget': 100,
                               'sponsor_address': self.test_account1,
                               'ipfs_link': 'test.link@link.com'}
        max_cap_bnusd = 5000 * 10 ** 18
        with mock.patch.object(self.cps_score, "_get_max_cap_bnusd", return_value=max_cap_bnusd):
            try:
                self.cps_score.submit_proposal(proposal_parameters)
            except IconScoreException as err:
                self.assertIn('CPS_Score: None Not a supported token.', str(err))

    def test_submit_proposal_token_ICX(self):
        self.set_msg(self.test_account1, 50 * 10 ** 18)
        self.cps_score.period_name.set(APPLICATION_PERIOD)
        self.cps_score.valid_preps.put(self.test_account1)
        proposal_parameters = {'ipfs_hash': 'Proposal 1',
                               'project_title': 'Test Proposal',
                               'project_duration': MAX_PROJECT_PERIOD,
                               'total_budget': 100,
                               'sponsor_address': self.test_account1,
                               'ipfs_link': 'test.link@link.com',
                               'token': ICX}
        max_bnUSD = 5000 * 10 ** 18
        with mock.patch.object(self.cps_score, "_get_max_cap_bnusd", return_value=max_bnUSD):
            try:
                self.cps_score.submit_proposal(proposal_parameters)
            except IconScoreException as err:
                self.assertIn('CPS_Score: ICX Not a supported token.', str(err))

    def test_submit_proposal(self):
        expected_proposal_details = {'approve_voters': 0,
                                     'approved_reports': 0,
                                     'approved_votes': 0,
                                     'budget_adjustment': False,
                                     'contributor_address': self.test_account1,
                                     'ipfs_hash': 'Proposal 1',
                                     'percentage_completed': 0,
                                     'project_duration': MAX_PROJECT_PERIOD,
                                     'project_title': 'Test Proposal',
                                     'reject_voters': 0,
                                     'rejected_votes': 0,
                                     'sponsor_address': self.test_account1,
                                     'sponsor_deposit_amount': 0,
                                     'sponsor_deposit_status': '',
                                     'sponsor_vote_reason': '',
                                     'sponsored_timestamp': 0,
                                     'status': '_sponsor_pending',
                                     'submit_progress_report': False,
                                     'timestamp': self.cps_score.now(),
                                     'total_budget': 100000000000000000000,
                                     'total_voters': 0,
                                     'total_votes': 0,
                                     'tx_hash': self.cps_score.tx.hash.hex(),
                                     'token': bnUSD}
        proposal_parameters = {'ipfs_hash': 'Proposal 1',
                               'project_title': 'Test Proposal',
                               'project_duration': MAX_PROJECT_PERIOD,
                               'total_budget': 100,
                               'sponsor_address': self.test_account1,
                               'ipfs_link': 'test.link@link.com',
                               'token': bnUSD}
        self._submit_proposal()
        self.assertEqual(self.cps_score._get_proposal_details(proposal_parameters['ipfs_hash']),
                         expected_proposal_details)
        self.assertEqual(proposal_parameters['ipfs_hash'], self.cps_score._sponsor_pending.get())
        self.assertEqual(self.test_account1, self.cps_score.contributors.get())

    def _submit_proposal(self):
        self.set_msg(self.test_account1, 50 * 10 ** 18)
        self.cps_score.period_name.set(APPLICATION_PERIOD)
        self.cps_score.valid_preps.put(self.test_account1)
        proposal_parameters = {'ipfs_hash': 'Proposal 1',
                               'project_title': 'Test Proposal',
                               'project_duration': MAX_PROJECT_PERIOD,
                               'total_budget': 100,
                               'sponsor_address': self.test_account1,
                               'ipfs_link': 'test.link@link.com',
                               'token': bnUSD}
        max_cap_bnUSD = 5000 * 10 ** 18
        with mock.patch.object(self.cps_score, "_get_max_cap_bnusd", return_value=max_cap_bnUSD):
            with mock.patch.object(self.cps_score, "_burn", return_alue=lambda: None):
                self.cps_score.submit_proposal(proposal_parameters)

    def test_sponsor_vote_not_in_application_period(self):
        self._submit_proposal()
        self.cps_score.period_name.set(VOTING_PERIOD)
        self._set_bnUSD_score()
        self.set_msg(self.bnUSD_score)
        _data = json.dumps({'method': 'sponsor_vote',
                            'params': {'ipfs_hash': 'Proposal 1',
                                       'vote': '_accept', 'vote_reason': 'Vote Reason'}})

        try:
            self.cps_score.tokenFallback(self.test_account1, 10 * 10 ** 18, _data.encode())
        except IconScoreException as err:
            self.assertIn('CPS_Score : Sponsor Vote can only be done on Application Period', str(err))
        else:
            raise

    def test_sponsor_vote_sender_not_in_valid_preps(self):
        self._submit_proposal()
        self._set_bnUSD_score()
        self.set_msg(self.bnUSD_score)
        _data = json.dumps({'method': 'sponsor_vote',
                            'params': {'ipfs_hash': 'Proposal 1',
                                       'vote': '_accept', 'vote_reason': 'Vote Reason'}})

        try:
            self.cps_score.tokenFallback(self.test_account2, 10 * 10 ** 18, _data.encode())
        except IconScoreException as err:
            self.assertIn('CPS_Score : Not a P-Rep.', str(err))
        else:
            raise

    def test_sponsor_vote_sender_not_sponsor(self):
        self._submit_proposal()
        self.cps_score.valid_preps.put(self.test_account2)
        self._set_bnUSD_score()
        self.set_msg(self.bnUSD_score)
        _data = json.dumps({'method': 'sponsor_vote',
                            'params': {'ipfs_hash': 'Proposal 1',
                                       'vote': '_accept', 'vote_reason': 'Vote Reason'}})

        try:
            self.cps_score.tokenFallback(self.test_account2, 10 * 10 ** 18, _data.encode())
        except IconScoreException as err:
            self.assertIn('CPS_Score : Not a valid Sponsor.', str(err))
        else:
            raise

    def test_sponsor_vote_vote_not_in_accept_and_reject(self):
        self._submit_proposal()
        self._set_bnUSD_score()
        self.set_msg(self.bnUSD_score)
        _data = json.dumps({'method': 'sponsor_vote',
                            'params': {'ipfs_hash': 'Proposal 1',
                                       'vote': '_approve', 'vote_reason': 'Vote Reason'}})

        try:
            self.cps_score.tokenFallback(self.test_account1, 10 * 10 ** 18, _data.encode())
        except IconScoreException as err:
            self.assertIn('CPS_Score: Not a valid vote.', str(err))
        else:
            raise

    def test_sponsor_vote_ACCEPT_not_depositing_10percent_of_budget(self):
        self._submit_proposal()
        self._set_bnUSD_score()
        self.set_msg(self.bnUSD_score)
        _data = json.dumps({'method': 'sponsor_vote',
                            'params': {'ipfs_hash': 'Proposal 1',
                                       'vote': '_accept', 'vote_reason': 'Vote Reason'}})

        try:
            self.cps_score.tokenFallback(self.test_account1, 9 * 10 ** 18, _data.encode())
        except IconScoreException as err:
            self.assertIn('CPS_Score : Deposit 10% of the total budget of the project.', str(err))
        else:
            raise

    def _sponsor_vote(self, _vote):
        self._set_bnUSD_score()
        self.set_msg(self.bnUSD_score)
        _data = json.dumps({'method': 'sponsor_vote',
                            'params': {'ipfs_hash': 'Proposal 1',
                                       'vote': _vote, 'vote_reason': 'Reason'}})

        try:
            self.cps_score.tokenFallback(self.test_account1, 10 * 10 ** 18, _data.encode())
        except IconScoreException as err:
            print(str(err))

    def test_sponsor_vote_ACCEPT(self):
        self._submit_proposal()
        self._sponsor_vote(ACCEPT)
        prefix = self.cps_score.proposal_prefix('Proposal 1')
        expected_proposal_details = {'approve_voters': 0,
                                     'approved_reports': 0,
                                     'approved_votes': 0,
                                     'budget_adjustment': False,
                                     'contributor_address': self.test_account1,
                                     'ipfs_hash': 'Proposal 1',
                                     'percentage_completed': 0,
                                     'project_duration': 12,
                                     'project_title': 'Test Proposal',
                                     'reject_voters': 0,
                                     'rejected_votes': 0,
                                     'sponsor_address': self.test_account1,
                                     'sponsor_deposit_amount': 10000000000000000000,
                                     'sponsor_deposit_status': BOND_RECEIVED,
                                     'sponsor_vote_reason': 'Reason',
                                     'sponsored_timestamp': self.cps_score.now(),
                                     'status': '_pending',
                                     'submit_progress_report': False,
                                     'timestamp': self.cps_score.now(),
                                     'total_budget': 100000000000000000000,
                                     'total_voters': 0,
                                     'total_votes': 0,
                                     'tx_hash': self.cps_score.tx.hash.hex(),
                                     'token': bnUSD}
        self.assertEqual(self.cps_score._get_proposal_details('Proposal 1'), expected_proposal_details)
        self.assertEqual(self.cps_score.proposals[prefix].sponsor_deposit_amount.get(), 10 * 10 ** 18)
        self.assertEqual(self.cps_score.proposals[prefix].sponsored_timestamp.get(), self.cps_score.now())
        self.assertEqual(self.cps_score.proposals[prefix].sponsor_deposit_status.get(), BOND_RECEIVED)
        self.assertEqual(self.cps_score.proposals[prefix].sponsor_vote_reason.get(), 'Reason'.encode())

    def test_sponsor_vote_REJECT(self):
        self._submit_proposal()
        self._sponsor_vote(REJECT)
        expected_proposal_details = {'approve_voters': 0,
                                     'approved_reports': 0,
                                     'approved_votes': 0,
                                     'budget_adjustment': False,
                                     'contributor_address': self.test_account1,
                                     'ipfs_hash': 'Proposal 1',
                                     'percentage_completed': 0,
                                     'project_duration': 12,
                                     'project_title': 'Test Proposal',
                                     'reject_voters': 0,
                                     'rejected_votes': 0,
                                     'sponsor_address': self.test_account1,
                                     'sponsor_deposit_amount': 0,
                                     'sponsor_deposit_status': '',
                                     'sponsor_vote_reason': '',
                                     'sponsored_timestamp': 0,
                                     'status': '_rejected',
                                     'submit_progress_report': False,
                                     'timestamp': self.cps_score.now(),
                                     'total_budget': 100000000000000000000,
                                     'total_voters': 0,
                                     'total_votes': 0,
                                     'tx_hash': self.cps_score.tx.hash.hex(),
                                     'token': bnUSD}
        try:
            self.cps_score.contributors.get()
        except InvalidParamsException as err:
            self.assertIn('ArrayDB out of index', str(err))
        else:
            raise
        self.assertEqual(self.cps_score._get_proposal_details('Proposal 1'), expected_proposal_details)

    def test_vote_proposal_not_in_voting_period(self):
        self._submit_proposal()
        self.set_msg(self.test_account2)
        try:
            self.cps_score.vote_proposal('Proposal 1', APPROVE, 'Reason')
        except IconScoreException as err:
            self.assertIn('CPS_Score : Proposals can be voted only on Voting Period.', str(err))
        else:
            raise

    def test_vote_proposal_not_in_valid_preps(self):
        self._submit_proposal()
        self.set_msg(self.test_account2)
        self.cps_score.period_name.set(VOTING_PERIOD)
        try:
            self.cps_score.vote_proposal('Proposal 1', APPROVE, 'Reason')
        except IconScoreException as err:
            self.assertIn('CPS_Score : Voting can only be done by registered P-Reps', str(err))
        else:
            raise

    def test_vote_proposal_vote_not_among_accepted_votes(self):
        self._submit_proposal()
        self.set_msg(self.test_account2)
        self.cps_score.period_name.set(VOTING_PERIOD)
        self.cps_score.valid_preps.put(self.test_account2)
        try:
            self.cps_score.vote_proposal('Proposal 1', VOTING_PERIOD, 'Reason')
        except IconScoreException as err:
            self.assertIn('CPS_Score : Vote should be on _approve, _reject or _abstain', str(err))
        else:
            raise

    def test_vote_proposal_voter_already_voted(self):
        self._submit_proposal()
        self.set_msg(self.test_account2)
        self.cps_score.period_name.set(VOTING_PERIOD)
        self.cps_score.valid_preps.put(self.test_account2)
        prefix = self.cps_score.proposal_prefix('Proposal 1')
        self.cps_score.proposals[prefix].voters_list.put(self.test_account2)
        try:
            self.cps_score.vote_proposal('Proposal 1', APPROVE, 'Reason')
        except IconScoreException as err:
            self.assertIn('CPS_Score : Already voted on this Proposal.', str(err))
        else:
            raise

    def _vote_proposal(self, _vote, change_vote=False):
        self._submit_proposal()
        self._sponsor_vote(ACCEPT)
        self.set_msg(self.test_account2)
        self.cps_score.period_name.set(VOTING_PERIOD)
        self.cps_score.valid_preps.put(self.test_account2)
        self.cps_score.delegation_snapshot[self.test_account2] = 100
        self.cps_score.vote_proposal('Proposal 1', _vote, 'Reason', change_vote)
        pprint(self.cps_score.get_proposal_details_by_hash('Proposal 1'))

    def _change_vote(self, _vote):
        self.cps_score.vote_proposal('Proposal 1', _vote, 'Reason', True)
        pprint(self.cps_score.get_proposal_details_by_hash('Proposal 1'))

    def test_vote_proposal_APPROVE(self):
        prefix = self.cps_score.proposal_prefix('Proposal 1')
        total_votes_before_voting = self.cps_score.proposals[prefix].total_votes.get()
        print(total_votes_before_voting)
        approved_votes_before_voting = self.cps_score.proposals[prefix].approved_votes.get()
        print(approved_votes_before_voting)
        voter_stake = 100
        self._vote_proposal(APPROVE, False)
        self.assertEqual(self.cps_score.proposals[prefix].total_voters.get(), len(self.cps_score.valid_preps))
        self.assertEqual(self.cps_score.proposals[prefix].voters_list.get(), self.test_account2)
        self.assertEqual(self.cps_score.proposals[prefix].voters_reasons.get(), 'Reason'.encode())
        self.assertEqual(self.cps_score.proposals[prefix].approve_voters.get(), self.test_account2)
        self.assertEqual(self.cps_score.proposals[prefix].approved_votes.get(), voter_stake)

    def test_vote_proposal_REJECT(self):
        prefix = self.cps_score.proposal_prefix('Proposal 1')
        total_votes_before_voting = self.cps_score.proposals[prefix].total_votes.get()
        rejected_votes_before_voting = self.cps_score.proposals[prefix].rejected_votes.get()
        voter_stake = 100
        self._vote_proposal(REJECT, False)
        self.assertEqual(self.cps_score.proposals[prefix].total_voters.get(), len(self.cps_score.valid_preps))
        total_votes_after_voting = self.cps_score.proposals[prefix].total_votes.get()
        self.assertEqual(total_votes_before_voting + voter_stake, total_votes_after_voting)
        self.assertEqual(self.cps_score.proposals[prefix].voters_list.get(), self.test_account2)
        self.assertEqual(self.cps_score.proposals[prefix].voters_reasons.get(), 'Reason'.encode())
        self.assertEqual(self.cps_score.proposals[prefix].reject_voters.get(), self.test_account2)
        rejected_votes_after_voting = self.cps_score.proposals[prefix].rejected_votes.get()
        self.assertEqual(rejected_votes_before_voting + voter_stake, rejected_votes_after_voting)

    def test_vote_proposal_vote_change(self):
        prefix = self.cps_score.proposal_prefix('Proposal 1')
        total_votes_before_voting = self.cps_score.proposals[prefix].total_votes.get()
        rejected_votes_before_voting = self.cps_score.proposals[prefix].rejected_votes.get()
        voter_stake = 100
        self._vote_proposal(REJECT, False)
        self.assertEqual(self.cps_score.proposals[prefix].total_voters.get(), len(self.cps_score.valid_preps))
        total_votes_after_voting = self.cps_score.proposals[prefix].total_votes.get()
        self.assertEqual(total_votes_before_voting + voter_stake, total_votes_after_voting)
        self.assertEqual(self.cps_score.proposals[prefix].voters_list.get(), self.test_account2)
        self.assertEqual(self.cps_score.proposals[prefix].voters_reasons.get(), 'Reason'.encode())
        self.assertEqual(self.cps_score.proposals[prefix].reject_voters.get(), self.test_account2)
        rejected_votes_after_voting = self.cps_score.proposals[prefix].rejected_votes.get()
        self.assertEqual(rejected_votes_before_voting + voter_stake, rejected_votes_after_voting)
        self._change_vote(REJECT)
        self.cps_score.get_proposal_details_by_hash('Proposal 1')
        self.assertEqual(self.cps_score.proposals[prefix].rejected_votes.get(), 0)
        try:
            self.assertEqual(self.cps_score.proposals[prefix].reject_voters.get(), 0)
        except InvalidParamsException as err:
            self.assertIn('ArrayDB out of index', str(err))
        else:
            raise
        self.assertEqual(self.cps_score.proposals[prefix].approved_votes.get(), 100)
        self.assertEqual(self.cps_score.proposals[prefix].approve_voters.get(), self.test_account2)

    def test_submit_progress_report_in_voting_period(self):
        self.set_msg(self.test_account1)
        self.cps_score.period_name.set(VOTING_PERIOD)
        progress_report_parameters = {'ipfs_hash': 'Proposal 1',
                                      'report_hash': 'Report 1',
                                      'ipfs_link': 'test.link@link.com',
                                      'progress_report_title': 'Progress Report 1',
                                      'budget_adjustment': False,
                                      'additional_budget': 0,
                                      'additional_month': 0,
                                      'percentage_completed': 10}
        try:
            self.cps_score.submit_progress_report(progress_report_parameters)
        except IconScoreException as err:
            self.assertIn('CPS_Score : Progress Reports can only be submitted on Application Period', str(err))
        else:
            raise

    def test_submit_progress_report_sender_is_contract(self):
        self.set_msg(self.test_contract_1)
        self.cps_score.period_name.set(APPLICATION_PERIOD)
        progress_report_parameters = {'ipfs_hash': 'Proposal 1',
                                      'report_hash': 'Report 1',
                                      'ipfs_link': 'test.link@link.com',
                                      'progress_report_title': 'Progress Report 1',
                                      'budget_adjustment': False,
                                      'additional_budget': 0,
                                      'additional_month': 0,
                                      'percentage_completed': 10}
        try:
            self.cps_score.submit_progress_report(progress_report_parameters)
        except IconScoreException as err:
            self.assertIn('CPS_Score : Contract Address not supported.', str(err))
        else:
            raise

    def test_submit_progress_report_sender_not_contributor(self):
        self._submit_proposal()
        self.set_msg(self.test_account2)
        self.cps_score.period_name.set(APPLICATION_PERIOD)
        progress_report_parameters = {'ipfs_hash': 'Proposal 1',
                                      'report_hash': 'Report 1',
                                      'ipfs_link': 'test.link@link.com',
                                      'progress_report_title': 'Progress Report 1',
                                      'budget_adjustment': False,
                                      'additional_budget': 0,
                                      'additional_month': 0,
                                      'percentage_completed': 10}
        try:
            self.cps_score.submit_progress_report(progress_report_parameters)
        except IconScoreException as err:
            self.assertIn('CPS_Score : Sorry, You are not the contributor for this project.', str(err))
        else:
            raise

    def test_submit_progress_report_ipfs_hash_not_in_proposal_keys(self):
        self._submit_proposal()
        self.set_msg(self.test_account1)
        self.cps_score.period_name.set(APPLICATION_PERIOD)
        progress_report_parameters = {'ipfs_hash': 'Proposal 1',
                                      'report_hash': 'Report 1',
                                      'ipfs_link': 'test.link@link.com',
                                      'progress_report_title': 'Progress Report 1',
                                      'budget_adjustment': False,
                                      'additional_budget': 0,
                                      'additional_month': 0,
                                      'percentage_completed': 10}
        self.cps_score.proposals_key_list.pop()
        try:
            self.cps_score.submit_progress_report(progress_report_parameters)
        except IconScoreException as err:
            self.assertIn('CPS_Score : Sorry, Active Project not found.', str(err))

    def test_submit_progress_report_twice_in_same_cycle(self):
        self._submit_proposal()
        prefix = self.cps_score.proposal_prefix('Proposal 1')
        self.cps_score.proposals[prefix].status.set('_active')
        self.set_msg(self.test_account1)
        self.cps_score.period_name.set(APPLICATION_PERIOD)
        progress_report_parameters = {'ipfs_hash': 'Proposal 1',
                                      'report_hash': 'Report 1',
                                      'ipfs_link': 'test.link@link.com',
                                      'progress_report_title': 'Progress Report 1',
                                      'budget_adjustment': False,
                                      'additional_budget': 0,
                                      'additional_month': 0,
                                      'percentage_completed': 10}
        try:
            self.cps_score.submit_progress_report(progress_report_parameters)
            self.cps_score.submit_progress_report(progress_report_parameters)
        except IconScoreException as err:
            self.assertIn('CPS_Score : Progress Report is already submitted this cycle.', str(err))

    def test_submit_progress_report_additional_budget_greater_than_remaining_fund(self):
        self._submit_proposal()
        prefix = self.cps_score.proposal_prefix('Proposal 1')
        self.cps_score.proposals[prefix].status.set('_active')
        self.set_msg(self.test_account1)
        self.cps_score.period_name.set(APPLICATION_PERIOD)
        progress_report_parameters = {'ipfs_hash': 'Proposal 1',
                                      'report_hash': 'Report 1',
                                      'ipfs_link': 'test.link@link.com',
                                      'progress_report_title': 'Progress Report 1',
                                      'budget_adjustment': True,
                                      'additional_budget': 1000,
                                      'additional_month': 0,
                                      'percentage_completed': 10}
        max_cap_bnusd = 100 * 10 ** 18
        with mock.patch.object(self.cps_score, "_get_max_cap_bnusd", return_value=max_cap_bnusd):
            try:
                self.cps_score.submit_progress_report(progress_report_parameters)
            except IconScoreException as err:
                self.assertIn("CPS_Score: Max Cap fund already reached for this period.", str(err))

    def test_submit_progress_report_additional_budget_already_sent(self):
        self._submit_proposal()
        prefix = self.cps_score.proposal_prefix('Proposal 1')
        self.cps_score.proposals[prefix].status.set('_active')
        self.set_msg(self.test_account1)
        self.cps_score.period_name.set(APPLICATION_PERIOD)
        prefix = self.cps_score.proposal_prefix('Proposal 1')
        self.cps_score.proposals[prefix].budget_adjustment.set(True)
        progress_report_parameters = {'ipfs_hash': 'Proposal 1',
                                      'report_hash': 'Report 1',
                                      'ipfs_link': 'test.link@link.com',
                                      'progress_report_title': 'Progress Report 1',
                                      'budget_adjustment': True,
                                      'additional_budget': 100,
                                      'additional_month': 0,
                                      'percentage_completed': 10}
        max_cap_bnusd = 5000 * 10 ** 18
        with mock.patch.object(self.cps_score, "_get_max_cap_bnusd", return_value=max_cap_bnusd):
            try:
                self.cps_score.submit_progress_report(progress_report_parameters)
            except IconScoreException as err:
                self.assertIn('CPS_Score : Budget Adjustment Already submitted for this proposal.', str(err))

    def test_submit_progress_report_additional_time_greater_than_max_project_period(self):
        self._submit_proposal()
        self.set_msg(self.test_account1)
        self.cps_score.period_name.set(APPLICATION_PERIOD)
        prefix = self.cps_score.proposal_prefix('Proposal 1')
        self.cps_score.proposals[prefix].status.set('_active')
        progress_report_parameters = {'ipfs_hash': 'Proposal 1',
                                      'report_hash': 'Report 1',
                                      'ipfs_link': 'test.link@link.com',
                                      'progress_report_title': 'Progress Report 1',
                                      'budget_adjustment': True,
                                      'additional_budget': 100,
                                      'additional_month': 2,
                                      'percentage_completed': 10}
        max_cap_bnusd = 5000 * 10 ** 18
        with mock.patch.object(self.cps_score, "_get_max_cap_bnusd", return_value=max_cap_bnusd):
            try:
                self.cps_score.submit_progress_report(progress_report_parameters)
            except IconScoreException as err:
                self.assertIn('CPS_Score: Maximum period for a project is 12 months.', str(err))

    def test_submit_progress_report_invalid_percentage_completed(self):
        self._submit_proposal()
        self.set_msg(self.test_account1)
        self.cps_score.period_name.set(APPLICATION_PERIOD)
        prefix = self.cps_score.proposal_prefix('Proposal 1')
        self.cps_score.proposals[prefix].status.set('_active')
        progress_report_parameters = {'ipfs_hash': 'Proposal 1',
                                      'report_hash': 'Report 1',
                                      'ipfs_link': 'test.link@link.com',
                                      'progress_report_title': 'Progress Report 1',
                                      'budget_adjustment': True,
                                      'additional_budget': 100,
                                      'additional_month': 0,
                                      'percentage_completed': -10}
        max_cap_bnUSD = 5000 * 10 ** 18
        with mock.patch.object(self.cps_score, "_get_max_cap_bnusd", return_value=max_cap_bnUSD):
            try:
                self.cps_score.submit_progress_report(progress_report_parameters)
            except IconScoreException as err:
                self.assertIn('CPS_Score : Not valid percentage value.', str(err))

    def test_submit_progress_report(self):
        prefix = self.cps_score.proposal_prefix('Proposal 1')
        progress_report_parameters = {'ipfs_hash': 'Proposal 1',
                                      'report_hash': 'Report 1',
                                      'ipfs_link': 'test.link@link.com',
                                      'progress_report_title': 'Progress Report 1',
                                      'budget_adjustment': True,
                                      'additional_budget': 100,
                                      'additional_month': 0,
                                      'percentage_completed': 10}
        expected_progress_report_details = {
            'additional_budget': progress_report_parameters['additional_budget'] * 10 ** 18,
            'additional_month': 0,
            'approve_voters': 0,
            'approved_votes': 0,
            'budget_adjustment': progress_report_parameters['budget_adjustment'],
            'budget_adjustment_status': '_pending',
            'budget_approve_voters': 0,
            'budget_approved_votes': 0,
            'budget_reject_voters': 0,
            'budget_rejected_votes': 0,
            'ipfs_hash': 'Proposal 1',
            'progress_report_title': 'Progress Report 1',
            'reject_voters': 0,
            'rejected_votes': 0,
            'report_hash': 'Report 1',
            'status': '_waiting',
            'timestamp': self.cps_score.now(),
            'total_voters': 0,
            'total_votes': 0,
            'tx_hash': self.cps_score.tx.hash.hex()}
        self._submit_progress_report()
        self.assertEqual(self.cps_score.proposals[prefix].submit_progress_report.get(), True)
        self.assertEqual(self.cps_score._get_progress_reports_details(progress_report_parameters['report_hash']),
                         expected_progress_report_details)

    def _submit_progress_report(self):
        self._submit_proposal()
        self.set_msg(self.test_account1)
        self.cps_score.period_name.set(APPLICATION_PERIOD)
        prefix = self.cps_score.proposal_prefix('Proposal 1')
        self.cps_score.proposals[prefix].status.set('_active')
        progress_report_parameters = {'ipfs_hash': 'Proposal 1',
                                      'report_hash': 'Report 1',
                                      'ipfs_link': 'test.link@link.com',
                                      'progress_report_title': 'Progress Report 1',
                                      'budget_adjustment': True,
                                      'additional_budget': 100,
                                      'additional_month': 0,
                                      'percentage_completed': 10}
        max_cap_bnUSD = 5000 * 10 ** 18
        with mock.patch.object(self.cps_score, "_get_max_cap_bnusd", return_value=max_cap_bnUSD):
            self.cps_score.submit_progress_report(progress_report_parameters)

    def test_vote_progress_report_not_in_voting_period(self):
        self._submit_progress_report()
        self._sponsor_vote(ACCEPT)
        self.set_msg(self.test_account2)
        try:
            self.cps_score.vote_progress_report('Proposal 1', 'Report 1', APPROVE, 'Reason', APPROVE)
        except IconScoreException as err:
            self.assertIn('CPS_Score : Progress Reports can be voted only on Voting Period.', str(err))
        else:
            raise

    def test_vote_progress_report_not_valid_prep(self):
        self._submit_progress_report()
        self._sponsor_vote(ACCEPT)
        self.set_msg(self.test_account2)
        self.cps_score.period_name.set(VOTING_PERIOD)
        try:
            self.cps_score.vote_progress_report('Proposal 1', 'Report 1', APPROVE, 'Reason', APPROVE)
        except IconScoreException as err:
            self.assertIn('CPS_Score : Voting can only be done only by Registered P-Reps', str(err))
        else:
            raise

    def test_vote_progress_report_voter_already_voted(self):
        self._submit_progress_report()
        self._sponsor_vote(ACCEPT)
        self.set_msg(self.test_account2)
        self.cps_score.period_name.set(VOTING_PERIOD)
        self.cps_score.valid_preps.put(self.test_account2)
        prefix = self.cps_score.progress_report_prefix('Report 1')
        self.cps_score.progress_reports[prefix].voters_list.put(self.test_account2)
        try:
            self.cps_score.vote_progress_report('Proposal 1', 'Report 1', APPROVE, 'Reason', APPROVE)
        except IconScoreException as err:
            self.assertIn('CPS_Score : Already Voted on this proposal.', str(err))
        else:
            raise

    def _vote_progress_report(self, progress_report_vote, budget_adjustment_vote, _vote_change=False):
        self._submit_progress_report()
        self._sponsor_vote(ACCEPT)
        self.cps_score.delegation_snapshot[self.test_account2] = 100
        self.set_msg(self.test_account2)
        self.cps_score.period_name.set(VOTING_PERIOD)
        self.cps_score.valid_preps.put(self.test_account2)
        prefix = self.cps_score.progress_report_prefix('Report 1')

        self.cps_score.vote_progress_report('Proposal 1', 'Report 1', progress_report_vote, 'Reason',
                                            budget_adjustment_vote, _vote_change)

    def _change_progress_report_vote(self, progress_report_vote, budget_adjustment_vote):
        self.cps_score.vote_progress_report('Proposal 1', 'Report 1', progress_report_vote, 'Reason',
                                            budget_adjustment_vote, True)

    def test_vote_progress_report_APPROVE_budget_adjustment_APPROVE(self):
        prefix = self.cps_score.progress_report_prefix('Report 1')
        total_votes_before_voting = self.cps_score.progress_reports[prefix].total_votes.get()
        approved_votes_before_voting = self.cps_score.progress_reports[prefix].approved_votes.get()
        budget_approved_votes_before_voting = self.cps_score.progress_reports[prefix].budget_approved_votes.get()
        voter_stake = 100
        self._vote_progress_report(APPROVE, APPROVE)
        self.assertEqual(self.cps_score.progress_reports[prefix].total_voters.get(),
                         len(self.cps_score.valid_preps))
        total_votes_after_voting = self.cps_score.progress_reports[prefix].total_votes.get()
        self.assertEqual(total_votes_before_voting + voter_stake, total_votes_after_voting)
        self.assertEqual(self.cps_score.progress_reports[prefix].voters_list.get(), self.test_account2)
        self.assertEqual(self.cps_score.progress_reports[prefix].voters_reasons.get(), 'Reason'.encode())
        self.assertEqual(self.cps_score.progress_reports[prefix].approve_voters.get(), self.test_account2)
        approved_votes_after_voting = self.cps_score.progress_reports[prefix].approved_votes.get()
        self.assertEqual(approved_votes_before_voting + voter_stake, approved_votes_after_voting)
        self.assertEqual(self.cps_score.progress_reports[prefix].budget_approve_voters.get(), self.test_account2)
        budget_approved_votes_after_voting = self.cps_score.progress_reports[prefix].budget_approved_votes.get()
        self.assertEqual(budget_approved_votes_before_voting + voter_stake, budget_approved_votes_after_voting)

    def test_vote_progress_report_APPROVE_budget_adjustment_REJECT(self):

        prefix = self.cps_score.progress_report_prefix('Report 1')
        total_votes_before_voting = self.cps_score.progress_reports[prefix].total_votes.get()
        approved_votes_before_voting = self.cps_score.progress_reports[prefix].approved_votes.get()
        budget_rejected_votes_before_voting = self.cps_score.progress_reports[prefix].budget_rejected_votes.get()
        voter_stake = 100
        self._vote_progress_report(APPROVE, REJECT)
        self.assertEqual(self.cps_score.progress_reports[prefix].total_voters.get(),
                         len(self.cps_score.valid_preps))
        total_votes_after_voting = self.cps_score.progress_reports[prefix].total_votes.get()
        self.assertEqual(total_votes_before_voting + voter_stake, total_votes_after_voting)
        self.assertEqual(self.cps_score.progress_reports[prefix].voters_list.get(), self.test_account2)
        self.assertEqual(self.cps_score.progress_reports[prefix].voters_reasons.get(), 'Reason'.encode())
        self.assertEqual(self.cps_score.progress_reports[prefix].approve_voters.get(), self.test_account2)
        approved_votes_after_voting = self.cps_score.progress_reports[prefix].approved_votes.get()
        self.assertEqual(approved_votes_before_voting + voter_stake, approved_votes_after_voting)
        self.assertEqual(self.cps_score.progress_reports[prefix].budget_reject_voters.get(), self.test_account2)
        budget_rejected_votes_after_voting = self.cps_score.progress_reports[prefix].budget_rejected_votes.get()
        self.assertEqual(budget_rejected_votes_before_voting + voter_stake, budget_rejected_votes_after_voting)

    def test_vote_progress_report_REJECT_budget_adjustment_REJECT(self):
        prefix = self.cps_score.progress_report_prefix('Report 1')
        total_votes_before_voting = self.cps_score.progress_reports[prefix].total_votes.get()
        rejected_votes_before_voting = self.cps_score.progress_reports[prefix].rejected_votes.get()
        budget_rejected_votes_before_voting = self.cps_score.progress_reports[prefix].budget_rejected_votes.get()
        self._vote_progress_report(REJECT, REJECT)
        voter_stake = 100
        self.assertEqual(self.cps_score.progress_reports[prefix].total_voters.get(),
                         len(self.cps_score.valid_preps))
        total_votes_after_voting = self.cps_score.progress_reports[prefix].total_votes.get()
        self.assertEqual(total_votes_before_voting + voter_stake, total_votes_after_voting)
        self.assertEqual(self.cps_score.progress_reports[prefix].voters_list.get(), self.test_account2)
        self.assertEqual(self.cps_score.progress_reports[prefix].voters_reasons.get(), 'Reason'.encode())
        self.assertEqual(self.cps_score.progress_reports[prefix].reject_voters.get(), self.test_account2)
        rejected_votes_after_voting = self.cps_score.progress_reports[prefix].rejected_votes.get()
        self.assertEqual(rejected_votes_before_voting + voter_stake, rejected_votes_after_voting)
        self.assertEqual(self.cps_score.progress_reports[prefix].budget_reject_voters.get(), self.test_account2)
        budget_rejected_votes_after_voting = self.cps_score.progress_reports[prefix].budget_rejected_votes.get()
        self.assertEqual(budget_rejected_votes_before_voting + voter_stake, budget_rejected_votes_after_voting)

    def test_vote_progress_report_REJECT_budget_adjustment_APPROVE(self):  # Vote rejected for progress report but
        # budget adjustment approved passes why?
        prefix = self.cps_score.progress_report_prefix('Report 1')
        total_votes_before_voting = self.cps_score.progress_reports[prefix].total_votes.get()
        rejected_votes_before_voting = self.cps_score.progress_reports[prefix].rejected_votes.get()
        budget_approved_votes_before_voting = self.cps_score.progress_reports[prefix].budget_approved_votes.get()
        self._vote_progress_report(REJECT, APPROVE)
        voter_stake = 100
        self.assertEqual(self.cps_score.progress_reports[prefix].total_voters.get(),
                         len(self.cps_score.valid_preps))
        total_votes_after_voting = self.cps_score.progress_reports[prefix].total_votes.get()
        self.assertEqual(total_votes_before_voting + voter_stake, total_votes_after_voting)
        self.assertEqual(self.cps_score.progress_reports[prefix].voters_list.get(), self.test_account2)
        self.assertEqual(self.cps_score.progress_reports[prefix].voters_reasons.get(), 'Reason'.encode())
        self.assertEqual(self.cps_score.progress_reports[prefix].reject_voters.get(), self.test_account2)
        rejected_votes_after_voting = self.cps_score.progress_reports[prefix].rejected_votes.get()
        self.assertEqual(rejected_votes_before_voting + voter_stake, rejected_votes_after_voting)
        self.assertEqual(self.cps_score.progress_reports[prefix].budget_approve_voters.get(), self.test_account2)
        budget_approved_votes_after_voting = self.cps_score.progress_reports[prefix].budget_approved_votes.get()
        self.assertEqual(budget_approved_votes_before_voting + voter_stake, budget_approved_votes_after_voting)

    def test_vote_progress_report_APPROVE_budget_adjustment_none(self):  # Vote rejected for progress report but
        try:
            self._vote_progress_report(APPROVE, None)
        except IconScoreException as err:
            self.assertIn('CPS_Score: Choose option _approve or _reject for budget adjustment.', str(err))

    def test_vote_progress_report_vote_change(self):
        prefix = self.cps_score.progress_report_prefix('Report 1')
        total_votes_before_voting = self.cps_score.progress_reports[prefix].total_votes.get()
        approved_votes_before_voting = self.cps_score.progress_reports[prefix].approved_votes.get()
        budget_approved_votes_before_voting = self.cps_score.progress_reports[prefix].budget_approved_votes.get()
        voter_stake = 100
        self._vote_progress_report(APPROVE, APPROVE)
        self.assertEqual(self.cps_score.progress_reports[prefix].total_voters.get(),
                         len(self.cps_score.valid_preps))
        total_votes_after_voting = self.cps_score.progress_reports[prefix].total_votes.get()
        self.assertEqual(total_votes_before_voting + voter_stake, total_votes_after_voting)
        self.assertEqual(self.cps_score.progress_reports[prefix].voters_list.get(), self.test_account2)
        self.assertEqual(self.cps_score.progress_reports[prefix].voters_reasons.get(), 'Reason'.encode())
        self.assertEqual(self.cps_score.progress_reports[prefix].approve_voters.get(), self.test_account2)
        approved_votes_after_voting = self.cps_score.progress_reports[prefix].approved_votes.get()
        self.assertEqual(approved_votes_before_voting + voter_stake, approved_votes_after_voting)
        self.assertEqual(self.cps_score.progress_reports[prefix].budget_approve_voters.get(), self.test_account2)
        budget_approved_votes_after_voting = self.cps_score.progress_reports[prefix].budget_approved_votes.get()
        self.assertEqual(budget_approved_votes_before_voting + voter_stake, budget_approved_votes_after_voting)
        pprint(self.cps_score.get_progress_reports_by_hash('Report 1'))

        self._change_progress_report_vote(APPROVE, APPROVE)

        pprint(self.cps_score.get_progress_reports_by_hash('Report 1'))

    def test_get_project_amounts_cps_score(self):
        self._submit_proposal()
        self._sponsor_vote(ACCEPT)
        self.assertEqual(self.cps_score.get_project_amounts()['_pending'],
                         {'_count': 1, '_total_amount': 100000000000000000000})

    def test_pay_prep_penalty_not_in_application_period(self):
        self.set_msg(self.test_account1, 1000 * 10 ** 18)
        self.cps_score.set_prep_penalty_amount([5, 10, 15])
        self.cps_score.denylist.put(self.test_account1)
        self.cps_score.denylist.put(self.test_account2)
        self.cps_score.preps_denylist_status[str(self.test_account1)] = 2
        self._set_bnUSD_score()
        self.set_msg(self.bnUSD_score)
        _data = json.dumps({'method': 'pay_prep_penalty',
                            'params': None})

        try:
            self.cps_score.tokenFallback(self.test_account1, 10 * 10 ** 18, _data.encode())
        except IconScoreException as err:
            self.assertIn('CPS_Score : Penalty can only be paid on Application Period', str(err))

    def test_pay_prep_penalty_sender_not_in_deny_list(self):
        self.set_msg(self.test_account1, 1000 * 10 ** 18)
        self.cps_score.period_name.set(APPLICATION_PERIOD)
        self.cps_score.set_prep_penalty_amount([5, 10, 15])
        self.cps_score.denylist.put(self.test_account2)
        self._set_bnUSD_score()
        self.set_msg(self.bnUSD_score)
        _data = json.dumps({'method': 'pay_prep_penalty',
                            'params': None})

        try:
            self.cps_score.tokenFallback(self.test_account1, 10 * 10 ** 18, _data.encode())
        except IconScoreException as err:
            self.assertIn(f'CPS_Score : {self.test_account1} not in denylist.', str(err))

    def test_pay_prep_penalty_no_penalty_amount_needs_to_be_paid(self):
        self.set_msg(self.test_account1, 1000 * 10 ** 18)
        self.cps_score.period_name.set(APPLICATION_PERIOD)
        self.cps_score.set_prep_penalty_amount([5, 10, 15])
        self.cps_score.denylist.put(self.test_account1)
        self.cps_score.denylist.put(self.test_account2)
        self._set_bnUSD_score()
        self.set_msg(self.bnUSD_score)
        _data = json.dumps({'method': 'pay_prep_penalty',
                            'params': None})

        try:
            self.cps_score.tokenFallback(self.test_account1, 10 * 10 ** 18, _data.encode())
        except IconScoreException as err:
            self.assertIn(f'CPS_Score : {self.test_account1} does not need to pay penalty', str(err))
        else:
            raise

    def test_pay_prep_penalty_wrong_penalty_amount(self):
        self.set_msg(self.test_account1, 1000 * 10 ** 18)
        self.cps_score.period_name.set(APPLICATION_PERIOD)
        self.cps_score.set_prep_penalty_amount([5, 10, 15])
        self.cps_score.denylist.put(self.test_account1)
        self.cps_score.denylist.put(self.test_account2)
        self.cps_score.preps_denylist_status[str(self.test_account1)] = 2
        self.cps_score.max_delegation.set(100)
        self._set_bnUSD_score()
        self.set_msg(self.bnUSD_score)
        _data = json.dumps({'method': 'pay_prep_penalty',
                            'params': None})
        with mock.patch.object(self.cps_score, '_get_stake', return_value=100):
            try:
                self.cps_score.tokenFallback(self.test_account1, 5 * 10 ** 18, _data.encode())
            except IconScoreException as err:
                self.assertIn('CPS_Score :  Please pay Penalty amount of 10000000000000000000 to register as a P-Rep.',
                              str(err))

    def test_pay_prep_penalty(self):
        self.set_msg(self.test_account1, 1000 * 10 ** 18)
        self.cps_score.period_name.set(APPLICATION_PERIOD)
        self.cps_score.set_prep_penalty_amount([5, 10, 15])
        self.cps_score.denylist.put(self.test_account1)
        self.cps_score.denylist.put(self.test_account2)
        self.cps_score.preps_denylist_status[str(self.test_account1)] = 2
        self.cps_score.max_delegation.set(100)
        self._set_bnUSD_score()
        self.set_msg(self.bnUSD_score)
        _data = json.dumps({'method': 'pay_prep_penalty',
                            'params': None}).encode()
        with mock.patch.object(self.cps_score, '_get_stake', return_value=100):
            with mock.patch.object(self.cps_score, '_burn', return_value=1):
                self.cps_score.tokenFallback(self.test_account1, 10 * 10 ** 18, _data)

    def _vote_progress_report_by_preps(self, progress_report_vote, budget_adjustment_vote, prep_address):
        self._submit_progress_report()
        self._sponsor_vote(ACCEPT)
        self.set_msg(prep_address)
        self.cps_score.period_name.set(VOTING_PERIOD)
        prefix = self.cps_score.progress_report_prefix('Report 1')
        voter_stake = 100
        with mock.patch.object(self.cps_score, "_get_stake", return_value=voter_stake):
            self.cps_score.vote_progress_report('Proposal 1', 'Report 1', progress_report_vote, 'Reason',
                                                budget_adjustment_vote)

    def test_vote_progress_report_accept(self):
        self._set_valid_preps()
        self._vote_proposal_by_preps()

    def test_swap_bnUSD(self):
        self.cps_score.swap_block_height.set(self.cps_score.block_height - 10)
        mock_cpf = MockCPFScore()
        with mock.patch.object(self.cps_score, 'create_interface_score', return_value=mock_cpf):
            self.cps_score._swap_bnusd_token()

    def _register_prep(self, prep_address):
        self.set_msg(prep_address)
        self.cps_score.period_name.set(APPLICATION_PERIOD)
        preps_list = [self.test_account1, self.test_account2, self.test_account3, self.test_account4,
                      self.test_account5, self.test_account6, self.test_account7]
        with mock.patch.object(self.cps_score, "_get_preps_address",
                               return_value=preps_list):
            self.cps_score.register_prep()

    def test_update_period_in_application_period_voting_proposals_and_progress_reports_is_zero(self):
        preps_list = [self.test_account1, self.test_account2, self.test_account3, self.test_account4,
                      self.test_account5, self.test_account6, self.test_account7]
        for preps in preps_list:
            self._register_prep(preps)
        self.cps_score.period_name.set(APPLICATION_PERIOD)
        self.cps_score.next_block.set(self.cps_score.block_height - 1)

        with mock.patch.object(self.cps_score, "_get_preps_address", return_value=preps_list):
            with mock.patch.object(self.cps_score, "_get_stake", return_value=100):
                self.cps_score.update_period()
                self.assertEqual(self.cps_score.valid_preps.get(), preps_list[0])
                self.assertEqual(self.cps_score.update_period_index.get(), 0)
                self.assertEqual(self.cps_score.period_name.get(), APPLICATION_PERIOD)
                self.assertEqual(self.cps_score.next_block.get(), 599)
                self.assertEqual(self.cps_score.previous_period_name.get(), APPLICATION_PERIOD)

    def test_update_period_active_proposals_not_submit_progress_report_in_application_period(self):
        preps_list = [self.test_account1, self.test_account2, self.test_account3, self.test_account4,
                      self.test_account5, self.test_account6, self.test_account7]
        self.cps_score.active_proposals.put('Proposal 1')
        for preps in preps_list:
            self._register_prep(preps)
        self.cps_score.period_name.set(APPLICATION_PERIOD)
        self.cps_score.next_block.set(self.cps_score.block_height - 1)

        proposal_prefix = self.cps_score.proposal_prefix('Proposal 1')
        self.cps_score.proposals[proposal_prefix].submit_progress_report.set(0)
        self.cps_score.proposals[proposal_prefix].status.set('_active')
        with mock.patch.object(self.cps_score, "_get_preps_address", return_value=preps_list):
            with mock.patch.object(self.cps_score, "_get_stake", return_value=100):
                mock_object = CreateMockObject(self.cps_treasury_score, self.cpf_treasury_score)
                with mock.patch.object(self.cps_score, 'create_interface_score', wraps=mock_object.create):
                    with mock.patch.object(self.cps_score, '_get_proposal_details', return_value={'status': '_active',
                                                                                                  'sponsor_address': self.test_account1,
                                                                                                  'contributor_address': self.test_account1}):
                        self.cps_score.update_period()
                        self.assertEqual(self.cps_score.get_proposals_keys_by_status('_paused'), ['Proposal 1'])

    def test_update_period_paused_proposals_not_submit_progress_report_in_application_period(self):
        self.set_msg(self.test_account1)
        self.cps_score.set_cps_treasury_score(self.cps_treasury_score)
        self.cps_score.set_cpf_treasury_score(self.cpf_treasury_score)
        self.cps_score.set_bnUSD_score(self.bnUSD_score)
        preps_list = [self.test_account1, self.test_account2, self.test_account3, self.test_account4,
                      self.test_account5, self.test_account6, self.test_account7]
        self.cps_score.active_proposals.put('Proposal 1')
        self.cps_score.contributors.put(self.test_account1)
        self.cps_score.sponsors.put(self.test_account1)
        for preps in preps_list:
            self._register_prep(preps)
        self.cps_score.period_name.set(APPLICATION_PERIOD)
        self.cps_score.next_block.set(self.cps_score.block_height - 1)

        proposal_prefix = self.cps_score.proposal_prefix('Proposal 1')
        self.cps_score.proposals[proposal_prefix].submit_progress_report.set(0)
        self.cps_score.proposals[proposal_prefix].status.set('_paused')
        with mock.patch.object(self.cps_score, "_get_preps_address", return_value=preps_list):
            with mock.patch.object(self.cps_score, "_get_stake", return_value=100):
                mock_object = CreateMockObject(self.cps_treasury_score, self.cpf_treasury_score, self.bnUSD_score)
                with mock.patch.object(self.cps_score, 'create_interface_score', wraps=mock_object.create):
                    with mock.patch.object(self.cps_score, '_get_proposal_details',
                                           return_value={'status': '_paused',
                                                         'sponsor_address': self.test_account1,
                                                         'contributor_address': self.test_account1,
                                                         'sponsor_deposit_amount': 10,
                                                         'token': 'bnUSD'}):
                        self.cps_score.update_period()
                        self.assertEqual(self.cps_score.get_proposals_keys_by_status('_disqualified'), ['Proposal 1'])

    def test_update_period_when_there_is_vote_pending_proposal(self):
        self._submit_proposal()
        self._sponsor_vote(ACCEPT)
        preps_list = [self.test_account1, self.test_account2, self.test_account3, self.test_account4,
                      self.test_account5, self.test_account6, self.test_account7]
        for preps in preps_list:
            self._register_prep(preps)
        self.cps_score.period_name.set(APPLICATION_PERIOD)
        self.cps_score.next_block.set(self.cps_score.block_height - 1)

        with mock.patch.object(self.cps_score, "_get_preps_address", return_value=preps_list):
            with mock.patch.object(self.cps_score, "_get_stake", return_value=100):
                self.cps_score.update_period()
                self.assertEqual(self.cps_score.valid_preps.get(), preps_list[0])
                self.assertEqual(self.cps_score.update_period_index.get(), 0)
                self.assertEqual(self.cps_score.period_name.get(), VOTING_PERIOD)
                self.assertEqual(self.cps_score.next_block.get(), 599)
                self.assertEqual(self.cps_score.previous_period_name.get(), APPLICATION_PERIOD)

    def test_update_period_in_application_period_when_prep_count_is_less_than_7(self):
        preps_list = [self.test_account1, self.test_account2, self.test_account3, self.test_account4,
                      self.test_account5, self.test_account6]
        for preps in preps_list:
            self._register_prep(preps)
        self.cps_score.period_name.set(APPLICATION_PERIOD)
        self.cps_score.next_block.set(self.cps_score.block_height - 1)

        with mock.patch.object(self.cps_score, "_get_preps_address", return_value=preps_list):
            with mock.patch.object(self.cps_score, "_get_stake", return_value=100):
                self.cps_score.update_period()
                self.assertEqual(self.cps_score.valid_preps.get(), preps_list[0])
                self.assertEqual(self.cps_score.update_period_index.get(), 0)
                self.assertEqual(self.cps_score.period_name.get(), APPLICATION_PERIOD)
                self.assertEqual(self.cps_score.next_block.get(), 599)
                self.assertEqual(self.cps_score.previous_period_name.get(), APPLICATION_PERIOD)

    def _register_prep_in_voting_period(self, prep_address):
        self.set_msg(prep_address)
        self.cps_score.period_name.set(VOTING_PERIOD)
        preps_list = [self.test_account1, self.test_account2, self.test_account3, self.test_account4,
                      self.test_account5, self.test_account6, self.test_account7]
        with mock.patch.object(self.cps_score, "_get_preps_address",
                               return_value=preps_list):
            self.cps_score.register_prep()

    def test_register_prep_in_voting_period(self):
        preps_list = [self.test_account1, self.test_account2, self.test_account3, self.test_account4,
                      self.test_account5, self.test_account6, self.test_account7]
        for preps in preps_list:
            self._register_prep_in_voting_period(preps)
        print(self.cps_score.valid_preps.get(0))

    def test_update_period_in_voting_period_no_one_vote_proposal(self):
        self.cps_score.next_block.set(-1)
        self.cps_score.update_period_index.set(0)
        self.cps_score._pending.put('Proposal 1')
        proposal_prefix = self.cps_score.proposal_prefix('Proposal 1')
        self.cps_score.proposals[proposal_prefix].status.set('_pending')
        self.cps_score.proposals[proposal_prefix].sponsor_deposit_status.set(BOND_APPROVED)
        self.cps_score.contributors.put(self.test_account1)
        with mock.patch.object(self.cps_score, "_get_proposal_details",
                               return_value={'contributor_address': self.test_account1,
                                             'project_title': 'title',
                                             'sponsor_address': self.test_account2,
                                             'total_budget': 100,
                                             'project_duration': 1,
                                             'sponsor_deposit_amount': 10,
                                             'approve_voters': 0,
                                             'approved_votes': 0,
                                             'total_votes': 0,
                                             'total_voters': 0,
                                             'token': 'bnUSD'}):
            self.cps_score.update_period()
        self.assertEqual(self.cps_score.get_proposals_keys_by_status('_rejected'), ['Proposal 1'])

    def test_update_period_in_voting_period_majority_approve_proposal(self):
        self.cps_score.next_block.set(-1)
        preps_list = [self.test_account1, self.test_account2, self.test_account3, self.test_account4,
                      self.test_account5, self.test_account6, self.test_account7]
        for preps in preps_list:
            self.cps_score.valid_preps.put(preps)
        self.cps_score.update_period_index.set(0)
        self.cps_score._pending.put('Proposal 1')
        proposal_prefix = self.cps_score.proposal_prefix('Proposal 1')
        self.cps_score.proposals[proposal_prefix].status.set('_pending')
        self.cps_score.proposals[proposal_prefix].sponsor_deposit_status.set(BOND_APPROVED)
        self.cps_score.contributors.put(self.test_account1)
        with mock.patch.object(self.cps_score, "_get_proposal_details",
                               return_value={'contributor_address': self.test_account1,
                                             'project_title': 'title',
                                             'sponsor_address': self.test_account2,
                                             'total_budget': 100,
                                             'project_duration': 1,
                                             'sponsor_deposit_amount': 10,
                                             'approve_voters': 7,
                                             'approved_votes': 7,
                                             'total_votes': 7,
                                             'total_voters': 7,
                                             'token': 'bnUSD'}):
            cpf_mock = MockCPFScore()
            with mock.patch.object(self.cps_score, "create_interface_score", return_value=cpf_mock):
                self.cps_score.update_period()
        self.assertEqual(self.cps_score.get_proposals_keys_by_status('_active'), ['Proposal 1'])

    def test_update_period_in_voting_period_majority_reject_proposal(self):
        self.cps_score.next_block.set(-1)
        preps_list = [self.test_account1, self.test_account2, self.test_account3, self.test_account4,
                      self.test_account5, self.test_account6, self.test_account7]
        for preps in preps_list:
            self.cps_score.valid_preps.put(preps)
        self.cps_score.update_period_index.set(0)
        self.cps_score._pending.put('Proposal 1')
        proposal_prefix = self.cps_score.proposal_prefix('Proposal 1')
        self.cps_score.proposals[proposal_prefix].status.set('_pending')
        self.cps_score.proposals[proposal_prefix].sponsor_deposit_status.set(BOND_APPROVED)
        self.cps_score.contributors.put(self.test_account1)
        with mock.patch.object(self.cps_score, "_get_proposal_details",
                               return_value={'contributor_address': self.test_account1,
                                             'project_title': 'title',
                                             'sponsor_address': self.test_account2,
                                             'total_budget': 100,
                                             'project_duration': 1,
                                             'sponsor_deposit_amount': 10,
                                             'approve_voters': 1,
                                             'approved_votes': 1,
                                             'total_votes': 7,
                                             'total_voters': 7,
                                             'token': 'bnUSD'}):
            cpf_mock = MockCPFScore()
            with mock.patch.object(self.cps_score, "create_interface_score", return_value=cpf_mock):
                self.cps_score.update_period()
            self.assertEqual(self.cps_score.get_proposals_keys_by_status('_rejected'), ['Proposal 1'])

    def test_update_period_in_voting_period_no_one_vote_progress_report(self):
        self.cps_score.next_block.set(-1)
        preps_list = [self.test_account1, self.test_account2, self.test_account3, self.test_account4,
                      self.test_account5, self.test_account6, self.test_account7]
        for preps in preps_list:
            self.cps_score.valid_preps.put(preps)
        self.cps_score.update_period_index.set(2)
        self.cps_score._waiting_progress_reports.put('Report 1')
        self.cps_score.active_proposals.put('Proposal 1')
        proposal_prefix = self.cps_score.proposal_prefix('Proposal 1')
        progress_prefix = self.cps_score.progress_report_prefix('Report 1')
        self.cps_score.progress_reports[progress_prefix].status.set(self.cps_score._WAITING)
        self.cps_score.proposals[proposal_prefix].status.set('_active')
        self.cps_score.progress_report_status[self.cps_score._WAITING] = self.cps_score._waiting_progress_reports
        self.cps_score.proposals_status[self.cps_score._ACTIVE] = self.cps_score.active_proposals
        report_details = {'approve_voters': 0,
                          'approved_votes': 0,
                          'reject_voters': 0,
                          'rejected_votes': 0,
                          'total_votes': 0,
                          'total_voters': 0,
                          'ipfs_hash': 'Proposal 1',
                          'budget_adjustment': 0}

        proposal_details = {'status': '_active',
                            'approved_reports': 0,
                            'sponsor_address': self.test_account1,
                            'contributor_address': self.test_account2,
                            'percentage_completed': 10,
                            'sponsor_deposit_amount': 10,
                            'token': 'bnUSD'}
        self.assertEqual(self.cps_score.get_proposals_keys_by_status('_active'), ['Proposal 1'])
        self.assertEqual(self.cps_score.progress_report_status['_waiting'].get(), 'Report 1')
        with mock.patch.object(self.cps_score, "_get_progress_reports_details", return_value=report_details):
            with mock.patch.object(self.cps_score, "_get_proposal_details", return_value=proposal_details):
                with mock.patch.object(self.cps_score, "create_interface_score", return_value=MockCPSScore):
                    self.cps_score.update_period()
                    self.assertEqual(self.cps_score.get_proposals_keys_by_status('_paused'), ['Proposal 1'])
                    self.assertEqual(self.cps_score.progress_report_status[self.cps_score._PROGRESS_REPORT_REJECTED].get(), 'Report 1')

    def test_update_period_in_voting_period_majority_reject_progress_report(self):
        self.cps_score.next_block.set(-1)
        preps_list = [self.test_account1, self.test_account2, self.test_account3, self.test_account4,
                      self.test_account5, self.test_account6, self.test_account7]
        for preps in preps_list:
            self.cps_score.valid_preps.put(preps)
        self.cps_score.update_period_index.set(2)
        self.cps_score._waiting_progress_reports.put('Report 1')
        self.cps_score.active_proposals.put('Proposal 1')
        proposal_prefix = self.cps_score.proposal_prefix('Proposal 1')
        progress_prefix = self.cps_score.progress_report_prefix('Report 1')
        self.cps_score.progress_reports[progress_prefix].status.set(self.cps_score._WAITING)
        self.cps_score.proposals[proposal_prefix].status.set('_active')
        self.cps_score.progress_report_status[self.cps_score._WAITING] = self.cps_score._waiting_progress_reports
        self.cps_score.proposals_status[self.cps_score._ACTIVE] = self.cps_score.active_proposals
        report_details = {'approve_voters': 0,
                          'approved_votes': 0,
                          'reject_voters': 7,
                          'rejected_votes': 7,
                          'total_votes': 7,
                          'total_voters': 7,
                          'ipfs_hash': 'Proposal 1',
                          'budget_adjustment': 0}

        proposal_details = {'status': '_active',
                            'approved_reports': 0,
                            'sponsor_address': self.test_account1,
                            'contributor_address': self.test_account2,
                            'percentage_completed': 10,
                            'sponsor_deposit_amount': 10,
                            'token': 'bnUSD'}
        self.assertEqual(self.cps_score.get_proposals_keys_by_status('_active'), ['Proposal 1'])
        self.assertEqual(self.cps_score.progress_report_status['_waiting'].get(), 'Report 1')
        with mock.patch.object(self.cps_score, "_get_progress_reports_details", return_value=report_details):
            with mock.patch.object(self.cps_score, "_get_proposal_details", return_value=proposal_details):
                with mock.patch.object(self.cps_score, "create_interface_score", return_value=MockCPSScore):
                    self.cps_score.update_period()
                    self.assertEqual(self.cps_score.get_proposals_keys_by_status('_paused'), ['Proposal 1'])
                    self.assertEqual(self.cps_score.progress_report_status[self.cps_score._PROGRESS_REPORT_REJECTED].get(), 'Report 1')

    def test_update_period_in_voting_period_majority_approve_progress_report(self):
        self.cps_score.next_block.set(-1)
        preps_list = [self.test_account1, self.test_account2, self.test_account3, self.test_account4,
                      self.test_account5, self.test_account6, self.test_account7]
        for preps in preps_list:
            self.cps_score.valid_preps.put(preps)
        self.cps_score.update_period_index.set(2)
        self.cps_score._waiting_progress_reports.put('Report 1')
        self.cps_score.active_proposals.put('Proposal 1')
        proposal_prefix = self.cps_score.proposal_prefix('Proposal 1')
        progress_prefix = self.cps_score.progress_report_prefix('Report 1')
        self.cps_score.progress_reports[progress_prefix].status.set(self.cps_score._WAITING)
        self.cps_score.proposals[proposal_prefix].status.set('_paused')
        self.cps_score.progress_report_status[self.cps_score._WAITING] = self.cps_score._waiting_progress_reports
        self.cps_score.proposals_status[self.cps_score._ACTIVE] = self.cps_score.active_proposals
        self.cps_score.proposals[proposal_prefix].project_duration.set(2)
        report_details = {'approve_voters': 7,
                          'approved_votes': 7,
                          'reject_voters': 0,
                          'rejected_votes': 0,
                          'total_votes': 7,
                          'total_voters': 7,
                          'ipfs_hash': 'Proposal 1',
                          'budget_adjustment': 0}

        proposal_details = {'status': '_active',
                            'approved_reports': 0,
                            'sponsor_address': self.test_account1,
                            'contributor_address': self.test_account2,
                            'percentage_completed': 10,
                            'sponsor_deposit_amount': 10,
                            'token': 'bnUSD'}
        with mock.patch.object(self.cps_score, "_get_progress_reports_details", return_value=report_details):
            with mock.patch.object(self.cps_score, "_get_proposal_details", return_value=proposal_details):
                with mock.patch.object(self.cps_score, "create_interface_score", return_value=MockCPSScore()):
                    self.cps_score.update_period()
                    self.assertEqual(self.cps_score.get_proposals_keys_by_status('_active'), ['Proposal 1'])

    def test_update_period_in_voting_period_majority_approve_progress_report_with_budget_adjustment(self):
        self.cps_score.next_block.set(-1)
        self.set_msg(self.test_account1)
        self.cps_score.set_cps_treasury_score(self.cps_treasury_score)
        self.cps_score.set_cpf_treasury_score(self.cpf_treasury_score)
        self.cps_score.set_bnUSD_score(self.bnUSD_score)
        preps_list = [self.test_account1, self.test_account2, self.test_account3, self.test_account4,
                      self.test_account5, self.test_account6, self.test_account7]
        for preps in preps_list:
            self.cps_score.valid_preps.put(preps)
        self.cps_score.update_period_index.set(2)
        self.cps_score._waiting_progress_reports.put('Report 1')
        self.cps_score.active_proposals.put('Proposal 1')
        proposal_prefix = self.cps_score.proposal_prefix('Proposal 1')
        progress_prefix = self.cps_score.progress_report_prefix('Report 1')
        self.cps_score.progress_reports[progress_prefix].status.set(self.cps_score._WAITING)
        self.cps_score.proposals[proposal_prefix].status.set('_paused')
        self.cps_score.progress_report_status[self.cps_score._WAITING] = self.cps_score._waiting_progress_reports
        self.cps_score.proposals_status[self.cps_score._ACTIVE] = self.cps_score.active_proposals
        self.cps_score.proposals[proposal_prefix].project_duration.set(2)
        report_details = {'approve_voters': 7,
                          'approved_votes': 7,
                          'reject_voters': 0,
                          'rejected_votes': 0,
                          'total_votes': 7,
                          'total_voters': 7,
                          'ipfs_hash': 'Proposal 1',
                          'budget_adjustment': 1,
                          'additional_month': 1,
                          'additional_budget': 10,
                          'report_hash': 'Report 1'}

        budget_adjustment_results = {'approve_voters': 7,
                                     'approved_votes': 7,
                                     'total_voters': 7,
                                     'total_votes': 7}

        proposal_details = {'status': '_active',
                            'approved_reports': 0,
                            'sponsor_address': self.test_account1,
                            'contributor_address': self.test_account2,
                            'percentage_completed': 10,
                            'sponsor_deposit_amount': 10,
                            'token': 'bnUSD'}
        with mock.patch.object(self.cps_score, "_get_progress_reports_details", return_value=report_details):
            with mock.patch.object(self.cps_score, "_get_proposal_details", return_value=proposal_details):
                with mock.patch.object(self.cps_score, "get_budget_adjustment_vote_result",
                                       return_value=budget_adjustment_results):
                    mock_object = CreateMockObject(self.cps_treasury_score, self.cpf_treasury_score,
                                                   self.cps_treasury_score)
                    with mock.patch.object(self.cps_score, "create_interface_score", wraps=mock_object.create):
                        self.cps_score.update_period()
                        self.assertEqual(self.cps_score.get_proposals_keys_by_status('_active'), ['Proposal 1'])
                        self.assertEqual(self.cps_score.progress_reports[progress_prefix].budget_adjustment_status.get()
                                         , self.cps_score._APPROVED)

    def test_update_period_in_voting_period_majority_approve_progress_report_with_budget_adjustment_majority_reject(self):
        self.cps_score.next_block.set(-1)
        self.set_msg(self.test_account1)
        self.cps_score.set_cps_treasury_score(self.cps_treasury_score)
        self.cps_score.set_cpf_treasury_score(self.cpf_treasury_score)
        self.cps_score.set_bnUSD_score(self.bnUSD_score)
        preps_list = [self.test_account1, self.test_account2, self.test_account3, self.test_account4,
                      self.test_account5, self.test_account6, self.test_account7]
        for preps in preps_list:
            self.cps_score.valid_preps.put(preps)
        self.cps_score.update_period_index.set(2)
        self.cps_score._waiting_progress_reports.put('Report 1')
        self.cps_score.active_proposals.put('Proposal 1')
        proposal_prefix = self.cps_score.proposal_prefix('Proposal 1')
        progress_prefix = self.cps_score.progress_report_prefix('Report 1')
        self.cps_score.progress_reports[progress_prefix].status.set(self.cps_score._WAITING)
        self.cps_score.proposals[proposal_prefix].status.set('_paused')
        self.cps_score.progress_report_status[self.cps_score._WAITING] = self.cps_score._waiting_progress_reports
        self.cps_score.proposals_status[self.cps_score._ACTIVE] = self.cps_score.active_proposals
        self.cps_score.proposals[proposal_prefix].project_duration.set(2)
        report_details = {'approve_voters': 7,
                          'approved_votes': 7,
                          'reject_voters': 0,
                          'rejected_votes': 0,
                          'total_votes': 7,
                          'total_voters': 7,
                          'ipfs_hash': 'Proposal 1',
                          'budget_adjustment': 1,
                          'additional_month': 1,
                          'additional_budget': 10,
                          'report_hash': 'Report 1'}

        budget_adjustment_results = {'approve_voters': 0,
                                     'approved_votes': 0,
                                     'total_voters': 7,
                                     'total_votes': 7}

        proposal_details = {'status': '_active',
                            'approved_reports': 0,
                            'sponsor_address': self.test_account1,
                            'contributor_address': self.test_account2,
                            'percentage_completed': 10,
                            'sponsor_deposit_amount': 10,
                            'token': 'bnUSD'}
        with mock.patch.object(self.cps_score, "_get_progress_reports_details", return_value=report_details):
            with mock.patch.object(self.cps_score, "_get_proposal_details", return_value=proposal_details):
                with mock.patch.object(self.cps_score, "get_budget_adjustment_vote_result",
                                       return_value=budget_adjustment_results):
                    mock_object = CreateMockObject(self.cps_treasury_score, self.cpf_treasury_score,
                                                   self.cps_treasury_score)
                    with mock.patch.object(self.cps_score, "create_interface_score", wraps=mock_object.create):
                        self.cps_score.update_period()
                        self.assertEqual(self.cps_score.get_proposals_keys_by_status('_active'), ['Proposal 1'])
                        self.assertEqual(self.cps_score.progress_reports[progress_prefix].budget_adjustment_status.get()
                                         , self.cps_score._REJECTED)

    def test_update_period_update_deny_list(self):
        self.cps_score.next_block.set(-1)
        self.set_msg(self.test_account1)
        self.cps_score.set_cps_treasury_score(self.cps_treasury_score)
        self.cps_score.set_cpf_treasury_score(self.cpf_treasury_score)
        self.cps_score.set_bnUSD_score(self.bnUSD_score)
        preps_list = [self.test_account1, self.test_account2, self.test_account3, self.test_account4,
                      self.test_account5, self.test_account6, self.test_account7]
        for preps in preps_list:
            self.cps_score.registered_preps.put(preps)
            self.cps_score.valid_preps.put(preps)
        self.cps_score.update_period_index.set(3)
        for i in range(2):
            self.cps_score.inactive_preps.put(preps_list[i])
        valid_preps = [self.test_account4, self.test_account5, self.test_account6, self.test_account7]
        with mock.patch.object(self.cps_score, "_get_preps_address", return_value=preps_list):
            with mock.patch.object(self.cps_score, "create_interface_score", return_value=MockCPFScore()):
                self.cps_score.update_period()
                self.assertEqual(len(self.cps_score.valid_preps), 5)

    def test_update_project_flag(self):
        self.set_msg(self.test_account1)
        self.cps_score.add_admin(self.test_account2)
        self.set_msg(self.test_account2)
        self.cps_score.proposals_key_list.put('Proposal 1')
        self.cps_score.proposals_key_list.put('Proposal 2')
        self.cps_score.proposals_key_list.put('Proposal 3')
        self.cps_score.update_project_flag()
        proposal_list = list()
        proposal_index = list()
        for i in range(len(self.cps_score.proposals_key_list)):
            proposal_list.append(self.cps_score.proposals_key_list.get(i))
        for proposals in proposal_list:
            proposal_index.append(self.cps_score.proposals_key_list_index[proposals])
        print(proposal_list)
        print(proposal_index)

    def test_update_progress_report_index(self):
        self.set_msg(self.test_account1)
        self.cps_score.add_admin(self.test_account2)
        self.set_msg(self.test_account2)
        self.cps_score.progress_key_list.put('Proposal 1')
        self.cps_score.progress_key_list.put('Proposal 2')
        self.cps_score.progress_key_list.put('Proposal 3')
        self.cps_score.update_progress_report_index()
        progress_report_list = list()
        progress_report_list_index = list()
        for i in range(len(self.cps_score.progress_key_list)):
            progress_report_list.append(self.cps_score.progress_key_list.get(i))
        for proposals in progress_report_list:
            progress_report_list_index.append(self.cps_score.progress_key_list_index[proposals])
        print(progress_report_list)
        print(progress_report_list_index)




    def test_score1(self):
        pprint({"loans": "cx3228124be7c85e3e57edebf870c4075c33c34c5f",
                "staking": "cx1eb5b209e4c6f95a958bddb322d76a2168e576b2",
                "dividends": "cx020042bb8742bfca138889e23817bee87ad8caa0",
                "reserve": "cx76d98fc79f779308d2e872b00e7571bebef59031",
                "daofund": "cx11781737f47520e3bfad0e132c5accb4e4d6fe4f",
                "rewards": "cx026ca90fdcf4851fa6c4e00403b3abe636a9f88b",
                "dex": "cx4342802efce67d2441e69b062b1f0110b6a6f820",
                "rebalancing": "cxd5df399205421930870e3b0798766aa31cffbe66",
                "governance": "cxdc519895ef110220db2442ff1b3223182304b68a",
                "oracle": "cxf96a2e83808058fb9159824e324f36d9e91cfafa",
                "sicx": "cx0e706eca3552a6e607095319f4ad8cea37e779d4",
                "bnUSD": "cx041714d034919c8456d3606f8766f0169e35cb8e",
                "bnXLM": "cxcc80a99118e2e35db8e9a575f86d87e33c2a9465",
                "bnDOGE": "cx47f5be000e9893936e415b1b704001dd43467889",
                "baln": "cxb45058d398614a7c8cdf7be6f556fa0b39399799",
                "bwt": "cxa2afb37647ae91ca6fbf35141b2ef2ac7105720a"})


class CreateMockObject:
    def __init__(self, cps_address, cpf_address, bnUSD_address):
        self.cps_address = cps_address
        self.cpf_address = cpf_address
        self.bnUSD_address = bnUSD_address

    def create(self, address, interface):
        class CPFMock:

            def return_fund_amount(self, sponsor_address):
                pass

            def update_proposal_fund(self, ipfs_hash, token_flag, _additional_budget, _additional_time):
                pass

        class CPSMock:
            def disqualify_project(self, ipfs_hash):
                pass

            def send_installment_to_contributor(self, _ipfs_hash):
                pass

            def send_reward_to_sponsor(self, ipfs_hash):
                pass

        class bnUSDMock:
            def transfer(self, _to, sponsor_deposit_amount, data):
                pass

        if address == self.cps_address:
            return CPSMock()
        elif address == self.cpf_address:
            return CPFMock()
        elif address == self.bnUSD_address:
            return bnUSDMock()


class ArrayDBUtilsMock:
    def remove_array_element(self):
        pass
