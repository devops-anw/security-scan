import { Card, CardContent } from "@/components/ui/card";
import { TranslationOrNode } from "@/utils/translation";
import Text from "@/components/text/Text";

interface NoUsersFoundProps {
  heading: string | TranslationOrNode;
  message: string | TranslationOrNode;
}

const NoUsersFound = ({ heading, message }: NoUsersFoundProps) => {
  return (
    <Card className="w-full max-w-lg sm:max-w-xl lg:max-w-2xl mx-auto bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
      <CardContent className="p-6 sm:p-8 md:p-10">
        <div className="flex flex-col items-center text-center">
          <svg
            className="w-16 h-16 text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="#C02427"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
          <Text text={heading} />
          </h3>
          <p className="text-gray-600">  <Text text={message} /></p>
        </div>
      </CardContent>
    </Card>
  );
};

export default NoUsersFound;
