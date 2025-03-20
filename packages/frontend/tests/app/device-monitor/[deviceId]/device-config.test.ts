import { describe, it, expect, vi, beforeEach } from "vitest";
import { getDeviceEndPointConfigDetails } from "@/lib/deviceEndPoint";
import logger from "@/utils/logger";
import { apiConsole } from "@/utils/apiUtils";
import { getAccessToken } from "@/lib/authToken";

// Mock the entire modules
vi.mock("@/utils/apiUtils");
vi.mock("@/utils/logger");
vi.mock("@/lib/authToken");
const mockToken = "mock-token";
describe("getDeviceEndPointConfigDetails", () => {
  const deviceEndPointId = "testDeviceEndPointId";

  // Reset mocks before each test
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should return device config details when API call is successful", async () => {
    const mockResponse = { data: { config: "testConfig" } };

    vi.mocked(getAccessToken).mockResolvedValue(mockToken);
    vi.mocked(apiConsole.get).mockResolvedValue(mockResponse);

    const result = await getDeviceEndPointConfigDetails(deviceEndPointId);

    expect(result).toEqual(mockResponse.data);
    expect(apiConsole.get).toHaveBeenCalledWith(
      `/endpoint-config/${deviceEndPointId}`,
      {
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${mockToken}`,
        },
      }
    );
  });

  it("should log error and throw an error when API call fails", async () => {
    const mockError = new Error("API call failed");

    vi.mocked(apiConsole.get).mockRejectedValue(mockError);

    await expect(
      getDeviceEndPointConfigDetails(deviceEndPointId)
    ).rejects.toThrow("Failed to fetch device config details");

    expect(logger.error).toHaveBeenCalledWith("error", mockError);
  });
});
