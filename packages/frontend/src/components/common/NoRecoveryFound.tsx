import { Card, CardContent } from "@/components/ui/card";
import { InboxIcon } from "lucide-react";
import Text from "@/components/text/Text";
import { recoveryListTexts } from "@/texts/recovery/recovery";

interface NoRecoveryListFoundProps {
  activeTab: string;
  isDevice?: boolean;
}

export default function NoRecoveryListFound({
  activeTab,
  isDevice = true,
}: NoRecoveryListFoundProps) {
  return (
    <Card className="w-full max-w-lg sm:max-w-xl lg:max-w-2xl mx-auto bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
      <CardContent className="p-6 sm:p-8 md:p-10 text-center">
        <InboxIcon className="mx-auto h-12 w-12 text-[#C02427] mb-4" />{" "}
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          <Text text={recoveryListTexts.noRecoveryEntiresFound} />
        </h3>
        <p className="text-gray-600">
          There are no recovery lists{" "}
          {activeTab !== "all" ? `with status "${activeTab}"` : ""}
          {isDevice ? " for this device." : "."}
        </p>
      </CardContent>
    </Card>
  );
}
