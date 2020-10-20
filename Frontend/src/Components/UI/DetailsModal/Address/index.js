import React from 'react';
import styles from './Address.module.css';

const Address = ({children}) => {
    return (
        <span className = {styles.address}>
            {children}
        </span>
    )
}

export default Address;