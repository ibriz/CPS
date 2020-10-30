import React from 'react';
import { Table } from 'react-bootstrap';
import styled from 'styled-components';

const MilestoneTable = ({milestones, title = "Milestones"}) => {

    const TableHeader = styled.th`
    background: #1AAABA !important;
    font-style: normal;
    font-weight: 600;
    font-size: 14px;
    line-height: 17px;
    color: #FFFFFF;
    `

    const TableData = styled.td`
    `

    const Key = styled.div`
    font-style: normal;
    font-weight: 600;
    font-size: 14px;
    line-height: 17px;    
    color: rgba(38, 38, 38, 0.9);
    `

    const Value = styled.div`
    font-style: normal;
    font-weight: normal;
    font-size: 14px;
    line-height: 17px;    
    color: rgba(38, 38, 38, 0.9);
    `

    return(
        <Table striped bordered hover responsive>
        <thead>
            <tr>
                <TableHeader>{title}</TableHeader>

            </tr>
        </thead>
        <tbody>
            {
                milestones?.map((milestone, index) => (
                    <tr key = {index}>

                        <TableData>
                            <Key>{milestone.name || 'N/A'}</Key>
                            <Value>`{milestone.duration || 'N/A'} months`</Value>
                        </TableData>
                    </tr>

                ))
            }
            
        </tbody>
    </Table>
    )
}

export default MilestoneTable;