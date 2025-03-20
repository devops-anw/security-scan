import { defineMessages } from "react-intl";

export const deviceConfigTexts = defineMessages({
  deviceConfiguration: {
    id: "deviceConfigTexts.title",
    defaultMessage: "Device Configuration",
  },
  edit: {
    id: "deviceConfigTexts.edit",
    defaultMessage: "Edit",
  },
  save: {
    id: "deviceConfigTexts.save",
    defaultMessage: "Save",
  },
  cancel: {
    id: "deviceConfigTexts.cancel",
    defaultMessage: "Cancel",
  },
  saving: {
    id: "deviceConfigTexts.saving",
    defaultMessage: "Saving...",
  },
  close: {
    id: "deviceConfigTexts.close",
    defaultMessage: "Close",
  },
  configError: {
    id: "deviceConfigTexts.configError",
    defaultMessage: "Configuration Error",
  },
  deviceConfigModalDesc: {
    id: "deviceConfigTexts.deviceConfigModalDesc",
    defaultMessage: "Configuration for the device",
  },
  errorMessage: {
    id: "deviceConfigTexts.errorMessage",
    defaultMessage:
      "We encountered a problem while fetching the device configuration. Please try again later or contact support if the issue persists.",
  },

  // Section names
  MemcryptLog: {
    id: "deviceConfigTexts.MemcryptLog",
    defaultMessage: "Memcrypt Log",
  },
  Analysis: {
    id: "deviceConfigTexts.Analysis",
    defaultMessage: "Analysis",
  },
  Decryptor: {
    id: "deviceConfigTexts.Decryptor",
    defaultMessage: "Decryption",
  },
  Bands: {
    id: "deviceConfigTexts.Bands",
    defaultMessage: "Bands",
  },
  MonitorStatistics: {
    id: "deviceConfigTexts.MonitorStatistics",
    defaultMessage: "Monitor Statistics",
  },
  Whitelist: {
    id: "deviceConfigTexts.Whitelist",
    defaultMessage: "Whitelist",
  },
  Extractor: {
    id: "deviceConfigTexts.Extractor",
    defaultMessage: "Extractor",
  },

  // MemcryptLog
  post_ip: {
    id: "deviceConfigTexts.post_ip",
    defaultMessage: "Post IP",
  },
  port: {
    id: "deviceConfigTexts.port",
    defaultMessage: "Port",
  },
  local_log_location: {
    id: "deviceConfigTexts.local_log_location",
    defaultMessage: "Local Log Location",
  },

  // Analysis
  dir_to_analyse: {
    id: "deviceConfigTexts.dir_to_analyse",
    defaultMessage: "Directory to Analyze",
  },
  key: {
    id: "deviceConfigTexts.key",
    defaultMessage: "Encryption Key",
  },
  nonce: {
    id: "deviceConfigTexts.nonce",
    defaultMessage: "Nonce",
  },
  ipaddress: {
    id: "deviceConfigTexts.ipaddress",
    defaultMessage: "IP Address",
  },
  infected_file: {
    id: "deviceConfigTexts.infected_file",
    defaultMessage: "Infected File",
  },
  dir_candidate_values: {
    id: "deviceConfigTexts.dir_candidate_values",
    defaultMessage: "Directory Candidate Values",
  },
  recovery_file: {
    id: "deviceConfigTexts.recovery_file",
    defaultMessage: "Recovery File",
  },
  parallel: {
    id: "deviceConfigTexts.parallel",
    defaultMessage: "Parallel Processing",
  },
  bulk: {
    id: "deviceConfigTexts.bulk",
    defaultMessage: "Bulk Processing",
  },

  // Decryptor
  dir_candidates_folder: {
    id: "deviceConfigTexts.dir_candidates_folder",
    defaultMessage: "Candidate Folder",
  },
  dir_ransomware_folder: {
    id: "deviceConfigTexts.dir_ransomware_folder",
    defaultMessage: "Ransomware Folder",
  },
  dir_extracts_folder: {
    id: "deviceConfigTexts.dir_extracts_folder",
    defaultMessage: "Extract Folder",
  },
  decrypts_folder: {
    id: "deviceConfigTexts.decrypts_folder",
    defaultMessage: "Decrypted Files Folder",
  },
  extensionvalidationfile: {
    id: "deviceConfigTexts.extensionvalidationfile",
    defaultMessage: "Extension Validation File",
  },
  ransomwareparameterfile: {
    id: "deviceConfigTexts.ransomwareparameterfile",
    defaultMessage: "Ransomware Parameter File",
  },
  remote: {
    id: "deviceConfigTexts.remote",
    defaultMessage: "Remote",
  },
  time_limit: {
    id: "deviceConfigTexts.time_limit",
    defaultMessage: "Time Limit",
  },
  algorithms: {
    id: "deviceConfigTexts.algorithms",
    defaultMessage: "Decryption Algorithms",
  },

  // Bands
  cpured: {
    id: "deviceConfigTexts.cpured",
    defaultMessage: "CPU Red Threshold",
  },
  cpuamber: {
    id: "deviceConfigTexts.cpuamber",
    defaultMessage: "CPU Amber Threshold",
  },
  memred: {
    id: "deviceConfigTexts.memred",
    defaultMessage: "Memory Red Threshold",
  },
  memamber: {
    id: "deviceConfigTexts.memamber",
    defaultMessage: "Memory Amber Threshold",
  },
  diskred: {
    id: "deviceConfigTexts.diskred",
    defaultMessage: "Disk Red Threshold",
  },
  diskamber: {
    id: "deviceConfigTexts.diskamber",
    defaultMessage: "Disk Amber Threshold",
  },
  ioreadsred: {
    id: "deviceConfigTexts.ioreadsred",
    defaultMessage: "I/O Reads Red Threshold",
  },
  ioreadsamber: {
    id: "deviceConfigTexts.ioreadsamber",
    defaultMessage: "I/O Reads Amber Threshold",
  },
  iowritesred: {
    id: "deviceConfigTexts.iowritesred",
    defaultMessage: "I/O Writes Red Threshold",
  },
  iowritesamber: {
    id: "deviceConfigTexts.iowritesamber",
    defaultMessage: "I/O Writes Amber Threshold",
  },
  updatedeltared: {
    id: "deviceConfigTexts.updatedeltared",
    defaultMessage: "Update Delta Red",
  },
  updatedeltaamber: {
    id: "deviceConfigTexts.updatedeltaamber",
    defaultMessage: "Update Delta Amber",
  },

  // Monitor Statistics
  refreshinterval: {
    id: "deviceConfigTexts.refreshinterval",
    defaultMessage: "Refresh Interval",
  },

  // Whitelist
  inspect_folder: {
    id: "deviceConfigTexts.inspect_folder",
    defaultMessage: "Inspect Folder",
  },
  hashes_number: {
    id: "deviceConfigTexts.hashes_number",
    defaultMessage: "Number of Hashes",
  },
  hash_size: {
    id: "deviceConfigTexts.hash_size",
    defaultMessage: "Hash Size",
  },
  buffer_size: {
    id: "deviceConfigTexts.buffer_size",
    defaultMessage: "Buffer Size",
  },
  append: {
    id: "deviceConfigTexts.append",
    defaultMessage: "Append Mode",
  },
  centralised: {
    id: "deviceConfigTexts.centralised",
    defaultMessage: "Centralised Whitelist",
  },

  // Extractor
  logswitch: {
    id: "deviceConfigTexts.logswitch",
    defaultMessage: "Log Switch",
  },
  security_switch: {
    id: "deviceConfigTexts.security_switch",
    defaultMessage: "Security Switch",
  },
  extract_folder: {
    id: "deviceConfigTexts.extract_folder",
    defaultMessage: "Extract Folder",
  },
  hash_filename: {
    id: "deviceConfigTexts.hash_filename",
    defaultMessage: "Hash Filename",
  },
  folder_filename: {
    id: "deviceConfigTexts.folder_filename",
    defaultMessage: "Folder Whitelist Filename",
  },
  suspectext_filename: {
    id: "deviceConfigTexts.suspectext_filename",
    defaultMessage: "Suspect Extensions Filename",
  },
  safeext_filename: {
    id: "deviceConfigTexts.safeext_filename",
    defaultMessage: "Safe Extensions Filename",
  },
  suspectext_killswitch: {
    id: "deviceConfigTexts.suspectext_killswitch",
    defaultMessage: "Suspect Extension Kill Switch",
  },
  updateSuccessMessage: {
    id: "deviceConfigTexts.updateSuccessMessage",
    defaultMessage: "Device configuration updated successfully.",
  },
  updateErrorMessage: {
    id: "deviceConfigTexts.updateErrorMessage",
    defaultMessage: "Failed to update configuration",
  },
});
