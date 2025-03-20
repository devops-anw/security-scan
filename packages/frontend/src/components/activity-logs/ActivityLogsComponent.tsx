"use client";
import { useState, useCallback, useMemo, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Shield,
  Search,
  List,
  X,
  SlidersHorizontal,
} from "lucide-react";
import Text from "@/components/text/Text";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { activityLogsTexts } from "@/texts/activity-logs/activity-logs";
import NoActivityFound from "../common/NoActivityFound";
import { getActivityLogs } from "@/lib/activityLogs";
import { useQuery } from "@tanstack/react-query";
import { useAuthSession } from "@/hooks/useAuthSession";
import LoadingIndicator from "../common/LoadingIndicator";
import ErrorMessage from "../common/ErrorMessage";
import { recoveryListTexts } from "@/texts/recovery/recovery";
import { ITEMS_PER_PAGE } from "@/constants/common";
import { commonTexts } from "@/texts/common/common";

import Pagination from "../common/Pagination";
import ColumnsConfigModel from "../common/ColumnConfigModal";
import { useRouter, useSearchParams } from "next/navigation";

interface ActivityLogsProps {
  severity?: string;
}

const ALL_SEVERITIES = "all_severities";
const ALL_DEVICES = "all_devices";
const severityOptions = ["Critical", "High", "Medium", "Low"];

const ActivityLogsComponent = ({ severity }: ActivityLogsProps) => {
  const [activeTab, setActiveTab] = useState("all");
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const searchParams = useSearchParams();
  const [filterSeverity, setFilterSeverity] = useState(ALL_SEVERITIES);
  const [filterDevice, setFilterDevice] = useState(ALL_DEVICES);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [initialTotalCount, setInitialTotalCount] = useState(0);
  const [initialDevices, setInitialDevices] = useState<string[]>([]);
  const { user } = useAuthSession();
  const orgId = user.tenantId;
  const [selectedColumns, setSelectedColumns] = useState<string[]>([
    "device_name",
    "device_id",
    "activity_type",
    "severity",
    "created_at",
    "details",
  ]);
  const [showModal, setShowModal] = useState(false);
  const defaultColumns = [
    { value: "device_name", label: "Device Name" },
    { value: "device_id", label: "Device ID" },
    { value: "activity_type", label: "Activity Type" },
    { value: "severity", label: "Severity" },
    { value: "created_at", label: "Timestamp" },
    { value: "details", label: "Additional Info" },
  ];

  const tabConfig = [
    { value: "all", label: "All Logs", icon: List },
    { value: "critical", label: "Critical", icon: XCircle },
    { value: "high", label: "High", icon: AlertTriangle },
    { value: "medium", label: "Medium", icon: Shield },
    { value: "low", label: "Low", icon: CheckCircle },
  ];

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const {
    data: activityLogs,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: [
      "applications",
      orgId,
      currentPage,
      debouncedSearchTerm,
      filterDevice,
      filterSeverity,
    ],
    queryFn: async () => {
      const result = await getActivityLogs(
        (currentPage - 1) * ITEMS_PER_PAGE,
        ITEMS_PER_PAGE,
        debouncedSearchTerm,
        filterDevice === ALL_DEVICES ? undefined : filterDevice,
        filterSeverity === ALL_SEVERITIES ? undefined : filterSeverity
      );
      setTotalCount(result.total);
      if (initialTotalCount === 0) {
        setInitialTotalCount(result.total);
      }

      return result;
    },
    enabled: !!orgId,
  });

  const keyMapping: { [key: string]: string } = {
    threat_name: "Threat Name",
    affected_files: "Affected Files",
    detection_method: "Detection Method",
    action_taken: "Action Taken",
    timestamp: "Timestamp",
  };

  useEffect(() => {
    if (activityLogs?.logs) {
      const newDeviceNames = activityLogs.logs.map(
        (device) => device.device_name
      );
      setInitialDevices((prevTypes) => {
        const updatedDevices = new Set([...prevTypes, ...newDeviceNames]);
        return Array.from(updatedDevices);
      });
    }
  }, [activityLogs]);

  useEffect(() => {
    const severity = searchParams.get("severity") || "all";
    if (severity && severity !== activeTab) {
      setActiveTab(severity);
      setFilterSeverity(severity === "all" ? ALL_SEVERITIES : severity);
    }
  }, [searchParams, activeTab]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setFilterSeverity(value === "all" ? ALL_SEVERITIES : value);
    setCurrentPage(1);
    router.push(`/activity-logs?severity=${value}`);
  };

  const filteredLogs = useMemo(() => {
    const logs = Array.isArray(activityLogs?.logs) ? activityLogs.logs : [];
    return logs.filter((log) => {
      const matchesSearchTerm =
        log.device_name
          ?.toLowerCase()
          .includes(debouncedSearchTerm.toLowerCase()) ||
        log.activity_type
          ?.toLowerCase()
          .includes(debouncedSearchTerm.toLowerCase());

      const matchesSeverity =
        !severity || log.severity?.toLowerCase() === severity.toLowerCase();

      const matchesDevice =
        filterDevice === ALL_DEVICES || log.device_name === filterDevice;

      return matchesSeverity && matchesDevice && matchesSearchTerm;
    });
  }, [activityLogs?.logs, debouncedSearchTerm, filterDevice, severity]);

  const totalPages = Math.ceil((activityLogs?.total || 0) / ITEMS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const getSeverityIcon = useCallback((severity: string) => {
    switch (severity?.toLowerCase()) {
      case "low":
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case "medium":
        return <Shield className="w-4 h-4 text-yellow-500" />;
      case "high":
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case "critical":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Shield className="w-4 h-4 text-gray-500" />;
    }
  }, []);

  const getSeverityColor = useCallback((severity: string) => {
    switch (severity?.toLowerCase()) {
      case "low":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
      case "high":
        return "bg-orange-100 text-orange-800 hover:bg-orange-200";
      case "critical":
        return "bg-red-100 text-red-800 hover:bg-red-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  }, []);

  const renderAdditionalInfo = (additionalInfo: AdditionalInfo) => {
    return (
      <div className="space-y-1">
        {Object.entries(additionalInfo).map(
          ([key, value]) =>
            value !== undefined &&
            key !== "timestamp" && (
              <p key={key} className="text-sm">
                <span className="font-medium">
                  {keyMapping[key] ||
                    key.charAt(0).toUpperCase() + key.slice(1)}
                  :
                </span>{" "}
                {value}
              </p>
            )
        )}
      </div>
    );
  };

  if (isLoading) return <LoadingIndicator />;
  if (isError) {
    if (error.message.includes("No activity logs found")) {
      return <NoActivityFound activeTab={activeTab} />;
    } else {
      <div className="mt-4">
        <ErrorMessage
          message={error.message}
          heading={activityLogsTexts.activityActionError}
        />
      </div>;
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleColumnSelect = (columns: string[]) => {
    setSelectedColumns(columns);
  };

  return (
    <div className="mt-4 sm:mt-8 px-2 sm:px-4 md:px-8">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        <Text text={activityLogsTexts.title} />
      </h2>

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        {initialTotalCount > 0 && (
          <>
            <div className="hidden sm:flex">
              <TabsList className="flex w-full mb-6 bg-white rounded-lg shadow-sm  py-6 sm:py-0">
                {tabConfig.map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className={` 
                      flex-1 flex-col sm:flex-row items-center justify-center gap-2 py-1 sm:py-3 px-1 sm:px-4
                      text-sm font-medium text-gray-600
                      data-[state=active]:bg-red-50 data-[state=active]:text-red-600
                      data-[state=active]:border-b-2 data-[state=active]:border-red-500
                      data-[state=active]:z-10 z-0
                      hover:z-5 hover:bg-red-50 hover:text-red-500
                      transition-all duration-200 ease-in-out
                      focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-opacity-50
                    `}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            <div className="mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="relative flex-grow">
                <Input
                  type="text"
                  placeholder="Search by device name or activity type..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="pl-10 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition duration-150 ease-in-out"
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

              <div className="flex  space-x-2 ">
                <div className="w-full sm:w-auto">
                  <Select
                    value={filterDevice}
                    onValueChange={(value) => {
                      setFilterDevice(value);
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Filter by device" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ALL_DEVICES}>
                        <Text text={"All Devices"} />
                      </SelectItem>
                      {initialDevices.map((deviceName) => (
                        <SelectItem key={deviceName} value={deviceName}>
                          {deviceName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-full sm:hidden">
                  <Select
                    value={filterSeverity}
                    onValueChange={(value) => {
                      setFilterSeverity(
                        value === "all" ? ALL_SEVERITIES : value
                      );
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ALL_SEVERITIES}>
                        <Text text={recoveryListTexts.allStatuses} />
                      </SelectItem>
                      {severityOptions.map((severity) => (
                        <SelectItem key={severity} value={severity}>
                          {severity}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <button
                  onClick={() => setShowModal(true)}
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  <span className="ml-2">
                    <Text text={commonTexts.allFilters} />
                  </span>
                </button>

                <div className="mt-4">
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
          </>
        )}

        <TabsContent value={activeTab} className="mt-6">
          {filteredLogs.length > 0 ? (
            <>
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      {selectedColumns.includes("device_name") && (
                        <TableHead className="px-4 py-3 font-semibold text-gray-700 text-left">
                          <Text text={recoveryListTexts.tableDeviceName} />
                        </TableHead>
                      )}

                      {selectedColumns.includes("device_id") && (
                        <TableHead className="px-4 py-3 font-semibold text-gray-700 text-left">
                          <Text text={activityLogsTexts.deviceId} />
                        </TableHead>
                      )}
                      {selectedColumns.includes("activity_type") && (
                        <TableHead className="px-4 py-3 font-semibold text-gray-700 text-left">
                          <Text text={activityLogsTexts.activityType} />
                        </TableHead>
                      )}
                      {selectedColumns.includes("severity") && (
                        <TableHead className="px-4 py-3 font-semibold text-gray-700 text-left">
                          <Text text={activityLogsTexts.severity} />
                        </TableHead>
                      )}
                      {selectedColumns.includes("created_at") && (
                        <TableHead className="px-4 py-3 font-semibold text-gray-700 text-left">
                          <Text text={activityLogsTexts.timeStamp} />
                        </TableHead>
                      )}
                      {selectedColumns.includes("details") && (
                        <TableHead className="px-4 py-3 font-semibold text-gray-700 text-left">
                          <Text text={activityLogsTexts.additionalInfo} />
                        </TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log) => (
                      <TableRow
                        key={log.id}
                        className="hover:bg-gray-50 transition-colors duration-150"
                      >
                        {selectedColumns.includes("device_name") && (
                          <TableCell className="px-4 py-3 text-gray-700">
                            {log.device_name || "Unknown Device"}
                          </TableCell>
                        )}
                        {selectedColumns.includes("device_id") && (
                          <TableCell className="px-4 py-3 font-medium text-gray-900">
                            {log.device_id}
                          </TableCell>
                        )}
                        {selectedColumns.includes("activity_type") && (
                          <TableCell className="px-4 py-3 text-gray-700">
                            {log.activity_type}
                          </TableCell>
                        )}
                        {selectedColumns.includes("severity") && (
                          <TableCell className="px-4 py-3">
                            <Badge
                              className={`items-center gap-1 inline-flex ${getSeverityColor(
                                log.severity
                              )} px-2 py-1 rounded-full text-xs`}
                            >
                              {getSeverityIcon(log.severity)}
                              {log.severity}
                            </Badge>
                          </TableCell>
                        )}
                        {selectedColumns.includes("created_at") && (
                          <TableCell className="px-4 py-3 text-gray-700">
                            {new Date(log.created_at).toLocaleString()}
                          </TableCell>
                        )}
                        {selectedColumns.includes("details") && (
                          <TableCell className="px-4 py-3 text-gray-700">
                            {renderAdditionalInfo(log.details)}
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
            <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
              <Text text={activityLogsTexts.noLogsFoundSearching} />
              <p className="mt-2 text-gray-600">
                <Text text={activityLogsTexts.tryAdjustingFilters} />
              </p>
            </div>
          ) : (
            <NoActivityFound activeTab={activeTab} isDevice={false} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ActivityLogsComponent;
