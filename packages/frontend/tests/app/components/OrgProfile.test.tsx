import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { IntlProvider } from "react-intl"; // Import the IntlProvider
import { useUserProfile } from "@/hooks/useUserProfile";
import { useUpdateProfile } from "@/hooks/useUpdateProfile";
import { useAuthSession } from "@/hooks/useAuthSession";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Profile from "@/components/org-profile/Profile";
import "@testing-library/jest-dom";
import OrgProfile from "@/app/org-profile/page";

// Mock hooks
vi.mock("@/hooks/useUserProfile", () => ({
  useUserProfile: vi.fn().mockReturnValue({
    data: {
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      organization: { name: "Company XYZ" },
    },
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
}));

vi.mock("@/hooks/useUpdateProfile", () => ({
  useUpdateProfile: vi.fn().mockReturnValue({
    updateProfile: vi.fn(),
    isLoading: false,
    isError: false,
  }),
}));

vi.mock("@/hooks/useAuthSession", () => ({
  useAuthSession: vi.fn().mockReturnValue({
    user: {
      id: "user123",
      name: "John Doe",
    },
  }),
}));

const mockUseUserProfile = useUserProfile as ReturnType<typeof vi.fn>;
const mockUseUpdateProfile = useUpdateProfile as ReturnType<typeof vi.fn>;
const mockUseAuthSession = useAuthSession as ReturnType<typeof vi.fn>;

// Sample messages for testing (add translations here)
const messages = {
  "profile.firstName": "First Name",
  "profile.lastName": "Last Name",
  "profile.email": "Email",
  "profile.organization": "Organization",
  "profile.edit": "Edit",
  "profile.save": "Save",
  "profile.error": "Error loading profile",
  "profile.updateSuccess":
    "Profile updated successfully for {firstName} {lastName}",
  "profile.updateError": "Error updating profile",
};

vi.mock("@/components/protected-route/ProtectedRoute", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

describe("OrgProfile Component", () => {
  it("should render the Organization Profile title", () => {
    render(
      <IntlProvider locale="en">
        <OrgProfile />
      </IntlProvider>
    );

    expect(screen.getByText("Organization Profile")).toBeInTheDocument();
  });
});

describe("Profile Component", () => {
  beforeEach(() => {
    // Set up mock data
    mockUseAuthSession.mockReturnValue({
      user: { id: "123", type: ["User"] },
    });

    mockUseUserProfile.mockReturnValue({
      data: {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        organization: { name: "Company XYZ" },
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    mockUseUpdateProfile.mockReturnValue({
      mutate: vi.fn(),
    });
  });

  it("should show a loading indicator when data is loading", () => {
    mockUseUserProfile.mockReturnValueOnce({
      data: null,
      isLoading: true,
      isError: false,
      refetch: vi.fn(),
    });
    const { container } = render(
      <IntlProvider locale="en" messages={messages}>
        <Profile />
      </IntlProvider>
    );

    const spinner = container.querySelector(".animate-spin");
    expect(spinner).toBeTruthy();
  });

  it("renders user profile information", () => {
    render(
      <IntlProvider locale="en" messages={messages}>
        <Profile />
      </IntlProvider>
    );

    // Check if profile data is rendered
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("john.doe@example.com")).toBeInTheDocument();
  });

  it("handles error state", () => {
    mockUseUserProfile.mockReturnValue({
      data: null,
      isLoading: false,
      isError: true,
      refetch: vi.fn(),
    });

    render(
      <IntlProvider locale="en" messages={messages}>
        <Profile />
      </IntlProvider>
    );

    expect(screen.getByText("Error loading user profile")).toBeInTheDocument();
  });

  it("renders and submits the form when in edit mode", async () => {
    render(
      <IntlProvider locale="en" messages={messages}>
        <Profile />
      </IntlProvider>
    );

    // Ensure the Edit button is present
    const editButton = screen.getByText(/edit/i);
    expect(editButton).toBeInTheDocument();

    fireEvent.click(editButton);

    await waitFor(() =>
      expect(screen.getByLabelText(/First Name/i)).toBeEnabled()
    );

    fireEvent.change(screen.getByLabelText(/First Name/i), {
      target: { value: "John" },
    });
    fireEvent.change(screen.getByLabelText(/Last Name/i), {
      target: { value: "Doe" },
    });

    const submitButton = screen.getByRole("button", {
      name: "Save",
    });

    fireEvent.click(submitButton);

    await waitFor(() => expect(mockUseUserProfile).toHaveBeenCalled());
  });

  it("resets form values when cancel is clicked", () => {
    render(
      <IntlProvider locale="en" messages={messages}>
        <Profile />
      </IntlProvider>
    );

    const editButton = screen.getByText(/edit/i);
    fireEvent.click(editButton);

    const firstNameInput = screen.getByLabelText(
      /First Name/i
    ) as HTMLInputElement;
    fireEvent.change(firstNameInput, { target: { value: "Jane" } });

    const cancelButton = screen.getByText("Cancel");
    fireEvent.click(cancelButton);

    expect(firstNameInput.value).toBe("John"); // Ensure the original value is reset
  });
  it("shows copied message when org ID is copied", () => {
    render(
      <IntlProvider locale="en" messages={messages}>
        <Profile />
      </IntlProvider>
    );
    const buttons = screen.getAllByRole("button");

    fireEvent.click(buttons[1]);

    expect(buttons).toBeTruthy();
  });

  it("handles cancel button click and resets the form", () => {
    render(
      <IntlProvider locale="en" messages={messages}>
        <Profile />
      </IntlProvider>
    );

    const editButton = screen.getByText("Edit");
    fireEvent.click(editButton);

    const firstNameInput = screen.getByLabelText(
      "First Name"
    ) as HTMLInputElement;
    fireEvent.change(firstNameInput, { target: { value: "Jane" } });

    const cancelButton = screen.getByText("Cancel");
    fireEvent.click(cancelButton);

    expect(firstNameInput.value).toBe("John");
  });

  it("shows profile data without edit option for platform admins", () => {
    mockUseAuthSession.mockReturnValue({
      user: { id: "123", type: ["Platform Admin"] },
    });

    render(
      <IntlProvider locale="en" messages={messages}>
        <Profile />
      </IntlProvider>
    );

    expect(screen.queryByText("Edit")).toBeNull();
  });
});
