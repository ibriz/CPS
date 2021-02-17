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

# 2/3 Vot
MAJORITY = 0.67

# Period Interval Time
DAY_COUNT = 15

# Total Blocks in 1 day
BLOCKS_DAY_COUNT = 43120

# User Defined Db
PROPOSAL_DB_PREFIX = b'proposal'
PROGRESS_REPORT_DB_PREFIX = b'progressReport'

# Period Names
APPLICATION_PERIOD = "Application Period"
VOTING_PERIOD = "Voting Period"
TRANSITION_PERIOD = "Transition Period"


# Bond Status
BOND_RECEIVED = "bond_received"
BOND_APPROVED = "bond_approved"
BOND_RETURNED = "bond_returned"
BOND_CANCELLED = "bond_cancelled"

# SCOREs Constants
CPS_TREASURY_SCORE = "_cps_treasury_score"
CPF_SCORE = "_cpf_score"

# PERIOD CONSTANTS
INITIAL_BLOCK = "initial_block"
PERIOD_DETAILS = "_period_details"
PERIOD_NAME = "period_name"
PREVIOUS_PERIOD_NAME = "previous_period_name"
PERIOD_SPAN = "period_span"
LASTBLOCK = "last_block"
CURRENTBLOCK = "current_block"
NEXTBLOCK = "next_block"
REMAINING_TIME = "remaining_time"
UPDATE_PERIOD_INDEX = "update_period_index"

# PREPS Related Constants
MAIN_PREPS = "main_preps"
ALL_PREPS = "_all_preps"
ADMINS = "admins"
UNREGISTERED_PREPS = "unregistered_preps"
REGISTERED_PREPS = "registered_preps"
INACTIVE_PREPS = "inactive_preps"
PREP_NAME = "prep_name"

# VarDB/ArrayDB Params
PROPOSALS_KEY_LIST = 'proposals_key_list'
PROGRESS_KEY_LIST = 'progress_key_list'
CONTRIBUTORS = "contributors"
SPONSORS = "sponsors"
BUDGET_APPROVALS_LIST = "budget_approvals_list"
SPONSOR_ADDRESS = 'sponsor_address'
TOTAL_BUDGET = 'total_budget'
ACTIVE_PROPOSALS = "active_proposals"
VOTING_PROPOSALS = "voting_proposals"
VOTING_PROGRESS_REPORTS = "voting_progress_reports"
AMOUNT = "_total_amount"
ADDRESS = "address"

# Proposals and Progress reports keys
PROPOSAL = "proposal"
PROGRESS_REPORTS = "progress_report"
NEW_PROGRESS_REPORT = "new_progress_report"
PROJECT_TITLE = "project_title"
PROGRESS_REPORT_TITLE = "progress_report_title"
TOTAL_VOTES = "total_votes"
TOTAL_VOTERS = "total_voters"
REJECTED_VOTES = "rejected_votes"
APPROVED_VOTES = "approved_votes"
REJECT_VOTERS = "reject_voters"
APPROVE_VOTERS = "approve_voters"

TIMESTAMP = 'timestamp'
CONTRIBUTOR_ADDRESS = "contributor_address"
TX_HASH = "tx_hash"
IPFS_HASH = 'ipfs_hash'
REPORT_KEY = 'report_key'
REPORT_HASH = 'report_hash'
PROJECT_DURATION = 'project_duration'
APPROVED_REPORTS = "approved_reports"
IPFS_LINK = "ipfs_link"
PERCENTAGE_COMPLETED = 'percentage_completed'
ADDITIONAL_BUDGET = 'additional_budget'
ADDITIONAL_DURATION = 'additional_month'
BUDGET_ADJUSTMENT = 'budget_adjustment'
BUDGET_ADJUSTMENT_STATUS = "budget_adjustment_status"
SPONSOR_DEPOSIT_AMOUNT = 'sponsor_deposit_amount'
PREPS_DENYLIST = "preps_denylist"
DENYLIST = "denylist"
PENALTY_AMOUNT = "penalty_amount"
STATUS = "status"
DATA = "data"
COUNT = "count"

# VOTE KEYS
VOTE = "vote"
VOTE_REASON = "vote_reason"
APPROVE = "_approve"
REJECT = "_reject"
ABSTAIN = "_abstain"
ACCEPT = "_accept"

# Sponsor Fee
SPONSOR_FEE = 50
