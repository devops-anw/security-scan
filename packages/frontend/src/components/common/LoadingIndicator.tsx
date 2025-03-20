interface LoadingIndicatorProps {
  size?: "small" | "default";
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  size = "default",
}) => {
  const spinnerSize =
    size === "small" ? "w-4 h-4 border-2" : "w-16 h-16 border-4";
  const marginTopClass = size === "small" ? "" : "mt-4";

  return (
    <div className="flex items-center justify-center h-full">
      <div
        data-testid="loading-spinner"
        className={`${spinnerSize} ${marginTopClass} border-t-4 border-t-[#C02427] border-gray-300 rounded-full animate-spin`}
      ></div>
    </div>
  );
};

export default LoadingIndicator;
