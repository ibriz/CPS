import React from 'react';
import { AiFillDelete, AiFillQuestionCircle } from 'react-icons/ai';
import {OverlayTrigger, Tooltip} from 'react-bootstrap'

  
const InfoIcon = ({description}) => {
    return (
        <OverlayTrigger
        placement="right"
        delay={{ show: 250, hide: 400 }}
        style = {{width: '1000px'}}
        overlay = {<Tooltip style = {{width: '1000px'}} >{description}</Tooltip>}
      >
            <AiFillQuestionCircle style = {{marginLeft: '1px', cursor: 'help', fontSize: '1.1rem', color: '#1AAABA'}} variant = "info"/>
    </OverlayTrigger>

    )
}

export default InfoIcon;