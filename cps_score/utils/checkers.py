# -*- coding: utf-8 -*-

# Copyright 2020 ICONation
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

from ..cps_score import *
from iconservice import *


# ================================================
#  Exceptions
# ================================================
class SenderNotScoreOwnerError(Exception):
    pass


class NotAFunctionError(Exception):
    pass


class NotApplicationPeriodError(Exception):
    pass


class NotVotingPeriodError(Exception):
    pass


def only_owner(func):
    if not isfunction(func):
        raise NotAFunctionError

    @wraps(func)
    def __wrapper(self: object, *args, **kwargs):
        if self.msg.sender != self.owner:
            raise SenderNotScoreOwnerError(self.owner)

        return func(self, *args, **kwargs)

    return __wrapper


def application_period(func):
    if not isfunction(func):
        raise NotAFunctionError

    @wraps(func)
    def __wrapper(self: object, *args, **kwargs):
        if self.period_name.get() != "Application Period":
            raise NotApplicationPeriodError("Not Application Period")

        return func(self, *args, **kwargs)

    return __wrapper


def voting_period(func):
    if not isfunction(func):
        raise NotAFunctionError

    @wraps(func)
    def __wrapper(self: object, *args, **kwargs):
        if self.period_name.get() != "Voting Period":
            raise NotVotingPeriodError("Not Voting Period")

        return func(self, *args, **kwargs)

    return __wrapper
