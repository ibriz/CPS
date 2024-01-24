import React from 'react';
import styled from 'styled-components';

const Description1 = styled.div`
  color: var(--proposal-text-color);
  font-size: 0.9rem;
  padding: 0px 8px;
  margin-top:20px;
`;

const DescriptionTitle = styled.div`
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 17px;
  color: var(--proposal-text-color);
  margin-bottom: 5px;
`;

const Description = ({ description, title = 'DESCRIPTION' }) => {
  description = description.replaceAll('<a', match => {
    return (
      match +
      ' target="_blank" style="word-break:break-word;white-space:normal"  '
    );
  });
  return (
    <>
      <DescriptionTitle>{title}</DescriptionTitle>
      <Description1 dangerouslySetInnerHTML={{ __html: description }} />
    </>
  );
};

export default Description;
