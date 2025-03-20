import { describe, it, expect, vi } from "vitest";

import { getContainer } from "@/utils/containerUtils";

vi.mock("@/utils/containerUtils", () => ({
  getContainer: vi.fn(),
}));

describe("Container Export", () => {
  it("should call getContainer and export the container", async () => {
    // Mock return value for getContainer
    const mockContainer = { key: "value" };
    (getContainer as ReturnType<typeof vi.fn>).mockReturnValue(mockContainer);

    // Dynamically import the module to ensure the mock is applied first
    const { container } = await import("@/di/container");

    // Assertions
    expect(getContainer).toHaveBeenCalled();
    expect(container).toBe(mockContainer);
  });
});
