import { defineMessages } from "react-intl";

export const userListTexts = defineMessages({
  pageTitle: {
    id: "userList.pageTitle",
    defaultMessage: "Organization Users",
  },
  loadingMessage: {
    id: "userList.loadingMessage",
    defaultMessage: "Loading users...",
  },
  errorHeading: {
    id: "userList.errorHeading",
    defaultMessage: "Unable to Load Users",
  },
  errorMessage: {
    id: "userList.errorMessage",
    defaultMessage:
      "We encountered an issue while trying to load the user list. Please refresh the page or contact support if the issue continues.",
  },
  noUsersFoundHeading: {
    id: "userList.noUsersFoundHeading",
    defaultMessage: "No Users Found",
  },
  noUsersFoundMessage: {
    id: "userList.noUsersFoundMessage",
    defaultMessage: "There are currently no users in the platform.",
  },
  tableStatus: {
    id: "userList.tableStatus",
    defaultMessage: "Status",
  },
});
