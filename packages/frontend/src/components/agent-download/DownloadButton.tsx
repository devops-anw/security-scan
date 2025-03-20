import Image from "next/image";
import Text from "@/components/text/Text"; 
import { commonTexts } from "@/texts/common/common";
interface DownloadButtonProps {
  icon: string;
  label: string;
  tooltip?: string;
  disabled?: boolean;
  onDownloadClick: () => void;
}

const DownloadButton = ({
  icon,
  label,
  tooltip = "Download this file",
  disabled = false,
  onDownloadClick,
}: DownloadButtonProps) => (
  <div
    className="flex overflow-hidden gap-10 self-stretch px-4 py-5 my-auto rounded border border-red-700 border-solid bg-red-400 bg-opacity-10 min-w-[240px] w-[260px] max-md:pl-5"
    title={tooltip}
  >
    <div className="flex gap-2 font-bold text-black">
      <Image
        src={icon}
        alt=""
        className="object-contain shrink-0 aspect-square w-[30px]"
        height={30}
        width={30}
      ></Image>
      <div className="my-auto">{label}</div>
    </div>
    <button
      className="px-4 py-3 text-center text-white bg-red-700 rounded"
      onClick={onDownloadClick}
      disabled={disabled}
    >
      <Text text={commonTexts.download} />
    </button>
  </div>
);

export default DownloadButton;
