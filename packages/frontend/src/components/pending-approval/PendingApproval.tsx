"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTrigger,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "../ui/button";
import { UserWithOrg } from "@/types/keycloak";
import LoadingIndicator from "../common/LoadingIndicator";
import apiClient from "@/utils/apiClient";
import NoUsersFound from "../common/NoUsersFound";
import { usePendingUsers } from "@/hooks/usePendingUsers";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthSession } from "@/hooks/useAuthSession";
import ErrorMessage from "../common/ErrorMessage";
import {
  CheckCircle,
  Search,
  X,
  XCircle,
  SlidersHorizontal,
} from "lucide-react";
import { pendingApprovalTexts } from "@/texts/user/pending-approval";
import Text from "@/components/text/Text";
import { userProfileTexts } from "@/texts/user/users-profile";
import { commonTexts } from "@/texts/common/common";
import { Input } from "../ui/input";
import { deviceListTexts } from "@/texts/device/device-list";
import { ITEMS_PER_PAGE } from "@/constants/common";
import Pagination from "../common/Pagination";
import ColumnsConfigModel from "../common/ColumnConfigModal";

export const PendingApproval = () => {
  const router = useRouter();
  const { isAuthenticated, type } = useAuthSession();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([
    "name",
    "firstName",
    "lastName",
    "userId",
    "email",
    "actions",
  ]);
  const [showModal, setShowModal] = useState(false);
  const defaultColumns = [
    { value: "name", label: "Organization" },
    { value: "firstName", label: "First Name" },
    { value: "lastName", label: "Last Name" },
    { value: "userId", label: "User Id" },
    { value: "email", label: "Email ID" },
    { value: "actions", label: "Actions" },
  ];

  useEffect(() => {
    if (isAuthenticated && type !== "Platform Admin") {
      router.push("/login");
    }
  }, [isAuthenticated, router, type]);

  const queryClient = useQueryClient();

  // Fetch pending users
  const { data: pendingUsers, isLoading, isError } = usePendingUsers();

  // Mutation for approving a user
  const approveUser = useMutation({
    mutationFn: async (userId: string) => {
      await apiClient.post(`/users/${userId}/approve`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["users", "pending"], // Specify the query key to invalidate
      });
    },
  });

  // Mutation for rejecting a user
  const rejectUser = useMutation({
    mutationFn: async (userId: string) => {
      await apiClient.post(`/users/${userId}/reject`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["users", "pending"], // Specify the query key to invalidate
      });
    },
  });

  const filteredUsers = useMemo(() => {
    if (!pendingUsers) return [];

    return pendingUsers.filter(
      (user: UserWithOrg) =>
        user.organization?.name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [pendingUsers, searchTerm]);

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
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleColumnSelect = (columns: string[]) => {
    setSelectedColumns(columns);
  };

  if (isLoading)
    return (
      <div className="text-center py-4">
        <LoadingIndicator />
      </div>
    );

  return (
    <div className="mt-4 sm:mt-8 px-2 sm:px-4 md:px-8">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        <Text text={pendingApprovalTexts.title} />
      </h2>
      {pendingUsers && pendingUsers.length > 0 && (
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
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700  lg:left-[22rem]"
                aria-label="Clear search"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
          <div className="flex  space-x-2 ">
            {" "}
            <button
              onClick={() => setShowModal(true)}
              className="flex h-10 w-full items-center  rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1"
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
          heading={pendingApprovalTexts.errorHeading}
          message={pendingApprovalTexts.errorMessage}
        />
      ) : paginatedUsers.length > 0 ? (
        <>
          <div className="w-full overflow-x-auto shadow-md sm:rounded-lg">
            <Table className="min-w-full bg-white">
              <TableHeader className="bg-gray-100 border-b">
                <TableRow>
                  {selectedColumns.includes("name") && (
                    <TableHead className="px-2 py-2 font-medium text-gray-700 text-left sm:table-cell">
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
                    <TableHead className="px-2 py-2 font-medium text-gray-700 text-left hidden sm:table-cell">
                      <Text text={pendingApprovalTexts.tableUserId} />
                    </TableHead>
                  )}
                  {selectedColumns.includes("email") && (
                    <TableHead className="px-2 py-2 font-medium text-gray-700 text-left sm:table-cell">
                      <Text text={userProfileTexts.email} />
                    </TableHead>
                  )}

                  {selectedColumns.includes("actions") && (
                    <TableHead className="px-2 py-2 font-medium text-gray-700 text-left sticky right-0 bg-gray-100">
                      <Text text={pendingApprovalTexts.tableActions} />
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedUsers.map((user: UserWithOrg) => (
                  <TableRow key={user.id} className="hover:bg-gray-50">
                    {selectedColumns.includes("name") && (
                      <TableCell className="px-2 py-2 text-gray-800 md:table-cell">
                        {user.organization?.name || "N/A"}
                      </TableCell>
                    )}
                    {selectedColumns.includes("firstName") && (
                      <TableCell className="px-2 py-2 text-gray-800 hidden md:table-cell">
                        {user.firstName}
                      </TableCell>
                    )}
                    {selectedColumns.includes("lastName") && (
                      <TableCell className="px-2 py-2 text-gray-800 hidden md:table-cell">
                        {user.lastName}
                      </TableCell>
                    )}

                    <TableCell className="px-2 py-2 text-gray-800 sm:table-cell md:hidden">
                      {user.firstName} {user.lastName}
                    </TableCell>

                    {selectedColumns.includes("userId") && (
                      <TableCell className="px-2 py-2 text-gray-800 hidden md:table-cell">
                        {user.username}
                      </TableCell>
                    )}
                    {selectedColumns.includes("email") && (
                      <TableCell className="px-2 py-2 text-gray-800 md:table-cell">
                        {user.email}
                      </TableCell>
                    )}
                    {selectedColumns.includes("actions") && (
                      <TableCell className="px-2 py-2 text-gray-800 sticky right-0 bg-white">
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
                              <div className="flex flex-col items-center justify-center h-full">
                                <AlertDialogTitle className="sr-only">
                                  Approve
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-center mb-4">
                                  <Text
                                    text={pendingApprovalTexts.confirmApprove}
                                  />
                                </AlertDialogDescription>
                                <div className="flex justify-center space-x-2">
                                  <AlertDialogCancel className="bg-white hover:bg-gray-200 text-gray-700 py-1 px-4 rounded text-sm">
                                    <Text text={commonTexts.cancel} />
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-green-600 hover:bg-green-700 text-white py-1 px-4 rounded text-sm"
                                    onClick={() => approveUser.mutate(user.id)}
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
                                <Text text={commonTexts.reject} />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="w-full max-w-sm mx-auto bg-gray-100 p-4 rounded-md">
                              <AlertDialogTitle className="sr-only">
                                Reject
                              </AlertDialogTitle>
                              <div className="flex flex-col items-center justify-center h-full">
                                <AlertDialogDescription className="text-center mb-4">
                                  <Text
                                    text={pendingApprovalTexts.confirmReject}
                                  />
                                </AlertDialogDescription>
                                <div className="flex justify-center space-x-2">
                                  <AlertDialogCancel className="bg-white hover:bg-gray-200 text-gray-700 py-1 px-4 rounded text-sm">
                                    <Text text={commonTexts.cancel} />
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-red-600 hover:bg-red-700 text-white py-1 px-4 rounded text-sm"
                                    onClick={() => rejectUser.mutate(user.id)}
                                  >
                                    <Text text={commonTexts.reject} />
                                  </AlertDialogAction>
                                </div>
                              </div>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
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
            <Text text={pendingApprovalTexts.noUsersFoundHeading} />
            <p className="mt-2">
              {" "}
              <Text text={deviceListTexts.deviceSearchNoResultTryAdjusting} />
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-4">
          <div className="text-lg text-gray-600">
            <NoUsersFound
              heading={pendingApprovalTexts.noUsersFoundHeading}
              message={pendingApprovalTexts.noUsersFoundMessage}
            />
          </div>
        </div>
      )}
    </div>
  );
};
