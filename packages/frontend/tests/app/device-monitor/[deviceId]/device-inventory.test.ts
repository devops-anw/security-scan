import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  approveApplication,
  bulkApproveApplications,
  bulkRejectApplications,
  getDeviceInventory,
  rejectApplication,
} from "@/lib/deviceInventory";
import logger from "@/utils/logger";
import { apiConsole } from "@/utils/apiUtils";
import { getAccessToken } from "@/lib/authToken";

vi.mock("@/utils/apiUtils");
vi.mock("@/utils/logger");
vi.mock("@/lib/authToken");

const mockToken = "mock-token";
const skip = 0;
const limit = 10;

describe("deviceInventory", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });
  const inventoryId = "test-inventory";
  const inventoryIds = ["test-inventory-1", "test-inventory-2"];
  const deviceId = "test-device";

  describe("getDeviceInventory", () => {
    it("should return device inventory data when API call is successful", async () => {
      const mockResponse = { inventory: "mockInventoryData" };
      vi.mocked(getAccessToken).mockResolvedValue(mockToken);
      vi.mocked(apiConsole.get).mockResolvedValue({ data: mockResponse });
      const result = await getDeviceInventory(deviceId, skip, limit);

      expect(result).toEqual(mockResponse);
      expect(apiConsole.get).toHaveBeenCalledWith(
        `/devices/${deviceId}/inventory`,
        {
          params: { skip, limit },
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${mockToken}`,
          },
        }
      );
    });

    it("should return an empty array when device inventory is not found (404)", async () => {
      const errorResponse = {
        response: {
          status: 404,
          data: "No inventory found for the specified device.",
        },
      };

      vi.mocked(apiConsole.get).mockRejectedValue(errorResponse);

      const result = await getDeviceInventory(deviceId, skip, limit);

      // Assert that the function returns an empty array instead of throwing an error

      expect(result).toEqual({ inventory: [], total: 0 });

      // Ensure that the logger is called with the appropriate message
      expect(logger.warn).toHaveBeenCalledWith(
        "No inventory found for the specified device",
        errorResponse.response.data
      );
    });

    it("should throw a generic error when API call fails with other errors", async () => {
      const error = new Error("Network Error");
      vi.mocked(apiConsole.get).mockRejectedValue(error);

      await expect(getDeviceInventory(deviceId, skip, limit)).rejects.toThrow(
        "Failed to fetch device inventory"
      );
      expect(logger.error).toHaveBeenCalledWith(
        "An error occurred while fetching device inventory",
        error
      );
    });
  });

  describe("approveApplication", () => {
    it("should approve application successfully", async () => {
      const mockResponse = { data: "approved" };
      vi.mocked(getAccessToken).mockResolvedValue(mockToken);
      vi.mocked(apiConsole.post).mockResolvedValue(mockResponse);
      const result = await approveApplication(inventoryId);
      expect(result).toBe(mockResponse.data);
      expect(apiConsole.post).toHaveBeenCalledWith(
        `/inventory/${inventoryId}/approve`,
        null,
        {
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${mockToken}`,
          },
        }
      );
    });

    it("should log error and throw error when approval fails", async () => {
      const mockError = new Error("Failed to approve application");
      vi.mocked(apiConsole.post).mockRejectedValue(mockError);
      await expect(approveApplication(inventoryId)).rejects.toThrow(
        "Failed to approve application"
      );
      expect(logger.error).toHaveBeenCalledWith("error", mockError);
    });
  });

  describe("rejectApplication", () => {
    it("should reject application successfully", async () => {
      const mockResponse = { data: "rejected" };
      vi.mocked(apiConsole.post).mockResolvedValue(mockResponse);
      vi.mocked(getAccessToken).mockResolvedValue(mockToken);

      const result = await rejectApplication(inventoryId);
      expect(result).toBe(mockResponse.data);
      expect(apiConsole.post).toHaveBeenCalledWith(
        `/inventory/${inventoryId}/deny`,
        null,
        {
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${mockToken}`,
          },
        }
      );
    });

    it("should log error and throw error when rejection fails", async () => {
      const mockError = new Error("Failed to reject application");
      vi.mocked(apiConsole.post).mockRejectedValue(mockError);

      await expect(rejectApplication(inventoryId)).rejects.toThrow(
        "Failed to reject application"
      );
      expect(logger.error).toHaveBeenCalledWith("error", mockError);
    });
  });

  describe("bulkApproveApplications", () => {
    it("should bulk approve applications successfully", async () => {
      const mockResponse = { data: "bulk approved" };
      vi.mocked(apiConsole.post).mockResolvedValue(mockResponse);
      vi.mocked(getAccessToken).mockResolvedValue(mockToken);
      const result = await bulkApproveApplications(inventoryIds);
      expect(result).toBe(mockResponse.data);
      expect(apiConsole.post).toHaveBeenCalledWith(
        `/inventory/bulk-approve`,
        inventoryIds,
        {
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${mockToken}`,
          },
        }
      );
    });

    it("should log error and throw error when bulk approval fails", async () => {
      const mockError = new Error("Failed to bulk approve applications");
      vi.mocked(apiConsole.post).mockRejectedValue(mockError);
      await expect(bulkApproveApplications(inventoryIds)).rejects.toThrow(
        "Failed to bulk approve applications"
      );
      expect(logger.error).toHaveBeenCalledWith("error", mockError);
    });
  });

  describe("bulkRejectApplications", () => {
    it("should bulk reject applications successfully", async () => {
      const mockResponse = { data: "bulk rejected" };
      vi.mocked(apiConsole.post).mockResolvedValue(mockResponse);
      vi.mocked(getAccessToken).mockResolvedValue(mockToken);

      const result = await bulkRejectApplications(inventoryIds);

      expect(result).toBe(mockResponse.data);
      expect(apiConsole.post).toHaveBeenCalledWith(
        `/inventory/bulk-deny`,
        inventoryIds,
        {
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${mockToken}`,
          },
        }
      );
    });

    it("should log error and throw error when bulk rejection fails", async () => {
      const mockError = new Error("Failed to bulk reject applications");

      vi.mocked(apiConsole.post).mockRejectedValue(mockError);
      await expect(bulkRejectApplications(inventoryIds)).rejects.toThrow(
        "Failed to bulk reject applications"
      );
      expect(logger.error).toHaveBeenCalledWith("error", mockError);
    });
  });
});
