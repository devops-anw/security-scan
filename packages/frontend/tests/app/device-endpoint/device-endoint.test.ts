import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getDeviceEndPointConfigDetails,
  updateDeviceEndPointConfig,
} from "../../../src/lib/deviceEndPoint";

import { apiConsole } from "@/utils/apiUtils";
import { getAccessToken } from "@/lib/authToken";
import logger from "@/utils/logger";

// Mock the entire modules
vi.mock("@/utils/apiUtils");
vi.mock("@/utils/logger");
vi.mock("@/lib/authToken");

describe("getDeviceEndPointConfigDetails", () => {
  const deviceEndPointId = "testDeviceEndPointId";
  const token = "test-token";

  // Reset mocks before each test
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should return device config details when API call is successful", async () => {
    const mockResponse = {
      data: {
        name: "Appnetwise R Laptop Config",
        type: "Laptop",
        config: {
          MemcryptLog: {
            post_ip: "localhost",
            port: "7777",
            local_log_location: "C:\\Windows\\Detect\\TempDEBUG=false",
          },
          Analysis: {
            dir_to_analyse: "",
            key: "",
            nonce: "",
            ipaddress: "localhost",
            port: "8888",
            infected_file: "",
            dir_candidate_values: "",
            recovery_file: "C:\\Windows\\Detect\\Tempremote=true",
            parallel: "false",
            bulk: "false",
          },
          Decryptor: {
            dir_candidate_values: "",
            infected_file: "",
            dir_candidates_folder: "",
            dir_ransomware_folder: "",
            dir_extracts_folder: "",
            decrypts_folder: "",
            recovery_file:
              "C:\\Windows\\Detect\\Tempsafeext_filename=C:\\Windows\\Detect\\SafeExt.csv",
            extensionvalidationfile: "C:\\Windows\\Detect\\fileidentifier.json",
            ransomwareparameterfile: "C:\\Windows\\Detect\\ransomware.json",
            time_limit: "1800",
            remote: "true",
            parallel: "auto",
            algorithms:
              "CHACHA20#256#NA,CHACHA8#256#NA,SALSA20#256#NA,AES#256#CBC,AES#256#CTR,AES#256#CFB",
            bulk: "false",
          },
          Bands: {
            cpured: "90",
            cpuamber: "70",
            memred: "90",
            memamber: "70",
            diskred: "90",
            diskamber: "70",
            ioreadsred: "100",
            ioreadsamber: "20",
            iowritesred: "100",
            iowritesamber: "20",
            updatedeltared: "30",
            updatedeltaamber: "10",
          },
          MonitorStatistics: {
            ipaddress: "localhost",
            port: "8888",
            refreshinterval: "10",
          },
          Whitelist: {
            inspect_folder:
              "c:whitelist_path=C:\\Windows\\Detect\\hashwhitelist.csv",
            hashes_number: "",
            hash_size: "",
            buffer_size: "",
            remote: "true",
            append: "true",
            centralised: "true",
            ipaddress: "localhost",
            port: "8888",
          },
          Extractor: {
            logswitch: "silent",
            security_switch: "off",
            extract_folder: "C:\\Windows\\Detect\\Temp",
            hash_filename: "C:\\Windows\\Detect\\hashwhitelist.csv",
            folder_filename: "C:\\Windows\\Detect\\folderwhitelist.enc",
            suspectext_filename: "C:\\Windows\\Detect\\SuspectExt.enc",
            safeext_filename: "C:\\Windows\\Detect\\SafeExt.enc",
            suspectext_killswitch: "on",
          },
        },
        id: "08d77a36-f994-4e2f-901e-00fda6d44512",
        org_id: "2520d97a-7a4a-4aa4-8aa7-d258a67c9222",
        created_at: "2024-10-02T13:37:49.462315Z",
        updated_at: "2024-10-02T13:38:16.214492Z",
      },
    };

    // Mock the API call
    (apiConsole.get as any).mockResolvedValue(mockResponse);

    vi.mocked(getAccessToken).mockResolvedValue(token);

    // Call the function and expect the result to match mockResponse.data
    const result = await getDeviceEndPointConfigDetails(deviceEndPointId);

    expect(result).toEqual(mockResponse.data); // Check for deep equality of the entire data structure

    // Ensure the mock function is called with the correct arguments
    expect(apiConsole.get).toHaveBeenCalledWith(
      `/endpoint-config/${deviceEndPointId}`,
      {
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
  });

  it("should handle API call failure gracefully", async () => {
    (apiConsole.get as any).mockRejectedValue(
      new Error("Failed to fetch device config details")
    );
    vi.mocked(getAccessToken).mockResolvedValue(token);
    await expect(
      getDeviceEndPointConfigDetails(deviceEndPointId)
    ).rejects.toThrow("Failed to fetch device config details");

    // Ensure the mock function was called
    expect(apiConsole.get).toHaveBeenCalledWith(
      `/endpoint-config/${deviceEndPointId}`,
      {
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
  });
  it("should throw an error if token retrieval fails", async () => {
    vi.mocked(getAccessToken).mockRejectedValue(
      new Error("Token retrieval failed")
    );
    await expect(
      getDeviceEndPointConfigDetails(deviceEndPointId)
    ).rejects.toThrow("Failed to fetch device config details");

    // Ensure no API call is made if token retrieval fails
    expect(apiConsole.get).not.toHaveBeenCalled();
  });

  it("should log an error if API call fails", async () => {
    const mockLogger = vi.mocked(logger.error);
    const apiError = new Error("API request failed");

    vi.mocked(getAccessToken).mockResolvedValue(token);
    (apiConsole.get as any).mockRejectedValue(apiError);

    await expect(
      getDeviceEndPointConfigDetails(deviceEndPointId)
    ).rejects.toThrow("Failed to fetch device config details");

    expect(mockLogger).toHaveBeenCalledWith("error", apiError);
  });
});

describe("updateDeviceEndPointConfig", () => {
  const deviceEndPointId = "testDeviceEndPointId";
  const token = "test-token";
  const config = { key: "value" };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should update device config details when API call is successful", async () => {
    const mockResponse = { data: { success: true } };

    (apiConsole.put as any).mockResolvedValue(mockResponse);
    vi.mocked(getAccessToken).mockResolvedValue(token);

    const result = await updateDeviceEndPointConfig(deviceEndPointId, config);

    expect(result).toEqual(mockResponse.data);
    expect(apiConsole.put).toHaveBeenCalledWith(
      `/endpoint-config/${deviceEndPointId}`,
      config,
      {
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
  });

  it("should handle token retrieval failure gracefully", async () => {
    vi.mocked(getAccessToken).mockRejectedValue(
      new Error("Token retrieval failed")
    );

    await expect(
      updateDeviceEndPointConfig(deviceEndPointId, config)
    ).rejects.toThrow("Failed to update device config");

    expect(apiConsole.put).not.toHaveBeenCalled();
  });

  it("should log an error if API call fails", async () => {
    const mockLogger = vi.mocked(logger.error);
    const apiError = new Error("API request failed");

    vi.mocked(getAccessToken).mockResolvedValue(token);
    (apiConsole.put as any).mockRejectedValue(apiError);

    await expect(
      updateDeviceEndPointConfig(deviceEndPointId, config)
    ).rejects.toThrow("Failed to update device config");

    expect(mockLogger).toHaveBeenCalledWith("error", apiError);
  });
});
