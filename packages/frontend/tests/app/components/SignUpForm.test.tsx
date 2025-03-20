import { render, fireEvent, waitFor, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import { IntlProvider } from "react-intl";
import SignUpForm from "@/components/signup/SignUpForm";
import { useMutation } from "@tanstack/react-query";
import SingUp from "@/app/signup/page";

// Mock hooks
vi.mock("@tanstack/react-query", () => ({
  useMutation: vi.fn().mockReturnValue({
    mutate: vi.fn(),
    isSuccess: false,
  }),
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: vi.fn().mockReturnValue({
    login: vi.fn(),
  }),
}));

const messages = {
  en: {
    "organization name": "Organization Name",
    "first name": "First Name",
    "last name": "Last Name",
    "email address": "Email Address",
    password: "Password",
    "confirm password": "Confirm Password",
    "sign up": "Sign Up",
    "organization name is required": "Organization name is required",
    "first name is required": "First name is required",
    "last name is required": "Last name is required",
    "email is required": "Email is required",
    "password is required": "Password is required",
    "passwords must match": "Passwords must match",
    "signup successful": "Signup successful",
  },
};

describe("SignUp page", () => {
  it("renders the LoginForm component", async () => {
    render(
      <IntlProvider locale="en" messages={{}}>
        <SingUp />
      </IntlProvider>
    );

    const SignUpForms = await screen.findAllByText("Sign Up");

    expect(SignUpForms[0]).toBeInTheDocument();
  });
});

describe("SignUpForm", () => {
  it("renders the form fields correctly", () => {
    render(
      <IntlProvider locale="en" messages={messages.en}>
        <SignUpForm />
      </IntlProvider>
    );
    expect(
      screen.getByPlaceholderText(/Your organization/i)
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Your first name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Your last name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Your email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Your Password")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Confirm your password")
    ).toBeInTheDocument();
  });

  it("displays validation errors when form is submitted with empty fields", async () => {
    render(
      <IntlProvider locale="en" messages={messages.en}>
        <SignUpForm />
      </IntlProvider>
    );
    const signUpButton = screen.getByRole("button", { name: /sign up/i });
    fireEvent.click(signUpButton);

    await waitFor(() => {
      expect(
        screen.getByText(/Organization name must be at least 3 characters/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/First name must be at least 2 characters/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Last name must be at least 2 characters/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Please enter a valid email address/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Password must be at least 8 characters/i)
      ).toBeInTheDocument();
    });
  });

  it("displays an error when the email format is invalid", async () => {
    render(
      <IntlProvider locale="en" messages={messages.en}>
        <SignUpForm />
      </IntlProvider>
    );
    const signUpButton = screen.getByRole("button", { name: /sign up/i });
    fireEvent.click(signUpButton);

    await waitFor(() => {
      expect(
        screen.getByText(/Please enter a valid email address./i)
      ).toBeInTheDocument();
    });
  });

  it("shows success message when the form is successfully submitted", async () => {
    const mockMutate = vi.fn().mockImplementation((data, options) => {
      if (options && options.onSuccess) {
        options.onSuccess();
      }
    });

    (useMutation as ReturnType<typeof vi.fn>).mockReturnValue({
      mutate: mockMutate,
      isSuccess: true,
    });

    render(
      <IntlProvider locale="en" messages={messages.en}>
        <SignUpForm />
      </IntlProvider>
    );

    fireEvent.change(screen.getByPlaceholderText(/Your organization/i), {
      target: { value: "TestOrg" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Your first name/i), {
      target: { value: "John" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Your last name/i), {
      target: { value: "Doe" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Your email/i), {
      target: { value: "john.doe@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Your Password"), {
      target: { value: "Pass123!" },
    });
    fireEvent.change(screen.getByPlaceholderText("Confirm your password"), {
      target: { value: "Pass123!" },
    });

    const signUpButton = screen.getByRole("button", { name: /sign up/i });
    fireEvent.click(signUpButton);

    await waitFor(() => {
      expect(
        screen.getByText(
          /We’ve received your sign-up request and it’s currently under review. We’ll make sure to keep you updated via email. Thank you for your patience./i
        )
      ).toBeInTheDocument();
    });

    expect(mockMutate).toHaveBeenCalledTimes(1);
  });

  it("shows error messages for mismatched passwords", async () => {
    render(
      <IntlProvider locale="en" messages={messages.en}>
        <SignUpForm />
      </IntlProvider>
    );
    fireEvent.change(screen.getByPlaceholderText("Your Password"), {
      target: { value: "Pass123!" },
    });
    fireEvent.change(screen.getByPlaceholderText("Confirm your password"), {
      target: { value: "Pass124!" },
    });
    const signUpButton = screen.getByRole("button", { name: /sign up/i });
    fireEvent.click(signUpButton);

    await waitFor(() => {
      expect(screen.getByText(/Passwords don't match/i)).toBeInTheDocument();
    });
  });

  it("toggles password visibility", () => {
    render(
      <IntlProvider locale="en" messages={{}}>
        <SignUpForm />
      </IntlProvider>
    );
    const passwordInput = screen.getByPlaceholderText("Your Password");
    const toggleButton = screen.getAllByRole("button")[0];
    expect(passwordInput).toHaveAttribute("type", "password");
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute("type", "text");
  });
});
