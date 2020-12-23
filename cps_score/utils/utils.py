from iconservice import *


class ArrayDBUtils:
    @staticmethod
    def array_db_clear(array: ArrayDB) -> None:
        while array:
            array.pop()

    @staticmethod
    def arraydb_to_list(array: ArrayDB) -> list:
        _list = []
        for key in array:
            _list.append(key)

        return _list
