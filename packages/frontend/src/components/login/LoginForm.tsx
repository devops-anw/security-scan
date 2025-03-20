"use client";
import { useAuth } from "@/hooks/useAuth";
import Image from "next/image";
import MemCryptRedButton from "../common/MemcryptRedButton";
import FeatureList from "../common/FeatureList";
import Text from "@/components/text/Text";
import { loginTexts } from "@/texts/common/login";

const Login = () => {
  const { login } = useAuth();

  const features = [
    {
      name: "Track Threats",
      icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
    },
    {
      name: "Detailed Reports",
      icon: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
    },
    { name: "Optimize Resources", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
    {
      name: "Prevent Damage",
      icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
    },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="hidden lg:block lg:w-1/2 bg-memcrypt-header bg-cover bg-center"></div>
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-12 bg-white">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <Image
              src="/memcrypt/memcrypt-logo.svg"
              alt="MemCrypt Logo"
              height={60}
              width={240}
              className="mx-auto mb-4"
            />
            <p className="text-lg font-medium text-red-600">
              <Text text={loginTexts.slogan}> </Text>
            </p>
          </div>
          <FeatureList features={features} />
          <MemCryptRedButton onClick={login}>
            <Text text={loginTexts.signInButton}> </Text>
          </MemCryptRedButton>
          <p className="text-center text-gray-600">
            <Text text={loginTexts.newUser}> </Text>{" "}
            <a
              href="/signup"
              className="text-red-600 hover:text-red-700 font-medium"
            >
              <Text text={loginTexts.createAccount}> </Text>
            </a>
          </p>
          <div className="mt-8 text-center">
            <a
              href="https://memcrypt.io/"
              className="text-red-600 hover:text-red-700 font-medium"
            >
              <Text text={loginTexts.learnMore}> </Text>
            </a>
            <p className="text-center text-gray-600 mb-4">
              <Text text={loginTexts.trusted}> </Text>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
