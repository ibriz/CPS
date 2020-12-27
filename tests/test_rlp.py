from iconservice import *

import pytest
from CPFTreasury import rlp


@pytest.mark.parametrize(
    "data,expected",
    [
        (
            ("cat", "dog"),
            b"\xc8\x83cat\x83dog",
        ),
        ("", b"\x80"),
        ((), b"\xc0"),
        ([], b"\xc0"),
        (1024, b"\x82\x04\x00"),
        (0, b"\x80"),
        (b"hello", b"\x85hello"),
        (
            "Lorem ipsum dolor sit amet, consectetur adipisicing elit",
            b"\xb8\x38Lorem ipsum dolor sit amet, consectetur adipisicing elit",
        ),
        (
            ZERO_SCORE_ADDRESS,
            b"\x95" + b"\x01" + b"\x00" * 20,
        ),
        (
            ("cat", 0, 1, 1024, ZERO_SCORE_ADDRESS, b"hello", True),
            b"".join((b"\xe6", b"\x83cat", b"\x80", b"\x01", b"\x82\x04\x00", b"\x95\x01", b"\x00" * 20, b"\x85hello", b"\x01"))
        )
    ],
)
def test_encode(data, expected):
    assert rlp.encode(data) == expected


@pytest.mark.parametrize(
    "data,sedes,expected",
    [
        (b"\x80", rlp.sedes.big_endian_int, 0),
        (b"\x01", rlp.sedes.big_endian_int, 1),
        (b"\x82\x04\x00", rlp.sedes.big_endian_int, 1024),
        (b"\x80", rlp.sedes.text, ""),
        (b"\x80", rlp.sedes.boolean, False),
        (b"\x01", rlp.sedes.boolean, True),
        (b"\x85hello", rlp.sedes.text, "hello"),
        (b"\x85world", None, b"world"),
        (b"\xc8\x83cat\x83dog", rlp.sedes.List([rlp.sedes.text, rlp.sedes.text]), ("cat", "dog")),
        (b"\xc8\x83cat\x83dog", rlp.sedes.CountableList(rlp.sedes.text, 2), ("cat", "dog")),
        (b"\xc8\x83cat\x83dog", None, [b"cat", b"dog"]),
        (b"\x95" + b"\x01" + b"\x00" * 20, CPFTreasury.rlp.sedes.address, ZERO_SCORE_ADDRESS),
    ]
)
def test_decode(data, sedes, expected):
    assert rlp.decode(data, sedes) == expected
