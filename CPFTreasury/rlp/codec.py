from iconservice import Address
from .exceptions import EncodingError, DecodingError
from .sedes import big_endian_int, binary, boolean, text, address
from .sedes.binary import Binary as BinaryClass
from .sedes.lists import List, is_sedes
from .utils import (
    ALL_BYTES,
    big_endian_to_int,
    int_to_big_endian,
    is_bytes,
)


def encode_raw(item):
    """RLP encode (a nested sequence of) :class:`Atomic`s."""
    if is_bytes(item):
        if len(item) == 1 and item[0] < 128:
            return item
        payload = item
        prefix_offset = 128  # string
    elif isinstance(item, (list, tuple)):
        payload = b''.join(encode_raw(x) for x in item)
        prefix_offset = 192  # list
    else:
        msg = 'Cannot encode object of type {0}'.format(type(item).__name__)
        raise EncodingError(msg, item)

    try:
        prefix = length_prefix(len(payload), prefix_offset)
    except ValueError:
        raise EncodingError('Item too big to encode', item)

    return prefix + payload


def decode_raw(item, strict):
    try:
        result, per_item_rlp, end = consume_item(item, 0)
    except IndexError:
        raise DecodingError('RLP string too short', item)
    if end != len(item) and strict:
        msg = 'RLP string ends with {} superfluous bytes'.format(len(item) - end)
        raise DecodingError(msg, item)

    return result, per_item_rlp


def encode(obj, sedes=None, infer_serializer=True):
    if sedes:
        item = sedes.serialize(obj)
    elif infer_serializer:
        item = infer_sedes(obj).serialize(obj)
    else:
        item = obj

    return encode_raw(item)


LONG_LENGTH = 256 ** 8


def length_prefix(length, offset):
    if length < 56:
        return ALL_BYTES[offset + length]
    elif length < LONG_LENGTH:
        length_string = int_to_big_endian(length)
        return ALL_BYTES[offset + 56 - 1 + len(length_string)] + length_string
    else:
        raise ValueError('Length greater than 256**8')


SHORT_STRING = 128 + 56


def consume_length_prefix(rlp, start):
    b0 = rlp[start]
    if b0 < 128:  # single byte
        return b'', bytes, 1, start
    elif b0 < SHORT_STRING:  # short string
        if b0 - 128 == 1 and rlp[start + 1] < 128:
            raise DecodingError('Encoded as short string although single byte was possible', rlp)
        return rlp[start:start + 1], bytes, b0 - 128, start + 1
    elif b0 < 192:  # long string
        ll = b0 - 183  # - (128 + 56 - 1)
        if rlp[start + 1:start + 2] == b'\x00':
            raise DecodingError('Length starts with zero bytes', rlp)
        len_prefix = rlp[start + 1:start + 1 + ll]
        l = big_endian_to_int(len_prefix)  # noqa: E741
        if l < 56:
            raise DecodingError('Long string prefix used for short string', rlp)
        return rlp[start:start + 1] + len_prefix, bytes, l, start + 1 + ll
    elif b0 < 192 + 56:  # short list
        return rlp[start:start + 1], list, b0 - 192, start + 1
    else:  # long list
        ll = b0 - 192 - 56 + 1
        if rlp[start + 1:start + 2] == b'\x00':
            raise DecodingError('Length starts with zero bytes', rlp)
        len_prefix = rlp[start + 1:start + 1 + ll]
        l = big_endian_to_int(len_prefix)  # noqa: E741
        if l < 56:
            raise DecodingError('Long list prefix used for short list', rlp)
        return rlp[start:start + 1] + len_prefix, list, l, start + 1 + ll


def consume_payload(rlp, prefix, start, type_, length):
    if type_ is bytes:
        item = rlp[start: start + length]
        return item, [prefix + item], start + length
    elif type_ is list:
        items = []
        per_item_rlp = []
        list_rlp = prefix
        next_item_start = start
        end = next_item_start + length
        while next_item_start < end:
            p, t, l, s = consume_length_prefix(rlp, next_item_start)
            item, item_rlp, next_item_start = consume_payload(rlp, p, s, t, l)
            per_item_rlp.append(item_rlp)
            # When the item returned above is a single element, item_rlp will also contain a
            # single element, but when it's a list, the first element will be the RLP of the
            # whole List, which is what we want here.
            list_rlp += item_rlp[0]
            items.append(item)
        per_item_rlp.insert(0, list_rlp)
        if next_item_start > end:
            raise DecodingError('List length prefix announced a too small '
                                'length', rlp)
        return items, per_item_rlp, next_item_start
    else:
        raise TypeError('Type must be either list or bytes')


def consume_item(rlp, start):
    p, t, l, s = consume_length_prefix(rlp, start)
    return consume_payload(rlp, p, s, t, l)


def decode(rlp, sedes=None, strict=True, **kwargs):
    if not is_bytes(rlp):
        raise DecodingError('Can only decode RLP bytes, got type %s' % type(rlp).__name__, rlp)

    item, per_item_rlp = decode_raw(rlp, strict)

    if sedes:
        return sedes.deserialize(item, **kwargs)
    else:
        return item


def _apply_rlp_cache(obj, split_rlp, recursive):
    item_rlp = split_rlp.pop(0)
    if isinstance(obj, (int, bool, str, bytes, bytearray)):
        return
    elif hasattr(obj, '_cached_rlp'):
        obj._cached_rlp = item_rlp
    if not recursive:
        return
    for sub in obj:
        if isinstance(sub, (int, bool, str, bytes, bytearray)):
            split_rlp.pop(0)
        else:
            sub_rlp = split_rlp.pop(0)
            _apply_rlp_cache(sub, sub_rlp, recursive)


def infer_sedes(obj):
    if is_sedes(obj.__class__):
        return obj.__class__
    elif not isinstance(obj, bool) and isinstance(obj, int) and obj >= 0:
        return big_endian_int
    elif BinaryClass.is_valid_type(obj):
        return binary
    elif not isinstance(obj, str) and isinstance(obj, (list, tuple)):
        return List(map(infer_sedes, obj))
    elif isinstance(obj, bool):
        return boolean
    elif isinstance(obj, str):
        return text
    elif isinstance(obj, Address):
        return address
    msg = 'Did not find sedes handling type {}'.format(type(obj).__name__)
    raise TypeError(msg)
