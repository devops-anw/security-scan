import Image from "next/image";

const LogoImage = () => {
  return (
    <Image
      alt="Company logo"
      src="/memcrypt/memcrypt-logo.svg"
      height={50}
      width={214}
      className="object-contain text-center max-w-full aspect-[7.35] w-[214px] h-auto"
      priority
    />
  );
};

export default LogoImage;
