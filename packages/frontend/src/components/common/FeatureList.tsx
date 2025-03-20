import { Feature } from "@/types/common";
import FeatureItem from "./FeatureItem";
import Text from "@/components/text/Text";
import { loginTexts } from "@/texts/common/login";

export interface FeatureListProps {
  features: Feature[];
}

const FeatureList = ({ features }: FeatureListProps) => (
  <div className="bg-gray-50 p-6 rounded-lg shadow-sm mb-8">
    <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">
      <Text text={loginTexts.featureListTitle} />
    </h3>
    <ul className="space-y-3">
      {features.map((feature, index) => (
        <FeatureItem key={index} {...feature} />
      ))}
    </ul>
  </div>
);

export default FeatureList;
