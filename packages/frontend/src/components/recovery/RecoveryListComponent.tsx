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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CheckCircle,
  XCircle,
  Shield,
  Search,
  List,
  AlertCircle,
  FileText,
  RefreshCw,
  Clock,
  X,
  SlidersHorizontal,
} from "lucide-react";
import Text from "@/components/text/Text";
import NoRecoveryFound from "../common/NoRecoveryFound";
import { recoveryListTexts } from "@/texts/recovery/recovery";
import { getRecoveryList } from "@/lib/fileRecovery";
import { useQuery } from "@tanstack/react-query";
import { useAuthSession } from "@/hooks/useAuthSession";
import LoadingIndicator from "../common/LoadingIndicator";
import ErrorMessage from "../common/ErrorMessage";
import { getStatusColor } from "@/utils/statusHelpers";
import { Badge } from "../ui/badge";
import { ITEMS_PER_PAGE } from "@/constants/common";
import Pagination from "../common/Pagination";
import ColumnsConfigModel from "../common/ColumnConfigModal";
import { commonTexts } from "@/texts/common/common";
import { useRouter, useSearchParams } from "next/navigation";

interface RecoveryProps {
  status?: string;
}

const ALL_STATUSES = "all_statuses";
const ALL_DEVICES = "all_devices";
const statusOptions = [
  "Pending",
  "In Progress",
  "Completed",
  "Failed",
  "Queued",
];

const RecoveryListComponent = ({ status }: RecoveryProps) => {
  const [activeTab, setActiveTab] = useState("all");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState(ALL_STATUSES);
  const [filterDevice, setFilterDevice] = useState(ALL_DEVICES);
  const { accessToken } = useAuthSession();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [initialTotalCount, setInitialTotalCount] = useState(0);
  const [initialDevices, setInitialDevices] = useState<string[]>([]);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([
    "device_name",
    "device_id",
    "file_name",
    "status",
    "recovery_method",

    "created_at",
  ]);
  const [showModal, setShowModal] = useState(false);
  const defaultColumns = [
    { value: "device_name", label: "Device Name" },
    { value: "device_id", label: "Device ID" },
    { value: "file_name", label: "File Name" },
    { value: "status", label: "Status" },
    { value: "recovery_method", label: "Recovery Method" },
    { value: "created_at", label: "Timestamp" },
  ];

  const tabConfig = [
    {
      value: "all",
      label: <Text text={recoveryListTexts.tabsAll} />,
      icon: List,
    },
    {
      value: "pending",
      label: <Text text={recoveryListTexts.tabsPending} />,
      icon: Clock,
    },
    {
      value: "in_progress",
      label: <Text text={recoveryListTexts.tabsInProgress} />,
      icon: RefreshCw,
    },
    {
      value: "completed",
      label: <Text text={recoveryListTexts.tabsCompleted} />,
      icon: CheckCircle,
    },
    {
      value: "failed",
      label: <Text text={recoveryListTexts.tabsFailed} />,
      icon: XCircle,
    },
    {
      value: "queued",
      label: <Text text={recoveryListTexts.tabsQueued} />,
      icon: AlertCircle,
    },
  ];

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const {
    data: recoveryList,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: [
      "recovery-list",
      accessToken,
      currentPage,
      debouncedSearchTerm,
      filterDevice,
      filterStatus,
    ],
    queryFn: async () => {
      const result = await getRecoveryList(
        (currentPage - 1) * ITEMS_PER_PAGE,
        ITEMS_PER_PAGE,
        debouncedSearchTerm,
        filterDevice === ALL_DEVICES ? undefined : filterDevice,
        filterStatus === ALL_STATUSES ? undefined : filterStatus
      );
      setTotalCount(result.total);
      if (initialTotalCount === 0) {
        setInitialTotalCount(result.total);
      }

      return result;
    },
  });

  useEffect(() => {
    const status = searchParams.get("status") || "all";
    if (status && status !== activeTab) {
      setActiveTab(status);
      setFilterStatus(status === "all" ? ALL_STATUSES : status);
    }
  }, [searchParams, activeTab]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setFilterStatus(value === "all" ? ALL_STATUSES : value);
    setCurrentPage(1);
    router.push(`/recovery?status=${value}`);
  };

  useEffect(() => {
    if (recoveryList?.recoveries) {
      const newDeviceNames = recoveryList.recoveries.map(
        (device) => device.device_name
      );
      setInitialDevices((prevTypes) => {
        const updatedDevices = new Set([...prevTypes, ...newDeviceNames]);
        return Array.from(updatedDevices);
      });
    }
  }, [recoveryList]);

  const filteredRecoveries = useMemo(() => {
    const recoveries = Array.isArray(recoveryList?.recoveries)
      ? recoveryList.recoveries
      : [];
    return recoveries.filter((recovery) => {
      const matchesSearchTerm =
        recovery.device_name
          ?.toLowerCase()
          .includes(debouncedSearchTerm.toLowerCase()) ||
        recovery.file_name
          ?.toLowerCase()
          .includes(debouncedSearchTerm.toLowerCase());

      const matchesStatus =
        !status || recovery.status?.toLowerCase() === status.toLowerCase();

      const matchesDevice =
        filterDevice === ALL_DEVICES || recovery.device_name === filterDevice;

      return matchesSearchTerm && matchesStatus && matchesDevice;
    });
  }, [recoveryList?.recoveries, debouncedSearchTerm, status, filterDevice]);

  const totalPages = Math.ceil((recoveryList?.total || 0) / ITEMS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const getStatusIcon = useCallback((status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case "in progress":
        return <RefreshCw className="w-4 h-4 text-blue-500" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "queued":
        return <AlertCircle className="w-4 h-4 text-purple-500" />;
      default:
        return <Shield className="w-4 h-4 text-gray-500" />;
    }
  }, []);

  if (isLoading) return <LoadingIndicator />;
  if (isError) {
    if (error.message.includes("No recovery lists found")) {
      return <NoRecoveryFound activeTab={activeTab} />;
    } else {
      <div className="mt-4">
        <ErrorMessage
          message={error.message}
          heading={recoveryListTexts.recoveryActionError}
        />
      </div>;
    }
  }

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
        <Text text={recoveryListTexts.title} />
      </h2>

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        {initialTotalCount > 0 && (
          <>
            <TabsList className="hidden sm:flex w-full mb-6 bg-white rounded-lg shadow-sm  py-6 sm:py-0">
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
            <div className="mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="relative flex-grow">
                <Input
                  type="text"
                  placeholder="Search by device name or file name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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
                    value={filterStatus}
                    onValueChange={(value) => {
                      setFilterStatus(value === "all" ? ALL_STATUSES : value);
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ALL_STATUSES}>
                        <Text text={recoveryListTexts.allStatuses} />
                      </SelectItem>
                      {statusOptions.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
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
                    {" "}
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
          {filteredRecoveries.length > 0 ? (
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
                          <Text text={recoveryListTexts.tableDeviceId} />
                        </TableHead>
                      )}
                      {selectedColumns.includes("file_name") && (
                        <TableHead className="px-4 py-3 font-semibold text-gray-700 text-left">
                          <Text text={recoveryListTexts.tableFileName} />
                        </TableHead>
                      )}
                      {selectedColumns.includes("status") && (
                        <TableHead className="px-4 py-3 font-semibold text-gray-700 text-left">
                          <Text text={recoveryListTexts.tableStatus} />
                        </TableHead>
                      )}
                      {selectedColumns.includes("recovery_method") && (
                        <TableHead className="px-4 py-3 font-semibold text-gray-700 text-left">
                          <Text text={recoveryListTexts.tableRecoveryMethod} />
                        </TableHead>
                      )}
                      {selectedColumns.includes("file_size") && (
                        <TableHead className="px-4 py-3 font-semibold text-gray-700 text-left hidden">
                          <Text text={recoveryListTexts.tableFileSize} />
                        </TableHead>
                      )}
                      {selectedColumns.includes("created_at") && (
                        <TableHead className="px-4 py-3 font-semibold text-gray-700 text-left">
                          <Text text={recoveryListTexts.tableTimestamp} />
                        </TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRecoveries.map((entry) => (
                      <TableRow
                        key={entry.id}
                        className="hover:bg-gray-50 transition-colors duration-150"
                      >
                        {selectedColumns.includes("device_name") && (
                          <TableCell className="px-4 py-3 text-gray-700">
                            {entry.device_name || "Unknown Device"}
                          </TableCell>
                        )}

                        {selectedColumns.includes("device_id") && (
                          <TableCell className="px-4 py-3 font-medium text-gray-900">
                            {entry.device_id}
                          </TableCell>
                        )}

                        {selectedColumns.includes("file_name") && (
                          <TableCell className="px-4 py-3 text-gray-700">
                            <div className="flex items-center">
                              <FileText className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
                              <span className="word-break-breakWord">
                                {entry.file_name}
                              </span>
                            </div>
                          </TableCell>
                        )}

                        {selectedColumns.includes("status") && (
                          <TableCell className="px-4 py-3">
                            <Badge
                              className={`inline-flex  items-center gap-1 ${getStatusColor(
                                entry.status
                              )} px-2 py-1 rounded-full text-xs`}
                            >
                              {getStatusIcon(entry.status)}
                              {entry.status}
                            </Badge>
                          </TableCell>
                        )}

                        {selectedColumns.includes("recovery_method") && (
                          <TableCell className="px-4 py-3 text-gray-700">
                            {entry.recovery_method}
                          </TableCell>
                        )}

                        {selectedColumns.includes("file_size") && (
                          <TableCell className="px-4 py-3 text-gray-700 hidden">
                            {(entry.file_size / 1024).toFixed(2)} MB
                          </TableCell>
                        )}

                        {selectedColumns.includes("created_at") && (
                          <TableCell className="px-4 py-3 text-gray-700">
                            {new Date(entry.created_at).toLocaleString()}
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
              <Text text={recoveryListTexts.noRecoveryFound} />
              <p className="mt-2 text-gray-600">
                <Text text={recoveryListTexts.tryAdjustingSearch} />
              </p>
            </div>
          ) : (
            <NoRecoveryFound activeTab={activeTab} isDevice={false} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RecoveryListComponent;
