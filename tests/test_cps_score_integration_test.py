import os
from pprint import pprint
import time
from iconsdk.builder.call_builder import CallBuilder
from iconsdk.builder.transaction_builder import DeployTransactionBuilder, CallTransactionBuilder, TransactionBuilder
from iconsdk.libs.in_memory_zip import gen_deploy_data_content
from iconsdk.signed_transaction import SignedTransaction
from tbears.libs.icon_integrate_test import IconIntegrateTestBase, SCORE_INSTALL_ADDRESS
from cps_score.utils.consts import BLOCKS_DAY_COUNT, DAY_COUNT, MAX_PROJECT_PERIOD, VOTING_PERIOD, APPLICATION_PERIOD, \
    ACCEPT, BOND_RECEIVED, REJECT, APPROVE, ABSTAIN, PROPOSAL, PROGRESS_REPORTS, TRANSITION_PERIOD, BOND_APPROVED, \
    BOND_RETURNED
from iconsdk.wallet.wallet import KeyWallet
from iconservice.base.address import Address
from iconsdk.icon_service import IconService
from iconsdk.providers.http_provider import HTTPProvider
from cps_score.cps_score import CPS_Score

DIR_PATH = os.path.abspath(os.path.dirname(__file__))


class test_CPS_Score(IconIntegrateTestBase):
    TEST_HTTP_ENDPOINT_URI_V3 = "http://127.0.0.1:9000/api/v3"
    CPS_SCORE_PROJECT = os.path.abspath((os.path.join(DIR_PATH, '..', 'cps_score')))
    CPF_TREASURY_PROJECT = os.path.abspath((os.path.join(DIR_PATH, '..', 'CPFTreasury')))
    CPS_TREASURY_PROJECT = os.path.abspath((os.path.join(DIR_PATH, '..', 'CPSTreasury')))
    BLOCK_INTERVAL = 6

    def setUp(self):
        self._wallet_setup()
        super().setUp()

        self.icon_service = IconService(HTTPProvider(self.TEST_HTTP_ENDPOINT_URI_V3))
        self.cps_score =  self._deploy_cps_score(params={})['scoreAddress']
        self.cpf_score = self._deploy_cpf_treasury_score(params={'amount': 1_000_000 * 10 ** 18})['scoreAddress']
        self.cps_treasury_score = self._deploy_cps_treasury_score(params={})['scoreAddress']
        self.system_score = SCORE_INSTALL_ADDRESS
        self._register_100_preps(10, 20)
        self._register_prep()
        self._add_fund()

    def _deploy_cps_score(self, to: str = SCORE_INSTALL_ADDRESS, params=None) -> dict:
        if params is None:
            params = {}
        transaction = DeployTransactionBuilder() \
            .from_(self._test1.get_address()) \
            .to(to) \
            .step_limit(100_000_000_000) \
            .nid(3) \
            .nonce(100) \
            .content_type("application/zip") \
            .content(gen_deploy_data_content(self.CPS_SCORE_PROJECT)) \
            .params(params) \
            .build()

        signed_transaction = SignedTransaction(transaction, self._test1)

        # process the transaction in local
        tx_result = self.process_transaction(signed_transaction, self.icon_service)

        self.assertEqual(True, tx_result['status'])
        self.assertTrue('scoreAddress' in tx_result)
        return tx_result

    def _deploy_cpf_treasury_score(self, to: str = SCORE_INSTALL_ADDRESS, params=None) -> dict:
        if params is None:
            params = {'amount': 1_000_000 * 10 ** 18}

        transaction = DeployTransactionBuilder() \
            .from_(self._test1.get_address()) \
            .to(to) \
            .step_limit(100_000_000_000) \
            .nid(3) \
            .nonce(100) \
            .content_type("application/zip") \
            .content(gen_deploy_data_content(self.CPF_TREASURY_PROJECT)) \
            .params(params) \
            .build()
        signed_transaction = SignedTransaction(transaction, self._test1)

        # process the transaction in local
        tx_result = self.process_transaction(signed_transaction, self.icon_service)

        self.assertEqual(True, tx_result['status'])
        self.assertTrue('scoreAddress' in tx_result)
        return tx_result

    def _deploy_cps_treasury_score(self, to: str = SCORE_INSTALL_ADDRESS, params=None) -> dict:
        if params is None:
            params = {}

        transaction = DeployTransactionBuilder() \
            .from_(self._test1.get_address()) \
            .to(to) \
            .step_limit(100_000_000_000) \
            .nid(3) \
            .nonce(100) \
            .content_type("application/zip") \
            .content(gen_deploy_data_content(self.CPS_TREASURY_PROJECT)) \
            .params(params) \
            .build()
        signed_transaction = SignedTransaction(transaction, self._test1)

        # process the transaction in local
        tx_result = self.process_transaction(signed_transaction, self.icon_service)

        self.assertEqual(True, tx_result['status'])
        self.assertTrue('scoreAddress' in tx_result)
        return tx_result

    def _wallet_setup(self):
        self.icx_factor = 10 ** 18
        self.btest_wallet: 'KeyWallet' = self._wallet_array[5]
        self.staking_wallet: 'KeyWallet' = self._wallet_array[6]

    def _register_100_preps(self, start, end):
        txs = []
        for i in range(start, end):
            len_str = str(start)
            if len(len_str) == 2:
                j = "0" + str(i)
            else:
                j = str(i)
            params = {"name": "Test P-rep " + str(i), "country": "KOR", "city": "Unknown",
                      "email": "nodehx9eec61296a7010c867ce24c20e69588e28321" + j + "@example.com", "website":
                          'https://nodehx9eec61296a7010c867ce24c20e69588e28321' + j + '.example.com',
                      "details": 'https'
                                 '://nodehx9eec61296a7010c867ce24c20e69588e28321' + j + '.example.com/details',
                      "p2pEndpoint": "nodehx9eec61296a7010c867ce24c20e69588e28321" + j + ".example.com:7100",
                      "nodeAddress": "hx9eec61296a7010c867ce24c20e69588e28321" + j}
            self.send_icx(self._test1, self._wallet_array[i].get_address(), 3000000000000000000000)
            print(params["nodeAddress"])
            txs.append(self.build_tx(self._wallet_array[i], "cx0000000000000000000000000000000000000000",
                                     2000000000000000000000, "registerPRep", params))
        ab = self.process_transaction_bulk(txs, self.icon_service, 10)
        print(ab)

    def send_icx(self, from_: KeyWallet, to: str, value: int):
        previous_to_balance = self.get_balance(to)
        previous_from_balance = self.get_balance(from_.get_address())

        signed_icx_transaction = self.build_send_icx(from_, to, value)
        tx_result = self.process_transaction(signed_icx_transaction, self.icon_service, self.BLOCK_INTERVAL)

        fee = tx_result['stepPrice'] * tx_result['cumulativeStepUsed']
        self.assertTrue('status' in tx_result)
        self.assertEqual(1, tx_result['status'], f"Failure: {tx_result['failure']}" if tx_result['status'] == 0 else "")
        self.assertEqual(previous_to_balance + value, self.get_balance(to))
        self.assertEqual(previous_from_balance - value - fee, self.get_balance(from_.get_address()))

    def build_send_icx(self, from_: KeyWallet, to: str, value: int) -> SignedTransaction:
        send_icx_transaction = TransactionBuilder(
            from_=from_.get_address(),
            to=to,
            value=value,
            step_limit=1000000,
            nid=3,
            nonce=3
        ).build()
        signed_icx_transaction = SignedTransaction(send_icx_transaction, from_)
        return signed_icx_transaction

    def get_balance(self, address: str) -> int:
        if self.icon_service is not None:
            return self.icon_service.get_balance(address)
        params = {'address': Address.from_string(address)}
        response = self.icon_service_engine.query(method="icx_getBalance", params=params)
        return response

    def send_tx(self, from_: KeyWallet, to: str, value: int = 0, method: str = None, params: dict = None) -> dict:
        signed_transaction = self.build_tx(from_, to, value, method, params)
        tx_result = self.process_transaction(signed_transaction, self.icon_service, self.BLOCK_INTERVAL)
        # ab = tx_result
        # print(ab)
        step_price = tx_result['stepPrice']
        step_used = tx_result['stepUsed']
        # print(step_used)
        # print(step_price)
        print("The tx fee is ....")
        print((step_price * step_used) / 10 ** 18)
        self.assertTrue('status' in tx_result)
        self.assertEqual(1, tx_result['status'], f"Failure: {tx_result['failure']}" if tx_result['status'] == 0 else "")
        return tx_result

    def build_tx(self, from_: KeyWallet, to: str, value: int, method: str = None, params: dict = None) \
            -> SignedTransaction:
        params = {} if params is None else params
        tx = CallTransactionBuilder(
            from_=from_.get_address(),
            to=to,
            value=value,
            step_limit=3_000_000_000,
            nid=3,
            nonce=5,
            method=method,
            params=params
        ).build()
        signed_transaction = SignedTransaction(tx, from_)
        return signed_transaction

    def _build_call_tx(self, _score, params, method):
        params = {} if params is None else params
        _call = CallBuilder() \
            .from_(self._test1.get_address()) \
            .to(_score) \
            .method(method) \
            .params(params) \
            .build()
        response = self.process_call(_call, self.icon_service)
        return response

    def build_transaction(self, from_: KeyWallet, to: str, value: int = 0, method: str = None,
                          params: dict = None) -> dict:
        call_transaction = CallTransactionBuilder() \
            .from_(from_.get_address()) \
            .to(to) \
            .value(value) \
            .nid(3) \
            .nonce(100) \
            .method(method) \
            .params(params) \
            .build()
        signed_transaction = SignedTransaction(call_transaction, self._test1, 10000000)
        tx_result = self.process_transaction(signed_transaction, self.icon_service)
        return tx_result

    def _add_admin(self):
        self.build_transaction(self._test1, self.cps_score, 0, 'add_admin', {'_address': self._test1.get_address()})

    def _set_cps_treasury_score(self):
        self._add_admin()
        self.build_transaction(self._test1, self.cps_score, 0, 'set_cps_treasury_score',
                               {'_score': self.cps_treasury_score})

    def _set_cpf_treasury_score(self):
        self._add_admin()
        self.build_transaction(self._test1, self.cps_score, 0, 'set_cpf_treasury_score', {'_score': self.cpf_score})

    def _set_cps_score_in_cpf_treasury(self):
        self.build_transaction(self._test1, self.cpf_score, 0, 'set_cps_score', {'_score': self.cps_score})

    def _set_cps_treasury_score_in_cpf_treasury(self):
        self.build_transaction(self._test1, self.cpf_score, 0, 'set_cps_treasury_score',
                               {'_score': self.cps_treasury_score})

    def _set_cps_score_in_cps_treasury(self):
        self.build_transaction(self._test1, self.cps_treasury_score, 0, 'set_cps_score', {'_score': self.cps_score})

    def _set_cpf_score_in_cps_treasury(self):
        self.build_transaction(self._test1, self.cps_treasury_score, 0, 'set_cpf_treasury_score', {'_score': self.cpf_score})

    def _register_prep(self):
        print(f'Wallet address: {self._wallet_array[10].get_address()}')

        pprint(self.send_tx(self._wallet_array[10], self.cps_score, 0, 'register_prep', None))
        pprint(self.send_tx(self._wallet_array[11], self.cps_score, 0, 'register_prep', None))
        pprint(self.send_tx(self._wallet_array[12], self.cps_score, 0, 'register_prep', None))
        pprint(self.send_tx(self._wallet_array[13], self.cps_score, 0, 'register_prep', None))
        pprint(self.send_tx(self._wallet_array[14], self.cps_score, 0, 'register_prep', None))
        pprint(self.send_tx(self._wallet_array[15], self.cps_score, 0, 'register_prep', None))
        pprint(self.send_tx(self._wallet_array[16], self.cps_score, 0, 'register_prep', None))

    def test_submit_proposal(self):
        self._add_fund()
        proposal_parameters = {'ipfs_hash': 'bafybeie5cifgwgu2x3guixgrs67miydug7ocyp6yia5kxv3imve6fthbs4',
                               'project_title': 'Test Proposal',
                               'project_duration': 3,
                               'total_budget': 3182,
                               'sponsor_address': self._wallet_array[10].get_address(),
                               'ipfs_link': 'test.link@link.com'}
        self._set_cps_treasury_score()
        self._set_cpf_treasury_score()
        pprint(self._build_call_tx(self.cps_score, None, "get_period_status"))
        self._set_initial_block()
        self._register_prep()
        pprint(self._build_call_tx(self.cps_score, None, "get_period_status"))  # application period
        tx_result = self.send_tx(self._test1, self.cps_score, 50 * 10 ** 18, "submit_proposal",
                                 {'_proposals': proposal_parameters})
        pprint(tx_result)
        pprint(self._build_call_tx(self.cps_score, None, "get_period_status"))
        self.assertEqual(tx_result['eventLogs'][0]['data'][0], 'Successfully submitted a Proposal.')

    def test_get_total_fund_cpf_score(self):
        self._add_fund()
        print(f"Total fund: {int(self._build_call_tx(self.cpf_score, None, 'get_total_fund'), 16)}")

    def _submit_proposal(self):
        self._add_fund()
        proposal_parameters = {'ipfs_hash': 'bafybeie5cifgwgu2x3guixgrs67miydug7ocyp6yia5kxv3imve6fthbs4',
                               'project_title': 'Test Proposal',
                               'project_duration': 3,
                               'total_budget': 3182,
                               'sponsor_address': self._wallet_array[10].get_address(),
                               'ipfs_link': 'test.link@link.com'}
        self._set_cps_treasury_score()
        self._set_cpf_treasury_score()
        self._set_cps_score_in_cpf_treasury()
        self._set_cps_treasury_score_in_cpf_treasury()
        self._set_initial_block()
        tx_result = self.send_tx(self._test1, self.cps_score, 50 * 10 ** 18, "submit_proposal",
                                 {'_proposals': proposal_parameters})
        pprint(tx_result)

    def _add_fund(self):
        self.send_tx(self._test1, self.cpf_score, 7000 * 10 ** 18, "add_fund", None)

    def _set_initial_block(self):
        self.send_tx(self._test1, self.cps_score, 0, "set_initialBlock", None)

    def test_update_period(self):
        self._submit_proposal()
        self._sponsor_vote(ACCEPT)
        pprint(self._build_call_tx(self.cps_score, None, "get_period_status"))
        tx_result = self.send_tx(self._test1, self.cps_score, 0, 'update_period', None)
        pprint(tx_result)
        pprint(self._build_call_tx(self.cps_score, None, "get_period_status"))

    def _sponsor_vote(self, _vote):
        pprint(self.send_tx(self._wallet_array[10], self.cps_score, 3182 * 10 ** 17, 'sponsor_vote',
                            {'_ipfs_key': 'bafybeie5cifgwgu2x3guixgrs67miydug7ocyp6yia5kxv3imve6fthbs4',
                             '_vote': _vote,
                             '_vote_reason': 'Vote Reason'}))

    def test_sponsor_vote(self):
        self._submit_proposal()
        pprint(self._build_call_tx(self.cps_score, None, "get_period_status"))
        tx_result = self.send_tx(self._wallet_array[10], self.cps_score, 3182 * 10 ** 17,
                                 'sponsor_vote',
                                 {'_ipfs_key': 'bafybeie5cifgwgu2x3guixgrs67miydug7ocyp6yia5kxv3imve6fthbs4',
                                  '_vote': ACCEPT,
                                  '_vote_reason': 'Vote Reason'})
        pprint(tx_result)
        pprint(self._build_call_tx(self.cps_score, None, "get_period_status"))

    def test_vote_proposal(self):
        self._submit_proposal()
        time.sleep(1)
        self._sponsor_vote(ACCEPT)
        self._set_delegation()
        time.sleep(60)
        tx_result = self.send_tx(self._wallet_array[10], self.cps_score, 0, 'vote_proposal',
                                 {'_ipfs_key': 'bafybeie5cifgwgu2x3guixgrs67miydug7ocyp6yia5kxv3imve6fthbs4',
                                  '_vote': APPROVE,
                                  '_vote_reason': 'Vote Reason'})
        pprint(tx_result)

        tx_result = self.send_tx(self._wallet_array[11], self.cps_score, 0, 'vote_proposal',
                                 {'_ipfs_key': 'bafybeie5cifgwgu2x3guixgrs67miydug7ocyp6yia5kxv3imve6fthbs4',
                                  '_vote': APPROVE,
                                  '_vote_reason': 'Vote Reason'})
        pprint(tx_result)

        tx_result = self.send_tx(self._wallet_array[12], self.cps_score, 0, 'vote_proposal',
                                 {'_ipfs_key': 'bafybeie5cifgwgu2x3guixgrs67miydug7ocyp6yia5kxv3imve6fthbs4',
                                  '_vote': APPROVE,
                                  '_vote_reason': 'Vote Reason'})
        pprint(tx_result)

        tx_result = self.send_tx(self._wallet_array[13], self.cps_score, 0, 'vote_proposal',
                                 {'_ipfs_key': 'bafybeie5cifgwgu2x3guixgrs67miydug7ocyp6yia5kxv3imve6fthbs4',
                                  '_vote': APPROVE,
                                  '_vote_reason': 'Vote Reason'})
        pprint(tx_result)

        tx_result = self.send_tx(self._wallet_array[14], self.cps_score, 0, 'vote_proposal',
                                 {'_ipfs_key': 'bafybeie5cifgwgu2x3guixgrs67miydug7ocyp6yia5kxv3imve6fthbs4',
                                  '_vote': APPROVE,
                                  '_vote_reason': 'Vote Reason'})
        pprint(tx_result)

        tx_result = self.send_tx(self._wallet_array[15], self.cps_score, 0, 'vote_proposal',
                                 {'_ipfs_key': 'bafybeie5cifgwgu2x3guixgrs67miydug7ocyp6yia5kxv3imve6fthbs4',
                                  '_vote': APPROVE,
                                  '_vote_reason': 'Vote Reason'})
        pprint(tx_result)
        pprint(self._build_call_tx(self.cps_score,
                                   {'_ipfs_key': 'bafybeie5cifgwgu2x3guixgrs67miydug7ocyp6yia5kxv3imve6fthbs4'},
                                   'get_proposal_details_by_hash'))
        pprint(self._build_call_tx(self.cps_score, None, 'get_denylist'))
        time.sleep(90)
        progress_report_parameters = {'ipfs_hash': 'bafybeie5cifgwgu2x3guixgrs67miydug7ocyp6yia5kxv3imve6fthbs4',
                                      'report_hash': 'Report 1',
                                      'ipfs_link': 'test.link@link.com',
                                      'progress_report_title': 'Progress Report 1',
                                      'budget_adjustment': True,
                                      'additional_budget': 100,
                                      'additional_month': 0,
                                      'percentage_completed': 10}
        pprint(self.send_tx(self._test1, self.cps_score, 0, 'submit_progress_report',
                            {'_progress_report': progress_report_parameters}))
        pprint(self._build_call_tx(self.cps_score, None, 'get_denylist'))
        proposal_details = self._build_call_tx(self.cps_score,
                                   {'_ipfs_key': 'bafybeie5cifgwgu2x3guixgrs67miydug7ocyp6yia5kxv3imve6fthbs4'},
                                   'get_proposal_details_by_hash')
        inactive_preps = self._build_call_tx(self.cps_score, None, 'get_inactive_preps')
        print(self._wallet_array[16].get_address())
        self.assertEqual(inactive_preps, [self._wallet_array[16].get_address()])
        self.assertEqual(proposal_details['status'], '_active')
        self.assertEqual(self._build_call_tx(self.cps_score, {'_status': '_active'}, 'get_proposals_keys_by_status'),
                         ['bafybeie5cifgwgu2x3guixgrs67miydug7ocyp6yia5kxv3imve6fthbs4'])
        self.assertEqual(int(proposal_details['approve_voters'], 16), 6)
        self.assertEqual(int(proposal_details['approved_votes'], 16), 600)
        self.assertEqual(proposal_details['sponsor_deposit_status'], 'bond_approved')
        self.assertEqual(self.icon_service.get_balance(self.cps_treasury_score), 3245640000000000000000)

    def test_vote_proposal_Reject(self):
        self._submit_proposal()
        time.sleep(1)
        self._sponsor_vote(ACCEPT)
        self._set_delegation()
        time.sleep(30)
        tx_result = self.send_tx(self._wallet_array[10], self.cps_score, 0, 'vote_proposal',
                                 {'_ipfs_key': 'bafybeie5cifgwgu2x3guixgrs67miydug7ocyp6yia5kxv3imve6fthbs4',
                                  '_vote': REJECT,
                                  '_vote_reason': 'Vote Reason'})
        pprint(tx_result)

        tx_result = self.send_tx(self._wallet_array[11], self.cps_score, 0, 'vote_proposal',
                                 {'_ipfs_key': 'bafybeie5cifgwgu2x3guixgrs67miydug7ocyp6yia5kxv3imve6fthbs4',
                                  '_vote': REJECT,
                                  '_vote_reason': 'Vote Reason'})
        pprint(tx_result)

        tx_result = self.send_tx(self._wallet_array[12], self.cps_score, 0, 'vote_proposal',
                                 {'_ipfs_key': 'bafybeie5cifgwgu2x3guixgrs67miydug7ocyp6yia5kxv3imve6fthbs4',
                                  '_vote': REJECT,
                                  '_vote_reason': 'Vote Reason'})
        pprint(tx_result)

        tx_result = self.send_tx(self._wallet_array[13], self.cps_score, 0, 'vote_proposal',
                                 {'_ipfs_key': 'bafybeie5cifgwgu2x3guixgrs67miydug7ocyp6yia5kxv3imve6fthbs4',
                                  '_vote': REJECT,
                                  '_vote_reason': 'Vote Reason'})
        pprint(tx_result)

        tx_result = self.send_tx(self._wallet_array[14], self.cps_score, 0, 'vote_proposal',
                                 {'_ipfs_key': 'bafybeie5cifgwgu2x3guixgrs67miydug7ocyp6yia5kxv3imve6fthbs4',
                                  '_vote': REJECT,
                                  '_vote_reason': 'Vote Reason'})
        pprint(tx_result)

        tx_result = self.send_tx(self._wallet_array[15], self.cps_score, 0, 'vote_proposal',
                                 {'_ipfs_key': 'bafybeie5cifgwgu2x3guixgrs67miydug7ocyp6yia5kxv3imve6fthbs4',
                                  '_vote': REJECT,
                                  '_vote_reason': 'Vote Reason'})
        pprint(tx_result)
        pprint(self._build_call_tx(self.cps_score,
                                   {'_ipfs_key': 'bafybeie5cifgwgu2x3guixgrs67miydug7ocyp6yia5kxv3imve6fthbs4'},
                                   'get_proposal_details_by_hash'))

        time.sleep(90)
        sponsor_balance_before = self.icon_service.get_balance(self._wallet_array[10].get_address())
        pprint(self.send_tx(self._test1, self.cps_score, 0, 'update_period', None))
        proposal_details = self._build_call_tx(self.cps_score,
                                   {'_ipfs_key': 'bafybeie5cifgwgu2x3guixgrs67miydug7ocyp6yia5kxv3imve6fthbs4'},
                                   'get_proposal_details_by_hash')
        pprint(proposal_details)
        self.assertEqual(proposal_details['status'], '_rejected')
        self.assertEqual(int(proposal_details['reject_voters'], 16), 6)
        self.assertEqual(int(proposal_details['rejected_votes'], 16), 600)
        self.assertEqual(proposal_details['sponsor_deposit_status'], 'bond_returned')
        sponsor_balance_after = self.icon_service.get_balance(self._wallet_array[10].get_address())
        self.assertEqual(sponsor_balance_after - sponsor_balance_before, 318200000000000000000)

    def _vote_proposal(self):
        self._submit_proposal()
        time.sleep(1)
        self._sponsor_vote(ACCEPT)
        self._set_delegation()
        time.sleep(30)
        tx_result = self.send_tx(self._wallet_array[10], self.cps_score, 0, 'vote_proposal',
                                 {'_ipfs_key': 'bafybeie5cifgwgu2x3guixgrs67miydug7ocyp6yia5kxv3imve6fthbs4',
                                  '_vote': APPROVE,
                                  '_vote_reason': 'Vote Reason'})
        pprint(tx_result)

        tx_result = self.send_tx(self._wallet_array[11], self.cps_score, 0, 'vote_proposal',
                                 {'_ipfs_key': 'bafybeie5cifgwgu2x3guixgrs67miydug7ocyp6yia5kxv3imve6fthbs4',
                                  '_vote': APPROVE,
                                  '_vote_reason': 'Vote Reason'})
        pprint(tx_result)

        tx_result = self.send_tx(self._wallet_array[12], self.cps_score, 0, 'vote_proposal',
                                 {'_ipfs_key': 'bafybeie5cifgwgu2x3guixgrs67miydug7ocyp6yia5kxv3imve6fthbs4',
                                  '_vote': APPROVE,
                                  '_vote_reason': 'Vote Reason'})
        pprint(tx_result)

        tx_result = self.send_tx(self._wallet_array[13], self.cps_score, 0, 'vote_proposal',
                                 {'_ipfs_key': 'bafybeie5cifgwgu2x3guixgrs67miydug7ocyp6yia5kxv3imve6fthbs4',
                                  '_vote': APPROVE,
                                  '_vote_reason': 'Vote Reason'})
        pprint(tx_result)

        tx_result = self.send_tx(self._wallet_array[14], self.cps_score, 0, 'vote_proposal',
                                 {'_ipfs_key': 'bafybeie5cifgwgu2x3guixgrs67miydug7ocyp6yia5kxv3imve6fthbs4',
                                  '_vote': APPROVE,
                                  '_vote_reason': 'Vote Reason'})
        pprint(tx_result)

        tx_result = self.send_tx(self._wallet_array[15], self.cps_score, 0, 'vote_proposal',
                                 {'_ipfs_key': 'bafybeie5cifgwgu2x3guixgrs67miydug7ocyp6yia5kxv3imve6fthbs4',
                                  '_vote': APPROVE,
                                  '_vote_reason': 'Vote Reason'})
        tx_result = self.send_tx(self._wallet_array[16], self.cps_score, 0, 'vote_proposal',
                                 {'_ipfs_key': 'bafybeie5cifgwgu2x3guixgrs67miydug7ocyp6yia5kxv3imve6fthbs4',
                                  '_vote': APPROVE,
                                  '_vote_reason': 'Vote Reason'})
        pprint(tx_result)
        pprint(self._build_call_tx(self.cps_score,
                                   {'_ipfs_key': 'bafybeie5cifgwgu2x3guixgrs67miydug7ocyp6yia5kxv3imve6fthbs4'},
                                   'get_proposal_details_by_hash'))

    def test_submit_progress_report(self):
        self._vote_proposal()
        time.sleep(90)
        progress_report_parameters = {'ipfs_hash': 'bafybeie5cifgwgu2x3guixgrs67miydug7ocyp6yia5kxv3imve6fthbs4',
                                      'report_hash': 'Report 1',
                                      'ipfs_link': 'test.link@link.com',
                                      'progress_report_title': 'Progress Report 1',
                                      'budget_adjustment': True,
                                      'additional_budget': 100,
                                      'additional_month': 0,
                                      'percentage_completed': 10}
        pprint(self.send_tx(self._test1, self.cps_score, 0, 'submit_progress_report',
                            {'_progress_report': progress_report_parameters}))
        pprint(self._build_call_tx(self.cps_score, None, 'get_denylist'))
        proposal_details = self._build_call_tx(self.cps_score,
                                               {
                                                   '_ipfs_key': 'bafybeie5cifgwgu2x3guixgrs67miydug7ocyp6yia5kxv3imve6fthbs4'},
                                               'get_proposal_details_by_hash')
        pprint(proposal_details)
        self.assertEqual(int(proposal_details['budget_adjustment'], 16), 1)
        self.assertEqual(int(proposal_details['percentage_completed'], 16), 10)
        self.assertEqual(int(proposal_details['submit_progress_report'], 16), 1)

    def _submit_progress_report(self):
        self._vote_proposal()
        time.sleep(90)
        progress_report_parameters = {'ipfs_hash': 'bafybeie5cifgwgu2x3guixgrs67miydug7ocyp6yia5kxv3imve6fthbs4',
                                      'report_hash': 'Report 1',
                                      'ipfs_link': 'test.link@link.com',
                                      'progress_report_title': 'Progress Report 1',
                                      'budget_adjustment': True,
                                      'additional_budget': 100,
                                      'additional_month': 0,
                                      'percentage_completed': 10}
        pprint(self.send_tx(self._test1, self.cps_score, 0, 'submit_progress_report',
                            {'_progress_report': progress_report_parameters}))
        pprint(self._build_call_tx(self.cps_score, None, 'get_denylist'))
        proposal_details = self._build_call_tx(self.cps_score,
                                               {
                                                   '_ipfs_key': 'bafybeie5cifgwgu2x3guixgrs67miydug7ocyp6yia5kxv3imve6fthbs4'},
                                               'get_proposal_details_by_hash')
        pprint(proposal_details)

    def test_progress_report_submission(self):
        self._submit_progress_report()
        pprint(self.send_tx(self._test1, self.cps_score, 0, 'update_period', None))
        proposal_details = self._build_call_tx(self.cps_score,
                                               {
                                                   '_ipfs_key': 'bafybeie5cifgwgu2x3guixgrs67miydug7ocyp6yia5kxv3imve6fthbs4'},
                                               'get_proposal_details_by_hash')
        pprint(proposal_details)

    def test_progress_report_submission_when_not_submitted(self):
        self._vote_proposal()
        time.sleep(90)
        pprint(self.send_tx(self._test1, self.cps_score, 0, 'update_period', None))
        time.sleep(5)
        pprint(self.send_tx(self._test1, self.cps_score, 0, 'update_period', None))
        time.sleep(5)
        pprint(self.send_tx(self._test1, self.cps_score, 0, 'update_period', None))
        time.sleep(5)
        pprint(self.send_tx(self._test1, self.cps_score, 0, 'update_period', None))
        time.sleep(5)  ## voting to applicaton
        pprint(self.send_tx(self._test1, self.cps_score, 0, 'update_period', None))
        time.sleep(5) # application to voting
        pprint(self.send_tx(self._test1, self.cps_score, 0, 'update_period', None))
        time.sleep(5)
        pprint(self.send_tx(self._test1, self.cps_score, 0, 'update_period', None))
        time.sleep(5)
        pprint(self.send_tx(self._test1, self.cps_score, 0, 'update_period', None))
        pprint(self.send_tx(self._test1, self.cps_score, 0, 'update_period', None)) # voting to application
        pprint(self.send_tx(self._test1, self.cps_score, 0, 'update_period', None)) # application to voting

        proposal_details = self._build_call_tx(self.cps_score,
                                               {
                                                   '_ipfs_key': 'bafybeie5cifgwgu2x3guixgrs67miydug7ocyp6yia5kxv3imve6fthbs4'},
                                               'get_proposal_details_by_hash')
        pprint(proposal_details)

    def _set_stake(self):
        pprint(self.send_tx(self._wallet_array[10],
                            'cx0000000000000000000000000000000000000000', 0, 'setStake',
                            {'value': 100}))
        pprint(self.send_tx(self._wallet_array[11],
                            'cx0000000000000000000000000000000000000000', 0, 'setStake',
                            {'value': 100}))
        pprint(self.send_tx(self._wallet_array[12],
                            'cx0000000000000000000000000000000000000000', 0, 'setStake',
                            {'value': 100}))
        pprint(self.send_tx(self._wallet_array[13],
                            'cx0000000000000000000000000000000000000000', 0, 'setStake',
                            {'value': 100}))
        pprint(self.send_tx(self._wallet_array[14],
                            'cx0000000000000000000000000000000000000000', 0, 'setStake',
                            {'value': 100}))
        pprint(self.send_tx(self._wallet_array[15],
                            'cx0000000000000000000000000000000000000000', 0, 'setStake',
                            {'value': 100}))
        pprint(self.send_tx(self._wallet_array[16],
                            'cx0000000000000000000000000000000000000000', 0, 'setStake',
                            {'value': 100}))

    def _set_delegation(self):
        pprint(self.send_tx(self._wallet_array[10],
                            'cx0000000000000000000000000000000000000000', 0, 'setDelegation',
                            {'delegations': [{'address': self._wallet_array[10].get_address(),
                                              'value': 100}]}))
        pprint(self.send_tx(self._wallet_array[11],
                            'cx0000000000000000000000000000000000000000', 0, 'setDelegation',
                            {'delegations': [{'address': self._wallet_array[11].get_address(),
                                              'value': 100}]}))
        pprint(self.send_tx(self._wallet_array[12],
                            'cx0000000000000000000000000000000000000000', 0, 'setDelegation',
                            {'delegations': [{'address': self._wallet_array[12].get_address(),
                                              'value': 100}]}))
        pprint(self.send_tx(self._wallet_array[13],
                            'cx0000000000000000000000000000000000000000', 0, 'setDelegation',
                            {'delegations': [{'address': self._wallet_array[13].get_address(),
                                              'value': 100}]}))
        pprint(self.send_tx(self._wallet_array[14],
                            'cx0000000000000000000000000000000000000000', 0, 'setDelegation',
                            {'delegations': [{'address': self._wallet_array[14].get_address(),
                                              'value': 100}]}))
        pprint(self.send_tx(self._wallet_array[15],
                            'cx0000000000000000000000000000000000000000', 0, 'setDelegation',
                            {'delegations': [{'address': self._wallet_array[15].get_address(),
                                              'value': 100}]}))
        pprint(self.send_tx(self._wallet_array[16],
                            'cx0000000000000000000000000000000000000000', 0, 'setDelegation',
                            {'delegations': [{'address': self._wallet_array[16].get_address(),
                                              'value': 100}]}))

    def _get_stake(self):
        self._set_delegation()
        pprint(self._build_call_tx(self.cps_score, {'_address': self._wallet_array[10].get_address()}, '_get_stake'))

    def _get_balance(self):
        print(self.icon_service.get_balance(self._test1.get_address()))
        print(self.icon_service.get_balance(self._wallet_array[10].get_address()))
        print(self.icon_service.get_balance(self.cpf_score))
        print(self.icon_service.get_balance(self.cps_treasury_score))

    def test_print_score_address(self):
        print(self.cps_score)
        print(self.cpf_score)
        print(self.cps_treasury_score)

    def _get_period_status(self):
        pprint(self._build_call_tx(self.cps_score, None, 'get_period_status'))
        proposal_details = self._build_call_tx(self.cps_score,
                                               {
                                                   '_ipfs_key': 'bafybeie5cifgwgu2x3guixgrs67miydug7ocyp6yia5kxv3imve6fthbs4'},
                                               'get_proposal_details_by_hash')
        pprint(proposal_details)
        pprint(self.send_tx(self._test1, self.cps_score, 0, 'update_period', None))
        time.sleep(5)
        pprint(self.send_tx(self._test1, self.cps_score, 0, 'update_period', None))
        time.sleep(5)
        pprint(self.send_tx(self._test1, self.cps_score, 0, 'update_period', None))
        pprint(self._build_call_tx(self.cps_score, None, 'get_period_status'))

    def _set_prep_penalty_amount(self):
        self.send_tx(self._test1, self.cps_score, 0, 'set_prep_penalty_amount', {'_penalty': [5, 10, 15]})
        pprint(self._build_call_tx(self.cps_score, {'_address': self._wallet_array[16].get_address()}, 'login_prep'))
        pprint(self.send_tx(self._wallet_array[16], self.cps_score, int('0x4563918244f40000', 16), 'pay_prep_penalty', None))

    def test_update_period_fail_case(self):
        proposal_details = self._build_call_tx(self.cps_score,
                                               {
                                                   '_ipfs_key': 'bafybeie5cifgwgu2x3guixgrs67miydug7ocyp6yia5kxv3imve6fthbs4'},
                                               'get_proposal_details_by_hash')
        pprint(proposal_details)
        pprint(self.send_tx(self._test1, self.cps_score, 0, 'update_period', None))
        proposal_details = self._build_call_tx(self.cps_score,
                                               {
                                                   '_ipfs_key': 'bafybeie5cifgwgu2x3guixgrs67miydug7ocyp6yia5kxv3imve6fthbs4'},
                                               'get_proposal_details_by_hash')
        pprint(proposal_details)

    def test_vote_proposals_two_proposals(self):
        print(self.cps_score)
        print(self.cpf_score)
        print(self.cps_treasury_score)
        self._submit_proposal_with_hash('bafybeie5cifgwgu2x3guixgrs67miydug7ocyp6yia5kxv3imve6fthbs4', 3182)
        self._submit_proposal_with_hash('bafybeiaubhdzignnbe24ypwwulsr6fxju4uyujzx5tnyqc6fgop3qbyldu', 1200)
        pprint(self._build_call_tx(self.cps_score, None, 'get_period_status'))
        self._sponsor_vote_two_proposals(ACCEPT)
        self._set_stake()
        self._set_delegation()
        self.vote_proposals_two_proposals()
        pprint(self.send_tx(self._test1, self.cps_score, 0, 'update_period', None))
        pprint(self.send_tx(self._test1, self.cps_score, 0, 'update_period', None))
        pprint(self.send_tx(self._test1, self.cps_score, 0, 'update_period', None))
        time.sleep(3)
        print(f'cpf_score_balance_before_progress_report_submission = {self.icon_service.get_balance(self.cpf_score)}')
        print(f'cps_treasury_balace_progress_report_submission = {self.icon_service.get_balance(self.cps_treasury_score)}')
        print(f'sponsor_balance_progress_report_submission = {self.icon_service.get_balance(self._wallet_array[10].get_address())}')
        print(f'contributor_balance_progress_report_submission = {self.icon_service.get_balance(self._test1.get_address())}')

        self._submit_progress_report_two_proposals()
        time.sleep(5)
        print(f'cpf_score_balance_before_progress_report_vote = {self.icon_service.get_balance(self.cpf_score)}')
        print(f'cps_treasury_balace_before_progress_report_vote = {self.icon_service.get_balance(self.cps_treasury_score)}')
        print(f'sponsor_balance_before_progress_report_vote= {self.icon_service.get_balance(self._wallet_array[10].get_address())}')
        print(f'contributor_balance_before_progress_report_vote= {self.icon_service.get_balance(self._test1.get_address())}')
        time.sleep(60)
        self._vote_two_progress_report()

        proposal_details = self._build_call_tx(self.cps_score,
                                               {
                                                   '_ipfs_key': 'bafybeie5cifgwgu2x3guixgrs67miydug7ocyp6yia5kxv3imve6fthbs4'},
                                               'get_proposal_details_by_hash')
        pprint(proposal_details)
        self.assertEqual(int(proposal_details['submit_progress_report'], 16), 1)
        self.assertEqual(int(proposal_details['budget_adjustment'], 16), 1)

        proposal_details_du = self._build_call_tx(self.cps_score,
                                   {'_ipfs_key': 'bafybeiaubhdzignnbe24ypwwulsr6fxju4uyujzx5tnyqc6fgop3qbyldu'},
                                   'get_proposal_details_by_hash')
        pprint(proposal_details_du)
        self.assertEqual(int(proposal_details_du['submit_progress_report'], 16), 0)
        self.assertEqual(int(proposal_details_du['budget_adjustment'], 16), 0)

        progress_report_details = self._build_call_tx(self.cps_score,
                                   {'_report_key': 'Report 1'},
                                    'get_progress_reports_by_hash')
        pprint(progress_report_details)
        self.assertEqual(progress_report_details['progress_report_title'], 'Progress Report 1')
        self.assertEqual(progress_report_details['report_hash'], 'Report 1')
        self.assertEqual(progress_report_details['status'], '_waiting')
        self.assertEqual(progress_report_details['budget_adjustment_status'], '_pending')
        self.assertEqual(int(progress_report_details['approve_voters'], 16), 7)
        self.assertEqual(int(progress_report_details['approved_votes'], 16), 700)
        self.assertEqual(int(progress_report_details['budget_approve_voters'], 16), 7)
        self.assertEqual(int(progress_report_details['budget_approved_votes'], 16), 700)
        self.assertEqual(int(progress_report_details['total_voters'], 16), 7)
        self.assertEqual(int(progress_report_details['total_votes'], 16), 700)
        #
        #
        #
        time.sleep(90)
        pprint(self.send_tx(self._test1, self.cps_score, 0, 'update_period', None))
        proposal_details = self._build_call_tx(self.cps_score,
                                               {
                                                   '_ipfs_key': 'bafybeie5cifgwgu2x3guixgrs67miydug7ocyp6yia5kxv3imve6fthbs4'},
                                               'get_proposal_details_by_hash')
        pprint(proposal_details)
        pprint(self._build_call_tx(self.cps_score,
                                   {'_ipfs_key': 'bafybeiaubhdzignnbe24ypwwulsr6fxju4uyujzx5tnyqc6fgop3qbyldu'},
                                   'get_proposal_details_by_hash'))
        pprint(self._build_call_tx(self.cps_score,
                                   {'_report_key': 'Report 1'},
                                   'get_progress_reports_by_hash'))
        #
        #
        #
        time.sleep(30)
        pprint(self.send_tx(self._test1, self.cps_score, 0, 'update_period', None))
        proposal_details = self._build_call_tx(self.cps_score,
                                               {
                                                   '_ipfs_key': 'bafybeie5cifgwgu2x3guixgrs67miydug7ocyp6yia5kxv3imve6fthbs4'},
                                               'get_proposal_details_by_hash')
        pprint(proposal_details)
        pprint(self._build_call_tx(self.cps_score,
                                   {'_ipfs_key': 'bafybeiaubhdzignnbe24ypwwulsr6fxju4uyujzx5tnyqc6fgop3qbyldu'},
                                   'get_proposal_details_by_hash'))
        pprint(self._build_call_tx(self.cps_score,
                                   {'_report_key': 'Report 1'},
                                   'get_progress_reports_by_hash'))
        #
        #
        #
        time.sleep(30)
        pprint(self.send_tx(self._test1, self.cps_score, 0, 'update_period', None))
        proposal_details = self._build_call_tx(self.cps_score,
                                               {
                                                   '_ipfs_key': 'bafybeie5cifgwgu2x3guixgrs67miydug7ocyp6yia5kxv3imve6fthbs4'},
                                               'get_proposal_details_by_hash')
        pprint(proposal_details)
        proposal_details_du_after_voting = self._build_call_tx(self.cps_score,
                                   {'_ipfs_key': 'bafybeiaubhdzignnbe24ypwwulsr6fxju4uyujzx5tnyqc6fgop3qbyldu'},
                                   'get_proposal_details_by_hash')
        pprint(proposal_details_du_after_voting)
        self.assertEqual(proposal_details_du_after_voting['status'], '_paused')
        progress_report_details_after_voting_check = self._build_call_tx(self.cps_score,
                                   {'_report_key': 'Report 1'},
                                   'get_progress_reports_by_hash')
        pprint(progress_report_details_after_voting_check)
        self.assertEqual(progress_report_details_after_voting_check['status'], '_approved')
        self.assertEqual(progress_report_details_after_voting_check['budget_adjustment_status'], '_approved')
        print(f'cpf_score_balance_after_progress_report_voting = {self.icon_service.get_balance(self.cpf_score)}')
        print(f'cps_treasury_balace_after_progress_report_voting = {self.icon_service.get_balance(self.cps_treasury_score)}')
        print(f'sponsor_balance_after_progress_report_voting = {self.icon_service.get_balance(self._wallet_array[10].get_address())}')
        print(f'contributor_balance_after_progress_report_voting = {self.icon_service.get_balance(self._test1.get_address())}')

        #######  ##########  ############
        #     #  #        #  #          #
        ######   #        #  #          #
        #        # #######   #          #
        #        #  #        #          #
        #        #     #     #          #
        #        #         # ############

        self._submit_progress_report_two_proposals_next_cycle()
        # time.sleep(15)
        self._vote_two_progress_report_next_cycle()

        proposal_details = self._build_call_tx(self.cps_score,
                                               {
                                                   '_ipfs_key': 'bafybeie5cifgwgu2x3guixgrs67miydug7ocyp6yia5kxv3imve6fthbs4'},
                                               'get_proposal_details_by_hash')
        pprint(proposal_details)
        proposal_details_du_after_voting = self._build_call_tx(self.cps_score,
                                                               {
                                                                   '_ipfs_key': 'bafybeiaubhdzignnbe24ypwwulsr6fxju4uyujzx5tnyqc6fgop3qbyldu'},
                                                               'get_proposal_details_by_hash')
        pprint(proposal_details_du_after_voting)
        #
        #
        #
        #
        time.sleep(90)
        pprint(self.send_tx(self._test1, self.cps_score, 0, 'update_period', None))
        proposal_details = self._build_call_tx(self.cps_score,
                                               {
                                                   '_ipfs_key': 'bafybeie5cifgwgu2x3guixgrs67miydug7ocyp6yia5kxv3imve6fthbs4'},
                                               'get_proposal_details_by_hash')
        pprint(proposal_details)
        proposal_details_du_after_voting = self._build_call_tx(self.cps_score,
                                                               {
                                                                   '_ipfs_key': 'bafybeiaubhdzignnbe24ypwwulsr6fxju4uyujzx5tnyqc6fgop3qbyldu'},
                                                               'get_proposal_details_by_hash')
        pprint(proposal_details_du_after_voting)

        #
        #
        #
        #

        time.sleep(30)
        pprint(self.send_tx(self._test1, self.cps_score, 0, 'update_period', None))
        proposal_details = self._build_call_tx(self.cps_score,
                                               {
                                                   '_ipfs_key': 'bafybeie5cifgwgu2x3guixgrs67miydug7ocyp6yia5kxv3imve6fthbs4'},
                                               'get_proposal_details_by_hash')
        pprint(proposal_details)
        proposal_details_du_after_voting = self._build_call_tx(self.cps_score,
                                                               {
                                                                   '_ipfs_key': 'bafybeiaubhdzignnbe24ypwwulsr6fxju4uyujzx5tnyqc6fgop3qbyldu'},
                                                               'get_proposal_details_by_hash')
        pprint(proposal_details_du_after_voting)

        #
        #
        #
        #

        time.sleep(30)
        pprint(self.send_tx(self._test1, self.cps_score, 0, 'update_period', None))
        proposal_details = self._build_call_tx(self.cps_score,
                                               {
                                                   '_ipfs_key': 'bafybeie5cifgwgu2x3guixgrs67miydug7ocyp6yia5kxv3imve6fthbs4'},
                                               'get_proposal_details_by_hash')
        pprint(proposal_details)
        proposal_details_du_after_voting = self._build_call_tx(self.cps_score,
                                                               {
                                                                   '_ipfs_key': 'bafybeiaubhdzignnbe24ypwwulsr6fxju4uyujzx5tnyqc6fgop3qbyldu'},
                                                               'get_proposal_details_by_hash')
        pprint(proposal_details_du_after_voting)
        time.sleep(5)
        print(f'cpf_score_balance_after_progress_report_voting1 = {self.icon_service.get_balance(self.cpf_score)}')
        print(
            f'cps_treasury_balace_after_progress_report_voting1 = {self.icon_service.get_balance(self.cps_treasury_score)}')
        print(
            f'sponsor_balance_after_progress_report_voting1 = {self.icon_service.get_balance(self._wallet_array[10].get_address())}')
        print(
            f'contributor_balance_after_progress_report_voting1 = {self.icon_service.get_balance(self._test1.get_address())}')
        #
        #
        #
        #

        time.sleep(30)
        pprint(self.send_tx(self._test1, self.cps_score, 0, 'update_period', None))
        proposal_details = self._build_call_tx(self.cps_score,
                                               {
                                                   '_ipfs_key': 'bafybeie5cifgwgu2x3guixgrs67miydug7ocyp6yia5kxv3imve6fthbs4'},
                                               'get_proposal_details_by_hash')
        pprint(proposal_details)
        proposal_details_du_after_voting = self._build_call_tx(self.cps_score,
                                                               {
                                                                   '_ipfs_key': 'bafybeiaubhdzignnbe24ypwwulsr6fxju4uyujzx5tnyqc6fgop3qbyldu'},
                                                               'get_proposal_details_by_hash')
        pprint(proposal_details_du_after_voting)

        self.assertEqual(proposal_details_du_after_voting['status'], '_disqualified')

        time.sleep(5)
        print(f'cpf_score_balance_after_progress_report_voting1 = {self.icon_service.get_balance(self.cpf_score)}')
        print(f'cps_treasury_balace_after_progress_report_voting1 = {self.icon_service.get_balance(self.cps_treasury_score)}')
        print(f'sponsor_balance_after_progress_report_voting1 = {self.icon_service.get_balance(self._wallet_array[10].get_address())}')
        print(f'contributor_balance_after_progress_report_voting1 = {self.icon_service.get_balance(self._test1.get_address())}')
        # after
        # pprint(self.send_tx(self._test1, self.cps_score, 0, 'update_period', None))
        # pprint(self.send_tx(self._test1, self.cps_score, 0, 'update_period', None))
        # pprint(self.send_tx(self._test1, self.cps_score, 0, 'update_period', None))
        # self._vote_two_progress_report()

    def _submit_proposal_with_hash(self, ipfs_hash, total_budget):
        #self._add_fund()
        proposal_parameters = {'ipfs_hash': ipfs_hash,
                               'project_title': 'Test Proposal',
                               'project_duration': 3,
                               'total_budget': total_budget,
                               'sponsor_address': self._wallet_array[10].get_address(),
                               'ipfs_link': 'test.link@link.com'}
        self._set_cps_treasury_score()
        self._set_cpf_treasury_score()
        self._set_cps_score_in_cpf_treasury()
        self._set_cps_treasury_score_in_cpf_treasury()
        self._set_cps_score_in_cps_treasury()
        self._set_cpf_score_in_cps_treasury()
        self._set_initial_block()
        #self._register_prep()
        tx_result = self.send_tx(self._test1, self.cps_score, 50 * 10 ** 18, "submit_proposal",
                                 {'_proposals': proposal_parameters})
        pprint(tx_result)

    def _sponsor_vote_two_proposals(self, _vote):
        pprint(self.send_tx(self._wallet_array[10], self.cps_score, 3182 * 10 ** 17, 'sponsor_vote',
                            {'_ipfs_key': 'bafybeie5cifgwgu2x3guixgrs67miydug7ocyp6yia5kxv3imve6fthbs4',
                             '_vote': _vote,
                             '_vote_reason': 'Vote Reason'}))
        pprint(self._build_call_tx(self.cps_score, None, 'get_period_status'))
        pprint(self.send_tx(self._wallet_array[10], self.cps_score, 1200 * 10 ** 17, 'sponsor_vote',
                            {'_ipfs_key': 'bafybeiaubhdzignnbe24ypwwulsr6fxju4uyujzx5tnyqc6fgop3qbyldu',
                             '_vote': _vote,
                             '_vote_reason': 'Vote Reason'}))

    def vote_proposals_two_proposals(self):
        tx_result = self.send_tx(self._wallet_array[10], self.cps_score, 0, 'vote_proposal',
                                 {'_ipfs_key': 'bafybeie5cifgwgu2x3guixgrs67miydug7ocyp6yia5kxv3imve6fthbs4',
                                  '_vote': APPROVE,
                                  '_vote_reason': 'Vote Reason'})
        pprint(tx_result)

        tx_result = self.send_tx(self._wallet_array[11], self.cps_score, 0, 'vote_proposal',
                                 {'_ipfs_key': 'bafybeie5cifgwgu2x3guixgrs67miydug7ocyp6yia5kxv3imve6fthbs4',
                                  '_vote': APPROVE,
                                  '_vote_reason': 'Vote Reason'})
        pprint(tx_result)

        tx_result = self.send_tx(self._wallet_array[12], self.cps_score, 0, 'vote_proposal',
                                 {'_ipfs_key': 'bafybeie5cifgwgu2x3guixgrs67miydug7ocyp6yia5kxv3imve6fthbs4',
                                  '_vote': APPROVE,
                                  '_vote_reason': 'Vote Reason'})
        pprint(tx_result)

        tx_result = self.send_tx(self._wallet_array[13], self.cps_score, 0, 'vote_proposal',
                                 {'_ipfs_key': 'bafybeie5cifgwgu2x3guixgrs67miydug7ocyp6yia5kxv3imve6fthbs4',
                                  '_vote': APPROVE,
                                  '_vote_reason': 'Vote Reason'})
        pprint(tx_result)

        tx_result = self.send_tx(self._wallet_array[14], self.cps_score, 0, 'vote_proposal',
                                 {'_ipfs_key': 'bafybeie5cifgwgu2x3guixgrs67miydug7ocyp6yia5kxv3imve6fthbs4',
                                  '_vote': APPROVE,
                                  '_vote_reason': 'Vote Reason'})
        pprint(tx_result)

        tx_result = self.send_tx(self._wallet_array[15], self.cps_score, 0, 'vote_proposal',
                                 {'_ipfs_key': 'bafybeie5cifgwgu2x3guixgrs67miydug7ocyp6yia5kxv3imve6fthbs4',
                                  '_vote': APPROVE,
                                  '_vote_reason': 'Vote Reason'})
        pprint(tx_result)

        tx_result = self.send_tx(self._wallet_array[16], self.cps_score, 0, 'vote_proposal',
                                 {'_ipfs_key': 'bafybeie5cifgwgu2x3guixgrs67miydug7ocyp6yia5kxv3imve6fthbs4',
                                  '_vote': APPROVE,
                                  '_vote_reason': 'Vote Reason'})
        pprint(tx_result)
        pprint(self._build_call_tx(self.cps_score,
                                   {'_ipfs_key': 'bafybeie5cifgwgu2x3guixgrs67miydug7ocyp6yia5kxv3imve6fthbs4'},
                                   'get_proposal_details_by_hash'))

        tx_result = self.send_tx(self._wallet_array[10], self.cps_score, 0, 'vote_proposal',
                                 {'_ipfs_key': 'bafybeiaubhdzignnbe24ypwwulsr6fxju4uyujzx5tnyqc6fgop3qbyldu',
                                  '_vote': APPROVE,
                                  '_vote_reason': 'Vote Reason'})
        pprint(tx_result)

        tx_result = self.send_tx(self._wallet_array[11], self.cps_score, 0, 'vote_proposal',
                                 {'_ipfs_key': 'bafybeiaubhdzignnbe24ypwwulsr6fxju4uyujzx5tnyqc6fgop3qbyldu',
                                  '_vote': APPROVE,
                                  '_vote_reason': 'Vote Reason'})
        pprint(tx_result)

        tx_result = self.send_tx(self._wallet_array[12], self.cps_score, 0, 'vote_proposal',
                                 {'_ipfs_key': 'bafybeiaubhdzignnbe24ypwwulsr6fxju4uyujzx5tnyqc6fgop3qbyldu',
                                  '_vote': APPROVE,
                                  '_vote_reason': 'Vote Reason'})
        pprint(tx_result)

        tx_result = self.send_tx(self._wallet_array[13], self.cps_score, 0, 'vote_proposal',
                                 {'_ipfs_key': 'bafybeiaubhdzignnbe24ypwwulsr6fxju4uyujzx5tnyqc6fgop3qbyldu',
                                  '_vote': APPROVE,
                                  '_vote_reason': 'Vote Reason'})
        pprint(tx_result)

        tx_result = self.send_tx(self._wallet_array[14], self.cps_score, 0, 'vote_proposal',
                                 {'_ipfs_key': 'bafybeiaubhdzignnbe24ypwwulsr6fxju4uyujzx5tnyqc6fgop3qbyldu',
                                  '_vote': APPROVE,
                                  '_vote_reason': 'Vote Reason'})
        pprint(tx_result)

        tx_result = self.send_tx(self._wallet_array[15], self.cps_score, 0, 'vote_proposal',
                                 {'_ipfs_key': 'bafybeiaubhdzignnbe24ypwwulsr6fxju4uyujzx5tnyqc6fgop3qbyldu',
                                  '_vote': APPROVE,
                                  '_vote_reason': 'Vote Reason'})
        pprint(tx_result)
        tx_result = self.send_tx(self._wallet_array[16], self.cps_score, 0, 'vote_proposal',
                                 {'_ipfs_key': 'bafybeiaubhdzignnbe24ypwwulsr6fxju4uyujzx5tnyqc6fgop3qbyldu',
                                  '_vote': APPROVE,
                                  '_vote_reason': 'Vote Reason'})
        pprint(tx_result)
        pprint(self._build_call_tx(self.cps_score,
                                   {'_ipfs_key': 'bafybeiaubhdzignnbe24ypwwulsr6fxju4uyujzx5tnyqc6fgop3qbyldu'},
                                   'get_proposal_details_by_hash'))

    def _vote_two_progress_report(self):
        time.sleep(90)
        tx_result = self.send_tx(self._wallet_array[10], self.cps_score, 0, 'vote_progress_report',
                                 {'_ipfs_key': 'bafybeie5cifgwgu2x3guixgrs67miydug7ocyp6yia5kxv3imve6fthbs4',
                                  '_report_key': 'Report 1',
                                  '_vote': APPROVE,
                                  '_vote_reason': 'Vote Reason',
                                  '_budget_adjustment_vote': '_approve'})
        pprint(tx_result)

        tx_result = self.send_tx(self._wallet_array[11], self.cps_score, 0, 'vote_progress_report',
                                 {'_ipfs_key': 'bafybeie5cifgwgu2x3guixgrs67miydug7ocyp6yia5kxv3imve6fthbs4',
                                  '_report_key': 'Report 1',
                                  '_vote': APPROVE,
                                  '_vote_reason': 'Vote Reason',
                                  '_budget_adjustment_vote': '_approve'})
        pprint(tx_result)

        tx_result = self.send_tx(self._wallet_array[12], self.cps_score, 0, 'vote_progress_report',
                                 {'_ipfs_key': 'bafybeie5cifgwgu2x3guixgrs67miydug7ocyp6yia5kxv3imve6fthbs4',
                                  '_report_key': 'Report 1',
                                  '_vote': APPROVE,
                                  '_vote_reason': 'Vote Reason',
                                  '_budget_adjustment_vote': '_approve'})
        pprint(tx_result)

        tx_result = self.send_tx(self._wallet_array[13], self.cps_score, 0, 'vote_progress_report',
                                 {'_ipfs_key': 'bafybeie5cifgwgu2x3guixgrs67miydug7ocyp6yia5kxv3imve6fthbs4',
                                  '_report_key': 'Report 1',
                                  '_vote': APPROVE,
                                  '_vote_reason': 'Vote Reason',
                                  '_budget_adjustment_vote': '_approve'})
        pprint(tx_result)

        tx_result = self.send_tx(self._wallet_array[14], self.cps_score, 0, 'vote_progress_report',
                                 {'_ipfs_key': 'bafybeie5cifgwgu2x3guixgrs67miydug7ocyp6yia5kxv3imve6fthbs4',
                                  '_report_key': 'Report 1',
                                  '_vote': APPROVE,
                                  '_vote_reason': 'Vote Reason',
                                  '_budget_adjustment_vote': '_approve'})
        pprint(tx_result)

        tx_result = self.send_tx(self._wallet_array[15], self.cps_score, 0, 'vote_progress_report',
                                 {'_ipfs_key': 'bafybeie5cifgwgu2x3guixgrs67miydug7ocyp6yia5kxv3imve6fthbs4',
                                  '_report_key': 'Report 1',
                                  '_vote': APPROVE,
                                  '_vote_reason': 'Vote Reason',
                                  '_budget_adjustment_vote': '_approve'})
        pprint(tx_result)

        tx_result = self.send_tx(self._wallet_array[16], self.cps_score, 0, 'vote_progress_report',
                                 {'_ipfs_key': 'bafybeie5cifgwgu2x3guixgrs67miydug7ocyp6yia5kxv3imve6fthbs4',
                                  '_report_key': 'Report 1',
                                  '_vote': APPROVE,
                                  '_vote_reason': 'Vote Reason',
                                  '_budget_adjustment_vote': '_approve'})
        pprint(tx_result)
        pprint(self._build_call_tx(self.cps_score,
                                   {'_ipfs_key': 'bafybeie5cifgwgu2x3guixgrs67miydug7ocyp6yia5kxv3imve6fthbs4'},
                                   'get_proposal_details_by_hash'))

    def _submit_progress_report_two_proposals(self):
        progress_report_parameters = {'ipfs_hash': 'bafybeie5cifgwgu2x3guixgrs67miydug7ocyp6yia5kxv3imve6fthbs4',
                                      'report_hash': 'Report 1',
                                      'ipfs_link': 'test.link@link.com',
                                      'progress_report_title': 'Progress Report 1',
                                      'budget_adjustment': True,
                                      'additional_budget': 100,
                                      'additional_month': 0,
                                      'percentage_completed': 10}
        pprint(self.send_tx(self._test1, self.cps_score, 0, 'submit_progress_report',
                            {'_progress_report': progress_report_parameters}))
        pprint(self._build_call_tx(self.cps_score, None, 'get_denylist'))
        proposal_details = self._build_call_tx(self.cps_score,
                                               {
                                                   '_ipfs_key': 'bafybeie5cifgwgu2x3guixgrs67miydug7ocyp6yia5kxv3imve6fthbs4'},
                                               'get_proposal_details_by_hash')
        pprint(proposal_details)

        pprint(self._build_call_tx(self.cps_score,
                                   {'_ipfs_key': 'bafybeiaubhdzignnbe24ypwwulsr6fxju4uyujzx5tnyqc6fgop3qbyldu'},
                                   'get_proposal_details_by_hash'))

    def _submit_progress_report_two_proposals_next_cycle(self):
        progress_report_parameters = {'ipfs_hash': 'bafybeie5cifgwgu2x3guixgrs67miydug7ocyp6yia5kxv3imve6fthbs4',
                                      'report_hash': 'Report 2',
                                      'ipfs_link': 'test.link@link.com',
                                      'progress_report_title': 'Progress Report 2',
                                      'budget_adjustment': False,
                                      'additional_budget': 0,
                                      'additional_month': 0,
                                      'percentage_completed': 20}
        pprint(self.send_tx(self._test1, self.cps_score, 0, 'submit_progress_report',
                            {'_progress_report': progress_report_parameters}))
        pprint(self._build_call_tx(self.cps_score, None, 'get_denylist'))
        proposal_details = self._build_call_tx(self.cps_score,
                                               {
                                                   '_ipfs_key': 'bafybeie5cifgwgu2x3guixgrs67miydug7ocyp6yia5kxv3imve6fthbs4'},
                                               'get_proposal_details_by_hash')
        pprint(proposal_details)

        pprint(self._build_call_tx(self.cps_score,
                                   {'_ipfs_key': 'bafybeiaubhdzignnbe24ypwwulsr6fxju4uyujzx5tnyqc6fgop3qbyldu'},
                                   'get_proposal_details_by_hash'))

    def _vote_two_progress_report_next_cycle(self):
        time.sleep(15)
        tx_result = self.send_tx(self._wallet_array[10], self.cps_score, 0, 'vote_progress_report',
                                 {'_ipfs_key': 'bafybeie5cifgwgu2x3guixgrs67miydug7ocyp6yia5kxv3imve6fthbs4',
                                  '_report_key': 'Report 2',
                                  '_vote': APPROVE,
                                  '_vote_reason': 'Vote Reason',
                                  '_budget_adjustment_vote': ''})
        pprint(tx_result)

        tx_result = self.send_tx(self._wallet_array[11], self.cps_score, 0, 'vote_progress_report',
                                 {'_ipfs_key': 'bafybeie5cifgwgu2x3guixgrs67miydug7ocyp6yia5kxv3imve6fthbs4',
                                  '_report_key': 'Report 2',
                                  '_vote': APPROVE,
                                  '_vote_reason': 'Vote Reason',
                                  '_budget_adjustment_vote': ''})
        pprint(tx_result)

        tx_result = self.send_tx(self._wallet_array[12], self.cps_score, 0, 'vote_progress_report',
                                 {'_ipfs_key': 'bafybeie5cifgwgu2x3guixgrs67miydug7ocyp6yia5kxv3imve6fthbs4',
                                  '_report_key': 'Report 2',
                                  '_vote': APPROVE,
                                  '_vote_reason': 'Vote Reason',
                                  '_budget_adjustment_vote': ''})
        pprint(tx_result)

        tx_result = self.send_tx(self._wallet_array[13], self.cps_score, 0, 'vote_progress_report',
                                 {'_ipfs_key': 'bafybeie5cifgwgu2x3guixgrs67miydug7ocyp6yia5kxv3imve6fthbs4',
                                  '_report_key': 'Report 2',
                                  '_vote': APPROVE,
                                  '_vote_reason': 'Vote Reason',
                                  '_budget_adjustment_vote': ''})
        pprint(tx_result)

        tx_result = self.send_tx(self._wallet_array[14], self.cps_score, 0, 'vote_progress_report',
                                 {'_ipfs_key': 'bafybeie5cifgwgu2x3guixgrs67miydug7ocyp6yia5kxv3imve6fthbs4',
                                  '_report_key': 'Report 2',
                                  '_vote': APPROVE,
                                  '_vote_reason': 'Vote Reason',
                                  '_budget_adjustment_vote': ''})
        pprint(tx_result)

        tx_result = self.send_tx(self._wallet_array[15], self.cps_score, 0, 'vote_progress_report',
                                 {'_ipfs_key': 'bafybeie5cifgwgu2x3guixgrs67miydug7ocyp6yia5kxv3imve6fthbs4',
                                  '_report_key': 'Report 2',
                                  '_vote': APPROVE,
                                  '_vote_reason': 'Vote Reason',
                                  '_budget_adjustment_vote': ''})
        pprint(tx_result)

        tx_result = self.send_tx(self._wallet_array[16], self.cps_score, 0, 'vote_progress_report',
                                 {'_ipfs_key': 'bafybeie5cifgwgu2x3guixgrs67miydug7ocyp6yia5kxv3imve6fthbs4',
                                  '_report_key': 'Report 2',
                                  '_vote': APPROVE,
                                  '_vote_reason': 'Vote Reason',
                                  '_budget_adjustment_vote': ''})
        pprint(tx_result)
        pprint(self._build_call_tx(self.cps_score,
                                   {'_ipfs_key': 'bafybeie5cifgwgu2x3guixgrs67miydug7ocyp6yia5kxv3imve6fthbs4'},
                                   'get_proposal_details_by_hash'))
