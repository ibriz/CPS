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
from iconservice import icon_service
from tbears.libs.icon_integrate_test import Account
import json
import time

DIR_PATH = os.path.abspath(os.path.dirname(__file__))


class test_CPS_Score(IconIntegrateTestBase):
    TEST_HTTP_ENDPOINT_URI_V3 = "http://127.0.0.1:9000/api/v3"
    CPS_SCORE_PROJECT = os.path.abspath((os.path.join(DIR_PATH, '..', 'cps_score')))
    CPF_TREASURY_PROJECT = os.path.abspath((os.path.join(DIR_PATH, '..', 'CPFTreasury')))
    CPS_TREASURY_PROJECT = os.path.abspath((os.path.join(DIR_PATH, '..', 'CPSTreasury')))
    BLOCK_INTERVAL = 6

    def setUp(self):
        super().setUp()
        self.icon_service = IconService(HTTPProvider(self.TEST_HTTP_ENDPOINT_URI_V3))
        print(self.icon_service)

        self.system_score = SCORE_INSTALL_ADDRESS
        self.contracts = {'baln': 'cx95da4b04e9bd7d6a92b186a1f122278576d34234',
                          'bnUSD': 'cx493bae75aaa45227a8af156be09d8ed93090f4b0',
                          'bwt': 'cx4166435d4410a960356024fbe303019c70e4cce5',
                          'cpf_treasury': 'cxc16ef2ea8ec9599a1f2320df2c4323fd5e965dee',
                          'cps_score': 'cx459122f0fa9b93b1eb00753eb57238a91a913e69',
                          'cps_treasury': 'cxedf06f84738d44fedc56bc4cf76da47796776794',
                          'daofund': 'cx705c8734a68bad1ae4bd1c5779048ca30d0c19d2',
                          'dex': 'cx2ffafb2e5fb3b37c144c2780edef2148c9cebabf',
                          'dividends': 'cxe33d4af72ef2dfd02c0c93db837a6f2116bd0e46',
                          'governance': 'cx821f5c5c83770f0b07b21b927fe3ccd7c26e149b',
                          'loans': 'cx9b0045a9cb9fe06dcf9a7c718e41a2396860edaa',
                          'oracle': 'cxb44659ae1cfd1198aad4a44397a38bdd0fbf6745',
                          'reserve': 'cx9fca7c94f66d136fa3e40a15aafed8a706777342',
                          'rewards': 'cx6325ee7aaf3025eb311ef240eb6b380e0642175c',
                          'sicx': 'cx0a7905aad9687952f0073038751e48e57485d103',
                          'staking': 'cx9d7a0d5beecba73cefa4f08b3a591f78b52a5294',
                          'system': 'cx0000000000000000000000000000000000000000'}

        pprint(self.contracts)
        self._wallet_setup()
        # self._register_100_preps()

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
        pprint(tx_result)
        return tx_result

    def test_update_scores(self):
        score_list = ['cps_score', 'cpf_treasury', 'cps_treasury']
        transaction = DeployTransactionBuilder() \
            .from_(self._test1.get_address()) \
            .to(self.contracts[score_list[0]]) \
            .step_limit(100_000_000_000) \
            .nid(3) \
            .nonce(100) \
            .content_type("application/zip") \
            .content(gen_deploy_data_content(self.CPS_SCORE_PROJECT)) \
            .build()

        signed_transaction = SignedTransaction(transaction, self._test1)

        tx_hash = self.process_transaction(signed_transaction, self.icon_service)
        pprint(tx_hash)

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
        pprint(tx_result)
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
        pprint(tx_result)
        return tx_result

    def _register_100_preps(self, start=10, end=20):
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
        pprint(ab)

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

    def get_balance(self, address: str) -> int:
        if self.icon_service is not None:
            return self.icon_service.get_balance(address)
        params = {'address': Address.from_string(address)}
        response = self.icon_service_engine.query(method="icx_getBalance", params=params)
        return response

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
        pprint(tx_result)
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

    def call_tx(self, _score, params, method):
        params = {} if params is None else params
        _call = CallBuilder() \
            .from_(self._test1.get_address()) \
            .to(_score) \
            .method(method) \
            .params(params) \
            .build()
        response = self.process_call(_call, self.icon_service)
        return response

    def test_register_prep(self):

        pprint(self.send_tx(self._wallet_array[10], self.contracts['cps_score'], 0, 'register_prep', None))
        pprint(self.send_tx(self._wallet_array[11], self.contracts['cps_score'], 0, 'register_prep', None))
        pprint(self.send_tx(self._wallet_array[12], self.contracts['cps_score'], 0, 'register_prep', None))
        pprint(self.send_tx(self._wallet_array[13], self.contracts['cps_score'], 0, 'register_prep', None))
        pprint(self.send_tx(self._wallet_array[14], self.contracts['cps_score'], 0, 'register_prep', None))
        pprint(self.send_tx(self._wallet_array[15], self.contracts['cps_score'], 0, 'register_prep', None))
        pprint(self.send_tx(self._wallet_array[16], self.contracts['cps_score'], 0, 'register_prep', None))

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
        signed_transaction = SignedTransaction(call_transaction, from_, 10000000)
        tx_result = self.process_transaction(signed_transaction, self.icon_service)
        self.assertEqual(tx_result['status'], 1)
        return tx_result

    def test_period_status(self):
        resposne = self.call_tx(self.contracts['cps_score'], None, 'get_period_status')
        pprint(resposne)
        pprint(f"remaining time: {int(resposne['remaining_time'], 16)}")

    # def test_register_prep(self):
    #     self._register_prep()

    def test_unregister_prep(self):
        pprint(self.send_tx(self._wallet_array[13], self.contracts['cps_score'], 0, 'unregister_prep', None))

    def test_get_preps(self):
        response = self.call_tx(self.contracts['cps_score'], None, 'get_PReps')
        pprint(response)

    def test_set_stake(self):
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

    def test_set_delegation(self):
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

    def _wallet_setup(self):
        self.icx_factor = 10 ** 18
        self.btest_wallet: 'KeyWallet' = self._wallet_array[5]
        self.staking_wallet: 'KeyWallet' = self._wallet_array[6]
        self.user1: 'KeyWallet' = self._wallet_array[7]
        self.user2: 'KeyWallet' = self._wallet_array[8]

    # set addresses in different scores ___________________________________________________________________________________
    # set addresses in cps_score

    def test_set_cps_treasury_cpf_treasury_and_bnUSD_score_in_cps_score(self):
        tx = self.build_transaction(self._test1, self.contracts['cps_score'], 0, 'set_cps_treasury_score',
                                    {'_score': self.contracts['cps_treasury']})
        pprint(tx)
        tx = self.build_transaction(self._test1, self.contracts['cps_score'], 0, 'set_cpf_treasury_score',
                                    {'_score': self.contracts['cpf_treasury']})
        pprint(tx)
        tx = self.build_transaction(self._test1, self.contracts['cps_score'], 0, 'set_bnUSD_score',
                                    {'_score': self.contracts['bnUSD']})
        pprint(tx)

    def test_score_addresses_in_cps_score(self):
        response = self.call_tx(self.contracts['cps_score'], None, 'get_cps_treasury_score')
        pprint(response)
        response = self.call_tx(self.contracts['cps_score'], None, 'get_cpf_treasury_score')
        pprint(response)
        response = self.call_tx(self.contracts['cps_score'], None, 'get_bnUSD_score')
        pprint(response)

    def test_set_cps_score_cpf_treasury_in_cps_treasury_score(self):
        tx = self.build_transaction(self._test1, self.contracts['cps_treasury'], 0, 'set_cps_score',
                                    {'_score': self.contracts['cps_score']})
        pprint(tx)
        tx = self.build_transaction(self._test1, self.contracts['cps_treasury'], 0, 'set_cpf_treasury_score',
                                    {'_score': self.contracts['cpf_treasury']})
        pprint(tx)
        tx = self.build_transaction(self._test1, self.contracts['cps_treasury'], 0, 'set_bnUSD_score',
                                    {'_score': self.contracts['bnUSD']})
        pprint(tx)

    def test_score_addresses_in_cps_treasury_score(self):
        response = self.call_tx(self.contracts['cps_treasury'], None, 'get_cps_score')
        pprint(response)
        response = self.call_tx(self.contracts['cps_treasury'], None, 'get_cpf_treasury_score')
        pprint(response)

    def test_set_cps_score_cps_treasury_cpf_treasury_bnUSD_staking_sicx_dex_in_cpf_treasury(self):
        tx = self.build_transaction(self._test1, self.contracts['cpf_treasury'], 0, 'set_cps_score',
                                    {'_score': self.contracts['cps_score']})
        pprint(tx)
        tx = self.build_transaction(self._test1, self.contracts['cpf_treasury'], 0, 'set_cps_treasury_score',
                                    {'_score': self.contracts['cps_treasury']})
        pprint(tx)
        tx = self.build_transaction(self._test1, self.contracts['cpf_treasury'], 0, 'set_bnUSD_score',
                                    {'_score': self.contracts['bnUSD']})
        pprint(tx)
        tx = self.build_transaction(self._test1, self.contracts['cpf_treasury'], 0, 'set_staking_score',
                                    {'_score': self.contracts['staking']})
        pprint(tx)
        tx = self.build_transaction(self._test1, self.contracts['cpf_treasury'], 0, 'set_sicx_score',
                                    {'_score': self.contracts['sicx']})
        pprint(tx)
        tx = self.build_transaction(self._test1, self.contracts['cpf_treasury'], 0, 'set_dex_score',
                                    {'_score': self.contracts['dex']})
        pprint(tx)

    def test_addresses_in_cpf_treasury(self):
        response = self.call_tx(self.contracts['cpf_treasury'], None, 'get_cps_score')
        pprint(response)
        response = self.call_tx(self.contracts['cpf_treasury'], None, 'get_cps_treasury_score')
        pprint(response)
        response = self.call_tx(self.contracts['cpf_treasury'], None, 'get_bnusd_score')
        pprint(response)
        response = self.call_tx(self.contracts['cpf_treasury'], None, 'get_staking_score')
        pprint(response)
        response = self.call_tx(self.contracts['cpf_treasury'], None, 'get_sicx_score')
        pprint(response)
        response = self.call_tx(self.contracts['cpf_treasury'], None, 'get_dex_score')
        pprint(response)

    # Project flow ________________________________________________________________________________________________________

    def test_add_fund_in_cpf_treasury(self):
        tx = self.send_tx(self._test1, self.contracts['cpf_treasury'], 20000 * 10 ** 18, 'add_fund',
                          None)
        pprint(tx)

    def test_get_total_funds_in_cpf_treasury(self):
        response = self.call_tx(self.contracts['cpf_treasury'], None, 'get_total_funds')
        pprint(response)
        print(f"ICX: {int(response['ICX'], 16)}, bnUSD: {int(response['bnUSD'], 16)}")

    def test_staking_on(self):
        tx = self.send_tx(self.staking_wallet, self.contracts['staking'], 0, 'toggleStakingOn', None)
        pprint(tx)

    # submit proposal _____________________________________________________________________________________________________

    def test_create_bnUSD_market(self):
        tx = self.send_tx(self.btest_wallet, self.contracts['governance'], 500 * 10 ** 18,
                          'createBnusdMarket', None)
        pprint(tx)

    def test_balanceOf(self):
        resposne = self.call_tx(self.contracts['bnUSD'], {'_owner': self.contracts['cpf_treasury']},
                                'balanceOf')
        pprint(int(resposne, 16) / 10 ** 18)

    def test_get_price(self):
        resposne = self.call_tx(self.contracts['dex'], {'_id': 2},
                                'getPrice')
        pprint(int(resposne, 16) / 10 ** 18)

    def test_pool_id(self):
        resposne = self.call_tx(self.contracts['dex'], {'_token1Address': self.contracts['sicx'],
                                                        '_token2Address': self.contracts['bnUSD']},
                                'getPoolId')
        pprint(int(resposne, 16))

    def test_max_cap_bnusd(self):
        tx = self.build_transaction(self._test1, self.contracts['cpf_treasury'], 0, 'set_maximum_treasury_fund_bnusd',
                                    {'_value': 10000 * 10 ** 18})
        pprint(tx)
        resposne = self.call_tx(self.contracts['cpf_treasury'], None, 'get_remaining_swap_amount')
        pprint(resposne)
        print(f"maxCap: {int(resposne['maxCap'], 16)}, remainingToSwap: {int(resposne['remainingToSwap'], 16)}")

    def test_set_initial_block(self):
        tx = self.build_transaction(self._test1, self.contracts['cps_score'], 0, 'set_initialBlock', None)
        pprint(tx)
        resposne = self.call_tx(self.contracts['cps_score'], None, 'get_period_status')
        pprint(resposne)
        pprint(f"remaining time: {int(resposne['remaining_time'], 16)}")

    def test_stake_ICX_from_wallet(self):
        # tx_hash = self.send_tx(self._wallet_array[10], self.contracts['staking'], 10 * 10 ** 18, 'stakeICX', None)
        # pprint(tx_hash)
        tx_hash = self.send_tx(self._wallet_array[11], self.contracts['staking'], 200 * 10 ** 18, 'stakeICX', None)
        pprint(tx_hash)
        # tx_hash = self.send_tx(self._wallet_array[12], self.contracts['staking'], 10 * 10 ** 18, 'stakeICX', None)
        # pprint(tx_hash)
        # tx_hash = self.send_tx(self._wallet_array[13], self.contracts['staking'], 10 * 10 ** 18, 'stakeICX', None)
        # pprint(tx_hash)
        # tx_hash = self.send_tx(self._wallet_array[14], self.contracts['staking'], 10 * 10 ** 18, 'stakeICX', None)
        # pprint(tx_hash)
        # tx_hash = self.send_tx(self._wallet_array[15], self.contracts['staking'], 10 * 10 ** 18, 'stakeICX', None)
        # pprint(tx_hash)
        # tx_hash = self.send_tx(self._wallet_array[16], self.contracts['staking'], 10 * 10 ** 18, 'stakeICX', None)
        # pprint(tx_hash)
        # time.sleep(3)

    def test_swap_sicx_with_bnUSD_from_wallet(self):
        to_token = self.contracts['bnUSD']
        _data = json.dumps({"method": "_swap", "params": {"toToken": str(to_token)}}).encode()
        params = {'_to': self.contracts['dex'], '_value': 200 * 10 ** 18, '_data': _data}

        # tx_hash = self.send_tx(self._wallet_array[10], self.contracts['sicx'], 0, 'transfer', params)
        # pprint(tx_hash)
        tx_hash = self.send_tx(self._wallet_array[11], self.contracts['sicx'], 0, 'transfer', params)
        pprint(tx_hash)
        # tx_hash = self.send_tx(self._wallet_array[12], self.contracts['sicx'], 0, 'transfer', params)
        # pprint(tx_hash)
        # tx_hash = self.send_tx(self._wallet_array[13], self.contracts['sicx'], 0, 'transfer', params)
        # pprint(tx_hash)
        # tx_hash = self.send_tx(self._wallet_array[14], self.contracts['sicx'], 0, 'transfer', params)
        # pprint(tx_hash)
        # tx_hash = self.send_tx(self._wallet_array[15], self.contracts['sicx'], 0, 'transfer', params)
        # pprint(tx_hash)
        # tx_hash = self.send_tx(self._wallet_array[16], self.contracts['sicx'], 0, 'transfer', params)
        # pprint(tx_hash)
        # time.sleep(3)

    def test_balance(self):
        print(self.icon_service.get_balance(self.btest_wallet.get_address()) / 10 ** 18)

    def test_send_icx(self):
        tx = self.send_icx(self.btest_wallet, self.contracts['bnUSD'], 1000 * 10 ** 18)
        pprint(tx)

    def test_bnUSD_balance(self):
        resposne = self.call_tx(self.contracts['bnUSD'], {'_owner': self._wallet_array[11].get_address()},
                                'balanceOf')
        print(int(resposne, 16) / 10 ** 18)

    def test_get_sicx_balance(self):
        resposne = self.call_tx(self.contracts['sicx'], {'_owner': self._wallet_array[11].get_address()},
                                'balanceOf')
        print(int(resposne, 16) / 10 ** 18)

    def test_set_next_block(self):
        tx = self.build_transaction(self._test1, self.contracts['cps_score'], 0, 'set_nextBlock', {'_block': 200})
        pprint(tx)

    def test_set_reduce_block(self):
        tx = self.build_transaction(self._test1, self.contracts['cps_score'], 0, 'set_reduce_block', {'_block': 646581})
        pprint(tx)

    def test_toogle_maintenence_mode(self):
        tx = self.build_transaction(self._test1, self.contracts['cps_score'], 0, 'toggle_maintenance', None)
        pprint(tx)

    def test_submit_proposal(self):
        params = {"_proposals": {
            "project_title": "METRICX COMICS",
            "total_budget": 10,
            "sponsor_address": "hx094a8b5324f86c340e1023ab5bba73d4fd58a122",
            "ipfs_hash": "Proposal 1 bnUSD",
            "ipfs_link": "https://gateway.ipfs.io/ipfs/Proposal",
            "project_duration": 1,
            "token": "bnUSD"
        }}
        print(params['_proposals']['sponsor_address'])
        tx_hash = self.send_tx(self.btest_wallet, self.contracts['cps_score'], 50 * 10 ** 18, 'submit_proposal',
                               params)
        pprint(tx_hash)

    def test_sponsor_vote(self):
        _data = json.dumps({'method': 'sponsor_vote',
                            'params': {'ipfs_hash': 'Proposal 1 bnUSD',
                                       'vote': '_accept', 'vote_reason': 'Vote Reason'}})
        print(_data)
        params = {'_to': self.contracts['cps_score'],
                  '_value': 1 * 10 ** 18,
                  '_data': _data.encode()}
        tx_hash = self.send_tx(self._wallet_array[11], self.contracts['bnUSD'], 0, 'transfer', params)
        pprint(tx_hash)

    def test_get_proposals_details_by_hash(self):
        resposne = self.call_tx(self.contracts['cps_score'], {'_ipfs_key': 'Proposal 1 bnUSD'},
                                'get_proposal_details_by_hash')
        pprint(resposne)

    def test_get_proposals_details_by_status(self):
        resposne = self.call_tx(self.contracts['cps_score'], {'_ipfs_key': 'ProposalTest'},
                                'get_proposal_details_by_hash')
        pprint(resposne)

    def test_remaining_time_in_application_period(self):
        resposne = self.call_tx(self.contracts['cps_score'], None, 'get_period_status')
        pprint(resposne)
        pprint(f"remaining time: {int(resposne['remaining_time'], 16)}")

    def test_set_next_block_1(self):
        tx = self.build_transaction(self._test1, self.contracts['cps_score'], 0, 'set_nextBlock', {'_block': 200})
        pprint(tx)

    def test_update_period(self):
        tx = self.build_transaction(self._test1, self.contracts['cps_score'], 0, 'update_period', None)
        pprint(tx)

    def test_vote_proposal(self):
        for i in range(7):
            tx_hash = self.send_tx(self._wallet_array[10 + i], self.contracts['cps_score'], 0, 'vote_proposal',
                                   {'_ipfs_key': 'Proposal 1 bnUSD',
                                    '_vote': APPROVE,
                                    '_vote_reason': 'Good addition to the platform',
                                    '_vote_change': False})
            pprint(tx_hash)
            time.sleep(2)

    def test_remaining_time_in_voting_period(self):
        resposne = self.call_tx(self.contracts['cps_score'], None, 'get_period_status')
        pprint(resposne)
        pprint(f"remaining time: {int(resposne['remaining_time'], 16)}")

    def test_update_period_after_voting(self):
        tx = self.send_tx(self._test1, self.contracts['cps_score'], 0, 'update_period', None)
        pprint(tx)
        time.sleep(15)
        tx = self.build_transaction(self._test1, self.contracts['cps_score'], 0, 'update_period', None)
        pprint(tx)
        time.sleep(15)
        tx = self.build_transaction(self._test1, self.contracts['cps_score'], 0, 'update_period', None)
        pprint(tx)
        time.sleep(15)
        tx = self.build_transaction(self._test1, self.contracts['cps_score'], 0, 'update_period', None)
        pprint(tx)
        time.sleep(15)

    def test_submit_progress_report(self):
        params = {'_progress_report': {'ipfs_hash': 'Proposal 1 bnUSD',
                                       'report_hash': 'Report 1 bnUSD',
                                       'ipfs_link': 'https://gateway.ipfs.io/ipfs/Proposal',
                                       'progress_report_title': 'Progress Report 1',
                                       'budget_adjustment': '0',
                                       'additional_budget': '0',
                                       'additional_month': '0',
                                       'percentage_completed': '50'}}
        tx_hash = self.send_tx(self.btest_wallet, self.contracts['cps_score'], 0, 'submit_progress_report',
                               params)
        pprint(tx_hash)

    def test_get_progress_reports_by_hash(self):
        resposne = self.call_tx(self.contracts['cps_score'], {'_report_key': 'Report test 1'},
                                'get_progress_reports_by_hash')
        pprint(resposne)

    def test_set_next_block_2(self):
        tx = self.build_transaction(self._test1, self.contracts['cps_score'], 0, 'set_nextBlock', {'_block': 150})
        pprint(tx)

    def test_remaining_time_in_application_period_1(self):
        resposne = self.call_tx(self.contracts['cps_score'], None, 'get_period_status')
        pprint(resposne)
        pprint(f"remaining time: {int(resposne['remaining_time'], 16)}")

    def test_update_period_after_progress_report_submission(self):
        tx = self.build_transaction(self._test1, self.contracts['cps_score'], 0, 'update_period', None)
        pprint(tx)

    def test_vote_progress_report(self):
        for i in range(7):
            tx_hash = self.send_tx(self._wallet_array[10 + i], self.contracts['cps_score'], 0, 'vote_progress_report',
                                   {'_ipfs_key': 'Proposal 1 bnUSD',
                                    '_report_key': 'Report 1 bnUSD',
                                    '_vote': APPROVE,
                                    '_vote_reason': 'Good addition to the platform',
                                    '_budget_adjustment_vote': APPROVE,
                                    '_vote_change': False})
            pprint(tx_hash)
            time.sleep(2)

    def test_update_period_after_voting_progress_report(self):
        # tx = self.build_transaction(self._test1, self.contracts['cps_score'], 0, 'update_period', None)
        # pprint(tx)
        tx = self.send_tx(self._test1, self.contracts['cps_score'], 0, 'update_period', None)
        pprint(tx)
        # tx = self.build_transaction(self._test1, self.contracts['cps_score'], 0, 'update_period', None)
        # pprint(tx)
        # tx = self.build_transaction(self._test1, self.contracts['cps_score'], 0, 'update_period', None)
        # pprint(tx)

    def test_remove_deny_list_preps(self):
        tx = self.build_transaction(self._test1, self.contracts['cps_score'], 0, 'remove_denylist_preps', None)
        pprint(tx)

    def test_get_remaining_swap_amount(self):
        resposne = self.call_tx(self.contracts['cpf_treasury'], None, 'get_remaining_swap_amount')
        pprint(resposne)
        print(f"maxCap: {int(resposne['maxCap'], 16)}, remainingToSwap: {int(resposne['remainingToSwap'], 16)}")

    def test_set_swap_count(self):
        tx = self.build_transaction(self._test1, self.contracts['cps_score'], 0, 'set_swap_count', None)
        pprint(tx)

    # paying prep penalty -------------------------------------------------------------------------------------------------

    def test_set_prep_penalty_amount(self):
        tx = self.build_transaction(self._test1, self.contracts['cps_score'], 0, 'set_prep_penalty_amount',
                                    {'_penalty': [5, 10, 15]})
        pprint(tx)

    def test_get_deny_list(self):
        resposne = self.call_tx(self.contracts['cps_score'], None, 'get_denylist')
        pprint(resposne)

    def test_pay_prep_penalty(self):
        _data = json.dumps({'method': 'pay_prep_penalty'})
        print(_data)
        params = {'_to': self.contracts['cps_score'],
                  '_value': 5 * 10 ** 18,
                  '_data': _data.encode()}
        tx_hash = self.send_tx(self._wallet_array[11], self.contracts['bnUSD'], 0, 'transfer', params)
        pprint(tx_hash)

    def test_get_staking_address_in_sicx_score(self):
        resposne = self.call_tx(self.contracts['sicx'], None, 'getStakingAddress')
        pprint(resposne)

    def test_score(self):
        pass
