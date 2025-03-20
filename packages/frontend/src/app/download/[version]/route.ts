import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { apiAgentBinary } from "@/utils/apiUtils";

export async function GET(
  request: NextRequest,
  { params }: { params: { version: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { version } = params;

  try {
    const response = await apiAgentBinary.get(`/download/${version}`, {
      responseType: "arraybuffer",
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    });

    const headers = new Headers();
    headers.set("Content-Type", response.headers["content-type"]);
    headers.set("Content-Disposition", response.headers["content-disposition"]);

    return new NextResponse(response.data, {
      status: 200,
      headers: headers,
    });
  } catch (error) {
    console.error("Error proxying download:", error);
    return NextResponse.json(
      { error: "Failed to download file" },
      { status: 500 }
    );
  }
}
