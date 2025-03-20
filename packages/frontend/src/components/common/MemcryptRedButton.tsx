import React, { forwardRef } from "react";
import { Button } from "../ui/button";

interface MemCryptRedButtonProps {
  children?: React.ReactNode;
  type?: "submit" | "button";
  width?: string;
  disabled?: boolean;
  onClick?: () => void;
}

const MemCryptRedButton = forwardRef<HTMLButtonElement, MemCryptRedButtonProps>(
  (
    { children, type = "button", width = "w-full", disabled = false, onClick },
    ref
  ) => {
    return (
      <Button
        ref={ref}
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={`${width} bg-memcryptRed hover:bg-hover-red-light dark:hover:bg-hover-red-dark text-white py-2 px-4 rounded`}
      >
        {children}
      </Button>
    );
  }
);

MemCryptRedButton.displayName = "MemCryptRedButton";

export default MemCryptRedButton;
