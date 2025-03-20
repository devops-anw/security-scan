"use server";

import { apiConsole } from "@/utils/apiUtils";
import logger from "@/utils/logger";
import { getAccessToken } from "./authToken";

export async function getDeviceEndPointConfigDetails(
  deviceEndPointId: string
): Promise<any> {
  try {
    const token = await getAccessToken();
    const response = await apiConsole.get(
      `/endpoint-config/${deviceEndPointId}`,
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
    throw new Error("Failed to fetch device config details");
  }
}

export async function updateDeviceEndPointConfig(
  deviceEndPointId: string,
  config: any
): Promise<any> {
  try {
    const token = await getAccessToken();
    const response = await apiConsole.put(
      `/endpoint-config/${deviceEndPointId}`,
      config,
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
    throw new Error("Failed to update device config");
  }
}
