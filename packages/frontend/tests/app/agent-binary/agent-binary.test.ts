import { describe, it, expect, vi, beforeAll } from "vitest";
import {
  getAgentBinaryVersions,
  getLatestAgentBinaryLink,
  uploadAgentBinary,
} from "../../../src/lib/agentBinary";
import { apiAgentBinary } from "@/utils/apiUtils";
import logger from "@/utils/logger";
import { AgentBinaryVersionListResponse } from "@/types/agent-binary";
import { ALLOWED_EXTENSIONS } from "@/constants/common";
import { getAccessToken } from "@/lib/authToken";

vi.mock("@/utils/apiUtils");
vi.mock("@/utils/logger");
vi.mock("@/lib/authToken");

// Mock FormData
class MockFormData {
  private data: Record<string, any> = {};
  append(key: string, value: any) {
    this.data[key] = value;
  }
  get(key: string) {
    return this.data[key];
  }
}

// Mock File
class MockFile {
  name: string;
  size: number;
  type: string;

  constructor(bits: Array<any>, name: string, options?: { type?: string }) {
    this.name = name;
    this.size = bits.length;
    this.type = options?.type || "";
  }
}

global.FormData = MockFormData as any;
global.File = MockFile as any;

const mockToken = "mock-token";

describe("Agent Binary Functions", () => {
  beforeAll(() => {
    global.console.log = vi.fn();
    global.console.error = vi.fn();
    global.console.warn = vi.fn();
  });

  describe("getAgentBinaryVersions", () => {
    it("should return agent versions if response is valid", async () => {
      const mockResponse: AgentBinaryVersionListResponse = {
        versions: {
          "1.0.0": [
            { filename: "agent-1.0.0.exe", download_link: "link1" },
            { filename: "agent-1.0.0.tar", download_link: "link2" },
          ],
          "1.1.0": [
            { filename: "agent-1.1.0.exe", download_link: "link3" },
            { filename: "agent-1.1.0.tar", download_link: "link4" },
          ],
        },
      };
      vi.mocked(getAccessToken).mockResolvedValue(mockToken);
      vi.mocked(apiAgentBinary.get).mockResolvedValue({ data: mockResponse });

      const result = await getAgentBinaryVersions();
      expect(result).toEqual(mockResponse);
      expect(apiAgentBinary.get).toHaveBeenCalledWith("/", {
        headers: { Authorization: `Bearer ${mockToken}` },
      });
    });

    it("should return empty versions if response is invalid", async () => {
      vi.mocked(apiAgentBinary.get).mockResolvedValue({ data: {} });

      const result = await getAgentBinaryVersions();
      expect(result).toEqual({ versions: {} });
      expect(logger.info).toHaveBeenCalledWith(
        "No agent versions found or invalid response format"
      );
    });

    it("should return empty versions if 404 error occurs", async () => {
      const error = { response: { status: 404 } };
      vi.mocked(apiAgentBinary.get).mockRejectedValue(error);

      const result = await getAgentBinaryVersions();
      expect(result).toEqual({ versions: {} });
      expect(logger.error).toHaveBeenCalledWith("No agent versions found");
    });

    it("should return empty versions if response data is missing", async () => {
      vi.mocked(apiAgentBinary.get).mockResolvedValue({});

      const result = await getAgentBinaryVersions();
      expect(result).toEqual({ versions: {} });
      expect(logger.info).toHaveBeenCalledWith(
        "No agent versions found or invalid response format"
      );
    });

    it("should log error and return empty versions if 404 error occurs", async () => {
      const error = { response: { status: 404 } };
      vi.mocked(apiAgentBinary.get).mockRejectedValue(error);

      const result = await getAgentBinaryVersions();
      expect(result).toEqual({ versions: {} });
      expect(logger.error).toHaveBeenCalledWith("No agent versions found");
    });

    it("should throw error and log it if other error occurs", async () => {
      const error = new Error("Network Error");
      vi.mocked(apiAgentBinary.get).mockRejectedValue(error);

      await expect(getAgentBinaryVersions()).rejects.toThrow(error);
      expect(logger.error).toHaveBeenCalledWith(
        "An error occurred while fetching agent versions:",
        error
      );
    });
    it("should throw an error if user is not authenticated", async () => {
      const error = { response: { status: 403 } };
      vi.mocked(apiAgentBinary.get).mockRejectedValue(error);

      await expect(getAgentBinaryVersions()).rejects.toThrow(
        "Not authenticated"
      );
      expect(logger.error).toHaveBeenCalledWith("Not authenticated");
    });
    it("should throw an error if there is a network timeout", async () => {
      const error = new Error("Network Timeout");
      vi.mocked(apiAgentBinary.get).mockRejectedValue(error);

      await expect(getAgentBinaryVersions()).rejects.toThrow("Network Timeout");
      expect(logger.error).toHaveBeenCalledWith(
        "An error occurred while fetching agent versions:",
        error
      );
    });
  });

  describe("uploadAgentBinary", () => {
    it("should upload file and return success response", async () => {
      const formData = new FormData();
      const file = new File(["content"], "agent-1.0.0.exe", {
        type: "application/octet-stream",
      });
      formData.append("file", file);

      const mockApiResponse = {
        data: {
          success: true,
          version: "1.0.0",
          status: "Upload successful",
        },
      };
      vi.mocked(getAccessToken).mockResolvedValue(mockToken);
      vi.mocked(apiAgentBinary.post).mockResolvedValue(mockApiResponse);

      const result = await uploadAgentBinary(formData);
      expect(result).toEqual({
        success: true,
        version: "1.0.0",
        message: "Upload successful",
      });
      expect(apiAgentBinary.post).toHaveBeenCalledWith("/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${mockToken}`,
        },
      });
    });

    it("should return error if file is not provided", async () => {
      const formData = new FormData();

      const result = await uploadAgentBinary(formData);
      expect(result).toEqual({
        success: false,
        message: "File is required",
      });
    });

    it("should return error if file type is not allowed", async () => {
      const formData = new FormData();
      const file = new File(["content"], "agent-1.0.0.txt", {
        type: "text/plain",
      });
      formData.append("file", file);

      const result = await uploadAgentBinary(formData);
      expect(result).toEqual({
        success: false,
        message: `The selected file type is not supported. Please upload a file with one of the following extensions: ${ALLOWED_EXTENSIONS.join(
          ", "
        )}`,
      });
    });

    it("should return failure response if upload fails", async () => {
      const formData = new FormData();
      const file = new File(["content"], "agent-1.0.0.exe", {
        type: "application/octet-stream",
      });
      formData.append("file", file);

      const error = new Error("Upload failed");
      vi.mocked(apiAgentBinary.post).mockRejectedValue(error);

      const result = await uploadAgentBinary(formData);
      expect(result).toEqual({
        success: false,
        message: "Upload failed",
      });
    });
    it("should return error if no file is appended to FormData", async () => {
      const formData = new FormData();
      const result = await uploadAgentBinary(formData);
      expect(result).toEqual({
        success: false,
        message: "File is required",
      });
    });

    it("should return error if file size exceeds limit", async () => {
      const formData = new FormData();
      const largeFile = new File(
        new Array(10 * 1024 * 1024).fill("a"),
        "large-agent.exe",
        { type: "application/octet-stream" }
      );
      formData.append("file", largeFile);

      const result = await uploadAgentBinary(formData);
      expect(result).toEqual({
        success: false,
        message: "Upload failed",
      });
    });

    it("should handle upload failure gracefully", async () => {
      const formData = new FormData();
      const file = new File(["content"], "agent.exe", {
        type: "application/octet-stream",
      });
      formData.append("file", file);

      const error = new Error("Upload failed");
      vi.mocked(apiAgentBinary.post).mockRejectedValue(error);

      const result = await uploadAgentBinary(formData);
      expect(result).toEqual({
        success: false,
        message: "Upload failed",
      });
    });
  });
  describe("getLatestAgentBinaryLink", () => {
    it("should return the latest agent binary link if response is valid", async () => {
      const mockResponse = {
        data: {
          file_details: {
            download_link: "/path/to/latest/agent-binary",
          },
        },
      };
      vi.mocked(getAccessToken).mockResolvedValue(mockToken);
      vi.mocked(apiAgentBinary.get).mockResolvedValue(mockResponse);

      const result = await getLatestAgentBinaryLink();
      expect(result).toBe(
        `${process.env.NEXT_PUBLIC_BASE_URL}/path/to/latest/agent-binary`
      );
      expect(apiAgentBinary.get).toHaveBeenCalledWith("/latest", {
        headers: { Authorization: `Bearer ${mockToken}` },
      });
    });

    it("should throw an error if download link is not found in the response", async () => {
      const mockResponse = {
        data: {
          file_details: {},
        },
      };

      vi.mocked(apiAgentBinary.get).mockResolvedValue(mockResponse);

      await expect(getLatestAgentBinaryLink()).rejects.toThrow(
        "Download link not found in the response"
      );
      expect(logger.error).toHaveBeenCalledWith(
        "Download link not found in the response"
      );
    });

    it("should log error and throw it if an error occurs while fetching the link", async () => {
      const error = new Error("Network Error");
      vi.mocked(apiAgentBinary.get).mockRejectedValue(error);

      await expect(getLatestAgentBinaryLink()).rejects.toThrow(error);
      expect(logger.error).toHaveBeenCalledWith(
        "Error fetching latest agent binary link:",
        error
      );
    });
    it("should return error if the file size exceeds maximum allowed limit", async () => {
      const formData = new FormData();
      const largeFile = new File(
        new Array(21 * 1024 * 1024).fill("a"),
        "large-file.exe",
        {
          type: "application/octet-stream",
        }
      );
      formData.append("file", largeFile);

      const result = await uploadAgentBinary(formData);
      expect(result).toEqual({
        success: false,
        message: "Upload failed",
      });
    });
    it("should return error if FormData is invalid", async () => {
      const invalidFormData = {
        invalidKey: "invalidValue",
      } as unknown as FormData;

      const result = await uploadAgentBinary(invalidFormData);
      expect(result).toEqual({
        success: false,
        message: "formData.get is not a function",
      });
    });
    it("should return an error for unsupported file format in `uploadAgentBinary`", async () => {
      const formData = new FormData();
      const file = new File(["content"], "unsupported.agent", {
        type: "application/x-unsupported",
      });
      formData.append("file", file);

      const result = await uploadAgentBinary(formData);
      expect(result).toEqual({
        success: false,
        message: `The selected file type is not supported. Please upload a file with one of the following extensions: ${ALLOWED_EXTENSIONS.join(
          ", "
        )}`,
      });
    });
  });
});
