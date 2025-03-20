export interface Device {
  name: string;
  type: string;
  serial_number: string;
  properties: Record<string, unknown>;
  id: string;
  org_id: string;
  created_at: string;
  updated_at: string;
  last_seen: string | null;
  is_active: string;
  health: string;
}

export enum ApprovalStatus {
  PENDING = "pending",
  APPROVED = "approved",
  DENIED = "denied",
}

export interface ApplicationResponse {
  id: string;
  name: string;
  version: string;
  publisher: string;
  hash: string;
  status: ApprovalStatus;
  organization_id: string;
}

export interface InventoryResponse {
  id: string;
  device_id: string;
  application_id: string;
  status: ApprovalStatus;
  approved_at?: Date | null;
  denied_at?: Date | null;
  last_updated: Date;
  application?: ApplicationResponse | null;
}
