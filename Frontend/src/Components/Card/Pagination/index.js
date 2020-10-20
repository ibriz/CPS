import React, {useState} from 'react';
import PaginationComponent from 'react-responsive-pagination';


const Pagination = ({currentPage, setCurrentPage, totalPages}) => {

    
    return (
        <div className="commentBox">

    <PaginationComponent
      current={currentPage}
      total={totalPages}
      maxWidth = {10}
      onPageChange={setCurrentPage}
    />

      </div>
    )
}

export default Pagination;