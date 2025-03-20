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
  CheckCircle,
  XCircle,
  Shield,
  Search,
  List,
  AlertCircle,
  RefreshCw,
  FileText,
  Clock,
  SlidersHorizontal,
  X,
} from "lucide-react";
import Text from "@/components/text/Text";
import { activityLogsTexts } from "@/texts/activity-logs/activity-logs";
import { useQuery } from "@tanstack/react-query";
import ErrorMessage from "../common/ErrorMessage";
import { TranslationOrNode } from "@/utils/translation";

import { recoveryListTexts } from "@/texts/recovery/recovery";
import { getDeviceRecoveryList } from "@/lib/fileRecovery";
import NoRecoveryFound from "../common/NoRecoveryFound";
import { commonTexts } from "@/texts/common/common";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { getStatusColor } from "@/utils/statusHelpers";
import { Badge } from "../ui/badge";
import { ITEMS_PER_PAGE } from "@/constants/common";
import Pagination from "../common/Pagination";
import ColumnsConfigModel from "../common/ColumnConfigModal";

interface DeviceRecoveryProps {
  deviceId: string;
  token: string;
}

const ALL_STATUSES = "all_statuses";

const statusOptions = [
  "Pending",
  "In Progress",
  "Completed",
  "Failed",
  "Queued",
];

const DeviceRecovery = ({ deviceId, token }: DeviceRecoveryProps) => {
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [errorMessage, setErrorMessage] = useState<
    string | null | TranslationOrNode
  >(null);
  const [filterStatus, setFilterStatus] = useState(ALL_STATUSES);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [initialTotalCount, setInitialTotalCount] = useState(0);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([
    "file_name",
    "status",
    "recovery_method",
    "created_at",
  ]);
  const [showModal, setShowModal] = useState(false);
  const defaultColumns = [
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
      value: "Pending",
      label: <Text text={recoveryListTexts.tabsPending} />,
      icon: Clock,
    },
    {
      value: "Progress",
      label: <Text text={recoveryListTexts.tabsInProgress} />,
      icon: RefreshCw,
    },
    {
      value: "Completed",
      label: <Text text={recoveryListTexts.tabsCompleted} />,
      icon: CheckCircle,
    },
    {
      value: "Failed",
      label: <Text text={recoveryListTexts.tabsFailed} />,
      icon: XCircle,
    },
    {
      value: "Queued",
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
      deviceId,
      currentPage,
      debouncedSearchTerm,
      filterStatus,
    ],
    queryFn: async () => {
      const result = await getDeviceRecoveryList(
        deviceId,
        (currentPage - 1) * ITEMS_PER_PAGE,
        ITEMS_PER_PAGE,
        debouncedSearchTerm,
        filterStatus === ALL_STATUSES ? undefined : filterStatus
      );
      setTotalCount(result.total);

      if (initialTotalCount === 0) {
        setInitialTotalCount(result.total);
      }
      return result;
    },
    enabled: !!deviceId && !!token,
    retry: false,
  });

  const filteredRecoveries = useMemo(() => {
    const lists = Array.isArray(recoveryList?.recoveries)
      ? recoveryList.recoveries
      : [];
    return lists?.filter((entry) => {
      const matchesSearchTerm = entry.file_name
        ?.toLowerCase()
        .includes(debouncedSearchTerm.toLowerCase());
      const matchesStatus =
        filterStatus === ALL_STATUSES ||
        (filterStatus === "Progress"
          ? entry.status === "In Progress"
          : entry.status === filterStatus);
      return matchesSearchTerm && matchesStatus;
    });
  }, [recoveryList?.recoveries, filterStatus, debouncedSearchTerm]);

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

  if (isError) {
    if (error.message.includes("No recovery lists found")) {
      return <NoRecoveryFound activeTab={activeTab} />;
    } else {
      <div className="mt-4">
        <ErrorMessage
          message={errorMessage}
          heading={recoveryListTexts.recoveryActionError}
        />
      </div>;
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleColumnSelect = (columns: string[]) => {
    setSelectedColumns(columns);
  };

  return (
    <div className="mt-4 sm:mt-4 px-2 sm:px-4 md:px-8">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        <Text text={recoveryListTexts.title} />
      </h2>

      {errorMessage && (
        <div className="mb-4">
          <div
            className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-sm"
            role="alert"
          >
            <Text text={errorMessage} />
          </div>
        </div>
      )}
      <div className="p-2">
        {isError ? (
          <ErrorMessage
            message={activityLogsTexts.activityLogsLoadErrorDescription}
            heading={activityLogsTexts.loadError}
          />
        ) : (
          <Tabs
            value={activeTab}
            onValueChange={(value) => {
              setActiveTab(value);
              setFilterStatus(value === "all" ? ALL_STATUSES : value);
              setCurrentPage(1);
              setSearchTerm("");
            }}
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
                      placeholder="Search by file name..."
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

                  <div className="flex space-x-2">
                    <div className="w-full sm:hidden">
                      <Select
                        value={filterStatus}
                        onValueChange={(value) => {
                          setFilterStatus(
                            value === "all" ? ALL_STATUSES : value
                          );
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
              {filteredRecoveries?.length > 0 ? (
                <>
                  <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
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
                              <Text
                                text={recoveryListTexts.tableRecoveryMethod}
                              />
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
                        {filteredRecoveries?.map((entry) => (
                          <TableRow
                            key={entry.id}
                            className="hover:bg-gray-50 transition-colors duration-150"
                          >
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
                <NoRecoveryFound activeTab={activeTab} />
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default DeviceRecovery;
