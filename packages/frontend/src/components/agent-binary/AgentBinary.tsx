"use client";
import { useState, useEffect, useCallback } from "react";
import { AgentBinaryList } from "@/components/agent-binary/AgentBinaryList";
import { AgentBinaryUploadForm } from "@/components/agent-binary/AgentBinaryUploadForm";
import { getAgentBinaryVersions } from "@/lib/agentBinary";
import { CloudArrowUpIcon, ServerIcon } from "@heroicons/react/24/outline";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MemCryptRedButton from "@/components/common/MemcryptRedButton";
import { useRouter } from "next/navigation";
import { useAuthSession } from "@/hooks/useAuthSession";
import Text from "@/components/text/Text";
import { agentBinaryTexts } from "@/texts/agent-binary/agent-binary";

export default function AgentBinary() {
  const [versions, setVersions] = useState<
    Awaited<ReturnType<typeof getAgentBinaryVersions>>["versions"]
  >({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const router = useRouter();

  const { isAuthenticated, accessToken, type } = useAuthSession();

  useEffect(() => {
    if (isAuthenticated && type !== "Platform Admin") {
      router.push("/login");
    }
  }, [type, router, isAuthenticated]);

  const fetchVersions = useCallback(async () => {
    const { versions: fetchedVersions } = await getAgentBinaryVersions();
    setVersions(fetchedVersions);
  }, []);

  useEffect(() => {
    fetchVersions();
  }, [fetchVersions]);

  const handleUploadSuccess = useCallback(() => {
    fetchVersions();
  }, [fetchVersions]);

  return (
    <div className="mt-4 sm:mt-8 px-2 sm:px-4 md:px-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          <Text text={agentBinaryTexts.pageTitle} />
        </h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <MemCryptRedButton width="100px">
              <CloudArrowUpIcon className="h-6 w-6 mr-2" />
              <span className="text-xs sm:text-sm md:text-base break-words">
                <Text text={agentBinaryTexts.uploadButton} />
              </span>
            </MemCryptRedButton>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                <Text text={agentBinaryTexts.uploadDialogTitle} />
              </DialogTitle>
              <DialogDescription>
                <Text text={agentBinaryTexts.uploadDialogDescription} />
              </DialogDescription>
            </DialogHeader>
            <AgentBinaryUploadForm
              accessToken={accessToken || ""}
              onUploadSuccess={handleUploadSuccess}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ServerIcon className="h-6 w-6 text-red-600 mr-2" />
              <Text text={agentBinaryTexts.versionsTitle} />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {versions && Object.keys(versions).length > 0 ? (
              <AgentBinaryList versions={versions} />
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-md p-6 text-center">
                <p className="text-gray-600">
                  <Text text={agentBinaryTexts.noVersionsAvailable} />
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  <Text text={agentBinaryTexts.uploadNewVersion} />
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
