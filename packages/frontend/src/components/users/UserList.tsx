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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import LoadingIndicator from "../common/LoadingIndicator";
import apiClient from "@/utils/apiClient";
import { UserWithOrg } from "@/types/keycloak";
import NoUsersFound from "../common/NoUsersFound";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ITEMS_PER_PAGE, SUPER_FE_ADMIN_EMAIL } from "@/constants/common";
import Status from "../common/Status";
import { useAuthSession } from "@/hooks/useAuthSession";
import ErrorMessage from "../common/ErrorMessage";
import Text from "@/components/text/Text";
import { userListTexts } from "@/texts/user/users-list";
import { pendingApprovalTexts } from "@/texts/user/pending-approval";
import { userProfileTexts } from "@/texts/user/users-profile";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { Input } from "../ui/input";
import { deviceListTexts } from "@/texts/device/device-list";
import Pagination from "../common/Pagination";
import { recoveryListTexts } from "@/texts/recovery/recovery";
import ColumnsConfigModel from "../common/ColumnConfigModal";
import { commonTexts } from "@/texts/common/common";

const ALL_STATUSES = "statuses";
const statusOptions = ["Approved", "Pending", "Rejected"];

export const UserList = () => {
  const router = useRouter();
  const { isAuthenticated, type } = useAuthSession();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [filterStatus, setFilterStatus] = useState(ALL_STATUSES);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([
    "name",
    "firstName",
    "lastName",
    "userId",
    "email",
    "status",
  ]);
  const [showModal, setShowModal] = useState(false);
  const defaultColumns = [
    { value: "name", label: "Organization" },
    { value: "firstName", label: "First Name" },
    { value: "lastName", label: "Last Name" },
    { value: "userId", label: "User Id" },
    { value: "email", label: "Email ID" },
    { value: "status", label: "Status" },
  ];

  useEffect(() => {
    if (isAuthenticated && type !== "Platform Admin") {
      router.push("/login");
    }
  }, [isAuthenticated, router, type]);

  // Fetch all users
  const {
    data: usersData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["users", "all"],
    queryFn: async () => {
      const response = await apiClient.get("/users/");
      return response.data;
    },
  });

  const filteredUsers = useMemo(() => {
    if (!usersData?.data) return [];

    return usersData.data.filter((user: UserWithOrg) => {
      const matchesSearchTerm =
        user.organization?.name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        filterStatus === ALL_STATUSES ||
        (user.attributes?.status?.[0] || "Pending").toLowerCase() ===
          filterStatus.toLowerCase();

      return (
        user.email !== SUPER_FE_ADMIN_EMAIL &&
        matchesSearchTerm &&
        matchesStatus
      );
    });
  }, [usersData?.data, searchTerm, filterStatus]);

  useEffect(() => {
    setTotalCount(filteredUsers.length);
  }, [filteredUsers]);

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredUsers.slice(startIndex, endIndex);
  }, [filteredUsers, currentPage]);

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  if (isLoading) {
    return (
      <div className="text-center py-4">
        <LoadingIndicator />
      </div>
    );
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleColumnSelect = (columns: string[]) => {
    setSelectedColumns(columns);
  };

  return (
    <div className="mt-4 sm:mt-8 px-2 sm:px-4 md:px-8">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        <Text text={userListTexts.pageTitle} />
      </h2>

      {usersData && usersData?.data.length > 0 && (
        <div className="mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-grow">
            <Input
              type="text"
              placeholder="Search by organization name or email id..."
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

          <div className="flex space-x-2">
            <Select
              value={filterStatus}
              onValueChange={(value) => {
                setFilterStatus(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[180px]">
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
      )}

      {isError ? (
        <ErrorMessage
          heading={userListTexts.errorHeading}
          message={userListTexts.errorMessage}
        />
      ) : paginatedUsers.length > 0 ? (
        <>
          <div className="overflow-x-auto shadow-md sm:rounded-lg">
            <Table className="min-w-full bg-white">
              <TableHeader className="bg-gray-100 border-b">
                <TableRow>
                  {selectedColumns.includes("name") && (
                    <TableHead className="px-2 py-2 font-medium text-gray-700 text-left">
                      <Text text={userProfileTexts.organization} />
                    </TableHead>
                  )}
                  {selectedColumns.includes("firstName") && (
                    <TableHead className="px-2 py-2 font-medium text-gray-700 text-left hidden md:table-cell">
                      <Text text={userProfileTexts.firstName} />
                    </TableHead>
                  )}
                  {selectedColumns.includes("lastName") && (
                    <TableHead className="px-2 py-2 font-medium text-gray-700 text-left hidden md:table-cell">
                      <Text text={userProfileTexts.lastName} />
                    </TableHead>
                  )}

                  <TableHead className="px-2 py-2 font-medium text-gray-700 text-left sm:table-cell md:hidden">
                    <Text text={pendingApprovalTexts.tableName} />
                  </TableHead>

                  {selectedColumns.includes("userId") && (
                    <TableHead className="px-2 py-2 font-medium text-gray-700 hidden sm:table-cell text-left">
                      <Text text={pendingApprovalTexts.tableUserId} />
                    </TableHead>
                  )}
                  {selectedColumns.includes("email") && (
                    <TableHead className="px-2 py-2 font-medium text-gray-700 text-left sm:table-cell">
                      <Text text={userProfileTexts.email} />
                    </TableHead>
                  )}
                  {selectedColumns.includes("status") && (
                    <TableHead className="px-2 py-2 font-medium text-gray-700 text-left sticky right-0 bg-gray-100">
                      <Text text={userListTexts.tableStatus} />
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedUsers.map((user: UserWithOrg) => (
                  <TableRow key={user.id} className="hover:bg-gray-50">
                    {selectedColumns.includes("name") && (
                      <TableCell className="px-2 py-2 text-gray-800">
                        {user.organization?.name || "N/A"}
                      </TableCell>
                    )}
                    {selectedColumns.includes("firstName") && (
                      <TableCell className="word-break-breakWord px-2 py-2 text-gray-800 hidden md:table-cell">
                        {user.firstName}
                      </TableCell>
                    )}
                    {selectedColumns.includes("lastName") && (
                      <TableCell className="word-break-breakWord px-2 py-2 text-gray-800 hidden md:table-cell">
                        {user.lastName}
                      </TableCell>
                    )}

                    <TableCell className="px-2 py-2 text-gray-800 sm:table-cell md:hidden">
                      {user.firstName} {user.lastName}
                    </TableCell>

                    {selectedColumns.includes("userId") && (
                      <TableCell className="px-2 py-2 text-gray-800 hidden sm:table-cell">
                        {user.username}
                      </TableCell>
                    )}
                    {selectedColumns.includes("email") && (
                      <TableCell className="px-2 py-2 text-gray-800 sm:table-cell">
                        {user.email}
                      </TableCell>
                    )}
                    {selectedColumns.includes("status") && (
                      <TableCell className="px-2 py-2 text-gray-800 sticky right-0 bg-white">
                        <Status
                          status={user.attributes?.status[0] || "pending"}
                          size="small"
                        />
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
            <Text text={userListTexts.noUsersFoundHeading} />
            <p className="mt-2">
              <Text text={deviceListTexts.deviceSearchNoResultTryAdjusting} />
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-4">
          <NoUsersFound
            heading={userListTexts.noUsersFoundHeading}
            message={userListTexts.noUsersFoundMessage}
          />
        </div>
      )}
    </div>
  );
};
