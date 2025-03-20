import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";

export async function getAccessToken(): Promise<string> {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    throw new Error("Access token is missing or expired");
  }
  return session.accessToken;
}
