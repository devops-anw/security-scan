import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { TranslationOrNode } from "@/utils/translation";
import Text from "@/components/text/Text";

interface ErrorMessageProps {
  heading: string | TranslationOrNode;
  message: string | TranslationOrNode;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ heading, message }) => {
  return (
    <Card className="w-full max-w-lg sm:max-w-xl lg:max-w-2xl mx-auto bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
      <CardContent className="p-6 sm:p-8 md:p-10">
        <div className="flex flex-col items-center text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            <Text text={heading} />
          </h3>
          <p className="text-gray-600">
            <Text text={message} />
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ErrorMessage;
