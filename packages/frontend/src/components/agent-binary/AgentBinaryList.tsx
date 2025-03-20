"use client";

import { AgentBinaryVersions } from "@/types/agent-binary";
import Link from "next/link";
import { ChevronDownIcon, Search } from "lucide-react";
import { useState, useMemo } from "react";
import { Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { agentBinaryTexts } from "@/texts/agent-binary/agent-binary";
import Text from "@/components/text/Text";
import { commonTexts } from "@/texts/common/common";

interface AgentListProps {
  versions: AgentBinaryVersions;
}

export function AgentBinaryList({ versions }: AgentListProps) {
  const [expandedVersion, setExpandedVersion] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const toggleExpand = (version: string) => {
    setExpandedVersion(expandedVersion === version ? null : version);
  };

  const filteredVersions = useMemo(() => {
    return Object.entries(versions).reduce((acc, [version, files]) => {
      const filteredFiles = files.filter(
        (file) =>
          file.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
          version.toLowerCase().includes(searchTerm.toLowerCase())
      );
      if (filteredFiles.length > 0) {
        acc[version] = filteredFiles;
      }
      return acc;
    }, {} as AgentBinaryVersions);
  }, [versions, searchTerm]);

  return (
    <div className="space-y-4">
      <div className="relative w-full max-w-xs">
        <Input
          type="text"
          placeholder="Search by version or file name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 border-gray-300 rounded-md 
    focus:outline-none !focus:ring-2 !focus:ring-red-500 !focus:border-red-500 
    transition duration-150 ease-in-out"
        />
        <Search className="h-5 w-5 text-memcryptRed absolute left-3 top-1/2 transform -translate-y-1/2" />
      </div>
      {Object.entries(filteredVersions).map(([version, files]) => (
        <div
          key={version}
          className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden"
        >
          <div
            className="flex justify-between items-center p-4 cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors duration-150"
            onClick={() => toggleExpand(version)}
          >
            <h3 className="text-lg font-semibold text-gray-800">
              Version: {version}
            </h3>
            <ChevronDownIcon
              className={`h-5 w-5 text-red-600 transition-transform duration-300 ${
                expandedVersion === version ? "transform rotate-180" : ""
              }`}
            />
          </div>
          {expandedVersion === version && (
            <ul className="divide-y divide-gray-200">
              {files.map((file, index) => (
                <li
                  key={index}
                  className="flex justify-between items-center p-4 hover:bg-gray-50 transition-colors duration-150"
                >
                  <span className="text-sm text-gray-600 word-break-breakWord">
                    {file.filename}
                  </span>
                  <Link
                    href={process.env.NEXT_PUBLIC_BASE_URL + file.download_link}
                    className="text-red-600 hover:text-red-700 flex items-center transition duration-150 ease-in-out"
                  >
                    <Download className="h-5 w-5 mr-1" />
                    <span className="font-medium hidden sm:inline-block">
                      <Text text={commonTexts.download} />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
      {Object.keys(filteredVersions).length === 0 && (
        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-lg font-medium">
            <Text text={agentBinaryTexts.noMatchingVersionsAvailable} />
          </p>
          <p className="mt-2">
            <Text text={agentBinaryTexts.adjustSearch} />
          </p>
        </div>
      )}
    </div>
  );
}
