"use server";

import {
  AgentVersionDetails,
  AgentBinaryVersionListResponse,
  AgentBinaryUploadResponse,
} from "@/types/agent-binary";
import logger from "@/utils/logger";
import { ALLOWED_EXTENSIONS } from "@/constants/common";
import { apiAgentBinary } from "@/utils/apiUtils";
import { getAccessToken } from "./authToken";

export async function getAgentBinaryVersions(): Promise<AgentBinaryVersionListResponse> {
  try {
    const token = await getAccessToken();
    const response = await apiAgentBinary.get<AgentBinaryVersionListResponse>(
      "/",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data && response.data.versions) {
      return response.data;
    } else {
      logger.info("No agent versions found or invalid response format");
      return { versions: {} };
    }
  } catch (error) {
    if ((error as any).response && (error as any).response.status === 403) {
      logger.error("Not authenticated");
      throw new Error("Not authenticated");
    } else if (
      (error as any).response &&
      (error as any).response.status === 404
    ) {
      logger.error("No agent versions found");
      return { versions: {} };
    } else {
      logger.error("An error occurred while fetching agent versions:", error);
      throw error;
    }
  }
}
export async function uploadAgentBinary(
  formData: FormData
): Promise<AgentBinaryUploadResponse> {
  try {
    const token = await getAccessToken();
    const file = formData.get("file") as File;
    if (!file) {
      throw new Error("File is required");
    }

    // Validate file type
    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
      throw new Error(
        `The selected file type is not supported. Please upload a file with one of the following extensions: ${ALLOWED_EXTENSIONS.join(
          ", "
        )}`
      );
    }

    const response = await apiAgentBinary.post<AgentBinaryUploadResponse>(
      "/",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: "Bearer " + token,
        },
      }
    );

    return {
      success: true,
      version: response.data.version,
      message: response.data.status,
    };
  } catch (error) {
    console.error("Error uploading agent binary file:", error);
    if (error instanceof Error) {
      return {
        success: false,
        message: error.message,
      };
    }
    return {
      success: false,
      message: "Failed to upload agent binary file",
    };
  }
}

export async function getAgentBinaryVersionDetails(
  version: string
): Promise<AgentVersionDetails> {
  const response = await apiAgentBinary.get<AgentVersionDetails>(
    `/download/${version}`
  );
  return response.data;
}

export async function getLatestAgentBinaryLink(): Promise<string> {
  try {
    const token = await getAccessToken();
    const response = await apiAgentBinary.get("/latest", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.data && response.data.file_details.download_link) {
      const version = response.data.file_details.download_link;
      return `${process.env.NEXT_PUBLIC_BASE_URL}${version}`;
    } else {
      logger.error("Download link not found in the response");
      throw new Error("Download link not found in the response");
    }
  } catch (error) {
    logger.error("Error fetching latest agent binary link:", error);
    throw error;
  }
}
