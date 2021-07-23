import React from "react";
import styled from "styled-components";

const ListTitle = ({ children }) => {
  const ListTitle = styled.div`
    font-family: "Montserrat", sans-serif;
    font-style: normal;
    font-weight: 600;
    font-size: 18px;
    line-height: 22px;
    color: #262626;
    margin-bottom: 18px;
  `;
  return (
    <>
      <ListTitle>{children}</ListTitle>
    </>
  );
};

export default ListTitle;
