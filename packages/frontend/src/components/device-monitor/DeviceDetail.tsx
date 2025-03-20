"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Laptop,
  Barcode,
  Clock,
  Calendar,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ScanEye,
  Shield,
} from "lucide-react";
import DeviceIdCopy from "@/components/common/DeviceIdCopy";
import DeviceProperties from "@/components/device-monitor/DeviceProperties";
import LoadingIndicator from "@/components/common/LoadingIndicator";
import Text from "@/components/text/Text";
import { deviceListTexts } from "@/texts/device/device-list";
import { Device } from "@/types/device-monitor";
import { getDeviceDetails } from "@/lib/deviceMonitor";
import { Badge } from "@/components/ui/badge";

interface DeviceDetailsProps {
  deviceId: string;
}

const DeviceDetails = ({ deviceId }: DeviceDetailsProps) => {
  const [device, setDevice] = useState<Device | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const {
    data: deviceDetails,
    isLoading: isLoadingDetails,
    refetch: refetchDetails,
  } = useQuery({
    queryKey: ["deviceDetails", deviceId],
    queryFn: () => getDeviceDetails(deviceId),
  });

  useEffect(() => {
    if (deviceDetails) {
      setDevice(deviceDetails);
      setIsLoading(false);
    }
  }, [deviceDetails]);

  const formatLastSeen = (lastSeen: string | null) => {
    if (!lastSeen) return "Never";
    const lastSeenDate = new Date(lastSeen);
    return lastSeenDate.toLocaleString();
  };

  const getSeverityColor = useCallback((severity: string) => {
    switch (severity?.toLowerCase()) {
      case "healthy":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case "at_risk":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
      case "critical":
        return "bg-red-100 text-red-800 hover:bg-red-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  }, []);

  const getSeverityIcon = useCallback((severity: string) => {
    switch (severity?.toLowerCase()) {
      case "healthy":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "at_risk":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case "critical":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Shield className="w-4 h-4 text-gray-500" />;
    }
  }, []);

  const getStatusIcon = (isActive: string) => {
    return isActive === "ONLINE" ? (
      <CheckCircle className="w-5 h-5 text-green-500" />
    ) : (
      <XCircle className="w-5 h-5 text-red-500" />
    );
  };

  return (
    <div className="mt-4 sm:mt-4 px-2 sm:px-4 md:px-8">
      <h2 className="text-xl font-bold flex items-center text-gray-800 gap-2">
        <Laptop className="w-6 h-6" />
        <Text text={deviceListTexts.deviceDetails} />
      </h2>
      {isLoading ? (
        <LoadingIndicator />
      ) : device ? (
        <div className="sm:max-w-[750px]  mt-4 rounded-lg shadow-md space-y-4 bg-white p-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <h3 className="text-lg font-semibold text-memcryptRed">
                {device.name}
              </h3>
              <p className="text-sm text-gray-500">{device.type}</p>
            </div>
            <div className="col-span-2 flex items-center gap-2">
              <ScanEye className="w-5 h-5 text-memcryptRed" />
              <div className="flex-grow">
                <p className="text-sm font-medium text-gray-700">
                  <Text text={deviceListTexts.deviceId} />
                </p>
                <DeviceIdCopy id={device.id} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Barcode className="w-5 h-5 text-memcryptRed" />
              <div>
                <p className="text-sm font-medium text-gray-700">
                  <Text text={deviceListTexts.deviceSerialNumber} />
                </p>
                <p className="text-sm text-gray-600">{device.serial_number}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-memcryptRed" />
              <div>
                <p className="text-sm font-medium text-gray-700">
                  <Text text={deviceListTexts.deviceLastSeen} />
                </p>
                <p className="text-sm text-gray-600">
                  {formatLastSeen(device.last_seen)}
                </p>
              </div>
            </div>
          </div>
          <div className="flex justify-between items-center py-2 border-t border-b border-gray-200">
            <div className="flex items-center gap-2">
              {getStatusIcon(device.is_active)}
              <span className="text-sm font-medium text-gray-700">
                {device.is_active}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                className={`items-center gap-1 inline-flex ${getSeverityColor(
                  device.health
                )} px-2 py-1 rounded-full text-xs`}
              >
                {getSeverityIcon(device.health)}
                {device.health === "AT_RISK" ? "AT RISK" : device.health}
              </Badge>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-memcryptRed" />
              <div>
                <p className="text-sm font-medium text-gray-700">
                  <Text text={deviceListTexts.deviceCreated} />
                </p>
                <p className="text-sm text-gray-600">
                  {new Date(device.created_at).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-memcryptRed" />
              <div>
                <p className="text-sm font-medium text-gray-700">
                  <Text text={deviceListTexts.deviceUpdated} />
                </p>
                <p className="text-sm text-gray-600">
                  {new Date(device.updated_at).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          {device.properties && (
            <div className="mt-4">
              <DeviceProperties properties={device.properties} />
            </div>
          )}
        </div>
      ) : (
        <p className="text-center text-gray-500">
          <Text text={deviceListTexts.deviceNoDetailsAvailable} />
        </p>
      )}
    </div>
  );
};

export default DeviceDetails;
