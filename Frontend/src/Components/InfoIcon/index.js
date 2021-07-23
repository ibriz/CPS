import React from "react";
import { AiFillDelete, AiFillQuestionCircle } from "react-icons/ai";
import { OverlayTrigger, Tooltip, Popover } from "react-bootstrap";

const InfoIcon = ({ description, placement = "right" }) => {
  return (
    <OverlayTrigger
      trigger="hover"
      placement={placement}
      overlay={
        <Popover id="popover-basic">
          <Popover.Content>
            <span cl>{description}</span>
          </Popover.Content>
        </Popover>
      }
    >
      <AiFillQuestionCircle
        style={{
          marginLeft: "1px",
          cursor: "help",
          fontSize: "1.1rem",
          color: "#1AAABA",
        }}
        variant="info"
      />
    </OverlayTrigger>
  );
};

export default InfoIcon;
