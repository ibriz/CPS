import React from 'react';
import PaginationComponent from 'react-responsive-pagination';
import styles from './Pagination.module.scss';
import Pagination from 'react-responsive-pagination';

const Pagination1 = ({ currentPage, setCurrentPage, totalPages }) => {
  return (
    <div className={styles.paginationContainer}>
      <PaginationComponent
        current={currentPage ?? 1}
        total={totalPages}
        maxWidth={10}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default Pagination1;
