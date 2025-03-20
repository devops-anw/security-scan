import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { describe, expect, it, vi } from "vitest";
import { getAccessToken } from "@/lib/authToken";

vi.mock("next-auth/next", () => ({
  getServerSession: vi.fn(),
}));

describe("getAccessToken", () => {
  it("should return access token if session contains a valid token", async () => {
    const mockAccessToken = "valid-token";

    (getServerSession as ReturnType<typeof vi.fn>).mockResolvedValue({
      accessToken: mockAccessToken,
    });

    const token = await getAccessToken();

    expect(token).toBe(mockAccessToken);
    expect(getServerSession).toHaveBeenCalledWith(authOptions);
  });

  it("should throw an error if the session does not contain an access token", async () => {
    (getServerSession as ReturnType<typeof vi.fn>).mockResolvedValue({
      accessToken: null,
    });

    await expect(getAccessToken()).rejects.toThrowError(
      "Access token is missing or expired"
    );

    expect(getServerSession).toHaveBeenCalledWith(authOptions);
  });

  it("should throw an error if the session is undefined", async () => {
    (getServerSession as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

    await expect(getAccessToken()).rejects.toThrowError(
      "Access token is missing or expired"
    );

    expect(getServerSession).toHaveBeenCalledWith(authOptions);
  });
});
