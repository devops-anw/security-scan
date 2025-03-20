import { render, screen, act, waitFor } from "@testing-library/react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import VerifyEmail from "@/components/verify-email/VerifyEmail";
import VerifyEmailPage from "@/app/verify-email/page";

vi.mock("axios");
vi.mock("next/navigation", () => ({
  useSearchParams: vi.fn(),
}));

describe("VerifyEmailPage Component", () => {
  const mockUseSearchParams = useSearchParams as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.resetAllMocks();
    mockUseSearchParams.mockReturnValue({
      get: vi.fn((key) => (key === "token" ? "test-token" : null)),
    });
  });

  it("should render the VerifyEmail component", async () => {
    render(<VerifyEmailPage />);

    await waitFor(() => {
      expect(screen.getByText(/Verifying your email/i)).toBeTruthy();
    });
  });
});

describe("VerifyEmail Component", () => {
  const mockAxiosPost = axios.post as ReturnType<typeof vi.fn>;
  const mockUseSearchParams = useSearchParams as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.resetAllMocks();
    mockUseSearchParams.mockReturnValue({
      get: vi.fn((key) => (key === "token" ? "test-token" : null)),
    });
  });

  it("should display loading state while verifying email", async () => {
    mockAxiosPost.mockResolvedValueOnce({ status: 200 });

    render(<VerifyEmail />);

    await waitFor(() => {
      expect(screen.getByText(/Verifying your email/i)).toBeTruthy();
    });
  });

  it("should display success state on successful verification", async () => {
    mockAxiosPost.mockResolvedValueOnce({ status: 200 });

    await act(async () => {
      render(<VerifyEmail />);
    });

    expect(screen.getByText(/Email Verified Successfully/i)).toBeTruthy();
    expect(
      screen.getByText(/Your email has been successfully verified/i)
    ).toBeTruthy();
  });

  it("should display error state on verification failure", async () => {
    mockAxiosPost.mockRejectedValueOnce(new Error("Verification failed"));

    await act(async () => {
      render(<VerifyEmail />);
    });

    expect(screen.getByText(/Verification Failed/i)).toBeTruthy();
    expect(
      screen.getByText(
        /We're sorry, but the verification link appears to be invalid/i
      )
    ).toBeTruthy();
  });

  it("should display error state if token is missing", async () => {
    mockUseSearchParams.mockReturnValue({
      get: vi.fn(() => null),
    });

    await act(async () => {
      render(<VerifyEmail />);
    });

    expect(screen.getByText(/Verification Failed/i)).toBeTruthy();
    expect(
      screen.getByText(
        /We're sorry, but the verification link appears to be invalid/i
      )
    ).toBeTruthy();
  });

  it("should call the API with the correct token", async () => {
    const token = "test-token";
    mockAxiosPost.mockResolvedValueOnce({ status: 200 });

    await act(async () => {
      render(<VerifyEmail />);
    });

    expect(mockAxiosPost).toHaveBeenCalledWith("/api/auth/verify-email", {
      token,
    });
  });
});
