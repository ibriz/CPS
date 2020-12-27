"""
A sedes that does nothing. Thus, everything that can be directly encoded by RLP
is serializable. This sedes can be used as a placeholder when deserializing
larger structures.
"""
from CPFTreasury.rlp.exceptions import SerializationError


def serializable(obj):
    if isinstance(obj, (bytes, bytearray)):
        return True
    elif not isinstance(obj, str) and isinstance(obj, (list, tuple)):
        return all(map(serializable, obj))
    else:
        return False


def serialize(obj):
    if not serializable(obj):
        raise SerializationError('Can only serialize nested lists of strings', obj)
    return obj


def deserialize(serial):
    return serial
