import React from 'react';
import styles from './ProgressBar.module.scss';
import {ProgressBar} from 'react-bootstrap';

const ProgreeBar = ({
    percentage = 46,
    variant = "info"
}) => {
    return (
        <ProgressBar className={styles.progressBar}>
            <ProgressBar striped variant={variant} now={percentage} key={1} />
        </ProgressBar>
    )
}

export default ProgreeBar;