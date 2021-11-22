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

DIR_PATH = os.path.abspath(os.path.dirname(__file__))


class test_CPS_Score(IconIntegrateTestBase):
    TEST_HTTP_ENDPOINT_URI_V3 = "http://127.0.0.1:9000/api/v3"
    CPS_SCORE_PROJECT = os.path.abspath((os.path.join(DIR_PATH, '..', 'cps_score')))
    CPF_TREASURY_PROJECT = os.path.abspath((os.path.join(DIR_PATH, '..', 'CPFTreasury')))
    CPS_TREASURY_PROJECT = os.path.abspath((os.path.join(DIR_PATH, '..', 'CPSTreasury')))
    GOVERNANCE = os.path.abspath((os.path.join(DIR_PATH, '..', 'governance')))
    bnUSD_SCORE = os.path.abspath((os.path.join(DIR_PATH, '..', 'bnUSD')))
    sICX_SCORE = os.path.abspath((os.path.join(DIR_PATH, '..', 'sicx')))
    DEX_SCORE = os.path.abspath((os.path.join(DIR_PATH, '..', 'dex')))
    STAKING_SCORE = os.path.abspath((os.path.join(DIR_PATH, '..', 'staking')))
    LOANS_SCORE = os.path.abspath((os.path.join(DIR_PATH, '..', 'loans')))
    BLOCK_INTERVAL = 6

    def setUp(self):
        self._wallet_setup()
        super().setUp()

        self.icon_service = IconService(HTTPProvider(self.TEST_HTTP_ENDPOINT_URI_V3))
        print(self.icon_service)
        # self.cps_score = self._deploy_cps_score(params={})['scoreAddress']
        # self.cpf_score = self._deploy_cpf_treasury_score(params={'amount': 1_000_000 * 10 ** 18})['scoreAddress']
        # self.cps_treasury_score = self._deploy_cps_treasury_score(params={})['scoreAddress']
        self.system_score = SCORE_INSTALL_ADDRESS
        # self.contracts = {'cps_score': self._deploy_cps_score()['scoreAddress'],
        #                   'cpf_treasury': self._deploy_cpf_treasury_score()['scoreAddress'],
        #                   'cps_treasury': self._deploy_cps_treasury_score()['scoreAddress'],
        #                   'bnUSD': self._deploy_bnUSD_score()['scoreAddress'],
        #                   # 'staking_score': self._deploy_staking_score()['scoreAddress'],
        #                   'sICX_score': self._deploy_sICX_score()['scoreAddress'],
        #                   'dex_score': self._deploy_dex_score()['scoreAddress'],
        #                   'governance_score': self._deploy_governance_score()['scoreAddress'],
        #                   }
        self.contracts = {'bnUSD': 'cxa0311a293021d534013d28c528efbd15022a5e91',
                          'cpf_treasury': 'cx13bb27bbf86e7a02760646cbd0c5c3bcba9d640c',
                          'cps_score': 'cxf0fd220782b4007ecca144f4a80fe3c9e594012f',
                          'cps_treasury': 'cxbe941a60817d351fd2151c551754cfa490a1c6c4',
                          'dex_score': 'cx5e902c7ea2a3f7693bef0b0059bd6ac376ac8375',
                          'governance_score': 'cx027796be7eb5f573cdfa4b41ca4ea61fc5019121',
                          'sICX_score': 'cx888dcf645f752a36bc0e86cb23b392068e36d743',
                          'staking_score': 'cx73971c52c82dea76f4bb7a8d17915037fd6b8538',
                          'loans_score': 'cx10fc346afb055cb0f671c16cc35ef0bd88b277f3'}
        pprint(self.contracts)
        # self._register_100_preps(10, 20)
        # self._register_prep()
        # self._set_stake()
        # self._set_delegation()
        # self._add_fund()

    # deployment of scores *************************************************************************
    # ******************************************************************************************

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

    def _deploy_governance_score(self, to=SCORE_INSTALL_ADDRESS, params=None):
        if params is None:
            params = {}

        transaction = DeployTransactionBuilder() \
            .from_(self._test1.get_address()) \
            .to(to) \
            .step_limit(100_000_000_000) \
            .nid(3) \
            .nonce(100) \
            .content_type("application/zip") \
            .content(gen_deploy_data_content(self.GOVERNANCE)) \
            .params(params) \
            .build()
        signed_transaction = SignedTransaction(transaction, self._test1)

        # process the transaction in local
        tx_result = self.process_transaction(signed_transaction, self.icon_service)

        self.assertEqual(True, tx_result['status'])
        self.assertTrue('scoreAddress' in tx_result)
        pprint(tx_result)
        return tx_result

    def _deploy_bnUSD_score(self, to=SCORE_INSTALL_ADDRESS):
        params = {'_governance': SCORE_INSTALL_ADDRESS}
        transaction = DeployTransactionBuilder() \
            .from_(self._test1.get_address()) \
            .to(to) \
            .step_limit(100_000_000_000) \
            .nid(3) \
            .nonce(100) \
            .content_type("application/zip") \
            .content(gen_deploy_data_content(self.bnUSD_SCORE)) \
            .params(params) \
            .build()
        signed_transaction = SignedTransaction(transaction, self._test1)

        # process the transaction in local
        tx_result = self.process_transaction(signed_transaction, self.icon_service)

        self.assertEqual(True, tx_result['status'])
        self.assertTrue('scoreAddress' in tx_result)
        pprint(tx_result)
        return tx_result

    def test_deploy_staking_score(self, to=SCORE_INSTALL_ADDRESS):
        params = {}
        transaction = DeployTransactionBuilder() \
            .from_(self._test1.get_address()) \
            .to(to) \
            .step_limit(100_000_000_000) \
            .nid(3) \
            .nonce(100) \
            .content_type("application/zip") \
            .content(gen_deploy_data_content(self.STAKING_SCORE)) \
            .params(params) \
            .build()
        signed_transaction = SignedTransaction(transaction, self._test1)

        # process the transaction in local
        tx_result = self.process_transaction(signed_transaction, self.icon_service)

        self.assertEqual(True, tx_result['status'])
        self.assertTrue('scoreAddress' in tx_result)
        pprint(tx_result)
        return tx_result

    def test_deploy_sICX_score(self, to=SCORE_INSTALL_ADDRESS):
        params = {'_admin': self.contracts['staking_score']}
        transaction = DeployTransactionBuilder() \
            .from_(self._test1.get_address()) \
            .to(to) \
            .step_limit(100_000_000_000) \
            .nid(3) \
            .nonce(100) \
            .content_type("application/zip") \
            .content(gen_deploy_data_content(self.sICX_SCORE)) \
            .params(params) \
            .build()
        signed_transaction = SignedTransaction(transaction, self._test1)

        # process the transaction in local
        tx_result = self.process_transaction(signed_transaction, self.icon_service)

        self.assertEqual(True, tx_result['status'])
        self.assertTrue('scoreAddress' in tx_result)
        pprint(tx_result)
        return tx_result

    def test_deploy_dex_score(self, to=SCORE_INSTALL_ADDRESS):
        params = {'_governance': self.contracts['governance_score']}
        transaction = DeployTransactionBuilder() \
            .from_(self._test1.get_address()) \
            .to(to) \
            .step_limit(100_000_000_000) \
            .nid(3) \
            .nonce(100) \
            .content_type("application/zip") \
            .content(gen_deploy_data_content(self.DEX_SCORE)) \
            .params(params) \
            .build()
        signed_transaction = SignedTransaction(transaction, self._test1)

        # process the transaction in local
        tx_result = self.process_transaction(signed_transaction, self.icon_service)

        self.assertTrue('scoreAddress' in tx_result)
        pprint(tx_result)
        self.assertEqual(True, tx_result['status'])

        return tx_result

    def test_deploy_loans_score(self, to=SCORE_INSTALL_ADDRESS):
        params = {'_governance': self.contracts['governance_score']}
        transaction = DeployTransactionBuilder() \
            .from_(self._test1.get_address()) \
            .to(to) \
            .step_limit(100_000_000_000) \
            .nid(3) \
            .nonce(100) \
            .content_type("application/zip") \
            .content(gen_deploy_data_content(self.LOANS_SCORE)) \
            .params(params) \
            .build()
        signed_transaction = SignedTransaction(transaction, self._test1)

        # process the transaction in local
        tx_result = self.process_transaction(signed_transaction, self.icon_service)

        self.assertTrue('scoreAddress' in tx_result)
        pprint(tx_result)
        self.assertEqual(True, tx_result['status'])

        return tx_result

    # score update ************************************************************************************************
    # *********************************************************************************************************

    def update_contracts(self, contract_path: str, contract_address: str):
        transaction = DeployTransactionBuilder() \
            .from_(self._test1.get_address()) \
            .to(contract_address) \
            .step_limit(100_000_000_000) \
            .nid(3) \
            .nonce(100) \
            .content_type("application/zip") \
            .content(gen_deploy_data_content(contract_path)) \
            .build()
        signed_transaction = SignedTransaction(transaction, self._test1)

        # process the transaction in local
        tx_result = self.process_transaction(signed_transaction, self.icon_service)

        self.assertEqual(True, tx_result['status'])
        self.assertTrue('scoreAddress' in tx_result)
        return tx_result

    def test_update_contract(self):
        self.update_contracts(self.CPF_TREASURY_PROJECT, self.contracts['cpf_treasury'])

    # wallet setup for preps and registering preps ***********************************************************************
    # ****************************************************************************************************************

    def _wallet_setup(self):
        self.icx_factor = 10 ** 18
        self.btest_wallet: 'KeyWallet' = self._wallet_array[5]
        self.staking_wallet: 'KeyWallet' = self._wallet_array[6]

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

    # send tx, call tx, send tx contracts *******************************************************************************
    # ***************************************************************************************************************

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
        self.assertEqual(tx_result['status'], 1)
        return tx_result

    def build_transaction_contact(self, from_, to: str, value: int = 0, method: str = None,
                                  params: dict = None) -> dict:
        call_transaction = CallTransactionBuilder() \
            .from_(from_) \
            .to(to) \
            .value(value) \
            .nid(3) \
            .nonce(100) \
            .method(method) \
            .params(params) \
            .build()
        signed_transaction = SignedTransaction(call_transaction, self._test1, 10000000)
        tx_result = self.process_transaction(signed_transaction, self.icon_service)
        self.assertEqual(tx_result['status'], 1)
        return tx_result

    # adding necessary parameters in different scores *******************************************************************
    # ***************************************************************************************************************

    def test_add_admin(self):
        tx_result = self.build_transaction(self._test1, self.contracts['cps_score'], 0, 'add_admin',
                                           {'_address': self._test1.get_address()})
        pprint(tx_result)

    def test_set_cps_treasury_score(self):
        tx_result = self.build_transaction(self._test1, self.contracts['cps_score'], 0, 'set_cps_treasury_score',
                                           {'_score': self.contracts['cps_treasury']})
        pprint(tx_result)

    def test_set_cpf_treasury_score(self):
        tx_result = self.build_transaction(self._test1, self.contracts['cps_score'], 0, 'set_cpf_treasury_score',
                                           {'_score': self.contracts['cpf_treasury']})
        pprint(tx_result)

    def test_set_bnUSD_in_cps_score(self):
        tx_result = self.build_transaction(self._test1, self.contracts['cps_score'], 0, 'set_bnUSD_score',
                                           {'_score': self.contracts['bnUSD']})
        pprint(tx_result)

    def test_set_cps_score_in_cps_treasury(self):
        tx_result = self.build_transaction(self._test1, self.contracts['cps_treasury'], 0, 'set_cps_score',
                                           {'_score': self.contracts['cps_score']})
        pprint(tx_result)

    def test_set_cpf_treasury_in_cps_treasury(self):
        tx_result = self.build_transaction(self._test1, self.contracts['cps_treasury'], 0, 'set_cpf_treasury_score',
                                           {'_score': self.contracts['cpf_treasury']})
        pprint(tx_result)

    def test_set_bnUSD_in_cps_treasury(self):
        tx_result = self.build_transaction(self._test1, self.contracts['cps_treasury'], 0, 'set_bnUSD_score',
                                           {'_score': self.contracts['bnUSD']})
        pprint(tx_result)

    def test_set_cps_score_in_cpf_treasury(self):
        tx_result = self.build_transaction(self._test1, self.contracts['cpf_treasury'], 0, 'set_cps_score',
                                           {'_score': self.contracts['cps_score']})
        pprint(tx_result)

    def test_set_cps_treasury_in_cpf_treasury(self):
        tx_result = self.build_transaction(self._test1, self.contracts['cpf_treasury'], 0, 'set_cps_treasury_score',
                                           {'_score': self.contracts['cps_treasury']})
        pprint(tx_result)

    def test_set_bnUSD_in_cpf_treasury(self):
        tx_result = self.build_transaction(self._test1, self.contracts['cpf_treasury'], 0, 'set_bnUSD_score',
                                           {'_score': self.contracts['bnUSD']})
        pprint(tx_result)

    def test_set_staking_score_in_cpf_treasury(self):
        tx_result = self.build_transaction(self._test1, self.contracts['cpf_treasury'], 0, 'set_staking_score',
                                           {'_score': self.contracts['staking_score']})
        pprint(tx_result)

    def test_set_sicx_score_in_cpf_treasury(self):
        tx_result = self.build_transaction(self._test1, self.contracts['cpf_treasury'], 0, 'set_sicx_score',
                                           {'_score': self.contracts['sICX_score']})
        pprint(tx_result)

    def test_set_dex_score_in_cpf_treasury(self):
        tx_result = self.build_transaction(self._test1, self.contracts['cpf_treasury'], 0, 'set_dex_score',
                                           {'_score': self.contracts['dex_score']})
        pprint(tx_result)

    def test_set_sicx_score_in_staking(self):
        tx_result = self.build_transaction(self._test1, self.contracts['staking_score'], 0, 'setSicxAddress',
                                           {'_address': self.contracts['sICX_score']})
        pprint(tx_result)

    def test_set_staking_in_sicx(self):
        tx_result = self.build_transaction(self._test1, self.contracts['sICX_score'], 0, 'setStakingAddress',
                                           {'_address': self.contracts['staking_score']})
        pprint(tx_result)

    def test_set_governance_on_dex(self):
        tx_result = self.build_transaction(self._test1, self.contracts['dex_score'], 0, 'setGovernance',
                                           {'_address': self.contracts['governance_score']})
        pprint(tx_result)

    def test_set_admin_on_dex(self):
        tx_result = self.build_transaction(self._test1, self.contracts['dex_score'], 0, 'setStaking',
                                           {'_address': self.contracts['staking_score']})
        pprint(tx_result)

    def test_set_admin_on_dex_score(self):
        call_transaction = CallTransactionBuilder() \
            .from_('cx027796be7eb5f573cdfa4b41ca4ea61fc5019121') \
            .to(self.contracts['dex_score']) \
            .value(0) \
            .nid(3) \
            .nonce(100) \
            .method('setAdmin') \
            .params({'_admin': self._test1.get_address()}) \
            .build()
        signed_transaction = SignedTransaction(call_transaction, self._test1, 10000000)
        tx_result = self.process_transaction(signed_transaction, self.icon_service)
        self.assertEqual(tx_result['status'], 1)
        return tx_result



    def _register_prep(self):
        print(f'Wallet address: {self._wallet_array[10].get_address()}')

        pprint(self.send_tx(self._wallet_array[10], self.contracts['cps_score'], 0, 'register_prep', None))
        pprint(self.send_tx(self._wallet_array[11], self.contracts['cps_score'], 0, 'register_prep', None))
        pprint(self.send_tx(self._wallet_array[12], self.contracts['cps_score'], 0, 'register_prep', None))
        pprint(self.send_tx(self._wallet_array[13], self.contracts['cps_score'], 0, 'register_prep', None))
        pprint(self.send_tx(self._wallet_array[14], self.contracts['cps_score'], 0, 'register_prep', None))
        pprint(self.send_tx(self._wallet_array[15], self.contracts['cps_score'], 0, 'register_prep', None))
        pprint(self.send_tx(self._wallet_array[16], self.contracts['cps_score'], 0, 'register_prep', None))

    # stake and deligate to vote *****************************************************************************************
    # ****************************************************************************************************************

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

    # testing the flow ***********************************************************************************************
    # ************************************************************************************************************

    def test_submit_proposal(self):
        proposal_parameters = {'ipfs_hash': 'bafybeie5cifgwgu2x3guixgrs67miydug7ocyp6yia5kxv3imve6fthbs4',
                               'project_title': 'Test Proposal',
                               'project_duration': 2,
                               'total_budget': 100,
                               'sponsor_address': self._wallet_array[10].get_address(),
                               'ipfs_link': 'test.link@link.com',
                               'token': 'bnUSD'}
        self._set_initial_block()
        tx_result = self.send_tx(self._test1, self.contracts['cps_score'], 50 * 10 ** 18, "submit_proposal",
                                 {'_proposals': proposal_parameters})
        pprint(tx_result)

    def _add_fund(self):
        self.send_tx(self._test1, self.contracts['cpf_treasury'], 7000 * 10 ** 18, "add_fund", None)

    def test_toggle_staking_on_staking_score(self):
        tx_result = self.send_tx(self._test1, self.contracts['staking_score'], 0, 'toggleStakingOn',
                                 None)
        pprint(tx_result)

    def test_set_sicx_address_on_staking_score(self):
        tx_result = self.send_tx(self._test1, self.contracts['staking_score'], 0, 'setSicxAddress',
                                 {'_address': self.contracts['sICX_score']})
        pprint(tx_result)

    def test_stake_icx_in_cpf_treasury(self):
        tx_result = self.send_tx(self._test1, self.contracts['cpf_treasury'], 0, 'stake_icx',
                                 {'_amount': 1000 * 10 ** 18})
        pprint(tx_result)

    def test_configure_balanced(self):
        tx_result = self.send_tx(self._test1, self.contracts['governance_score'], 0, 'configureBalanced',
                                 None)
        pprint(tx_result)

    def test_swap_sicx_in_cpf_treasury(self):
        tx_result = self.send_tx(self._test1, self.contracts['cpf_treasury'], 0, 'swap_bnusd',
                                 {'_amount': 900 * 10 ** 18})
        pprint(tx_result)

    def test_get_staking_address(self):
        print(self.call_tx(self.contracts['dex_score'], None, 'getGovernance'))

    def _set_initial_block(self):
        self.send_tx(self._test1, self.contracts['cps_score'], 0, "set_initialBlock", None)

    def test_path(self):
        print(self.GOVERNANCE)
        print(self.sICX_SCORE)
        print(self.bnUSD_SCORE)
        print(self.DEX_SCORE)
        print(self.STAKING_SCORE)
