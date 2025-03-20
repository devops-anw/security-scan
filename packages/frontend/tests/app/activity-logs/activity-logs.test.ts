import { describe, it, expect, vi, beforeEach } from "vitest";
import logger from "@/utils/logger";
import { apiConsole } from "@/utils/apiUtils";
import { getActivityLogs, getDeviceActivityLogs } from "@/lib/activityLogs";
import { getAccessToken } from "@/lib/authToken";

vi.mock("@/utils/apiUtils");
vi.mock("@/utils/logger");
vi.mock("@/lib/authToken");

describe("Activity logs API", () => {
  const mockToken = "mock-token";
  const skip = 0;
  const limit = 10;

  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("getActivityLogs", () => {
    it("should fetch logs successfully", async () => {
      const mockResponse = {
        logs: [{ activityLogs: "mockActivityLogsData" }],
        total_count: 1,
      };

      vi.mocked(getAccessToken).mockResolvedValue(mockToken);
      vi.mocked(apiConsole.get).mockResolvedValue({ data: mockResponse });

      const result = await getActivityLogs(skip, limit);

      expect(result).toEqual({
        logs: mockResponse.logs,
        total: mockResponse.total_count,
      });

      expect(apiConsole.get).toHaveBeenCalledWith("/activity-logs", {
        params: { skip, limit },
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${mockToken}`,
        },
      });
    });

    it("should handle 404 error", async () => {
      const error = { response: { status: 404, data: "Not found" } };
      vi.mocked(apiConsole.get).mockRejectedValue(error);

      await expect(getActivityLogs(skip, limit)).rejects.toThrow(
        "No activity logs found."
      );
      expect(logger.warn).toHaveBeenCalledWith(
        "No activity logs found.",
        error.response.data
      );
    });

    it("should handle other errors", async () => {
      const error = new Error("Network error");
      vi.mocked(apiConsole.get).mockRejectedValue(error);

      await expect(getActivityLogs(skip, limit)).rejects.toThrow(
        "Failed to fetch activity logs"
      );
      expect(logger.error).toHaveBeenCalledWith(
        "An error occurred while fetching activity logs",
        error
      );
    });
    it("should fetch logs successfully with optional parameters", async () => {
      const mockResponse = {
        logs: [{ activityLogs: "mockActivityLogsData" }],
        total_count: 1,
      };
      const search = "error";
      const device_name = "device123";
      const severity = "high";

      vi.mocked(getAccessToken).mockResolvedValue(mockToken);
      vi.mocked(apiConsole.get).mockResolvedValue({ data: mockResponse });

      const result = await getActivityLogs(
        skip,
        limit,
        search,
        device_name,
        severity
      );

      expect(result).toEqual({
        logs: mockResponse.logs,
        total: mockResponse.total_count,
      });

      expect(apiConsole.get).toHaveBeenCalledWith("/activity-logs", {
        params: { skip, limit, search, device_name, severity },
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${mockToken}`,
        },
      });
    });

    it("should handle missing optional parameters gracefully", async () => {
      const mockResponse = {
        logs: [{ activityLogs: "mockActivityLogsData" }],
        total_count: 1,
      };

      vi.mocked(getAccessToken).mockResolvedValue(mockToken);
      vi.mocked(apiConsole.get).mockResolvedValue({ data: mockResponse });

      const result = await getActivityLogs(skip, limit);

      expect(result).toEqual({
        logs: mockResponse.logs,
        total: mockResponse.total_count,
      });

      expect(apiConsole.get).toHaveBeenCalledWith("/activity-logs", {
        params: { skip, limit },
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${mockToken}`,
        },
      });
    });

    it("should handle invalid token errors", async () => {
      const error = new Error("Invalid token");
      vi.mocked(getAccessToken).mockRejectedValue(error);

      await expect(getActivityLogs(skip, limit)).rejects.toThrow(
        "Failed to fetch activity logs"
      );
      expect(logger.error).toHaveBeenCalledWith(
        "An error occurred while fetching activity logs",
        error
      );
    });
  });
  describe("getDeviceActivityLogs", () => {
    const mockDeviceId = "device123";

    it("should fetch logs for a specific device successfully", async () => {
      const mockResponse = {
        logs: [{ deviceLogs: "mockDeviceLogsData" }],
        total_count: 1,
      };

      vi.mocked(getAccessToken).mockResolvedValue(mockToken);
      vi.mocked(apiConsole.get).mockResolvedValue({ data: mockResponse });

      const result = await getDeviceActivityLogs(mockDeviceId, skip, limit);

      expect(result).toEqual({
        logs: mockResponse.logs,
        total: mockResponse.total_count,
      });

      expect(apiConsole.get).toHaveBeenCalledWith(
        `/activity-logs/device/${mockDeviceId}`,
        {
          params: { skip, limit },
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${mockToken}`,
          },
        }
      );
    });

    it("should handle 404 error for a specific device", async () => {
      const error = { response: { status: 404, data: "Not found" } };
      vi.mocked(apiConsole.get).mockRejectedValue(error);

      await expect(
        getDeviceActivityLogs(mockDeviceId, skip, limit)
      ).rejects.toThrow(
        `No activity logs found for device ID: ${mockDeviceId}`
      );
      expect(logger.warn).toHaveBeenCalledWith(
        `No activity logs found for device ID: ${mockDeviceId}`,
        error.response.data
      );
    });

    it("should handle other errors for a specific device", async () => {
      const error = new Error("Network error");
      vi.mocked(apiConsole.get).mockRejectedValue(error);

      await expect(
        getDeviceActivityLogs(mockDeviceId, skip, limit)
      ).rejects.toThrow("Failed to fetch device activity logs");
      expect(logger.error).toHaveBeenCalledWith(
        "An error occurred while fetching device activity logs",
        error
      );
    });

    it("should handle invalid device ID errors", async () => {
      const mockInvalidDeviceId = "";
      await expect(
        getDeviceActivityLogs(mockInvalidDeviceId, skip, limit)
      ).rejects.toThrow("Failed to fetch device activity logs");
      expect(logger.error).toHaveBeenCalled();
    });
  });
});
