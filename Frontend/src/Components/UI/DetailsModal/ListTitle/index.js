import React from 'react';
import styled from 'styled-components';

const ListTitleComp = styled.div`
    font-family: 'Montserrat', sans-serif;
    font-style: normal;
    font-weight: 600;
    font-size: 18px;
    line-height: 22px;
    color: #262626;
    margin-bottom: 18px;
  `;

const ListTitle = ({ children }) => {
  return (
    <>
      <ListTitleComp>{children}</ListTitleComp>
    </>
  );
};

export default ListTitle;
