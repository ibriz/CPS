import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import styles from './InfoCard.module.scss';

const InfoCard = ({bg = "secondary", title, value}) => {
    return (
        <Card bg = {bg} text={(bg === 'light' || bg === 'warning') ? 'dark' : 'white'} className = {styles.card} style = {{height: 'auto', minHeight: '100%'}}
        >
            <Card.Body className = {styles.cardBody}>
                <Card.Title style = {{textAlign: 'center', fontSize: '23px'}}>{value}</Card.Title>
                <Card.Text style = {{fontSize: '18px', textAlign: 'center'}}>
                    {title}
                 </Card.Text>

            </Card.Body>
        </Card>
    )
}

export default InfoCard;