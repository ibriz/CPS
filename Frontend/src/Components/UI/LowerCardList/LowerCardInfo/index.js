import React from 'react';
import styles from './LowerCardInfo.module.scss';
import classNames from 'classnames';

const LowerCardInfo = ({ className = '', children }) => {
  return (
    <span className={classNames([styles.proposalInfo], styles[className])}>
      {children}
    </span>
  );
};

export default LowerCardInfo;
