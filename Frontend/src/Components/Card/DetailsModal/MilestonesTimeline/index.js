import React from "react";
import { Timeline, TimelineEvent } from "react-event-timeline";
import { AiFillStar } from "react-icons/ai";

const MilestonesTimeline = ({ milestones = [] }) => {
  const milestoneList = [
    {
      name: "Project Started",
      duration: 0,
    },
    ...milestones,
  ];
  return (
    <Timeline style={{ padding: 0 }} lineStyle={{ height: "94.99%" }}>
      {milestoneList.map((milestone, index) => (
        <TimelineEvent
          title={milestone.name}
          titleStyle={{ paddingTop: "7px", marginLeft: "-8px" }}
          // createdAt="2016-09-11 09:06 AM"
          icon={<AiFillStar />}
          contentStyle={{
            backgroundColor: "white",
            boxShadow: "none",
            paddingLeft: "0px",
            marginLeft: "-23px",
            marginBottom: "-8px",
            marginTop: "3.5px",
          }}
        >
          {milestoneList[index + 1]
            ? `${milestoneList[index + 1].duration} month${
                milestoneList[index + 1].duration > 1 ? "s" : ""
              }`
            : ""}
        </TimelineEvent>
      ))}
    </Timeline>
  );
};

export default MilestonesTimeline;
