import React from "react";
import styles from "./LowerCardTitle.module.scss";

const LowerCardTitle = ({ children, style }) => {
  return (
    <span className={styles.proposalTitle} style={style}>
      {children}
    </span>
  );
};

export default LowerCardTitle;
