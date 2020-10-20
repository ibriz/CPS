import React from 'react';
import styled from 'styled-components';

const Description = ({description, title = "DESCRIPTION"}) => {

    const Description = styled.div`
        color: #262626;
        font-size: 0.9rem;
    `

    const DescriptionTitle = styled.div`
    font-style: normal;
    font-weight: 600;
    font-size: 14px;
    line-height: 17px;   
    color: #262626;
    margin-bottom: 5px;

    `
    return(
        <>
        <DescriptionTitle>{title}</DescriptionTitle>
        <Description dangerouslySetInnerHTML={{ __html: description }} />
        </>
    )
}

export default Description;