import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Copy, EyeIcon, EyeOffIcon } from "lucide-react";

interface OrgIdCopyProps {
  orgId: string;
  disabled?: boolean;
  onCopy?: () => void;
}

const OrgIdCopy = ({ orgId, disabled = true, onCopy }: OrgIdCopyProps) => {
  const [showOrgId, setShowOrgId] = useState(false);

  const copyOrgId = () => {
    navigator.clipboard.writeText(orgId || "");
    if (onCopy) {
      onCopy();
    }
  };

  return (
    <div className="space-y-2">
      <label htmlFor="orgId" className="text-sm font-medium text-gray-700">
        Org ID
      </label>
      <div className="flex items-center space-x-2">
        <Input
          id="orgId"
          className="bg-white border memcryptRed w-full sm:w-72"
          type={showOrgId ? "text" : "password"}
          value={orgId}
          disabled={disabled}
          readOnly
        />
        <Button
          type="button"
          variant="ghost"
          onClick={() => setShowOrgId(!showOrgId)}
          className="p-2 hover:bg-memcryptRed hover:bg-opacity-10"
        >
          {showOrgId ? (
            <EyeOffIcon className="w-5 h-5 text-memcryptRed" />
          ) : (
            <EyeIcon className="w-5 h-5 text-memcryptRed" />
          )}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={copyOrgId}
          className="p-2 hover:bg-memcryptRed hover:bg-opacity-10"
        >
          <Copy className="w-5 h-5 text-memcryptRed" />
        </Button>
      </div>
    </div>
  );
};

export default OrgIdCopy;
