import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";

import { apiConsole } from "@/utils/apiUtils";
import logger from "@/utils/logger";
import {
  getDevices,
  getDeviceHeartbeat,
  registerDevice,
  getDeviceDetails,
} from "@/lib/deviceMonitor";
import { getAccessToken } from "@/lib/authToken";
import createApi from "@/lib/apiDeviceMonitor";

vi.mock("@/utils/apiUtils");
vi.mock("@/utils/logger");
vi.mock("@/lib/authToken");

beforeAll(() => {
  global.console.log = vi.fn();
  global.console.error = vi.fn();
  global.console.warn = vi.fn();
});

describe("createApi", () => {
  const orgKey = "test-org-key";

  it("should create an Axios instance with the correct baseURL and headers", () => {
    const apiInstance = createApi(orgKey);

    expect(apiInstance.defaults.baseURL).toBe(
      process.env.NEXT_PUBLIC_CONSOLE_API_URL
    );
    expect(apiInstance.defaults.headers["X-Org-Key"]).toBe(orgKey);
  });

  it("should use the correct environment variable for the baseURL", () => {
    const mockApiUrl = "https://mock-api.example.com";
    process.env.NEXT_PUBLIC_CONSOLE_API_URL = mockApiUrl;

    const apiInstance = createApi(orgKey);

    expect(apiInstance.defaults.baseURL).toBe(mockApiUrl);
  });
});

describe("deviceMonitor functions", () => {
  const token = "test-token";

  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(getAccessToken).mockResolvedValue(token);
  });

  describe("getDevices", () => {
    const skip = 0;
    const limit = 10;
    const search = "test-search";
    const device_type = "laptop";
    const status = true;

    it("should return devices with optional filters", async () => {
      const mockResponse = {
        data: {
          devices: [],
          total: 0,
        },
      };

      vi.mocked(apiConsole.get).mockResolvedValue(mockResponse);

      const result = await getDevices(skip, limit, search, device_type, status);

      expect(result).toEqual(mockResponse.data);
      expect(apiConsole.get).toHaveBeenCalledWith("/devices", {
        params: { skip, limit, search, device_type, status },
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    });

    it("should handle API call failure", async () => {
      const error = new Error("API call failed");
      vi.mocked(apiConsole.get).mockRejectedValue(error);

      await expect(getDevices(skip, limit)).rejects.toThrow(
        "Failed to fetch devices"
      );
      expect(logger.error).toHaveBeenCalledWith("error", error);
    });
  });

  describe("getDeviceHeartbeat", () => {
    const deviceId = "test-device-id";

    it("should return heartbeat data on success", async () => {
      const mockResponse = { data: { status: "active" } };
      vi.mocked(apiConsole.get).mockResolvedValue(mockResponse);

      const result = await getDeviceHeartbeat(deviceId);

      expect(result).toEqual(mockResponse.data);
      expect(apiConsole.get).toHaveBeenCalledWith(
        `/devices/heartbeat/${deviceId}`,
        {
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
    });

    it("should handle errors gracefully", async () => {
      const error = new Error("API call failed");
      vi.mocked(apiConsole.get).mockRejectedValue(error);

      await expect(getDeviceHeartbeat(deviceId)).rejects.toThrow(
        "Failed to fetch device heartbeat"
      );
      expect(logger.error).toHaveBeenCalledWith("error", error);
    });
  });

  describe("registerDevice", () => {
    const deviceData = { name: "Device 1", type: "laptop" };

    it("should register a device successfully", async () => {
      const mockResponse = { data: { id: "device1" } };
      vi.mocked(apiConsole.post).mockResolvedValue(mockResponse);

      const result = await registerDevice(deviceData);

      expect(result).toEqual(mockResponse.data);
      expect(apiConsole.post).toHaveBeenCalledWith(
        `/devices/register`,
        deviceData,
        {
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
    });

    it("should handle registration failure", async () => {
      const error = new Error("API call failed");
      vi.mocked(apiConsole.post).mockRejectedValue(error);

      await expect(registerDevice(deviceData)).rejects.toThrow(
        "Failed to register device"
      );
      expect(logger.error).toHaveBeenCalledWith("error", error);
    });
  });

  describe("getDeviceDetails", () => {
    const deviceId = "test-device-id";

    it("should return device details on success", async () => {
      const mockResponse = { data: { id: deviceId, name: "Device 1" } };
      vi.mocked(apiConsole.get).mockResolvedValue(mockResponse);

      const result = await getDeviceDetails(deviceId);

      expect(result).toEqual(mockResponse.data);
      expect(apiConsole.get).toHaveBeenCalledWith(`/devices/${deviceId}`, {
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    });

    it("should handle errors gracefully", async () => {
      const error = new Error("API call failed");
      vi.mocked(apiConsole.get).mockRejectedValue(error);

      await expect(getDeviceDetails(deviceId)).rejects.toThrow(
        "Failed to fetch device details"
      );
      expect(logger.error).toHaveBeenCalledWith("error", error);
    });
  });
});
