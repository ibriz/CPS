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

    @staticmethod
    def remove_array_item(array_db, target):
        _out = array_db.pop()
        if _out != target:
            for index in range(0, len(array_db)):
                if array_db[index] == target:
                    array_db[index] = _out
                    return
