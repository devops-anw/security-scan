import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

interface UserAvatarProps {
  name?: string;
  image?: string;
  className?: string;
  width?: number;
  height?: number;
}
const UserAvatar = ({
  name,
  image,
  className,
  height,
  width,
}: UserAvatarProps) => {
  return (
    <Avatar
      className={`h-${height || "8"} w-${width || "8"} border-2 border-red-600`}
    >
      <AvatarImage src={image} alt="User" />
      <AvatarFallback className={cn("bg-red-100 text-red-600", className)}>
        {name?.charAt(0)}
      </AvatarFallback>
    </Avatar>
  );
};
export default UserAvatar;
