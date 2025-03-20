import { Card, CardContent } from "../ui/card";
import { TranslationOrNode } from "@/utils/translation";
import Text from "@/components/text/Text";

interface MetricCardProps {
  title?: string | TranslationOrNode;
  value?: string;
  icon?: React.ReactNode;
  description?: string | TranslationOrNode;
}

const MetricCard = ({ title, value, icon, description }: MetricCardProps) => (
  <Card>
    <CardContent className="pt-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">
            <Text text={title} />
          </p>
          <p className="text-2xl font-semibold text-gray-700">{value}</p>
        </div>
        <div className="p-2 bg-red-100 rounded-full border-memcryptRed text-memcryptRed">
          {icon}
        </div>
      </div>
      <p className="mt-2 text-xs text-gray-500">
        <Text text={description} />
      </p>
    </CardContent>
  </Card>
);

export default MetricCard;
