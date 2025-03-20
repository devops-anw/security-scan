"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import LoadingIndicator from "../common/LoadingIndicator";
import { getDevices, getDeviceDetails } from "@/lib/deviceMonitor";
import { Device } from "@/types/device-monitor";
import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import NoDevicesFound from "../common/NoDeviceFound";
import { Badge } from "@/components/ui/badge";
import DeviceStatus from "../common/DeviceStatus";
import {
  Eye,
  Settings,
  MoreVertical,
  Search,
  Logs,
  RecycleIcon,
  AppWindow,
  X,
  SlidersHorizontal,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Shield,
  ShieldQuestion,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import ErrorMessage from "../common/ErrorMessage";
import { useAuthSession } from "@/hooks/useAuthSession";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { MenubarSeparator } from "../ui/menubar";
import { Input } from "../ui/input";
import { ITEMS_PER_PAGE } from "@/constants/common";

import { deviceListTexts } from "@/texts/device/device-list";
import Text from "@/components/text/Text";
import React from "react";
import { commonTexts } from "@/texts/common/common";

import { recoveryListTexts } from "@/texts/recovery/recovery";
import Pagination from "../common/Pagination";
import ColumnsConfigModel from "../common/ColumnConfigModal";

const ALL_STATUSES = "statuses";
const ALL_HEALTH = "all_health";
const ALL_TYPES = "all_types";

const statusOptions = ["Online", "Offline"];
const healthOptions = ["Healthy", "Critical", "At Risk", "Unknown"];

interface DeviceListProps {
  health?: string;
}

export default function DeviceList({ health }: DeviceListProps) {
  const router = useRouter();
  const { user, type } = useAuthSession();
  const searchParams = useSearchParams();

  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);

  const [filterStatus, setFilterStatus] = useState(ALL_STATUSES);
  const [filterHealth, setFilterHealth] = useState(ALL_HEALTH);
  const [filterType, setFilterType] = useState(ALL_TYPES);
  const [initialDeviceTypes, setInitialDeviceTypes] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [initialTotalCount, setInitialTotalCount] = useState(0);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([
    "name",
    "type",
    "serial_number",
    "last_seen",
    "health",
    "heartbeat",
    "actions",
  ]);
  const [showModal, setShowModal] = useState(false);
  const defaultColumns = [
    { value: "name", label: "Name" },
    { value: "type", label: "Type" },
    { value: "serial_number", label: "Serial Number" },
    { value: "last_seen", label: "Last Seen" },
    { value: "health", label: "Health" },
    { value: "heartbeat", label: "Heartbeat" },
    { value: "actions", label: "Actions" },
  ];

  useEffect(() => {
    if (user && type === "Platform Admin") {
      router.push("/login");
    }
  }, [user, type, router]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const {
    data: deviceData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: [
      "devices",
      user?.tenantId,
      currentPage,
      debouncedSearchTerm,
      filterType,
      filterStatus,
      filterHealth,
    ],
    queryFn: async () => {
      const result = await getDevices(
        (currentPage - 1) * ITEMS_PER_PAGE,
        ITEMS_PER_PAGE,
        debouncedSearchTerm,
        filterType === ALL_TYPES ? undefined : filterType,
        filterStatus === ALL_STATUSES ? undefined : filterStatus,
        filterHealth === ALL_HEALTH ? undefined : filterHealth
      );
      setTotalCount(result.total);

      if (initialTotalCount === 0) {
        setInitialTotalCount(result.total);
      }

      return result;
    },
    enabled: !!user?.tenantId,
  });

  useEffect(() => {
    if (deviceData?.devices) {
      const newDeviceTypes = deviceData.devices.map((device) => device.type);
      setInitialDeviceTypes((prevTypes) => {
        const updatedTypes = new Set([...prevTypes, ...newDeviceTypes]);
        return Array.from(updatedTypes);
      });
    }
  }, [deviceData]);

  useEffect(() => {
    const health = searchParams.get("health") || "all";
    if (health && health !== filterHealth) {
      setFilterHealth(health === "all" ? ALL_HEALTH : health);
    }
  }, [searchParams, filterHealth]);

  const handleHealthChange = (value: string) => {
    setFilterHealth(value === "all" ? ALL_HEALTH : value);
    setCurrentPage(1);
    router.push(`/device-monitor?health=${value.replace(/\s+/g, "_")}`);
  };

  const filteredDevices = useMemo(() => {
    if (!deviceData?.devices) return [];

    return deviceData.devices.filter((device) => {
      const matchesStatus =
        filterStatus === ALL_STATUSES ||
        device.is_active.toLowerCase() === filterStatus.toLowerCase();
      const matchesSearchTerm =
        device.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        device.serial_number
          .toLowerCase()
          .includes(debouncedSearchTerm.toLowerCase());
      const matchesType =
        filterType === ALL_TYPES || device.type === filterType;
      const matchesHealth =
        !health ||
        health === ALL_HEALTH ||
        device.health?.toLowerCase() === health.toLowerCase();
      return matchesStatus && matchesType && matchesSearchTerm && matchesHealth;
    });
  }, [
    deviceData?.devices,
    debouncedSearchTerm,
    filterStatus,
    filterType,
    health,
  ]);

  const totalPages = Math.ceil((deviceData?.total || 0) / ITEMS_PER_PAGE);

  const {
    data: deviceDetails,
    isLoading: isLoadingDetails,
    refetch: refetchDetails,
  } = useQuery({
    queryKey: ["deviceDetails", selectedDevice?.id],
    queryFn: () =>
      selectedDevice?.id && getDeviceDetails(String(selectedDevice?.id || "")),
    enabled: !!selectedDevice,
    staleTime: Infinity,
  });

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
      case "unknown":
        return <ShieldQuestion className="w-4 h-4 text-gray-500" />;
      default:
        return <Shield className="w-4 h-4 text-gray-500" />;
    }
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  if (isLoading) {
    return (
      <div className="text-center py-4">
        <LoadingIndicator />
      </div>
    );
  }

  const formatLastSeen = (lastSeen: string | null) => {
    if (!lastSeen) return "Never";
    const lastSeenDate = new Date(lastSeen);
    return lastSeenDate.toLocaleString();
  };

  const handleViewClick = (device: Device) => {
    router.push(`/device-monitor/${device.id}/device-details/`);
  };

  const handleWhitelistClick = (device: Device) => {
    router.push(`/device-monitor/${device.id}/device-inventory/`);
  };

  const handleConfigClick = (device: Device) => {
    router.push(`/device-monitor/${device.id}/device-config/`);
  };

  const handleLogsClick = (device: Device) => {
    router.push(`/device-monitor/${device.id}/device-logs/`);
  };

  const handleRecoveryClick = (device: Device) => {
    router.push(`/device-monitor/${device.id}/device-recovery/`);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleColumnSelect = (columns: string[]) => {
    setSelectedColumns(columns);
  };

  return (
    <div className="mt-4 sm:mt-8 px-2 sm:px-4 md:px-8">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        <Text text={deviceListTexts.title}> </Text>
      </h2>

      {initialTotalCount > 0 && (
        <div className="mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-grow">
            <Input
              type="text"
              placeholder="Search by name or serial number..."
              value={searchTerm}
              onChange={handleSearch}
              className="pl-10 pr-10 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition duration-150 ease-in-out"
            />
            <Search className="h-5 w-5 text-memcryptRed absolute left-3 top-1/2 transform -translate-y-1/2" />

            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                aria-label="Clear search"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
            <Select
              value={filterType}
              onValueChange={(value) => {
                setFilterType(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_TYPES}>
                  <Text text={deviceListTexts.allTypeFilter} />
                </SelectItem>
                {initialDeviceTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterHealth} onValueChange={handleHealthChange}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by health" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_HEALTH}>
                  <Text text={deviceListTexts.allHealthFilter} />
                </SelectItem>
                {healthOptions.map((health) => (
                  <SelectItem
                    key={health}
                    value={health.replace(/\s+/g, "_").toLowerCase()}
                  >
                    {health}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filterStatus}
              onValueChange={(value) => {
                setFilterStatus(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_STATUSES}>
                  <Text text={deviceListTexts.allHeartBeatFilter} />
                </SelectItem>
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <button
              onClick={() => setShowModal(true)}
              className="flex h-10  items-center  rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span className="ml-2">
                {" "}
                <Text text={commonTexts.allFilters} />
              </span>
            </button>

            <div className="mt-4 sm:mt-0">
              <ColumnsConfigModel
                columns={defaultColumns}
                selectedColumns={selectedColumns}
                onColumnSelect={handleColumnSelect}
                showModal={showModal}
                onClose={() => setShowModal(false)}
              />
            </div>
          </div>
        </div>
      )}

      {isError ? (
        <ErrorMessage
          message={deviceListTexts.deviceListLoadErrorMessage}
          heading={deviceListTexts.deviceListLoadError}
        />
      ) : filteredDevices.length > 0 ? (
        <>
          <div className="overflow-x-auto shadow-md sm:rounded-lg">
            <Table className="min-w-full bg-white">
              <TableHeader className="bg-gray-100 border-b">
                <TableRow>
                  {selectedColumns.includes("name") && (
                    <TableHead className="px-2 py-2 font-medium text-gray-700 text-left">
                      <Text text={deviceListTexts.deviceName} />
                    </TableHead>
                  )}
                  {selectedColumns.includes("type") && (
                    <TableHead className="px-2 py-2 font-medium text-gray-700 text-left">
                      <Text text={deviceListTexts.deviceType} />
                    </TableHead>
                  )}
                  {selectedColumns.includes("serial_number") && (
                    <TableHead className="px-2 py-2 font-medium text-gray-700 text-left">
                      <Text text={deviceListTexts.deviceSerialNumber} />
                    </TableHead>
                  )}
                  {selectedColumns.includes("last_seen") && (
                    <TableHead className="px-2 py-2 font-medium text-gray-700 text-left">
                      <Text text={deviceListTexts.deviceLastSeen} />
                    </TableHead>
                  )}
                  {selectedColumns.includes("health") && (
                    <TableHead className="px-2 py-2 font-medium text-gray-700 text-left">
                      <Text text={deviceListTexts.deviceHealth} />
                    </TableHead>
                  )}
                  {selectedColumns.includes("heartbeat") && (
                    <TableHead className="px-2 py-2 font-medium text-gray-700 text-left sticky right-16 bg-gray-100">
                      <Text text={deviceListTexts.deviceHeartbeat} />
                    </TableHead>
                  )}
                  {selectedColumns.includes("actions") && (
                    <TableHead className="px-2 py-2 font-medium text-gray-700 text-left sticky right-0 bg-gray-100">
                      <Text text={deviceListTexts.deviceActions} />
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDevices.map((device) => (
                  <TableRow key={device.id} className="hover:bg-gray-50">
                    {selectedColumns.includes("name") && (
                      <TableCell className="px-2 py-2 text-gray-800">
                        {device.name}
                      </TableCell>
                    )}
                    {selectedColumns.includes("type") && (
                      <TableCell className="px-2 py-2 text-gray-800">
                        {device.type}
                      </TableCell>
                    )}
                    {selectedColumns.includes("serial_number") && (
                      <TableCell className="px-2 py-2 text-gray-800">
                        {device.serial_number}
                      </TableCell>
                    )}
                    {selectedColumns.includes("last_seen") && (
                      <TableCell className="px-2 py-2 text-gray-800">
                        {formatLastSeen(device.last_seen)}
                      </TableCell>
                    )}
                    {selectedColumns.includes("health") && (
                      <TableCell className="px-2 py-2 text-gray-800 text-xs sm:text-sm md:text-base">
                        <Badge
                          className={`items-center gap-1 inline-flex ${getSeverityColor(
                            device.health
                          )} px-2 py-1 rounded-full text-xs`}
                        >
                          {getSeverityIcon(device.health)}
                          {device.health === "AT_RISK"
                            ? "AT RISK"
                            : device.health}
                        </Badge>
                      </TableCell>
                    )}
                    {selectedColumns.includes("heartbeat") && (
                      <TableCell className="px-2 py-2 text-gray-800 sticky right-16 bg-white md:bg-transparent text-xs sm:text-sm md:text-base">
                        <DeviceStatus status={device.is_active} />
                      </TableCell>
                    )}

                    {selectedColumns.includes("actions") && (
                      <TableCell className="px-2 py-2 text-gray-800 sticky right-0 bg-white md:bg-transparent">
                        <DropdownMenu>
                          <DropdownMenuTrigger>
                            <MoreVertical className="w-5 h-5 cursor-pointer text-memcryptRed" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-white shadow-lg rounded-md py-1 mt-1">
                            <DropdownMenuItem
                              onClick={() => handleViewClick(device)}
                              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                            >
                              <Eye className="w-4 h-4 mr-2 text-memcryptRed" />{" "}
                              <Text text={commonTexts.view} />
                            </DropdownMenuItem>
                            <MenubarSeparator className="bg-gray-200" />
                            <DropdownMenuItem
                              onClick={() => handleConfigClick(device)}
                              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                            >
                              <Settings className="w-4 h-4 mr-2 text-memcryptRed" />{" "}
                              <Text text={deviceListTexts.deviceConfig} />
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleWhitelistClick(device)}
                              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                            >
                              <AppWindow className="w-4 h-4 mr-2 text-memcryptRed" />{" "}
                              <Text
                                text={
                                  deviceListTexts.deviceApplicationInventory
                                }
                              />
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleLogsClick(device)}
                              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                            >
                              <Logs className="w-4 h-4 mr-2 text-memcryptRed" />{" "}
                              <Text text={deviceListTexts.deviceLogs} />
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleRecoveryClick(device)}
                              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                            >
                              <RecycleIcon className="w-4 h-4 mr-2 text-memcryptRed" />{" "}
                              <Text text={deviceListTexts.recoveryList} />
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <Pagination
            currentPage={currentPage}
            itemsPerPage={ITEMS_PER_PAGE}
            totalItems={totalCount || 0}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      ) : searchTerm ? (
        <div className="text-center py-4">
          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
            <Text text={deviceListTexts.noSearchDevicesFound} />
            <p className="mt-2">
              {" "}
              <Text text={deviceListTexts.deviceSearchNoResultTryAdjusting} />
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-4">
          <div className="text-lg text-gray-600">
            <NoDevicesFound status={filterStatus} health={filterHealth} />
          </div>
        </div>
      )}
    </div>
  );
}
