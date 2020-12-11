from iconservice import *

# ================================================
#  Consts
# ================================================
# TAG
TAG = 'CPS_Score'
# ICX Multiplier
MULTIPLIER = 10 ** 18
# MINIMUM P-Reps Count
MINIMUM_PREPS = 7
# MAXIMUM PROJECT PERIOD
MAX_PROJECT_PERIOD = 6
# 2/3 Vote
MAJORITY = 0.666
# Period Interval Time
BLOCKS_COUNT = 900
# BURN COIN ADDRESS
ZERO_WALLET_ADDRESS = Address.from_string('hx0000000000000000000000000000000000000000')

# User Defined Db
PROPOSAL_DB_PREFIX = b'proposal'
PROGRESS_REPORT_DB_PREFIX = b'progressReport'

# Period Names
APPLICATION_PERIOD = "Application Period"
VOTING_PERIOD = "Voting Period"

# Bond Status
BOND_RECEIVED = "bond_received"
BOND_APPROVED = "bond_approved"
BOND_RETURNED = "bond_returned"
BOND_CANCELLED = "bond_cancelled"
