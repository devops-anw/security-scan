import { defineMessages } from "react-intl";

export const validationTexts = defineMessages({
  orgNameMin: {
    id: "validation.orgName.min",
    defaultMessage: "Organization name must be at least 3 characters.",
  },
  orgNameMax: {
    id: "validation.orgName.max",
    defaultMessage: "Organization name must be no more than 63 characters.",
  },
  orgNameTrim: {
    id: "validation.orgName.trim",
    defaultMessage:
      "Organization name must be at least 3 non-space characters.",
  },
  firstNameMin: {
    id: "validation.firstName.min",
    defaultMessage: "First name must be at least 2 characters.",
  },
  firstNameMax: {
    id: "validation.firstName.max",
    defaultMessage: "First name must be no more than 255 characters.",
  },
  firstNameTrim: {
    id: "validation.firstName.trim",
    defaultMessage: "First name must be at least 2 non-space characters.",
  },
  firstNameEmpty: {
    id: "validation.lastName.trim",
    defaultMessage: "First name cannot be empty",
  },
  lastNameMin: {
    id: "validation.lastName.min",
    defaultMessage: "Last name must be at least 2 characters.",
  },
  lastNameMax: {
    id: "validation.lastName.max",
    defaultMessage: "Last name must be no more than 255 characters.",
  },
  lastNameTrim: {
    id: "validation.lastName.trim",
    defaultMessage: "Last name must be at least 2 non-space characters.",
  },
  lastNameEmpty: {
    id: "validation.lastName.trim",
    defaultMessage: "Last name cannot be empty",
  },
  emailMax: {
    id: "validation.email.max",
    defaultMessage: "Email must be no more than 255 characters.",
  },
  emailInvalid: {
    id: "validation.email.invalid",
    defaultMessage: "Please enter a valid email address.",
  },
  passwordMin: {
    id: "validation.password.min",
    defaultMessage: "Password must be at least 8 characters.",
  },
  passwordLetter: {
    id: "validation.password.letter",
    defaultMessage: "Password must contain at least one letter.",
  },
  passwordNumber: {
    id: "validation.password.number",
    defaultMessage: "Password must contain at least one number.",
  },
  passwordSpecial: {
    id: "validation.password.special",
    defaultMessage: "Password must contain at least one special character.",
  },
  passwordsMismatch: {
    id: "validation.passwords.mismatch",
    defaultMessage: "Passwords don't match.",
  },
  orgNameTaken: {
    id: "validation.orgNameTaken",
    defaultMessage:
      "This organization name is already taken. Please choose a different name.",
  },
  emailAlreadyExits: {
    id: "validation.emailAlreadyExits",
    defaultMessage:
      "An account with this email already exists. Please use a different email or sign in.",
  },
});
