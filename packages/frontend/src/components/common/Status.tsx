interface StatusProps {
  status: "approved" | "pending" | "rejected";
  size?: "small" | "normal";
}

const Status = ({ status, size = "normal" }: StatusProps) => {
  const getStatusClasses = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-500 border-green-500 text-white";
      case "pending":
        return "bg-yellow-500 border-yellow-500 text-white";
      case "rejected":
        return "bg-red-500 border-red-500 text-white";
      default:
        return "bg-gray-500 border-gray-500 text-white";
    }
  };

  const baseClasses = "border rounded-full inline-block font-medium";
  const sizeClasses =
    size === "small" ? "px-2 py-1 text-xs" : "px-3 py-1.5 text-sm";
  const statusClasses = getStatusClasses(status);
  return (
    <div className={`${baseClasses} ${sizeClasses} ${statusClasses}`}>
      {String(status).charAt(0).toUpperCase() + String(status).slice(1)}
    </div>
  );
};

export default Status;
