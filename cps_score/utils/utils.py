from iconservice import *


class ArrayDBUtils:
    @staticmethod
    def array_db_clear(array: ArrayDB) -> None:
        size = len(array)
        for _ in range(size):
            array.pop()

    @staticmethod
    def arraydb_to_list(array: ArrayDB) -> list:
        return [item for item in array]

    @staticmethod
    def remove_array_item(array_db, target) -> bool:
        _out = array_db[-1]
        if _out == target:
            array_db.pop()
            return True
        for index in range(len(array_db) - 1):
            if array_db[index] == target:
                array_db[index] = _out
                array_db.pop()
                return True
        return False
