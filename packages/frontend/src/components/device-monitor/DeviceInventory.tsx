"use client";
import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CheckCircle,
  XCircle,
  Shield,
  Clock,
  List,
  Package,
  Search,
  X,
  SlidersHorizontal,
} from "lucide-react";
import LoadingIndicator from "@/components/common/LoadingIndicator";
import ErrorMessage from "@/components/common/ErrorMessage";
import Text from "@/components/text/Text";
import { getDeviceInventory } from "@/lib/deviceInventory";
import { ITEMS_PER_PAGE } from "@/constants/common";
import { Input } from "@/components/ui/input";
import NoApplicationsFound from "@/components/common/NoApplicationsFound";
import { deviceInventoryTexts } from "@/texts/device/device-inventory";
import { deviceListTexts } from "@/texts/device/device-list";
import { commonTexts } from "@/texts/common/common";
import Pagination from "../common/Pagination";
import ColumnsConfigModel from "../common/ColumnConfigModal";

interface DeviceInventoryPageProps {
  deviceId: string;
  token: string;
}

const ALL_STATUSES = "all_statuses";

const DeviceInventoryPage = ({ deviceId, token }: DeviceInventoryPageProps) => {
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [showModal, setShowModal] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [filterStatus, setFilterStatus] = useState(ALL_STATUSES);
  const [initialTotalCount, setInitialTotalCount] = useState(0);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([
    "name",
    "version",
    "publisher",
    "status",
  ]);

  const defaultColumns = [
    { value: "name", label: "Application Name" },
    { value: "version", label: "Version" },
    { value: "publisher", label: "Publisher" },
    { value: "status", label: "Status" },
  ];

  const tabConfig = [
    { value: "all", label: "All", icon: List },
    { value: "pending", label: "Pending", icon: Clock },
    { value: "approved", label: "Approved", icon: CheckCircle },
    { value: "denied", label: "Rejected", icon: XCircle },
  ];

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const {
    data: inventory,
    isLoading,
    isError,
  } = useQuery({
    queryKey: [
      "inventory",
      deviceId,
      currentPage,
      debouncedSearchTerm,
      filterStatus,
    ],
    queryFn: async () => {
      const result = await getDeviceInventory(
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

  const filteredInventory = useMemo(() => {
    const inventories = Array.isArray(inventory?.inventory)
      ? inventory.inventory
      : [];

    return inventories?.filter((item) => {
      const matchesSearchTerm = item.application?.name
        ?.toLowerCase()
        .includes(debouncedSearchTerm.toLowerCase());

      const matchesStatus =
        filterStatus === ALL_STATUSES || item.status === filterStatus;

      return matchesSearchTerm && matchesStatus;
    });
  }, [inventory?.inventory, debouncedSearchTerm, filterStatus]);

  const totalPages = Math.ceil((inventory?.total || 0) / ITEMS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "denied":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <Shield className="w-5 h-5 text-gray-500" />;
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleColumnSelect = (columns: string[]) => {
    setSelectedColumns(columns);
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <Text text={deviceInventoryTexts.loadingApplications} />
        <LoadingIndicator />
      </div>
    );
  }

  return (
    <div className="mt-4 sm:mt-4 px-2 sm:px-4 md:px-8">
      <h2 className="flex items-center gap-2 text-xl font-bold text-gray-800 mb-4">
        <Package className="w-6 h-6" />
        <Text text={deviceListTexts.deviceApplicationInventory} />
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
            message={deviceInventoryTexts.applicationLoadErrorDescription}
            heading={deviceInventoryTexts.applicationLoadError}
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

                <div className="mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                  <div className="relative flex-grow">
                    <Input
                      type="text"
                      placeholder="Search by application name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-gray-300 rounded-md focus:outline-none !focus:ring-2 !focus:ring-red-500 !focus:border-red-500 transition duration-150 ease-in-out"
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

                  <button
                    onClick={() => setShowModal(true)}
                    className="flex h-10 items-center  rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1"
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
              </>
            )}
            <TabsContent value={activeTab} className="mt-6">
              {filteredInventory?.length > 0 ? (
                <>
                  <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          {selectedColumns.includes("name") && (
                            <TableHead className="px-2 py-2 font-medium text-gray-700 text-left">
                              <Text
                                text={deviceInventoryTexts.applicationName}
                              />
                            </TableHead>
                          )}
                          {selectedColumns.includes("version") && (
                            <TableHead className="px-2 py-2 font-medium text-gray-700 text-left">
                              <Text
                                text={deviceInventoryTexts.applicationVersion}
                              />
                            </TableHead>
                          )}
                          {selectedColumns.includes("publisher") && (
                            <TableHead className="px-4 py-3 font-semibold text-gray-700 text-left">
                              <Text
                                text={deviceInventoryTexts.applicationPublisher}
                              />
                            </TableHead>
                          )}
                          {selectedColumns.includes("status") && (
                            <TableHead className="px-2 py-2 font-medium text-gray-700 text-left sticky right-0 bg-gray-50">
                              <Text
                                text={deviceInventoryTexts.applicationStatus}
                              />
                            </TableHead>
                          )}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredInventory.map((item) => (
                          <TableRow
                            key={item.id}
                            className="hover:bg-gray-50 transition-colors duration-150"
                          >
                            {selectedColumns.includes("name") && (
                              <TableCell className="px-4 py-3 font-medium text-gray-900">
                                {item.application?.name}
                              </TableCell>
                            )}

                            {selectedColumns.includes("version") && (
                              <TableCell className="px-4 py-3 text-gray-700">
                                {item.application?.version}
                              </TableCell>
                            )}
                            {selectedColumns.includes("publisher") && (
                              <TableCell className="px-4 py-3 text-gray-700">
                                {item.application?.publisher}
                              </TableCell>
                            )}
                            {selectedColumns.includes("status") && (
                              <TableCell className="sticky right-0 bg-white">
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                            ${
                              item.status === "approved"
                                ? "bg-green-100 text-green-800"
                                : item.status === "denied"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                                >
                                  {getStatusIcon(item.status)}
                                  <span className="ml-1">
                                    {" "}
                                    {item.status === "denied"
                                      ? "Rejected"
                                      : item.status}
                                  </span>
                                </span>
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
                  <Text
                    text={deviceInventoryTexts.applicationSearchNoResults}
                  />
                  <p className="mt-2 text-gray-600">
                    <Text
                      text={
                        deviceInventoryTexts.applicationSearchNoResultTryAdjusting
                      }
                    />
                  </p>
                </div>
              ) : (
                <NoApplicationsFound activeTab={activeTab} />
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default DeviceInventoryPage;
