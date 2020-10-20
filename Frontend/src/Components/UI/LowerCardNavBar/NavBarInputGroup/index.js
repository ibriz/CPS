import React from 'react';
import { FormControl, InputGroup } from 'react-bootstrap';
import { AiOutlineSearch } from 'react-icons/ai';
import styles from './NavBarInputGroup.module.scss';

const NavBarInputGroup = ({placeholder, value, setValue}) => {

    return (
        <InputGroup className={styles.inputGroup} >
            <FormControl
                value = {value}
                onChange = {(event) => setValue(event.target.value)}
                placeholder={placeholder}
                aria-label="Recipient's username"
                aria-describedby="basic-addon2"
            />
            <InputGroup.Append className={styles.inputGroupAppend}>
                <AiOutlineSearch />
            </InputGroup.Append>
        </InputGroup>
    )
}

export default NavBarInputGroup;