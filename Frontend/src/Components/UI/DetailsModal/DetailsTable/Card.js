import React from 'react';
import styles from './DetailsTable.module.css';

const InformationCard = ({ title, data }) => {
  return (
    <div style={{ width:'100%'}}>
      <h3 className={styles.cardHeader}>{title}</h3>
      <div className='row mt-4'>
        {data.map((row, index) => (
          <div
            key={index}
            className={styles.data}
            class='d-flex flex-column col-xl-4 col-lg-6 col-12'
          >
            <h4 className={styles.key}>{row.key}</h4>
            <p className={styles.value}>{row.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InformationCard;
