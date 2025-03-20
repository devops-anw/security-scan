interface FeatureItemProps {
  name: string;
  icon: string;
}

const FeatureItem = ({ name, icon }: FeatureItemProps) => (
  <li className="flex items-center text-gray-600 pl-8">
    <svg
      className="w-5 h-5 text-red-500 mr-3 flex-shrink-0"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path d={icon}></path>
    </svg>
    <span>{name}</span>
  </li>
);

export default FeatureItem;
