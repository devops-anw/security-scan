import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuth } from "@/hooks/useAuth";
import "@testing-library/jest-dom";
import { loginTexts } from "@/texts/common/login";
import Login from "@/components/login/LoginForm";
import LoginPage from "@/app/login/page";
import { IntlProvider } from "react-intl";

// Mock the useAuth hook
vi.mock("@/hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

describe("Login page", () => {
  beforeEach(() => {
    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      login: vi.fn(),
    });
  });

  it("renders the LoginForm component", async () => {
    render(
      <IntlProvider locale="en" messages={{}}>
        <LoginPage />
      </IntlProvider>
    );

    const loginForm = await screen.findByText("Sign In to Your Account");
    expect(loginForm).toBeInTheDocument();
  });
});

describe("Login Component", () => {
  beforeEach(() => {
    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      login: vi.fn(),
    });
  });

  const renderWithIntl = (component: JSX.Element) => {
    return render(
      <IntlProvider locale="en" messages={{}}>
        {component}
      </IntlProvider>
    );
  };

  it("renders the Login page slogan", () => {
    renderWithIntl(<Login />);

    expect(
      screen.getByText(loginTexts.slogan.defaultMessage)
    ).toBeInTheDocument();
  });

  it("renders features correctly", () => {
    renderWithIntl(<Login />);

    expect(screen.getByText("Track Threats")).toBeInTheDocument();
    expect(screen.getByText("Detailed Reports")).toBeInTheDocument();
    expect(screen.getByText("Optimize Resources")).toBeInTheDocument();
    expect(screen.getByText("Prevent Damage")).toBeInTheDocument();
  });

  it("calls the login function when the sign-in button is clicked", async () => {
    const loginMock = vi.fn();

    // Mock the useAuth hook to use the loginMock
    (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
      login: loginMock,
    });

    renderWithIntl(<Login />);

    const signInButton = screen.getByRole("button", {
      name: loginTexts.signInButton.defaultMessage,
    });

    fireEvent.click(signInButton);

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledTimes(1);
    });
  });

  it("displays the 'Create Account' link", () => {
    renderWithIntl(<Login />);

    const createAccountLink = screen.getByText(
      loginTexts.createAccount.defaultMessage
    );
    expect(createAccountLink).toBeInTheDocument();
    expect(createAccountLink).toHaveAttribute("href", "/signup");
  });

  it("displays the 'Learn More' link", () => {
    renderWithIntl(<Login />);

    const learnMoreLink = screen.getByText(loginTexts.learnMore.defaultMessage);
    expect(learnMoreLink).toBeInTheDocument();
    expect(learnMoreLink).toHaveAttribute("href", "https://memcrypt.io/");
  });

  it("displays the 'Trusted' text", () => {
    renderWithIntl(<Login />);

    expect(
      screen.getByText(loginTexts.trusted.defaultMessage)
    ).toBeInTheDocument();
  });

  it("displays the 'Sign In' button with correct text", () => {
    renderWithIntl(<Login />);

    const signInButton = screen.getByRole("button", {
      name: loginTexts.signInButton.defaultMessage,
    });

    expect(signInButton).toBeInTheDocument();
    expect(signInButton).toHaveClass("bg-memcryptRed");
  });

  it("renders the logo correctly", () => {
    renderWithIntl(<Login />);

    const logo = screen.getByAltText("MemCrypt Logo");
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute("src", "/memcrypt/memcrypt-logo.svg");
  });
});
