"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useUpdateProfile } from "@/hooks/useUpdateProfile";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import LoadingIndicator from "../common/LoadingIndicator";
import UserAvatar from "../common/UserAvatar";
import MemCryptRedButton from "../common/MemcryptRedButton";
import { useAuthSession } from "@/hooks/useAuthSession";
import OrgIdCopy from "../common/OrgIdCopy";
import { userProfileTexts } from "@/texts/user/users-profile";
import Text from "@/components/text/Text";
import { commonTexts } from "@/texts/common/common";
import { validationTexts } from "@/texts/common/validation";

const profileSchema = z.object({
  firstName: z
    .string()
    .min(2, {
      message: validationTexts.firstNameMin.defaultMessage,
    })
    .max(255, {
      message: validationTexts.firstNameMax.defaultMessage,
    })
    .transform((value) => value.trim())
    .refine((value) => value !== "", {
      message: validationTexts.firstNameEmpty.defaultMessage,
    }),
  lastName: z
    .string()
    .min(2, {
      message: validationTexts.lastNameMin.defaultMessage,
    })
    .max(255, {
      message: validationTexts.lastNameMax.defaultMessage,
    })
    .transform((value) => value.trim())
    .refine((value) => value !== "", {
      message: validationTexts.lastNameEmpty.defaultMessage,
    }),
  displayName: z.string().optional(),
  country: z.string().optional(),
  organization: z.string().optional(),
  email: z.string().email("Invalid email address").optional(),
  orgId: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const Profile = () => {
  const { user } = useAuthSession();
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const {
    data: profileData,
    isLoading,
    isError,
    refetch,
  } = useUserProfile(user?.id || "");
  const updateProfileMutation = useUpdateProfile(user?.id || "");
  const isPlatformAdmin = user.type?.includes("Platform Admin");

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    reset,
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    mode: "onChange",
    defaultValues: {
      firstName: "",
      lastName: "",
      displayName: "",
      country: "",
      organization: "",
      email: "",
    },
  });

  useEffect(() => {
    if (user?.id) {
      refetch();
    }
  }, [user?.id, refetch]);

  useEffect(() => {
    if (profileData) {
      reset({
        firstName: profileData.firstName || "",
        lastName: profileData.lastName || "",
        organization: profileData?.organization?.name || "",
        email: profileData.email || "",
      });
    }
  }, [profileData, reset]);

  const onSubmit = (data: ProfileFormValues) => {
    const { firstName, lastName } = data;
    updateProfileMutation.mutate(
      {
        firstName,
        lastName,
      },
      {
        onSuccess: () => {
          refetch();
          setIsEditing(false);
          setSuccessMessage(
            `Profile updated successfully for ${firstName} ${lastName}`
          );
          setTimeout(() => setSuccessMessage(null), 5000);
        },
        onError: (error) => {
          console.error("Error updating profile", error);
          setErrorMessage(error.message);
        },
      }
    );
  };

  const handleOrgIdCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const editHandler = () => {
    setIsEditing(true);
  };

  if (isLoading) return <LoadingIndicator />;
  if (isError)
    return (
      <div>
        <Text text={userProfileTexts.errorLoading} />
      </div>
    );

  return (
    <Card className="max-w-[726px] bg-gray-100">
      <CardHeader className="flex flex-col md:flex-row items-center">
        <UserAvatar name={profileData?.username} height={10} width={10} />
        <div className="px-2 text-center md:text-left">
          <h1 className="text-lg font-semibold text-gray-900 word-break-breakWord">
            {profileData?.firstName} {profileData?.lastName}
          </h1>
          <p className="text-sm text-gray-600">{profileData?.email}</p>
        </div>
        <div className="ml-auto mt-4 md:mt-0">
          {!isEditing && !isPlatformAdmin && (
            <MemCryptRedButton width="100%" onClick={editHandler}>
              <Text text={commonTexts.edit} />
            </MemCryptRedButton>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <LoadingIndicator />
        ) : (
          !isPlatformAdmin && (
            <form onSubmit={handleSubmit(onSubmit)}>
              {successMessage && (
                <div
                  className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 mb-4 rounded relative word-break-breakWord "
                  role="alert"
                >
                  <span className="block sm:inline">{successMessage}</span>
                </div>
              )}
              {errorMessage && (
                <div
                  className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
                  role="alert"
                >
                  <span className="block sm:inline">{errorMessage}</span>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4 md:col-span-1">
                  <div className="space-y-2">
                    <label
                      htmlFor="organization"
                      className="text-sm font-medium text-gray-700"
                    >
                      <Text text={userProfileTexts.organization} />
                    </label>
                    <Input
                      id="organization"
                      className="bg-white w-full"
                      {...register("organization")}
                      disabled={true}
                    />
                  </div>
                </div>

                <div className="space-y-4 md:col-span-1">
                  <div className="space-y-2">
                    <label
                      htmlFor="email"
                      className="text-sm font-medium text-gray-700"
                    >
                      <Text text={userProfileTexts.email} />
                    </label>
                    <Input
                      id="email"
                      className="bg-white w-full"
                      {...register("email")}
                      disabled={true}
                    />
                  </div>
                </div>
                <div className="space-y-4 md:col-span-1">
                  <div className="space-y-2">
                    <label
                      htmlFor="firstName"
                      className="text-sm font-medium text-gray-700"
                    >
                      <Text text={userProfileTexts.firstName} />
                    </label>
                    <Input
                      id="firstName"
                      className="bg-white w-full"
                      {...register("firstName")}
                      disabled={!isEditing}
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-xs">
                        {errors.firstName.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-4 md:col-span-1">
                  <div className="space-y-2">
                    <label
                      htmlFor="lastName"
                      className="text-sm font-medium text-gray-700"
                    >
                      <Text text={userProfileTexts.lastName} />
                    </label>
                    <Input
                      id="lastName"
                      className="bg-white w-full"
                      {...register("lastName")}
                      disabled={!isEditing}
                    />
                    {errors.lastName && (
                      <p className="text-red-500 text-xs">
                        {errors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="col-span-1 md:col-span-2 space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="flex-grow">
                      <OrgIdCopy
                        orgId={profileData?.organization?.id || ""}
                        onCopy={handleOrgIdCopy}
                      />
                    </div>
                    {copied && (
                      <span className="text-memcryptRed text-sm">
                        <Text text={userProfileTexts.copiedMessage} />
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {isEditing && (
                <CardFooter className="flex justify-start space-x-4 pt-6">
                  <Button
                    type="submit"
                    className="bg-green-500 hover:bg-green-600 text-white "
                    disabled={!isValid || isLoading || !isDirty}
                  >
                    {isLoading ? (
                      <Text text={commonTexts.saving} />
                    ) : (
                      <Text text={commonTexts.save} />
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="bg-white text-gray-700 hover:bg-gray-100"
                    onClick={() => {
                      reset({
                        firstName: profileData?.firstName || "",
                        lastName: profileData?.lastName || "",
                        organization: profileData?.organization?.name || "",
                        email: profileData?.email || "",
                      });
                      setIsEditing(false);
                    }}
                  >
                    <Text text={commonTexts.cancel} />
                  </Button>
                </CardFooter>
              )}
            </form>
          )
        )}
      </CardContent>
    </Card>
  );
};

export default Profile;
