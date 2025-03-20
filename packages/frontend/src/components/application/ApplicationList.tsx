"use client";
import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  XCircle,
  Shield,
  Search,
  List,
  Clock,
  X,
  SlidersHorizontal,
} from "lucide-react";
import LoadingIndicator from "@/components/common/LoadingIndicator";
import Text from "@/components/text/Text";
import logger from "@/utils/logger";
import { Input } from "@/components/ui/input";
import NoApplicationsFound from "../common/NoApplicationsFound";
import { deviceInventoryTexts } from "@/texts/device/device-inventory";
import {
  approveApplication,
  bulkApproveApplications,
  bulkRejectApplications,
  getApplications,
  rejectApplication,
} from "@/lib/application";
import { useAuthSession } from "@/hooks/useAuthSession";
import { ApplicationResponse } from "@/types/device-monitor";
import { applicationTexts } from "@/texts/application/application";
import { TranslationOrNode } from "@/utils/translation";
import ErrorMessage from "../common/ErrorMessage";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTrigger,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { commonTexts } from "@/texts/common/common";
import { ITEMS_PER_PAGE } from "@/constants/common";
import Pagination from "../common/Pagination";
import ColumnsConfigModel from "../common/ColumnConfigModal";

const ALL_STATUSES = "all_statuses";

const ApplicationList = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState<
    string | null | TranslationOrNode
  >(null);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [initialTotalCount, setInitialTotalCount] = useState(0);
  const [filterStatus, setFilterStatus] = useState(ALL_STATUSES);
  const queryClient = useQueryClient();
  const { user } = useAuthSession();
  const orgId = user.tenantId;
  const [selectedColumns, setSelectedColumns] = useState<string[]>([
    "name",
    "version",
    "publisher",
    "status",
    "actions",
  ]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [selectAllOnPage, setSelectAllOnPage] = useState(false);
  const [selectAllAcrossPages, setSelectAllAcrossPages] = useState(false);
  const [totalPendingCount, setTotalPendingCount] = useState(0);
  const [allPendingApplicationIds, setAllPendingApplicationIds] = useState<
    string[]
  >([]);

  const [showModal, setShowModal] = useState(false);
  const [dialogOpenApprove, setDialogOpenApprove] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dialogOpenReject, setDialogOpenReject] = useState(false);
  const defaultColumns = [
    { value: "name", label: "Application Name" },
    { value: "version", label: "Version" },
    { value: "publisher", label: "Publisher" },
    { value: "status", label: "Status" },
    { value: "actions", label: "Actions" },
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
    data: applicationList,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: [
      "applications",
      orgId,
      currentPage,
      debouncedSearchTerm,
      filterStatus,
    ],
    queryFn: async () => {
      const result = await getApplications(
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
    enabled: !!orgId,
  });

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const allApplicationsData = await getApplications();
        const pendingApplications = allApplicationsData.applications.filter(
          (item) => item.status === "pending"
        );
        setTotalPendingCount(pendingApplications.length);
        setAllPendingApplicationIds(pendingApplications.map((app) => app.id));
      } catch (error) {
        console.error("Failed to fetch applications", error);
      }
    };

    fetchApplications();
  }, [applicationList]);

  const approveMutation = useMutation<void, Error, string>({
    mutationFn: (applicationId) => approveApplication(applicationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications", orgId] });
      setErrorMessage(null);
    },
    onError: (error) => {
      logger.error("Failed to approve application", error);
      setErrorMessage(applicationTexts.approveApplicationError);
    },
  });

  const rejectMutation = useMutation<void, Error, string>({
    mutationFn: (applicationId) => rejectApplication(applicationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications", orgId] });
    },
    onError: (error) => {
      logger.error("Failed to reject application", error);
      setErrorMessage(applicationTexts.rejectApplicationError);
    },
  });

  const filteredApplications = useMemo(() => {
    const appList = Array.isArray(applicationList?.applications)
      ? applicationList.applications
      : [];
    return appList?.filter(
      (item) =>
        (activeTab === "all" || item.status === activeTab) &&
        item?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [applicationList?.applications, activeTab, searchTerm]);

  const hasPendingApplications = useMemo(() => {
    const appList = Array.isArray(applicationList?.applications)
      ? applicationList.applications
      : [];
    return appList.some(
      (item: ApplicationResponse) => item.status === "pending"
    );
  }, [applicationList]);

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

  const handleBulkAction = async (
    action: "approve" | "reject",
    applicationIds: string[]
  ) => {
    try {
      if (applicationIds.length > 0) {
        if (action === "approve") {
          await bulkApproveApplications(applicationIds);
        } else if (action === "reject") {
          await bulkRejectApplications(applicationIds);
        }
        queryClient.invalidateQueries({ queryKey: ["applications", orgId] });
      }
    } catch (error) {
      logger.error(`Failed to bulk ${action} applications`, error);
      setErrorMessage(
        action === "approve"
          ? applicationTexts.bulkApproveApplicationsError
          : applicationTexts.bulkRejectApplicationsError
      );
    }
  };

  const handleApproveAll = async () => {
    setLoading(true);
    try {
      const selectedPendingApplicationIds = selectedItems.length
        ? selectedItems.filter((id) => allPendingApplicationIds.includes(id))
        : allPendingApplicationIds;

      await handleBulkAction("approve", selectedPendingApplicationIds);

      setSelectAllAcrossPages(false);
      setSelectAllOnPage(false);
      setSelectedItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectAll = async () => {
    setLoading(true);
    try {
      const selectedPendingApplicationIds = selectedItems.length
        ? selectedItems.filter((id) => allPendingApplicationIds.includes(id))
        : allPendingApplicationIds;

      await handleBulkAction("reject", selectedPendingApplicationIds);

      setSelectAllAcrossPages(false);
      setSelectAllOnPage(false);
      setSelectedItems([]);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil((applicationList?.total || 0) / ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleColumnSelect = (columns: string[]) => {
    setSelectedColumns(columns);
  };

  const handleCheckboxChange = (itemId: string) => {
    setSelectedItems((prevSelectedItems) => {
      if (prevSelectedItems.includes(itemId)) {
        return prevSelectedItems.filter((id) => id !== itemId);
      } else {
        return [...prevSelectedItems, itemId];
      }
    });
  };

  const handleHeaderCheckboxChange = () => {
    if (selectAllAcrossPages) {
      setSelectAllAcrossPages(false);
      setSelectedItems([]);
    } else {
      const currentPageIds = filteredApplications
        .filter((item) => item.status === "pending")
        .map((item) => item.id);

      if (selectAllOnPage) {
        setSelectedItems((prevSelectedItems) =>
          prevSelectedItems.filter((id) => !currentPageIds.includes(id))
        );
        setSelectAllOnPage(false);
      } else {
        setSelectedItems((prevSelectedItems) => [
          ...prevSelectedItems,
          ...currentPageIds.filter((id) => !prevSelectedItems.includes(id)),
        ]);
        setSelectAllOnPage(true);
      }
    }
  };

  const handleSelectAllAcrossPages = () => {
    setSelectAllAcrossPages(!selectAllAcrossPages);
    if (!selectAllAcrossPages) {
      setSelectedItems(allPendingApplicationIds || []);
    } else {
      setSelectedItems([]);
    }
  };

  if (isLoading) return <LoadingIndicator />;
  if (isError) {
    if (error.message.includes("No application found")) {
      return <NoApplicationsFound activeTab={activeTab} />;
    } else {
      <div className="mt-4">
        <ErrorMessage
          message={errorMessage}
          heading={applicationTexts.applicationActionError}
        />
      </div>;
    }
  }

  return (
    <div className="mt-4 sm:mt-8 px-2 sm:px-4 md:px-8">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        <Text text={applicationTexts.title}> </Text>
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

      <Tabs
        value={activeTab}
        onValueChange={(value) => {
          setActiveTab(value);
          setFilterStatus(value === "all" ? ALL_STATUSES : value);
          setCurrentPage(1);
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

              {(activeTab === "all" || activeTab === "pending") &&
                hasPendingApplications &&
                filteredApplications.length > 0 && (
                  <div className="flex space-x-3">
                    <AlertDialog
                      open={dialogOpenApprove}
                      onOpenChange={(open) =>
                        !loading && setDialogOpenApprove(open)
                      }
                    >
                      <AlertDialogTrigger asChild>
                        <Button
                          className="bg-green-600 hover:bg-green-700 text-white transition-colors duration-150 px-3 py-1 rounded-md text-sm flex items-center"
                          size="sm"
                          disabled={loading}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          <Text text={applicationTexts.approveAll} />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="w-full max-w-sm mx-auto bg-gray-100 p-4 rounded-md">
                        <div className="flex flex-col items-center justify-center h-full">
                          <AlertDialogDescription className="text-center mb-4">
                            <Text
                              text={
                                selectedItems.length === 0 ||
                                selectedItems.length === totalPendingCount
                                  ? applicationTexts.approveAllConfirmation
                                  : applicationTexts.approveSelectedConfirmation
                              }
                            />
                          </AlertDialogDescription>
                          <div className="flex justify-center space-x-2">
                            <AlertDialogCancel
                              disabled={loading}
                              className="bg-white hover:bg-gray-200 text-gray-700 py-1 px-4 rounded text-sm"
                            >
                              <Text text={commonTexts.cancel} />
                            </AlertDialogCancel>
                            <button
                              className={`${
                                loading
                                  ? "bg-gray-400 cursor-not-allowed"
                                  : "bg-green-600 hover:bg-green-700"
                              } text-white py-1 px-4 rounded text-sm flex items-center`}
                              disabled={loading}
                              onClick={async () => {
                                setLoading(true);
                                await handleApproveAll();
                                setLoading(false);
                                setDialogOpenApprove(false);
                              }}
                            >
                              {loading ? (
                                <>
                                  <LoadingIndicator size="small" />
                                  <span className="ml-2">Processing...</span>
                                </>
                              ) : (
                                <Text text={commonTexts.approve} />
                              )}
                            </button>
                          </div>
                        </div>
                      </AlertDialogContent>
                    </AlertDialog>

                    <AlertDialog
                      open={dialogOpenReject}
                      onOpenChange={(open) =>
                        !loading && setDialogOpenReject(open)
                      }
                    >
                      <AlertDialogTrigger asChild>
                        <Button
                          className="bg-red-100 text-red-600 hover:bg-red-200 hover:text-red-700 transition-colors duration-150 px-3 py-1 rounded-md text-sm flex items-center"
                          size="sm"
                          disabled={loading}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          <Text text={applicationTexts.rejectAll} />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="w-full max-w-sm mx-auto bg-gray-100 p-4 rounded-md">
                        <div className="flex flex-col items-center justify-center h-full">
                          <AlertDialogDescription className="text-center mb-4">
                            <Text
                              text={
                                selectedItems.length === 0 ||
                                selectedItems.length === totalPendingCount
                                  ? applicationTexts.rejectAllConfirmation
                                  : applicationTexts.rejectSelectedConfirmation
                              }
                            />
                          </AlertDialogDescription>
                          <div className="flex justify-center space-x-2">
                            <AlertDialogCancel
                              disabled={loading}
                              className="bg-white hover:bg-gray-200 text-gray-700 py-1 px-4 rounded text-sm"
                            >
                              <Text text={commonTexts.cancel} />
                            </AlertDialogCancel>
                            <button
                              className={`${
                                loading
                                  ? "bg-gray-400 cursor-not-allowed"
                                  : "bg-red-500 hover:bg-red-600"
                              } text-white py-1 px-4 rounded text-sm flex items-center`}
                              disabled={loading}
                              onClick={async () => {
                                setLoading(true);
                                await handleRejectAll();
                                setLoading(false);
                                setDialogOpenReject(false);
                              }}
                            >
                              {loading ? (
                                <>
                                  <LoadingIndicator size="small" />
                                  <span className="ml-2">Processing...</span>
                                </>
                              ) : (
                                <Text text={applicationTexts.reject} />
                              )}
                            </button>
                          </div>
                        </div>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}

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
          {filteredApplications.length > 0 ? (
            <>
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="">
                  {!selectAllAcrossPages &&
                    selectedItems.length > 0 &&
                    selectAllOnPage &&
                    totalPendingCount > selectedItems.length && (
                      <div className="text-gray-700 m-4 text-center">
                        All{" "}
                        {
                          filteredApplications.filter(
                            (item) =>
                              item.status === "pending" &&
                              selectedItems.includes(item.id)
                          ).length
                        }{" "}
                        pending applications on this page are selected.
                        <button
                          onClick={handleSelectAllAcrossPages}
                          className="text-memcryptRed underline ml-2"
                        >
                          Select all {totalPendingCount} pending applications
                          across all pages.
                        </button>
                      </div>
                    )}
                  {selectAllAcrossPages && (
                    <div className="text-gray-700 m-4 text-center">
                      All {selectedItems.length} pending applications are
                      selected across all pages.
                    </div>
                  )}
                </div>

                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      {hasPendingApplications && (
                        <TableHead className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={
                              selectAllAcrossPages ||
                              (selectAllOnPage &&
                                selectedItems.length ===
                                  filteredApplications.filter(
                                    (item) => item.status === "pending"
                                  ).length)
                            }
                            onChange={handleHeaderCheckboxChange}
                            className="w-4 h-4 text-memcryptRed border-gray-300 rounded focus:ring-memcryptRed accent-memcryptRed"
                          />
                        </TableHead>
                      )}
                      {selectedColumns.includes("name") && (
                        <TableHead className="px-4 py-3 font-semibold text-gray-700 text-left">
                          <Text text={deviceInventoryTexts.applicationName} />
                        </TableHead>
                      )}

                      {selectedColumns.includes("version") && (
                        <TableHead className="px-4 py-3 font-semibold text-gray-700 text-left">
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
                        <TableHead
                          className={`px-4 py-3 font-semibold text-gray-700 text-left sticky  bg-gray-50 
                          }`}
                        >
                          <Text text={deviceInventoryTexts.applicationStatus} />
                        </TableHead>
                      )}

                      {selectedColumns.includes("actions") &&
                        (activeTab === "all" || activeTab === "pending") &&
                        hasPendingApplications && (
                          <TableHead className="px-4 py-3 font-semibold text-gray-700 text-left sticky right-0 bg-gray-50">
                            <Text
                              text={deviceInventoryTexts.applicationActions}
                            />
                          </TableHead>
                        )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredApplications.map((item) => (
                      <TableRow
                        key={item.id}
                        className={`transition-colors duration-150 ${
                          selectedItems.includes(item.id)
                            ? "bg-gray-50"
                            : "hover:bg-gray-50 "
                        }`}
                      >
                        {hasPendingApplications && (
                          <TableCell className="px-4 py-3">
                            {item.status === "pending" ? (
                              <input
                                type="checkbox"
                                checked={selectedItems.includes(item.id)}
                                onChange={() => handleCheckboxChange(item.id)}
                                className="w-4 h-4 text-memcryptRed border-gray-300 rounded focus:ring-memcryptRed accent-memcryptRed"
                              />
                            ) : (
                              <span>&nbsp;</span>
                            )}
                          </TableCell>
                        )}

                        {selectedColumns.includes("name") && (
                          <TableCell className="px-4 py-3 font-medium text-gray-900">
                            {item?.name}
                          </TableCell>
                        )}

                        {selectedColumns.includes("version") && (
                          <TableCell className="px-4 py-3 text-gray-700">
                            {item?.version}
                          </TableCell>
                        )}

                        {selectedColumns.includes("publisher") && (
                          <TableCell className="px-4 py-3 text-gray-700">
                            {item?.publisher}
                          </TableCell>
                        )}

                        {selectedColumns.includes("status") && (
                          <TableCell
                            className={`px-4 py-3 sticky  bg-white md:bg-transparent `}
                          >
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
                              <span className="ml-1 hidden sm:table-cell">
                                {item.status === "denied"
                                  ? "Rejected"
                                  : item.status}
                              </span>
                            </span>
                          </TableCell>
                        )}

                        {selectedColumns.includes("actions") &&
                          (activeTab === "all" || activeTab === "pending") &&
                          hasPendingApplications && (
                            <TableCell className="px-4 py-3 sticky right-0 bg-white md:bg-transparent">
                              {item.status === "pending" && (
                                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        className="bg-green-600 hover:bg-green-700 text-white transition-colors duration-150 px-3 py-1 rounded-md text-sm flex items-center"
                                        size="sm"
                                      >
                                        <CheckCircle className="w-4 h-4 mr-1" />
                                        <Text text={commonTexts.approve} />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="w-full max-w-sm mx-auto bg-gray-100 p-4 rounded-md">
                                      <AlertDialogTitle className="sr-only">
                                        Approve Application
                                      </AlertDialogTitle>
                                      <div className="flex flex-col items-center justify-center h-full">
                                        <AlertDialogDescription className="text-center mb-4">
                                          <Text
                                            text={
                                              applicationTexts.approveConfirmation
                                            }
                                          />
                                        </AlertDialogDescription>
                                        <div className="flex justify-center space-x-2">
                                          <AlertDialogCancel className="bg-white hover:bg-gray-200 text-gray-700 py-1 px-4 rounded text-sm">
                                            <Text text={commonTexts.cancel} />
                                          </AlertDialogCancel>
                                          <AlertDialogAction
                                            className="bg-green-600 hover:bg-green-700 text-white py-1 px-4 rounded text-sm"
                                            onClick={() =>
                                              approveMutation.mutate(item.id)
                                            }
                                          >
                                            <Text text={commonTexts.approve} />
                                          </AlertDialogAction>
                                        </div>
                                      </div>
                                    </AlertDialogContent>
                                  </AlertDialog>

                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        className="bg-red-100 text-red-600 hover:bg-red-200 hover:text-red-700 transition-colors duration-150 px-3 py-1 rounded-md text-sm flex items-center"
                                        size="sm"
                                      >
                                        <XCircle className="w-4 h-4 mr-1" />
                                        <Text text={applicationTexts.reject} />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="w-full max-w-sm mx-auto bg-gray-100 p-4 rounded-md">
                                      {/* Add AlertDialogTitle for accessibility */}
                                      <AlertDialogTitle className="sr-only">
                                        Reject Application
                                      </AlertDialogTitle>
                                      <div className="flex flex-col items-center justify-center h-full">
                                        <AlertDialogDescription className="text-center mb-4">
                                          <Text
                                            text={
                                              applicationTexts.rejectConfirmation
                                            }
                                          />
                                        </AlertDialogDescription>
                                        <div className="flex justify-center space-x-2">
                                          <AlertDialogCancel className="bg-white hover:bg-gray-200 text-gray-700 py-1 px-4 rounded text-sm">
                                            <Text text={commonTexts.cancel} />
                                          </AlertDialogCancel>
                                          <AlertDialogAction
                                            className="bg-red-500 hover:bg-red-600 text-white py-1 px-4 rounded text-sm"
                                            onClick={() =>
                                              rejectMutation.mutate(item.id)
                                            }
                                          >
                                            <Text
                                              text={applicationTexts.reject}
                                            />
                                          </AlertDialogAction>
                                        </div>
                                      </div>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              )}
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
              <Text text={deviceInventoryTexts.applicationSearchNoResults} />
              <p className="mt-2 text-gray-600">
                <Text
                  text={
                    deviceInventoryTexts.applicationSearchNoResultTryAdjusting
                  }
                />
              </p>
            </div>
          ) : (
            <NoApplicationsFound activeTab={activeTab} isDevice={false} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ApplicationList;
