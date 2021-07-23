import store from "Redux/Store";

export const progressReportStatusMapping = [
  {
    name: "Approved",
    status: "_approved",
    badgeColor: "success",
  },
  {
    name: "Rejected",
    status: "_progress_report_rejected",
    badgeColor: "danger",
  },
  {
    name: "Voting",
    status: "_waiting",
    badgeColor: "primary",
  },
  {
    name: "Approved",
    status: "_approve",
    badgeColor: "success",
  },
  {
    name: "Rejected",
    status: "_reject",
    badgeColor: "danger",
  },

  {
    name: "Abstained",
    status: "_abstain",
    badgeColor: "info",
  },

  {
    name: "Draft",
    status: "draft",
    badgeColor: "info",
  },
];

export const proposalStatusMapping = [
  {
    name: "Active",
    status: "_active",
    badgeColor: "success",
  },
  {
    name: "Approved",
    status: "_approve",
    badgeColor: "success",
  },
  {
    name: "Rejected",
    status: "_reject",
    badgeColor: "danger",
  },
  {
    name: "Abstained",
    status: "_abstain",
    badgeColor: "info",
  },
  {
    name: "Abstained",
    status: "_abstain",
    badgeColor: "primary",
  },
  {
    name: "Voting",
    status: "_pending",
    badgeColor: "primary",
  },
  {
    name: "Pending",
    status: "_sponsor_pending",
    badgeColor: "warning",
  },
  {
    name: "Completed",
    status: "_completed",
    badgeColor: "completed",
  },
  {
    name: "Disqualified",
    status: "_disqualified",
    badgeColor: "danger",
  },
  {
    name: "Paused",
    status: "_paused",
    badgeColor: "secondary",
  },
  {
    name: "Approved",
    status: "_approved",
    badgeColor: "success",
  },
  {
    name: "Rejected",
    status: "_rejected",
    badgeColor: "danger",
  },

  {
    name: "Draft",
    status: "draft",
    badgeColor: "info",
  },
];

export const payPenaltyAmount = 10;
export const specialCharacterMessage = (name) => {
  let specialCharacterMessage = `Please do not use special characters`;
  if (name) {
    specialCharacterMessage += ` in the ${name}.`;
  } else {
    specialCharacterMessage += `.`;
  }
  return specialCharacterMessage;
};
