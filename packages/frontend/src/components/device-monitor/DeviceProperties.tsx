import { Settings, Cpu, HardDrive, Database } from "lucide-react";
import Text from "@/components/text/Text";
import { deviceListTexts } from "@/texts/device/device-list";

interface PropertyItemProps {
  label: string;
  value: string;
  icon: JSX.Element;
  progress: number | null;
}

const PropertyItem = ({ label, value, icon, progress }: PropertyItemProps) => (
  <div className="flex flex-col py-4 border-b border-gray-200 last:border-b-0">
    <div className="flex justify-between items-center">
      <span className="text-sm font-medium text-gray-600 flex items-center gap-2">
        {icon}
        {label}
      </span>
      <span className="text-sm text-gray-800 font-semibold">{value}%</span>
    </div>
    {/* Only show the progress bar if progress is a valid number between 0 and 100 */}
    {progress !== null && progress >= 0 && progress <= 100 && (
      <div className="w-full mt-2 bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full bg-${
            progress > 90 ? "red" : progress > 70 ? "yellow" : "green"
          }-500`}
          style={{ width: `${progress}%` }}
        />
      </div>
    )}
  </div>
);

interface DevicePropertiesProps {
  properties: { [key: string]: any };
}

const labelMapping: { [key: string]: string } = {
  cpu: "CPU Usage",
  memory: "Memory Usage",
  disk: "Disk Usage",
};

const iconMapping: { [key: string]: JSX.Element } = {
  cpu: <Cpu className="w-5 h-5 text-gray-600" />,
  memory: <Database className="w-5 h-5 text-gray-600" />,
  disk: <HardDrive className="w-5 h-5 text-gray-600" />,
};

const DeviceProperties = ({ properties }: DevicePropertiesProps) => {
  if (!properties || Object.keys(properties).length === 0) {
    return null;
  }

  return (
    <div className="mt-4">
      <h4 className="text-md font-semibold text-gray-800 flex items-center gap-2 mb-3">
        <Settings className="w-5 h-5 text-memcryptRed" />
        <Text text={deviceListTexts.deviceProperties} />
      </h4>
      <div className="bg-gray-50 p-4 rounded-md shadow-sm">
        {Object.entries(properties)
          .filter(([key]) => ["cpu", "memory", "disk"].includes(key))
          .map(([key, value]) => {
            const label =
              labelMapping[key] || key.replace(/_/g, " ").replace(/-/g, " ");
            const icon = iconMapping[key];
            const progress =
              typeof value === "number" && value >= 0 && value <= 100
                ? value
                : null;

            return (
              <PropertyItem
                key={key}
                label={label}
                value={String(value)}
                icon={icon}
                progress={progress}
              />
            );
          })}
      </div>
    </div>
  );
};

export default DeviceProperties;
