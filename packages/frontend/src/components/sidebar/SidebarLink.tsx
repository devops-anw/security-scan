import { TranslationOrNode } from "@/utils/translation";
import Link from "next/link";
import Text from "@/components/text/Text";

function SidebarLink({
  href,
  icon,
  text,
  active = false,
  isCollapsed = false,
}: {
  href: string;
  icon: React.ReactNode;
  text: string | TranslationOrNode;
  active?: boolean;
  isCollapsed?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`relative flex items-center space-x-3 p-2 rounded-lg transition duration-150 ease-in-out
        ${
          active
            ? "bg-gray-100 text-red-600 before:absolute before:content-[''] before:left-[-14px] before:top-0 before:h-full before:w-1 before:bg-red-500 before:rounded-r"
            : "text-gray-700 hover:bg-gray-50 hover:text-red-600"
        }
      `}
    >
      <div
        className={`flex items-center justify-center text-xl ${
          active ? "text-red-600" : "text-gray-500 hover:text-red-600"
        }`}
      >
        {icon}
      </div>
      {!isCollapsed && (
        <span className="font-medium">
          <Text text={text} />
        </span>
      )}
    </Link>
  );
}

export default SidebarLink;
