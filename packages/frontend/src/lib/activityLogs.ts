"use server";

import { apiConsole } from "@/utils/apiUtils";

import logger from "@/utils/logger";
import { getAccessToken } from "./authToken";

export async function getActivityLogs(
  skip?: number,
  limit?: number,
  search?: string,
  device_name?: string,
  severity?: string
): Promise<{
  logs: LogEntry[];
  total: number;
}> {
  try {
    const token = await getAccessToken();
    const params: Record<string, string | number | boolean> = {
      ...(skip !== undefined && { skip }),
      ...(limit !== undefined && { limit }),
      ...(search?.trim() && { search: search.trim() }),
      ...(device_name && { device_name }),
      ...(severity && { severity }),
    };
    const response = await apiConsole.get(`/activity-logs`, {
      params,
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    return {
      logs: response.data.logs as LogEntry[],
      total: response.data.total_count as number,
    };
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      logger.warn("No activity logs found.", error.response.data);
      throw new Error(`No activity logs found.`);
    }
    logger.error("An error occurred while fetching activity logs", error);
    throw new Error("Failed to fetch activity logs");
  }
}

export async function getDeviceActivityLogs(
  deviceId: string,
  skip: number,
  limit: number,
  search?: string,
  severity?: string
): Promise<{ logs: LogEntry[]; total: number }> {
  try {
    const token = await getAccessToken();
    const params: Record<string, string | number | boolean> = {
      skip,
      limit,
      ...(search?.trim() && { search: search.trim() }),
      ...(severity && { severity }),
    };
    const response = await apiConsole.get(`/activity-logs/device/${deviceId}`, {
      params,
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    return {
      logs: response.data.logs as LogEntry[],
      total: response.data.total_count as number,
    };
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      logger.warn(
        `No activity logs found for device ID: ${deviceId}`,
        error.response.data
      );
      throw new Error(`No activity logs found for device ID: ${deviceId}`);
    }
    logger.error(
      "An error occurred while fetching device activity logs",
      error
    );
    throw new Error("Failed to fetch device activity logs");
  }
}
