"use server";
import { apiConsole } from "@/utils/apiUtils";
import logger from "@/utils/logger";
import { getAccessToken } from "./authToken";
import { InventoryResponse } from "@/types/device-monitor";

export async function getDeviceInventory(
  deviceId: string,
  skip: number,
  limit: number,
  search?: string,
  status?: string
): Promise<{ inventory: InventoryResponse[]; total: number }> {
  try {
    const token = await getAccessToken();
    const params: Record<string, string | number | boolean> = {
      skip,
      limit,
      ...(search?.trim() && { search: search.trim() }),
      ...(status && { status }),
    };
    const response = await apiConsole.get(`/devices/${deviceId}/inventory`, {
      params,
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return {
      inventory: response.data.inventory as InventoryResponse[],
      total: response.data.total as number,
    };
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      logger.warn(
        "No inventory found for the specified device",
        error.response.data
      );
      // Return empty array instead of throwing an error
      return { inventory: [], total: 0 };
    }
    logger.error("An error occurred while fetching device inventory", error);
    throw new Error("Failed to fetch device inventory");
  }
}

export async function approveApplication(inventoryId: string): Promise<any> {
  try {
    const token = await getAccessToken();
    const response = await apiConsole.post(
      `/inventory/${inventoryId}/approve`,
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

export async function rejectApplication(inventoryId: string): Promise<any> {
  try {
    const token = await getAccessToken();
    const response = await apiConsole.post(
      `/inventory/${inventoryId}/deny`,
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
  inventoryIds: string[]
): Promise<any> {
  try {
    const token = await getAccessToken();
    const response = await apiConsole.post(
      `/inventory/bulk-approve`,
      inventoryIds,
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
  inventoryIds: string[]
): Promise<any> {
  try {
    const token = await getAccessToken();
    const response = await apiConsole.post(
      `/inventory/bulk-deny`,
      inventoryIds,
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
