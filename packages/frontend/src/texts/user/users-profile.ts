import { defineMessages } from "react-intl";

export const userProfileTexts = defineMessages({
  loading: {
    id: "userProfile.loading",
    defaultMessage: "Loading user profile...",
  },
  errorLoading: {
    id: "userProfile.errorLoading",
    defaultMessage: "Error loading user profile",
  },
  profileUpdated: {
    id: "userProfile.profileUpdated",
    defaultMessage: "Profile updated successfully for {firstName} {lastName}",
  },
  firstName: {
    id: "userProfile.firstName",
    defaultMessage: "First Name",
  },
  lastName: {
    id: "userProfile.lastName",
    defaultMessage: "Last Name",
  },
  organization: {
    id: "userProfile.organization",
    defaultMessage: "Organization",
  },
  email: {
    id: "userProfile.email",
    defaultMessage: "Email ID",
  },
  copiedMessage: {
    id: "userProfile.copiedMessage",
    defaultMessage: "Copied!",
  },
});
