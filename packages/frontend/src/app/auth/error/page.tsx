"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

export default function AuthError() {
  const { login } = useAuth();
  return (
    <div className="min-h-screen bg-memcryptLightBlue flex flex-col justify-center items-center px-4">
      <Card className="w-full max-w-lg sm:max-w-xl lg:max-w-2xl mx-auto bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
        <CardContent className="p-6 sm:p-8 md:p-10">
          <div className="flex flex-col items-center text-center">
            <svg
              className="w-16 h-16 text-gray-400 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="#C02427"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M12 15v2m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 1112 0v1H3v-1z"
              />
            </svg>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Authentication Error
            </h3>
            <p className="text-gray-600 mb-4">
              There was a problem with your authentication session.
            </p>
            <p className="text-gray-600 mb-6">
              This could be due to an expired session or an issue with your
              login credentials. Please try logging in again. If the problem
              persists, contact support.
            </p>
            <div className="space-y-4 w-full">
              <a
                onClick={login}
                className="block w-full py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-memcryptRed hover:bg-memcryptDarkRed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-memcryptRed transition-colors duration-200"
              >
                Go to Login
              </a>
              <Link
                href="/"
                className="block w-full py-2 px-4 border border-memcryptRed text-sm font-medium rounded-md text-memcryptRed hover:bg-memcryptLightRed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-memcryptRed transition-colors duration-200"
              >
                Return to Home Page
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
