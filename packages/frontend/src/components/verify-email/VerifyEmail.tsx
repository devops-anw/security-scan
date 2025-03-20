"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import LoadingIndicator from "../common/LoadingIndicator";
import { useSearchParams } from "next/navigation";
import Image from "next/image";

const VerifyEmail = () => {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("loading");
  const token = searchParams.get("token");

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await axios.post("/api/auth/verify-email", {
          token: token,
        });
        if (response.status === 200) {
          setStatus("success");
        } else {
          setStatus("error");
        }
      } catch (error) {
        setStatus("error");
      }
    };

    if (token) {
      verifyEmail();
    } else {
      setStatus("error");
    }
  }, [token]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Image
          src="/memcrypt/memcrypt-logo.svg"
          alt="MemCrypt Logo"
          width={200}
          height={50}
        />
      </div>
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl">
        {status === "loading" && (
          <div className="text-center">
            <LoadingIndicator />
            <p className="mt-4 text-gray-600 text-lg">
              Verifying your email...
            </p>
          </div>
        )}
        {status === "success" && (
          <div className="text-center">
            <svg
              className="mx-auto h-16 w-16 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <h1 className="mt-6 text-3xl font-bold text-gray-800">
              Email Verified Successfully!
            </h1>
            <p className="mt-4 text-gray-600 text-lg leading-relaxed">
              Your email has been successfully verified. Once your account is
              approved, you will be able to log in. You will receive an email
              notification once the approval process is complete. Thank you for
              your patience.
            </p>
          </div>
        )}
        {status === "error" && (
          <div className="text-center">
            <svg
              className="mx-auto h-16 w-16 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            <h1 className="mt-6 text-3xl font-bold text-gray-800">
              Verification Failed
            </h1>
            <p className="mt-4 text-gray-600 text-lg leading-relaxed">
              {`We're sorry, but the verification link appears to be invalid or has expired. 
              Please try again or contact our support team if you continue to experience issues.`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
