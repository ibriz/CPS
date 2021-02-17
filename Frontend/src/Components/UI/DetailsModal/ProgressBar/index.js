import React from 'react';
import styles from './ProgressBar.module.scss';
import {ProgressBar} from 'react-bootstrap';

const ProgreeBar = () => {
    return (
        <ProgressBar className={styles.progressBar}>
            <ProgressBar striped variant="info" now={46} key={1} />
        </ProgressBar>
    )
}

export default ProgreeBar;