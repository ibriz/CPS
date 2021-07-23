import React from "react";
import { Table } from "react-bootstrap";
import styles from "./DetailsTable.module.css";

const DetailsTable = ({ title, data }) => {
  return (
    <Table striped bordered hover responsive>
      <thead>
        <tr>
          <th className={styles.tableHeader}>{title}</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row, index) => (
          <tr key={index}>
            <td className={styles.data}>
              <span className={styles.key}>{row.key}</span>
              <span className={styles.value}>{row.value}</span>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default DetailsTable;
