import { defineMessages } from "react-intl";

export const pendingApprovalTexts = defineMessages({
  title: {
    id: "pendingApproval.title",
    defaultMessage: "Organizations Pending Approval",
  },
  errorHeading: {
    id: "pendingApproval.errorHeading",
    defaultMessage: "Unable to Load Organizations Pending Approval",
  },
  errorMessage: {
    id: "pendingApproval.errorMessage",
    defaultMessage:
      "There was an issue fetching the organizations pending approval. Please refresh the page, or contact support if the problem continues.",
  },
  noUsersFoundHeading: {
    id: "pendingApproval.noUsersFoundHeading",
    defaultMessage: "No pending users found",
  },
  noUsersFoundMessage: {
    id: "pendingApproval.noUsersFoundMessage",
    defaultMessage: "There are currently no users waiting for approval.",
  },
  confirmApprove: {
    id: "pendingApproval.confirmApprove",
    defaultMessage: "Are you sure you want to approve this user?",
  },
  confirmReject: {
    id: "pendingApproval.confirmReject",
    defaultMessage: "Are you sure you want to reject this user?",
  },
  tableName: {
    id: "pendingApproval.tableName",
    defaultMessage: "Name",
  },
  tableUserId: {
    id: "pendingApproval.tableUserId",
    defaultMessage: "User Id",
  },
  tableEmail: {
    id: "pendingApproval.tableEmail",
    defaultMessage: "Email",
  },
  tableActions: {
    id: "pendingApproval.tableActions",
    defaultMessage: "Actions",
  },
});
