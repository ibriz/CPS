import React from "react";
import styles from "./ProgressText.module.scss";

const ProgressText = ({ children }) => {
  return <span className={styles.progressText}>{children}</span>;
};

export default ProgressText;
