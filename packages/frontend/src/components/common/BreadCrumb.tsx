"use client";
import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

const Breadcrumb = ({ items }: BreadcrumbProps) => {
  const pathname = usePathname();

  return (
    <nav className="text-sm text-gray-600 mb-4" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {items.map((item, index) => {
          const isActive = pathname === item.href;
          return (
            <li key={index} className="flex items-center">
              {index > 0 && <ChevronRight className="w-4 h-4 text-gray-700" />}
              {item.label === "Dashboard" ? (
                // Render Home icon instead of "Dashboard" text
                <Link
                  href={item.href}
                  className={`text-sm ${
                    isActive ? "text-red-600" : "text-gray-700"
                  } hover:text-memcryptDarkRed`}
                >
                  <Home className="w-4 h-4" />
                </Link>
              ) : (
                <Link
                  href={item.href}
                  className={`text-sm ${
                    isActive ? "text-memcryptRed" : "text-gray-700"
                  } hover:text-memcryptDarkRed`}
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
