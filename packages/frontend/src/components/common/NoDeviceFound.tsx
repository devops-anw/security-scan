import { Card, CardContent } from "@/components/ui/card";
import Text from "@/components/text/Text";
import { InboxIcon } from "lucide-react";
import { deviceListTexts } from "@/texts/device/device-list";
import Link from "next/link";

interface NoDevicesFoundProps {
  status?: string;
  health?: string;
}

export default function NoDevicesFound({
  status,
  health,
}: NoDevicesFoundProps) {
  return (
    <Card className="w-full max-w-lg sm:max-w-xl lg:max-w-2xl mx-auto bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
      <CardContent className="p-6 sm:p-8 md:p-10 text-center">
        <InboxIcon className="mx-auto h-12 w-12 text-[#C02427] mb-4" />
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          <Text text={deviceListTexts.noDevicesFound} />
        </h3>
        <p className="text-gray-600">
          {status && status !== "statuses" ? (
            `There are currently no devices with status "${status}" in the platform.`
          ) : health && health !== "all_health" ? (
            `There are currently no devices with status "${health}" in the platform.`
          ) : (
            <>
              <Text text={deviceListTexts.noDevicesFoundDesc} />,{" "}
              <Link
                href="/agent-download"
                className="text-memcryptRed underline"
              >
                <Text text={deviceListTexts.clickHere} />
              </Link>
              .
            </>
          )}
        </p>
      </CardContent>
    </Card>
  );
}
