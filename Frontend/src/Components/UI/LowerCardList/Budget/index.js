import React from "react";
import styles from "./Budget.module.scss";
import ClassNames from "classnames";

const Budget = ({ children, marginLeft = true }) => {
  return (
    <span
      className={ClassNames(
        styles.budget,
        { [styles.proposalInfo2]: marginLeft },
        styles.budget
      )}
    >
      {children}
    </span>
  );
};

export default Budget;
