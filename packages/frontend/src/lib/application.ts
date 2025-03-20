"use server";

import { apiConsole } from "@/utils/apiUtils";
import logger from "@/utils/logger";
import { getAccessToken } from "./authToken";
import { ApplicationResponse } from "@/types/device-monitor";

export async function getApplications(
  skip?: number,
  limit?: number,
  search?: string,
  status?: string
): Promise<{ applications: ApplicationResponse[]; total: number }> {
  try {
    const token = await getAccessToken();
    const params: Record<string, string | number | boolean> = {
      ...(skip !== undefined && { skip }),
      ...(limit !== undefined && { limit }),
      ...(search?.trim() && { search: search.trim() }),
      ...(status && { status }),
    };

    const response = await apiConsole.get(`/applications`, {
      params,
      headers: { accept: "application/json", Authorization: `Bearer ${token}` },
    });

    return {
      applications: response.data.applications as ApplicationResponse[],
      total: response.data.total_count as number,
    };
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      logger.warn("No application found.", error.response.data);
      throw new Error(`No application found.`);
    }
    logger.error("An error occurred while fetching applications", error);
    throw new Error("Failed to fetch applications");
  }
}

export async function approveApplication(applicationId: string): Promise<any> {
  try {
    const token = await getAccessToken();
    const response = await apiConsole.post(
      `/applications/${applicationId}/approve`,
      null,
      {
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    logger.error("error", error);
    throw new Error("Failed to approve application");
  }
}

export async function rejectApplication(applicationId: string): Promise<any> {
  try {
    const token = await getAccessToken();
    const response = await apiConsole.post(
      `/applications/${applicationId}/deny`,
      null,
      {
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    logger.error("error", error);
    throw new Error("Failed to reject application");
  }
}

export async function bulkApproveApplications(
  applicationIds: string[]
): Promise<any> {
  try {
    const token = await getAccessToken();
    const response = await apiConsole.post(
      `/applications/bulk-approve`,
      applicationIds,
      {
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    logger.error("error", error);
    throw new Error("Failed to bulk approve applications");
  }
}

export async function bulkRejectApplications(
  applicationIds: string[]
): Promise<any> {
  try {
    const token = await getAccessToken();
    const response = await apiConsole.post(
      `/applications/bulk-deny`,
      applicationIds,
      {
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    logger.error("error", error);
    throw new Error("Failed to bulk reject applications");
  }
}
