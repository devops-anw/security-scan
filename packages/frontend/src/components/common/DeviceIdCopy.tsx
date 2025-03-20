"use client";

import { CheckCircle, Copy } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";

interface DeviceIdCopyProps {
  id: string;
  disabled?: boolean;
}

const DeviceIdCopy = ({ id, disabled = true }: DeviceIdCopyProps) => {
  const [copied, setCopied] = useState(false);

  const copyDeviceId = () => {
    navigator.clipboard.writeText(id);
    setCopied(true);
  };

  return (
    <div className="flex items-center space-x-2">
      <input
        type="text"
        value={id}
        readOnly
        disabled={disabled}
        className="flex-grow bg-gray-100 text-gray-800 text-sm rounded-md px-2 py-1"
      />
      <Button
        type="button"
        variant="ghost"
        onClick={copyDeviceId}
        className="p-1"
      >
        {copied ? (
          <CheckCircle className="h-4 w-4 text-green-500" />
        ) : (
          <Copy className="h-4 w-4 text-gray-500" />
        )}
      </Button>
    </div>
  );
};

export default DeviceIdCopy;
