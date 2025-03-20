"use client";
import { Card, CardContent } from "@/components/ui/card";
import { commonTexts } from "@/texts/common/common";
import Text from "@/components/text/Text";

const ComingSoon = () => {
  return (
    <Card className="w-full max-w-lg sm:max-w-xl lg:max-w-2xl mx-auto bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center">
          <svg
            className="w-16 h-16 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="#C02427"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          <h3 className="text-2xl font-semibold text-gray-800 mb-2">
            <Text text={commonTexts.comingSoon} />
          </h3>
          <p className="text-gray-600">
            <Text text={commonTexts.comingSoonDesc} />
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ComingSoon;
