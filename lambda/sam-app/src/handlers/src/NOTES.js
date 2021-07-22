// Registered preps
[
  {
      "name": "Testing P-Rep4",
      "address": "hxef35c447e3f657315a6990da0ddaf4c61fa146e4",
      "delegated": "5 280 256 339 879 420 000 000 000"
  },
  {
      "name": "Testing P-Rep5",
      "address": "hxb4e90a285a79687ec148c29faabe6f71afa8a066",
      "delegated": "5 201 170 225 508 215 000 000 000"
  },
  {
      "name": "Testing P-Rep1",
      "address": "hxf5bdb1625e4b7fc6de7d85f9dd921090b27ec7d0",
      "delegated": "1 029 489 065 846 467 100 000 000"
  },
  {
      "name": "CPS Test P-Rep2(DO NOT DELEGATE)",
      "address": "hx37cbd8e2bbdc38554199e1afa48c4c90e3eed9ab",
      "delegated": "946 476 121 327 803 100 000 000"
  },
  {
      "name": "Testing P-Rep1",
      "address": "hx265305fb7d45e1edfba223503284d2b770605d4a",
      "delegated": "943 603 873 766 330 300 000 000"
  },
  {
      "name": "Testing P-Rep8",
      "address": "hxfd114a60eefa8e2c3de2d00dc5e41b1a0c7e8931",
      "delegated": "939 590 360 281 189 700 000 000"
  },
  {
      "name": "CPS Test P-Rep3(DO NOT DELEGATE)",
      "address": "hxd47ad924eba01ec91330e4e996cf7b8c658f4e4c",
      "delegated": "818 789 938 520 167 000 000 000"
  }
]


// Send 50icx along with this. This can be sent from any wallet but the tx object should have
// sponsor_address set to one of the registered PReps.
 
{
	"method": "submit_proposal",
	"params": {
		"_proposals": {
			"project_title": "ICON Mobile Wallet",
			"total_budget": "210",
			"sponsor_address": "hxb4e90a285a79687ec148c29faabe6f71afa8a066",
			"ipfs_hash": "bafybeiai75yev2ygmtjgsz7igziknq4fyo5gmnp4qqpcfhtmfum4",
			"ipfs_link": "https://gateway.ipfs.io/ipfs/bafybeiai75yev2ygmtjgsz7igziknkq4fyo5gmnp4qqpcfhtmfum4",
			"project_duration": "1"
		}
	}
}

// Sent from sponsor_address above, with same ipfs_hash as above. Should send 10% of total_budget in ICX
{
	"method": "sponsor_vote",
	"params": {
		"_vote": "_accept",
		"_vote_reason": "Great one",
		"_ipfs_key": "bafybeiai75yev2ygmtjgsz7igziknq4fyo5gmnp4qqpcfhtmfum4"
	}
}
