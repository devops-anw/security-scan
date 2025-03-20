import { defineMessages } from "react-intl";

export const applicationTexts = defineMessages({
  title: {
    id: "applicationTexts.title",
    defaultMessage: "Applications",
  },
  approveApplicationError: {
    id: "applicationTexts.approveApplicationError",
    defaultMessage: "Failed to approve application. Please try again.",
  },
  rejectApplicationError: {
    id: "applicationTexts.rejectApplicationError",
    defaultMessage: "Failed to reject application. Please try again.",
  },
  bulkApproveApplicationsError: {
    id: "applicationTexts.bulkApproveApplicationsError",
    defaultMessage: "Failed to approve all applications. Please try again.",
  },
  bulkRejectApplicationsError: {
    id: "applicationTexts.bulkRejectApplicationsError",
    defaultMessage: "Failed to reject all applications. Please try again.",
  },
  applicationActionError: {
    id: "applicationTexts.applicationActionError",
    defaultMessage:
      "Failed to perform action on application. Please try again.",
  },
  approveAll: {
    id: "applicationTexts.approveAll",
    defaultMessage: "Approve All",
  },
  approveAllConfirmation: {
    id: "applicationTexts.approveAllConfirmation",
    defaultMessage:
      "Are you sure you want to approve all pending applications?",
  },
  approveSelectedConfirmation: {
    id: "applicationTexts.approveSelectedConfirmation",
    defaultMessage:
      "Are you sure you want to approve the selected pending applications?",
  },
  rejectAll: {
    id: "applicationTexts.rejectAll",
    defaultMessage: "Reject All",
  },
  rejectAllConfirmation: {
    id: "applicationTexts.rejectAllConfirmation",
    defaultMessage: "Are you sure you want to reject all pending applications?",
  },
  rejectSelectedConfirmation: {
    id: "applicationTexts.approveAllConfirmation",
    defaultMessage:
      "Are you sure you want to reject the selected pending applications?",
  },

  approveConfirmation: {
    id: "applicationTexts.approveConfirmation",
    defaultMessage: "Are you sure you want to approve this application?",
  },
  reject: {
    id: "applicationTexts.reject",
    defaultMessage: "Reject",
  },
  rejectConfirmation: {
    id: "applicationTexts.rejectConfirmation",
    defaultMessage: "Are you sure you want to reject this application?",
  },
});
