export interface AgentBinaryVersion {
  version: string;
  uploadDate: string;
  fileSize: number;
  downloadUrl: string;
}

export interface AgentBinaryUploadResponse {
  success: boolean;
  message?: string;
  version?: string;
  status?: string;
}

export interface AgentVersionDetails extends AgentBinaryVersion {
  md5Hash: string;
  supportedOperatingSystems: string[];
}

export interface AgentBinaryFile {
  filename: string;
  download_link: string;
}

export interface AgentBinaryVersions {
  [version: string]: AgentBinaryFile[];
}

export interface AgentBinaryVersionListResponse {
  versions: AgentBinaryVersions;
}
