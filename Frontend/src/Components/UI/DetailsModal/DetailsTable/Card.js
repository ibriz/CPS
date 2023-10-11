import React from 'react';
import styles from './DetailsTable.module.css';

const InformationCard = ({ title, data }) => {
  return (
    <div style={{ width:'100%'}}>
      <h3 className={styles.cardHeader}>{title}</h3>
      <div className='row mt-2 pb-2'>
        {data.map((row, index) => (
          <div
            key={index}
            style={{gap:10}}
            className='d-flex p-2 col-xl-4 col-lg-6 col-12'
          >
            <div className={styles.key}>{`${row.key} : `}</div>
            <div className={styles.value}>{row.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InformationCard;
