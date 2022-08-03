import React from 'react';
import Table from 'react-bootstrap/Table';
import Form from 'react-bootstrap/Form';
import prepsSlice from 'Redux/Reducers/prepsSlice';
const ValidatorStatsCard = ({ preps, count1, count2 }) => {
  const type = 'checkbox';
  return (
    <Table striped bordered hover>
      <thead>
        <tr>
          <th>S.N.</th>
          <th>Validator Name</th>
          <th>Proposals</th>
          <th>Progress reports</th>
          <th>Priority Voting</th>
        </tr>
      </thead>
      <tbody>
        {preps?.map((prep, i) => (
          <tr>
            <td>{i}</td>
            <td>{prep.prep.name}</td>
            <td>
              {prep.proposalRemaining} / {count1}
            </td>
            <td>
              {prep.progressReportRemaining} / {count2}
            </td>
            <td>
              <Form.Check
                checked={Boolean(Number(prep.priorityVoting))}
                disabled
                type={type}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default ValidatorStatsCard;
