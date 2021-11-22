from .test_integrate_base_loans import BalancedTestBaseLoans


class BalancedTestDepositAndBorrow(BalancedTestBaseLoans):

    def setUp(self):
        super().setUp()

    def test_addAsset(self):
        # add iETH as a collateral asset
        self.send_tx(self.btest_wallet, self.contracts['governance'], 0, "addAsset", {'_token_address': self.contracts['iETH'], '_active': True, '_collateral':True})

        self.send_tx(self.btest_wallet, self.contracts['governance'], 0, "setAssetOracle", {'_symbol': 'iETH', '_address': self.contracts['oracle']})

        # mint iETH to a address
        self.send_tx(self.btest_wallet, self.contracts['governance'], 0, "mintETH", {'_account': self.btest_wallet.get_address(), '_amount': 1000*10**18})
        res = self.call_tx(self.contracts['iETH'], "balanceOf", {"_owner": self.btest_wallet.get_address()})

        self.call_tx(self.contracts['sicx'], "balanceOf", {"_owner": self.btest_wallet.get_address()})
        # print(self.get_balance(self.btest_wallet.get_address()))

        self.call_tx(self.contracts['loans'], "getAssetTokens", {})

        self.send_tx(self.btest_wallet, self.contracts['loans'], 0, "setOracle", {'_address': self.contracts['bandOracle']})
        self.call_tx(self.contracts['loans'], "getOracle", {})

        res = self.send_tx(self.btest_wallet, self.contracts['loans'], 0, "getIethprice", {})
        #self.call_tx(self.contracts['bandOracle'], "lastPriceInLoop", {'_asset': 'iETH'})


        # self.send_tx(self.btest_wallet, self.contracts['loans'], 100*10**18, "depositAndBorrow", {'_asset': 'bnUSD', '_amount': 10*10**18})
        #
        # self.call_tx(self.contracts['loans'], "getAccountPositions", {'_owner': self.btest_wallet.get_address()})

