import { describe, it, expect, vi, beforeEach } from "vitest";
import { apiConsole } from "@/utils/apiUtils";
import logger from "@/utils/logger";
import { getDeviceRecoveryList, getRecoveryList } from "@/lib/fileRecovery";
import { getAccessToken } from "@/lib/authToken";

vi.mock("@/utils/apiUtils");
vi.mock("@/utils/logger");
vi.mock("@/lib/authToken");

describe("RecoveryList", () => {
  const token = "test-token";

  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("getRecoveryList", () => {
    const skip = 0;
    const limit = 10;

    it("should handle additional filters (search, device_name, status)", async () => {
      const mockData = {
        recoveries: [{ recoveries: "mockRecoveryData" }],
        total_count: 1,
      };
      const filters = {
        search: "test",
        device_name: "Device 1",
        status: "Completed",
      };

      vi.mocked(getAccessToken).mockResolvedValue(token);
      vi.mocked(apiConsole.get).mockResolvedValue({ data: mockData });

      const result = await getRecoveryList(
        skip,
        limit,
        filters.search,
        filters.device_name,
        filters.status
      );

      expect(result).toEqual({
        recoveries: mockData.recoveries,
        total: mockData.total_count,
      });
      expect(apiConsole.get).toHaveBeenCalledWith(
        "/organization/devices/recoveries",
        {
          params: { skip, limit, ...filters },
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
    });

    it("should return an empty recovery list if the API responds with an empty result", async () => {
      const mockData = { recoveries: [], total_count: 0 };

      vi.mocked(getAccessToken).mockResolvedValue(token);
      vi.mocked(apiConsole.get).mockResolvedValue({ data: mockData });

      const result = await getRecoveryList(skip, limit);

      expect(result).toEqual({
        recoveries: [],
        total: 0,
      });
    });

    it("should throw a generic error if the API returns an unknown error structure", async () => {
      const error = { message: "Unexpected error" };
      vi.mocked(apiConsole.get).mockRejectedValue(error);

      await expect(getRecoveryList(skip, limit)).rejects.toThrow(
        "Failed to fetch recovery list"
      );
      expect(logger.error).toHaveBeenCalledWith(
        "An error occurred while fetching recovery list",
        error
      );
    });
    it("should exclude optional parameters if they are not provided", async () => {
      const mockData = {
        recoveries: [{ recoveries: "mockRecoveryData" }],
        total_count: 1,
      };

      vi.mocked(getAccessToken).mockResolvedValue(token);
      vi.mocked(apiConsole.get).mockResolvedValue({ data: mockData });

      const result = await getRecoveryList(skip, limit);

      expect(result).toEqual({
        recoveries: mockData.recoveries,
        total: mockData.total_count,
      });
      expect(apiConsole.get).toHaveBeenCalledWith(
        "/organization/devices/recoveries",
        {
          params: { skip, limit }, // Ensure no extra parameters are added.
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
    });
    it("should throw an error if token retrieval fails", async () => {
      const tokenError = new Error("Token retrieval failed");
      vi.mocked(getAccessToken).mockRejectedValue(tokenError);

      await expect(getRecoveryList(skip, limit)).rejects.toThrow(
        "Failed to fetch recovery list"
      );
      expect(logger.error).toHaveBeenCalledWith(
        "An error occurred while fetching recovery list",
        tokenError
      );
    });
    it("should throw an error and log a warning when recovery list is not found (404)", async () => {
      const errorResponse = {
        response: {
          status: 404,
          data: "Not Found",
        },
      };

      vi.mocked(apiConsole.get).mockRejectedValue(errorResponse);

      await expect(getRecoveryList(skip, limit)).rejects.toThrow(
        "No recovery list found."
      );
      expect(logger.warn).toHaveBeenCalledWith(
        "No recovery list found.",
        errorResponse.response.data
      );
    });
  });

  describe("getDeviceRecoveryList", () => {
    const deviceId = "test-device-id";
    const skip = 0;
    const limit = 10;

    it("should handle a large dataset correctly", async () => {
      const mockData = {
        recoveries: Array.from({ length: 1000 }, (_, i) => ({
          id: i,
          name: `Recovery ${i}`,
        })),
      };

      vi.mocked(getAccessToken).mockResolvedValue(token);
      vi.mocked(apiConsole.get).mockResolvedValue({ data: mockData });

      const result = await getDeviceRecoveryList(deviceId, skip, limit);

      expect(result).toEqual(mockData);
      expect(result.recoveries).toHaveLength(1000);
    });

    it("should log a warning and return an empty array if device ID is invalid", async () => {
      const invalidDeviceId = "";
      const mockError = {
        response: {
          status: 404,
          data: "Not Found",
        },
      };

      vi.mocked(apiConsole.get).mockRejectedValue(mockError);

      const result = await getDeviceRecoveryList(invalidDeviceId, skip, limit);

      expect(result).toEqual({ recoveries: [], total: 0 });
      expect(logger.warn).toHaveBeenCalledWith(
        "No recovery list found for the specified device",
        mockError.response.data
      );
    });

    it("should log an error for non-HTTP errors", async () => {
      const error = new Error("Connection timeout");

      vi.mocked(apiConsole.get).mockRejectedValue(error);

      await expect(
        getDeviceRecoveryList(deviceId, skip, limit)
      ).rejects.toThrow("Failed to fetch device recovery list");
      expect(logger.error).toHaveBeenCalledWith(
        "An error occurred while fetching device recovery list",
        error
      );
    });
    it("should log and throw a generic error for unexpected error structure", async () => {
      const genericError = { message: "Unexpected error" };
      vi.mocked(apiConsole.get).mockRejectedValue(genericError);

      await expect(
        getDeviceRecoveryList(deviceId, skip, limit)
      ).rejects.toThrow("Failed to fetch device recovery list");
      expect(logger.error).toHaveBeenCalledWith(
        "An error occurred while fetching device recovery list",
        genericError
      );
    });
  });
});
