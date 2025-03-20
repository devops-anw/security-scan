import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getApplications,
  approveApplication,
  rejectApplication,
  bulkApproveApplications,
  bulkRejectApplications,
} from "@/lib/application";
import logger from "@/utils/logger";
import { apiConsole } from "@/utils/apiUtils";
import { getAccessToken } from "@/lib/authToken";

vi.mock("@/utils/apiUtils");
vi.mock("@/utils/logger");
vi.mock("@/lib/authToken");

describe("Application API", () => {
  const orgId = "test-org";
  const applicationId = "test-app";
  const applicationIds = ["app1", "app2"];
  const mockToken = " mock-token";
  const skip = 0;
  const limit = 10;

  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("getApplications", () => {
    describe("getApplications", () => {
      it("should fetch applications successfully", async () => {
        const mockResponse = {
          applications: [{ applications: "mockApplicationsData" }],
          total_count: 1,
        };
        vi.mocked(getAccessToken).mockResolvedValue(mockToken);
        vi.mocked(apiConsole.get).mockResolvedValue({ data: mockResponse });

        const result = await getApplications(skip, limit);

        expect(result).toEqual({
          applications: mockResponse.applications,
          total: mockResponse.total_count,
        });

        expect(apiConsole.get).toHaveBeenCalledWith("/applications", {
          params: { skip, limit },
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${mockToken}`,
          },
        });
      });
    });

    it("should handle 404 error", async () => {
      const error = { response: { status: 404, data: "Not found" } };
      vi.mocked(apiConsole.get).mockRejectedValue(error);

      await expect(getApplications(skip, limit)).rejects.toThrow(
        "No application found."
      );
      expect(logger.warn).toHaveBeenCalledWith(
        "No application found.",
        error.response.data
      );
    });

    it("should handle other errors", async () => {
      const error = new Error("Network error");
      vi.mocked(apiConsole.get).mockRejectedValue(error);

      await expect(getApplications(skip, limit)).rejects.toThrow(
        "Failed to fetch applications"
      );
      expect(logger.error).toHaveBeenCalledWith(
        "An error occurred while fetching applications",
        error
      );
    });
  });

  describe("approveApplication", () => {
    it("should approve application successfully", async () => {
      const mockData = { data: "approved" };
      vi.mocked(getAccessToken).mockResolvedValue(mockToken);
      vi.mocked(apiConsole.post).mockResolvedValue(mockData);
      const result = await approveApplication(applicationId);
      expect(result).toBe(mockData.data);
      expect(apiConsole.post).toHaveBeenCalledWith(
        `/applications/${applicationId}/approve`,
        null,
        {
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${mockToken}`,
          },
        }
      );
    });

    it("should handle errors", async () => {
      const error = new Error("Network error");
      vi.mocked(apiConsole.post).mockRejectedValue(error);
      await expect(approveApplication(applicationId)).rejects.toThrow(
        "Failed to approve application"
      );
      expect(logger.error).toHaveBeenCalledWith("error", error);
    });
  });

  describe("rejectApplication", () => {
    it("should reject application successfully", async () => {
      const mockData = { data: "rejected" };
      vi.mocked(getAccessToken).mockResolvedValue(mockToken);
      vi.mocked(apiConsole.post).mockResolvedValue(mockData);
      const result = await rejectApplication(applicationId);
      expect(result).toBe(mockData.data);
      expect(apiConsole.post).toHaveBeenCalledWith(
        `/applications/${applicationId}/deny`,
        null,
        {
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${mockToken}`,
          },
        }
      );
    });

    it("should handle errors", async () => {
      const error = new Error("Network error");
      vi.mocked(apiConsole.post).mockRejectedValue(error);
      await expect(rejectApplication(applicationId)).rejects.toThrow(
        "Failed to reject application"
      );
      expect(logger.error).toHaveBeenCalledWith("error", error);
    });
  });

  describe("bulkApproveApplications", () => {
    it("should bulk approve applications successfully", async () => {
      const mockData = { data: "bulk approved" };
      vi.mocked(getAccessToken).mockResolvedValue(mockToken);
      vi.mocked(apiConsole.post).mockResolvedValue(mockData);
      const result = await bulkApproveApplications(applicationIds);
      expect(result).toBe(mockData.data);
      expect(apiConsole.post).toHaveBeenCalledWith(
        "/applications/bulk-approve",
        applicationIds,
        {
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${mockToken}`,
          },
        }
      );
    });

    it("should handle errors", async () => {
      const error = new Error("Network error");
      vi.mocked(apiConsole.post).mockRejectedValue(error);
      await expect(bulkApproveApplications(applicationIds)).rejects.toThrow(
        "Failed to bulk approve applications"
      );
      expect(logger.error).toHaveBeenCalledWith("error", error);
    });
  });

  describe("bulkRejectApplications", () => {
    it("should bulk reject applications successfully", async () => {
      const mockData = { data: "bulk rejected" };
      vi.mocked(getAccessToken).mockResolvedValue(mockToken);
      vi.mocked(apiConsole.post).mockResolvedValue(mockData);

      const result = await bulkRejectApplications(applicationIds);
      expect(result).toBe(mockData.data);
      expect(apiConsole.post).toHaveBeenCalledWith(
        "/applications/bulk-deny",
        applicationIds,
        {
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${mockToken}`,
          },
        }
      );
    });

    it("should handle errors", async () => {
      const error = new Error("Network error");
      vi.mocked(apiConsole.post).mockRejectedValue(error);
      await expect(bulkRejectApplications(applicationIds)).rejects.toThrow(
        "Failed to bulk reject applications"
      );
      expect(logger.error).toHaveBeenCalledWith("error", error);
    });
  });
});
