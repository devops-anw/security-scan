"use server";

import { Device } from "@/types/device-monitor";
import { apiConsole } from "@/utils/apiUtils";

import logger from "@/utils/logger";
import { getAccessToken } from "./authToken";

export async function getDevices(
  skip: number,
  limit: number,
  search?: string,
  device_type?: string,
  status?: string,
  health?: string
): Promise<{ devices: Device[]; total: number }> {
  try {
    const token = await getAccessToken();
    const params: Record<string, string | number | boolean> = {
      skip,
      limit,
      ...(search?.trim() && { search: search.trim() }),
      ...(device_type && { device_type }),
      ...(status !== undefined && { status }),
      ...(health && { health }),
    };

    const response = await apiConsole.get(`/devices`, {
      params,
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return {
      devices: response.data.devices as Device[],
      total: response.data.total as number,
    };
  } catch (error) {
    logger.error("error", error);
    console.error(error);
    throw new Error("Failed to fetch devices");
  }
}

export async function getDeviceHeartbeat(deviceId: string): Promise<any> {
  try {
    const token = await getAccessToken();
    const response = await apiConsole.get(`/devices/heartbeat/${deviceId}`, {
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    logger.error("error", error);
    throw new Error("Failed to fetch device heartbeat");
  }
}

export async function registerDevice(deviceData: any): Promise<any> {
  try {
    const token = await getAccessToken();
    const response = await apiConsole.post(`/devices/register`, deviceData, {
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    logger.error("error", error);
    throw new Error("Failed to register device");
  }
}

export async function getDeviceDetails(deviceId: string): Promise<any> {
  try {
    const token = await getAccessToken();
    const response = await apiConsole.get(`/devices/${deviceId}`, {
      headers: { accept: "application/json", Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    logger.error("error", error);
    throw new Error("Failed to fetch device details");
  }
}
