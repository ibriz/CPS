class RLPException(Exception):
    """Base class for exceptions raised by this package."""
    pass


class EncodingError(RLPException):
    """Exception raised if encoding fails.

    :ivar obj: the object that could not be encoded
    """

    def __init__(self, message, obj):
        super(EncodingError, self).__init__(message)
        self.obj = obj


class DecodingError(RLPException):
    """Exception raised if decoding fails.

    :ivar rlp: the RLP string that could not be decoded
    """

    def __init__(self, message, rlp):
        super(DecodingError, self).__init__(message)
        self.rlp = rlp


class SerializationError(RLPException):
    """Exception raised if serialization fails.

    :ivar obj: the object that could not be serialized
    """

    def __init__(self, message, obj):
        super(SerializationError, self).__init__(message)
        self.obj = obj


class ListSerializationError(SerializationError):
    """Exception raised if serialization by a :class:`sedes.List` fails.

    :ivar element_exception: the exception that occurred during the serialization of one of the
                             elements, or `None` if the error is unrelated to a specific element
    :ivar index: the index in the list that produced the error or `None` if the error is unrelated
                 to a specific element
    """

    def __init__(self, message=None, obj=None, element_exception=None, index=None):
        if message is None:
            assert index is not None
            assert element_exception is not None
            message = ('Serialization failed because of element at index {} '
                       '("{}")'.format(index, str(element_exception)))
        super(ListSerializationError, self).__init__(message, obj)
        self.index = index
        self.element_exception = element_exception


class DeserializationError(RLPException):
    """Exception raised if deserialization fails.

    :ivar serial: the decoded RLP string that could not be deserialized
    """

    def __init__(self, message, serial):
        super(DeserializationError, self).__init__(message)
        self.serial = serial


class ListDeserializationError(DeserializationError):
    """Exception raised if deserialization by a :class:`sedes.List` fails.

    :ivar element_exception: the exception that occurred during the deserialization of one of the
                             elements, or `None` if the error is unrelated to a specific element
    :ivar index: the index in the list that produced the error or `None` if the error is unrelated
                 to a specific element
    """

    def __init__(self, message=None, serial=None, element_exception=None, index=None):
        if not message:
            assert index is not None
            assert element_exception is not None
            message = ('Deserialization failed because of element at index {} '
                       '("{}")'.format(index, str(element_exception)))
        super(ListDeserializationError, self).__init__(message, serial)
        self.index = index
        self.element_exception = element_exception
