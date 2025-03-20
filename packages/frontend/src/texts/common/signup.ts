import { defineMessages } from "react-intl";

export const signupTexts = defineMessages({
  title: {
    id: "signup.title",
    defaultMessage: "Sign Up",
  },
  orgName: {
    id: "signup.orgName",
    defaultMessage: "Organization",
  },
  firstName: {
    id: "signup.firstName",
    defaultMessage: "First Name",
  },
  lastName: {
    id: "signup.lastName",
    defaultMessage: "Last Name",
  },
  email: {
    id: "signup.email",
    defaultMessage: "Email",
  },
  password: {
    id: "signup.password",
    defaultMessage: "Password",
  },
  organizationPlaceholder: {
    id: "signup.organizationPlaceholder",
    defaultMessage: "Your organization",
  },
  firstNamePlaceholder: {
    id: "signup.firstNamePlaceholder",
    defaultMessage: "Your first name",
  },
  lastNamePlaceholder: {
    id: "signup.lastNamePlaceholder",
    defaultMessage: "Your last name",
  },
  emailPlaceholder: {
    id: "signup.emailPlaceholder",
    defaultMessage: "Your email",
  },
  passwordPlaceholder: {
    id: "signup.passwordPlaceholder",
    defaultMessage: "Your Password",
  },
  confirmPasswordPlaceholder: {
    id: "signup.confirmPasswordPlaceholder",
    defaultMessage: "Confirm your password",
  },
  confirmPassword: {
    id: "signup.confirmPassword",
    defaultMessage: "Confirm Password",
  },

  alreadyHaveAccount: {
    id: "signup.alreadyHaveAccount",
    defaultMessage: "Already have an Account?",
  },
  signIn: {
    id: "signup.signIn",
    defaultMessage: "Sign In",
  },
  successMessage: {
    id: "signup.successMessage",
    defaultMessage:
      "We’ve received your sign-up request and it’s currently under review. We’ll make sure to keep you updated via email. Thank you for your patience.",
  },
  createOrganizationError: {
    id: "signup.createOrganizationError",
    defaultMessage:
      "Failed to create organization or user. Please check your information and try again",
  },
  unexpectedError: {
    id: "signup.unexpectedError",
    defaultMessage:
      "An unexpected error occurred. Please try again or contact support.",
  },
});
