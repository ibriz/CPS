import React from 'react';
import styles from './NavBarTitle.module.scss';
import classNames from 'classnames';
import { Nav } from 'react-bootstrap';

const NavBarTitle = ({ children, onClick, activeCondition }) => {
  return (
    // <span className={classNames({ [styles.navTitle]: true }, { [styles.selectedNav]: activeCondition })}
    //     onClick={onClick}>
    //         {children}
    // </span>
    <Nav.Link
      className={classNames(
        { [styles.navTitle]: true },
        { [styles.selectedNav]: activeCondition },
      )}
      onClick={onClick}
    >
      {children}
    </Nav.Link>
  );
};

export default NavBarTitle;
