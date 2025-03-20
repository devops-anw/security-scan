type AdditionalInfo = {
  [key: string]: string | number | undefined;
};

type LogEntry = {
  org_id: string;
  device_id: string;
  device_name: string;
  activity_type: string;
  severity: string;
  details: AdditionalInfo;
  id: string;
  created_at: string;
};
