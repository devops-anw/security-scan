export const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case "completed":
      return "bg-green-100 text-green-800 hover:bg-green-200";
    case "pending":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
    case "in progress":
      return "bg-blue-100 text-blue-800 hover:bg-blue-200";
    case "failed":
      return "bg-red-100 text-red-800 hover:bg-red-200";
    case "queued":
      return "bg-purple-100 text-purple-800 hover:bg-purple-200";
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-200";
  }
};

export const getSeverityColor = (severity: string) => {
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
};
