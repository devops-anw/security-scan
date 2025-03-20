"use client";
import { useState, useCallback, useEffect } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import DownloadButton from "./DownloadButton";
import IconButton from "./IconButton";
import {
  getAgentBinaryVersions,
  getLatestAgentBinaryLink,
} from "@/lib/agentBinary";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "../ui/toaster";
import { AgentBinaryList } from "../agent-binary/AgentBinaryList";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { useAuthSession } from "@/hooks/useAuthSession";
import { agentDownloadTexts } from "@/texts/agent-download/agent-download";
import Text from "@/components/text/Text";

const AgentDownloadComponent = () => {
  const [latestAgentLink, setLatestAgentLink] = useState("");
  const { accessToken, user } = useAuthSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isVersionsCollapsed, setIsVersionsCollapsed] = useState(true);
  const [isInstallGuideCollapsed, setIsInstallGuideCollapsed] = useState(true);
  const { toast } = useToast();
  const [versions, setVersions] = useState({});

  const fetchVersions = useCallback(async () => {
    const { versions: fetchedVersions } = await getAgentBinaryVersions();
    setVersions(fetchedVersions);
  }, []);

  useEffect(() => {
    fetchVersions();
  }, [fetchVersions]);

  useEffect(() => {
    const fetchLatestAgentLink = async () => {
      if (user) {
        setIsLoading(true);
        setError("");
        try {
          const link = await getLatestAgentBinaryLink();
          setLatestAgentLink(link);
        } catch (err) {
          setError(agentDownloadTexts.fetchAgentLinkError.defaultMessage);
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchLatestAgentLink();
  }, [user, accessToken]);

  const handleDownloadClick = async (version: string) => {
    window.location.href = version;
    toast({
      title: agentDownloadTexts.downloadStarted.defaultMessage,
      description: agentDownloadTexts.downloadStartedDescription.defaultMessage,
    });
  };

  if (!user) {
    return null;
  }

  const downloadButtons = [{ icon: "memcrypt/windows.svg", label: "Windows" }];

  const iconButtons = [
    { src: "/memcrypt/mac.svg", alt: "Mac OS" },
    { src: "/memcrypt/linux.svg", alt: "Linux" },
    { src: "/memcrypt/android.svg", alt: "Android" },
    { src: "/memcrypt/ios.svg", alt: "iOS" },
  ];

  return (
    <>
      <Toaster />
      <main className="flex flex-col items-center max-w-[752px] lg:max-w-[1024px] p-4 ml-0 sm:ml-12 overflow-hidden">
        <header className="z-10 mt-0 text-2xl text-memcryptRed">
          <Text text={agentDownloadTexts.welcomeTitle.defaultMessage} />
        </header>
        <p className="mt-2 text-sm text-black max-w-full">
          <Text text={agentDownloadTexts.greetingMessage.defaultMessage} />
        </p>
        <section className="relative flex flex-col items-start self-stretch bg-white rounded-lg shadow-sm pb-10 px-6 mt-4 w-full max-md:pl-4 max-md:max-w-full z-10">
          <div className="flex items-start self-stretch text-black">
            <div className="flex flex-col grow shrink-0 self-end mt-10 mr-0 w-fit max-md:mt-8">
              <h2 className="text-xl max-w-full text-memcryptRed">
                <Text text={agentDownloadTexts.installationTitle} />
              </h2>
              <p className="mt-2 text-sm leading-5 max-w-full">
                <Text text={agentDownloadTexts.installationDescription} />
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-6 mt-4 w-full text-sm whitespace-nowrap max-w-[609px] max-md:max-w-full">
            <div className="flex flex-wrap gap-6 items-center flex-auto max-md:max-w-full">
              {downloadButtons.map((button, index) => (
                <DownloadButton
                  key={index}
                  icon={button.icon}
                  label={button.label}
                  disabled={!latestAgentLink}
                  onDownloadClick={() => handleDownloadClick(latestAgentLink)}
                  tooltip="Download the latest binary"
                />
              ))}
              {iconButtons.map((button, index) => (
                <IconButton key={index} src={button.src} alt={button.alt} />
              ))}
            </div>
          </div>
        </section>

        <div className="w-full mt-6 space-y-4">
          <Card className="w-full">
            <CardHeader
              className="cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setIsVersionsCollapsed(!isVersionsCollapsed)}
            >
              <CardTitle className="flex items-center justify-between text-lg font-medium text-memcryptRed">
                <span>
                  <Text text={agentDownloadTexts.downloadOtherVersionsTitle} />
                </span>
                {isVersionsCollapsed ? (
                  <ChevronDownIcon className="w-5 h-5" />
                ) : (
                  <ChevronUpIcon className="w-5 h-5" />
                )}
              </CardTitle>
            </CardHeader>
            {!isVersionsCollapsed && (
              <CardContent>
                {versions && Object.keys(versions).length > 0 ? (
                  <div className="max-h-[300px] overflow-y-auto">
                    <AgentBinaryList versions={versions} />
                  </div>
                ) : (
                  <p>
                    <Text text={agentDownloadTexts.noVersionsAvailable} />
                  </p>
                )}
              </CardContent>
            )}
          </Card>

          <Card className="w-full">
            <CardHeader
              className="cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() =>
                setIsInstallGuideCollapsed(!isInstallGuideCollapsed)
              }
            >
              <CardTitle className="flex items-center justify-between text-lg font-medium text-memcryptRed">
                <span>
                  <Text text={agentDownloadTexts.installationGuideTitle} />
                </span>
                {isInstallGuideCollapsed ? (
                  <ChevronDownIcon className="w-5 h-5" />
                ) : (
                  <ChevronUpIcon className="w-5 h-5" />
                )}
              </CardTitle>
            </CardHeader>
            {!isInstallGuideCollapsed && (
              <CardContent>
                <h3 className="text-md font-semibold mb-2">
                  <Text text={agentDownloadTexts.installationStepsTitle} />
                </h3>
                <ol className="list-decimal list-inside space-y-2">
                  <li>
                    <Text text={agentDownloadTexts.installationStep1} />
                  </li>
                  <li>
                    <Text text={agentDownloadTexts.installationStep2} />
                  </li>
                  <li>
                    <Text text={agentDownloadTexts.installationStep3} />
                  </li>
                  <li>
                    <Text text={agentDownloadTexts.installationStep4} />
                  </li>
                  <li>
                    <Text text={agentDownloadTexts.installationStep5} />
                  </li>
                  <li>
                    <Text text={agentDownloadTexts.installationStep6} />
                  </li>
                </ol>
                <p className="mt-4 text-sm">
                  <Text
                    text={agentDownloadTexts.supportMessage.defaultMessage}
                  />
                </p>
              </CardContent>
            )}
          </Card>
        </div>
      </main>
    </>
  );
};

export default AgentDownloadComponent;
