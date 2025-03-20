"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { BASE_URL } from "@/utils/apiUtils";
import { useAuth } from "@/hooks/useAuth";
import MemCryptRedButton from "../common/MemcryptRedButton";
import LogoImage from "../common/LogoImage";
import BackgroundContainer from "../common/BackgroundContainer";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import {
  ERROR_MESSAGE_FAILED_CREATE_ORG,
  ERROR_MESSAGE_FAILED_CREATE_ORG_OR_USER,
  ERROR_MESSAGE_FAILED_CREATE_USER,
} from "@/constants/common";
import { signupTexts } from "@/texts/common/signup";
import { validationTexts } from "@/texts/common/validation";
import Text from "@/components/text/Text";

const formSchema = z
  .object({
    orgName: z
      .string()
      .min(3, {
        message: validationTexts.orgNameMin.defaultMessage,
      })
      .max(63, {
        message: validationTexts.orgNameMax.defaultMessage,
      })
      .refine((value) => value.trim().length >= 3, {
        message: validationTexts.orgNameTrim.defaultMessage,
      }),
    firstName: z
      .string()
      .min(2, {
        message: validationTexts.firstNameMin.defaultMessage,
      })
      .max(255, {
        message: validationTexts.firstNameMax.defaultMessage,
      })
      .refine((value) => value.trim().length >= 2, {
        message: validationTexts.firstNameTrim.defaultMessage,
      }),
    lastName: z
      .string()
      .min(2, {
        message: validationTexts.lastNameMin.defaultMessage,
      })
      .max(255, {
        message: validationTexts.lastNameMax.defaultMessage,
      })
      .refine((value) => value.trim().length >= 2, {
        message: validationTexts.lastNameTrim.defaultMessage,
      }),
    email: z
      .string()
      .max(255, {
        message: validationTexts.emailMax.defaultMessage,
      })
      .email({
        message: validationTexts.emailInvalid.defaultMessage,
      }),
    password: z
      .string()
      .min(8, {
        message: validationTexts.passwordMin.defaultMessage,
      })
      .refine((value) => /[a-zA-Z]/.test(value), {
        message: validationTexts.passwordLetter.defaultMessage,
      })
      .refine((value) => /\d/.test(value), {
        message: validationTexts.passwordNumber.defaultMessage,
      })
      .refine((value) => /[!@#$%^&*(),.?":{}|<>]/.test(value), {
        message: validationTexts.passwordSpecial.defaultMessage,
      }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: validationTexts.passwordsMismatch.defaultMessage,
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof formSchema>;

const SignUpForm = () => {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [generalErrorMessage, setGeneralErrorMessage] = useState("");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      orgName: "",
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (newUser: FormValues) => {
      return axios.post(`${BASE_URL}/auth/signup`, {
        orgName: newUser.orgName,
        adminUser: {
          username: newUser.email,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          password: newUser.password,
        },
      });
    },
    onSuccess: () => {
      form.reset();
    },
    onError: (error: any) => {
      if (error.response && error.response.data && error.response.data.error) {
        const serverErrorMessage = error.response.data.error;

        if (error.response.data.code === "USER_EXISTS") {
          const details = error.response.data.details;

          if (details && Array.isArray(details)) {
            details.forEach(({ field }) => {
              if (field === "email") {
                form.setError("email", {
                  type: "manual",
                  message: validationTexts.emailAlreadyExits.defaultMessage,
                });
              } else if (field === "orgName") {
                form.setError("orgName", {
                  type: "manual",
                  message: validationTexts.orgNameTaken.defaultMessage,
                });
              }
            });
          }
        } else {
          switch (serverErrorMessage) {
            case ERROR_MESSAGE_FAILED_CREATE_USER:
              form.setError("email", {
                type: "manual",
                message: validationTexts.emailAlreadyExits.defaultMessage,
              });
              break;
            case ERROR_MESSAGE_FAILED_CREATE_ORG:
              setGeneralErrorMessage(
                signupTexts.createOrganizationError.defaultMessage
              );
              break;
            default:
              setGeneralErrorMessage(
                signupTexts.createOrganizationError.defaultMessage
              );
          }
        }
      } else {
        setGeneralErrorMessage(
          signupTexts.createOrganizationError.defaultMessage
        );
      }
    },
  });

  const onSubmit = (data: FormValues) => {
    mutation.mutate(data);
  };

  return (
    <BackgroundContainer>
      <div className="w-full max-w-md p-8 space-y-3 rounded-xl bg-white shadow-lg">
        <div className="flex flex-col items-center justify-center">
          <LogoImage />
          <h1 className="text-2xl text-center mt-4">Sign Up</h1>
        </div>

        {generalErrorMessage && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <span className="block sm:inline">{generalErrorMessage}</span>
          </div>
        )}
        {mutation.isSuccess && (
          <div
            className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <span className="block sm:inline">
              <Text text={signupTexts.successMessage} />
            </span>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="orgName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Text text={signupTexts.orgName} />
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={
                        signupTexts.organizationPlaceholder.defaultMessage
                      }
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Text text={signupTexts.firstName} />{" "}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={
                        signupTexts.firstNamePlaceholder.defaultMessage
                      }
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {" "}
                    <Text text={signupTexts.lastName} />
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={
                        signupTexts.lastNamePlaceholder.defaultMessage
                      }
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {" "}
                    <Text text={signupTexts.email} />
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder={signupTexts.emailPlaceholder.defaultMessage}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {" "}
                    <Text text={signupTexts.password} />
                  </FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder={
                          signupTexts.passwordPlaceholder.defaultMessage
                        }
                        onPaste={(e) => e.preventDefault()} // Prevent paste action
                        {...field}
                      />
                    </FormControl>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center  text-red-600 hover:text-red-700"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {" "}
                    <Text text={signupTexts.confirmPassword} />
                  </FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder={
                          signupTexts.confirmPasswordPlaceholder.defaultMessage
                        }
                        onPaste={(e) => e.preventDefault()} // Prevent paste action
                        {...field}
                      />
                    </FormControl>
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-red-600 hover:text-red-700"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <MemCryptRedButton type="submit">Sign Up</MemCryptRedButton>
          </form>
        </Form>
        <p className="mt-6 text-center text-gray-500 text-sm">
          {`Already have an Account?`} {""}
          <a
            onClick={login}
            className="text-red-600 hover:text-red-500 cursor-pointer"
          >
            <Text text={signupTexts.signIn} />
          </a>
        </p>
      </div>
    </BackgroundContainer>
  );
};

export default SignUpForm;
