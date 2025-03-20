"use server";

import { apiConsole } from "@/utils/apiUtils";

import logger from "@/utils/logger";
import { getAccessToken } from "./authToken";

export async function getRecoveryList(
  skip?: number,
  limit?: number,
  search?: string,
  device_name?: string,
  status?: string
): Promise<{
  recoveries: Recovery[];
  total: number;
}> {
  try {
    const token = await getAccessToken();
    const params: Record<string, string | number | boolean> = {
      ...(skip !== undefined && { skip }),
      ...(limit !== undefined && { limit }),
      ...(search?.trim() && { search: search.trim() }),
      ...(device_name && { device_name }),
      ...(status && { status }),
    };
    const response = await apiConsole.get(`/organization/devices/recoveries`, {
      params,
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return {
      recoveries: response.data.recoveries as Recovery[],
      total: response.data.total_count as number,
    };
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      logger.warn("No recovery list found.", error.response.data);
      throw new Error(`No recovery list found.`);
    }
    logger.error("An error occurred while fetching recovery list", error);
    throw new Error("Failed to fetch recovery list");
  }
}

export async function getDeviceRecoveryList(
  deviceId: string,
  skip: number,
  limit: number,
  search?: string,
  status?: string
): Promise<{ recoveries: Recovery[]; total: number }> {
  try {
    const token = await getAccessToken();
    const params: Record<string, string | number | boolean> = {
      skip,
      limit,
      ...(search?.trim() && { search: search.trim() }),
      ...(status && { status }),
    };
    const response = await apiConsole.get(`/device/${deviceId}/file_recovery`, {
      params,
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return {
      recoveries: response.data.recoveries as Recovery[],
      total: response.data.total_count as number,
    };
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      logger.warn(
        "No recovery list found for the specified device",
        error.response.data
      );
      // Return empty array instead of throwing an error
      return { recoveries: [], total: 0 };
    }
    logger.error(
      "An error occurred while fetching device recovery list",
      error
    );
    throw new Error("Failed to fetch device recovery list");
  }
}
