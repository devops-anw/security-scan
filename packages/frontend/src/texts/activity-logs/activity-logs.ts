import { defineMessages } from "react-intl";

export const activityLogsTexts = defineMessages({
  title: {
    id: "activityLogsTexts.title",
    defaultMessage: "Activity Logs / Telemetry",
  },
  noLogsFoundSearching: {
    id: "activityLogsTexts.noLogsFoundSearching",
    defaultMessage: "No logs found matching your search criteria.",
  },
  tryAdjustingFilters: {
    id: "activityLogsTexts.tryAdjustingFilters",
    defaultMessage: "Try adjusting your search term.",
  },
  noActivityFoundHeading: {
    id: "activityLogsTexts.noActivityFoundHeading",
    defaultMessage: "No activity found",
  },
  noActivityFoundMessage: {
    id: "activityLogsTexts.noActivityFoundMessage",
    defaultMessage: "There are currently no activity logs to display.",
  },
  activityActionError: {
    id: "activityLogsTexts.activityActionError",
    defaultMessage:
      "Failed to perform action on activity logs. Please try again.",
  },
  deviceId: {
    id: "activityLogsTexts.deviceId",
    defaultMessage: "Device ID",
  },
  activityType: {
    id: "activityLogsTexts.activityType",
    defaultMessage: "Activity Type",
  },
  severity: {
    id: "activityLogsTexts.severity",
    defaultMessage: "Severity",
  },
  timeStamp: {
    id: "activityLogsTexts.timeStamp",
    defaultMessage: "Timestamp",
  },
  additionalInfo: {
    id: "activityLogsTexts.additionalInfo",
    defaultMessage: "Additional Info",
  },
  activityLogsLoadErrorDescription: {
    id: "activityLogsTexts.activityLogsLoadErrorDescription",
    defaultMessage:
      "We encountered a problem while fetching the activity logs. Please try again later or contact support if the issue persists.",
  },
  loadError: {
    id: "activityLogsTexts.loadError",
    defaultMessage: "Failed to load activity logs",
  },
  noActivityFoundDeviceMessage: {
    id: "activityLogsTexts.noActivityFoundDeviceMessage",
    defaultMessage:
      "There are currently no activity logs to display for this device.",
  },
  deviceLogModalDesc: {
    id: "activityLogsTexts.deviceLogModalDesc",
    defaultMessage: "Recent Activity logs for the device",
  },
});
