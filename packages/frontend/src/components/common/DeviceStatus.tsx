interface StatusProps {
  status: string;
  size?: "small" | "normal";
}

const DeviceStatus = ({ status, size = "normal" }: StatusProps) => {
  const getStatusClasses = (status: string) => {
    switch (status) {
      case "ONLINE":
        return "bg-green-500 border-green-500 text-white";
      case "OFFLINE":
        return "bg-gray-500 border-gray-500 text-white";
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
      {String(status).replace("_", " ").toUpperCase()}
    </div>
  );
};

export default DeviceStatus;
