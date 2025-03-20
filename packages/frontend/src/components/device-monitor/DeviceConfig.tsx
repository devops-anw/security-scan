"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import LoadingIndicator from "@/components/common/LoadingIndicator";
import ErrorMessage from "@/components/common/ErrorMessage";
import MemCryptRedButton from "@/components/common/MemcryptRedButton";
import {
  getDeviceEndPointConfigDetails,
  updateDeviceEndPointConfig,
} from "@/lib/deviceEndPoint";
import { deviceConfigTexts } from "@/texts/device/device-config";
import logger from "@/utils/logger";
import { useAuthSession } from "@/hooks/useAuthSession";
import {
  BarChart,
  FileText,
  Key,
  Layers,
  Monitor,
  Settings,
  Shield,
} from "lucide-react";
import Text from "@/components/text/Text";
import { commonTexts } from "@/texts/common/common";
import { Button } from "@/components/ui/button";

const sectionIcons: { [key: string]: JSX.Element } = {
  MemcryptLog: <FileText className="w-5 h-5 text-memcryptRed" />,
  Analysis: <BarChart className="w-5 h-5 text-memcryptRed" />,
  Decryptor: <Key className="w-5 h-5 text-memcryptRed" />,
  Bands: <Layers className="w-5 h-5 text-memcryptRed" />,
  MonitorStatistics: <Monitor className="w-5 h-5 text-memcryptRed" />,
  Whitelist: <Shield className="w-5 h-5 text-memcryptRed" />,
  Extractor: <Settings className="w-5 h-5 text-memcryptRed" />,
};

interface Config {
  name: string;
  type: string;
  config: {
    [section: string]: {
      [key: string]: string;
    };
  };
}

interface Message {
  type: "success" | "error";
  content: string;
}

const DeviceConfig = ({ deviceId }: { deviceId: string }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [localConfig, setLocalConfig] = useState<Config | null>(null);
  const [message, setMessage] = useState<Message | null>(null);
  const { user } = useAuthSession();
  const queryClient = useQueryClient();

  const {
    data: config,
    isLoading,
    isError,
    error,
  } = useQuery<Config, Error>({
    queryKey: ["deviceConfig", deviceId],
    queryFn: () => getDeviceEndPointConfigDetails(deviceId),
    enabled: !!deviceId && !!user?.tenantId,
  });

  const updateConfigMutation = useMutation<void, Error, Config>({
    mutationFn: (updatedConfig) => {
      const orgId = user?.tenantId || "";
      return updateDeviceEndPointConfig(deviceId, updatedConfig);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deviceConfig", deviceId] });
      setIsEditing(false);
      setHasUnsavedChanges(false);
      setMessage({
        type: "success",
        content: deviceConfigTexts.updateSuccessMessage.defaultMessage,
      });
    },
    onError: (error) => {
      setMessage({
        type: "error",
        content: deviceConfigTexts.updateErrorMessage.defaultMessage,
      });
      logger.error("Failed to update configuration", error);
      console.error(error);
    },
  });

  const handleEdit = () => {
    setIsEditing(true);
    setLocalConfig(JSON.parse(JSON.stringify(config)));
  };

  const handleCancel = () => {
    if (localConfig) {
      queryClient.setQueryData<Config>(["deviceConfig", deviceId], localConfig);
    }
    setIsEditing(false);
    setHasUnsavedChanges(false);
    setMessage(null);
  };

  const handleSave = () => {
    if (config) {
      updateConfigMutation.mutate(config);
    }
  };

  const handleInputChange = (section: string, key: string, value: string) => {
    if (config) {
      const updatedConfig = {
        ...config,
        config: {
          ...config.config,
          [section]: {
            ...config.config[section],
            [key]: value,
          },
        },
      };
      queryClient.setQueryData<Config>(
        ["deviceConfig", deviceId],
        updatedConfig
      );
      setHasUnsavedChanges(true);
    }
  };

  if (isLoading) return <LoadingIndicator />;

  if (isError) {
    return (
      <div>
        <ErrorMessage
          heading={deviceConfigTexts.configError}
          message={deviceConfigTexts.errorMessage}
        />
      </div>
    );
  }

  if (!config) return null;

  return (
    <div className="mt-4 sm:mt-4 px-2 sm:px-4 md:px-8">
      <h2 className="text-xl font-bold flex items-center text-gray-800 gap-2">
        <Settings className="w-6 h-6" />
        <Text text={deviceConfigTexts.deviceConfiguration} />
      </h2>
      <div className="sm:max-w-[750px]  mt-4 rounded-lg shadow-md space-y-4 bg-white p-6">
        <h3 className="text-lg font-semibold text-memcryptRed">
          {config.name}
        </h3>
        <p className="text-sm text-gray-600">Type: {config.type}</p>
        {message && (
          <div
            className={`mt-2 p-2 rounded ${
              message.type === "success"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {message.content}
          </div>
        )}
        <Accordion type="single" collapsible className="w-full mt-4">
          {Object.entries(config.config).map(
            ([section, sectionConfig], index) => (
              <AccordionItem value={`item-${index}`} key={section}>
                <AccordionTrigger className="flex items-center">
                  {sectionIcons[section] || (
                    <Settings className="w-5 h-5 text-memcryptRed" />
                  )}
                  <span className="ml-2 text-gray-800">{section}</span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 pl-7">
                    {Object.entries(sectionConfig).map(([key, value]) => (
                      <div key={key} className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700">
                          {key}
                        </label>
                        <Input
                          value={value}
                          onChange={(e) =>
                            handleInputChange(section, key, e.target.value)
                          }
                          disabled={!isEditing}
                          className="mt-1 w-[98%]"
                        />
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )
          )}
        </Accordion>
        <div className="mt-6 flex justify-end space-x-2">
          {isEditing ? (
            <>
              <MemCryptRedButton
                onClick={handleSave}
                width="100px"
                disabled={updateConfigMutation.isPending || !hasUnsavedChanges}
              >
                {updateConfigMutation.isPending ? "Saving..." : "Save"}
              </MemCryptRedButton>
              <Button
                onClick={handleCancel}
                variant="outline"
                className="border-memcryptRed text-memcryptRed hover:bg-red-50 hover:text-memcryptRed"
              >
                <Text text={deviceConfigTexts.cancel} />
              </Button>
            </>
          ) : (
            <MemCryptRedButton onClick={handleEdit} width="100px">
              <Text text={commonTexts.edit} />
            </MemCryptRedButton>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeviceConfig;
