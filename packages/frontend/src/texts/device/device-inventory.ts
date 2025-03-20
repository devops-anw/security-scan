import { defineMessages } from "react-intl";

export const deviceInventoryTexts = defineMessages({
  approveAll: {
    id: "deviceConfigTexts.approveAll",
    defaultMessage: "Approve All",
  },
  rejectAll: {
    id: "deviceConfigTexts.rejectAll",
    defaultMessage: "Reject All",
  },
  applicationName: {
    id: "deviceConfigTexts.applicationName",
    defaultMessage: "Application Name",
  },
  applicationVersion: {
    id: "deviceConfigTexts.applicationVersion",
    defaultMessage: "Version",
  },
  applicationPublisher: {
    id: "deviceConfigTexts.applicationPublisher",
    defaultMessage: "Publisher",
  },
  applicationStatus: {
    id: "deviceConfigTexts.applicationStatus",
    defaultMessage: "Status",
  },
  applicationActions: {
    id: "deviceConfigTexts.applicationActions",
    defaultMessage: "Actions",
  },
  noApplications: {
    id: "deviceConfigTexts.noApplications",
    defaultMessage: "No applications found",
  },
  applicationLoadError: {
    id: "deviceConfigTexts.applicationLoadError",
    defaultMessage: "Failed to load applications",
  },
  applicationLoadErrorDescription: {
    id: "deviceConfigTexts.applicationLoadErrorDescription",
    defaultMessage:
      "We encountered a problem while fetching the applications. Please try again later or contact support if the issue persists.",
  },
  applicationSearchNoResults: {
    id: "deviceConfigTexts.applicationSearchNoResults",
    defaultMessage: "No application found matching your search criteria.",
  },
  applicationSearchNoResultTryAdjusting: {
    id: "deviceConfigTexts.applicationSearchNoResultTryAdjusting",
    defaultMessage: "Try adjusting your search term.",
  },
  loadingApplications: {
    id: "deviceConfigTexts.loadingApplications",
    defaultMessage: "Loading applications...",
  },
});
