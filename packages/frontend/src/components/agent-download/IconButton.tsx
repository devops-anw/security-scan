import Image from "next/image";

interface IconButtonProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
}

const IconButton = ({ src, alt, width, height }: IconButtonProps) => (
  <Image
    src={src}
    alt={alt}
    className="object-contain shrink-0 self-stretch my-auto w-8 aspect-square"
    height={width || 8}
    width={height || 8}
  />
);

export default IconButton;
