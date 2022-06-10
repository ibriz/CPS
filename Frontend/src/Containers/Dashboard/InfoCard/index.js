import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import styles from './InfoCard.module.scss';
import InfoIcon from 'Components/InfoIcon';
import { OverlayTrigger, Tooltip, Popover } from 'react-bootstrap';

const InfoCard = ({
  bg = 'secondary',
  title,
  value,
  color = '#FF0000',
  hoverText,
}) => {
  return (
    <Card
      bg={bg}
      className={styles.card}
      style={{ height: 'auto', minHeight: '100%' }}
    >
      {hoverText ? (
        <OverlayTrigger
          placement='bottom-end'
          trigger={['hover', 'focus']}
          overlay={
            <Popover id='popover-basic'>
              <Popover.Content>
                <span cl>{hoverText}</span>
              </Popover.Content>
            </Popover>
          }
        >
          <Card.Body
            className={styles.cardBody}
            style={{ color: color, border: `1px solid ${color}` }}
          >
            <Card.Title
              dangerouslySetInnerHTML={{ __html: value }}
              style={{
                textAlign: 'center',
                fontSize: '1.5rem',
                fontWeight: 700,
              }}
            ></Card.Title>
            <Card.Text
              style={{
                fontSize: '0.875rem',
                textAlign: 'center',
                fontWeight: 500,
              }}
            >
              {title}
            </Card.Text>
          </Card.Body>
        </OverlayTrigger>
      ) : (
        <Card.Body
          className={styles.cardBody}
          style={{ color: color, border: `1px solid ${color}` }}
        >
          <Card.Title
            dangerouslySetInnerHTML={{ __html: value }}
            style={{
              textAlign: 'center',
              fontSize: '1.5rem',
              fontWeight: 700,
            }}
          ></Card.Title>
          <Card.Text
            style={{
              fontSize: '0.875rem',
              textAlign: 'center',
              fontWeight: 500,
            }}
          >
            {title}
          </Card.Text>
        </Card.Body>
      )}
    </Card>
  );
};

export default InfoCard;
