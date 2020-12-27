from iconservice import Address
from CPFTreasury.rlp.exceptions import (
    DeserializationError,
    SerializationError,
)


def serialize(obj):
    if not isinstance(obj, Address):
        raise SerializationError('Can only serialize addresses', obj)
    return obj.to_bytes_including_prefix()


def deserialize(serial):
    if len(serial) != 21:
        raise DeserializationError('Invalid serialization (wrong size)', serial)
    return Address.from_bytes_including_prefix(serial)
