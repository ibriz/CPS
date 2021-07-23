import React from 'react';
import styles from './Heading.module.css';

const Header = ({ children }) => {
  return <span className={styles.header}>{children}</span>;
};

export default Header;
