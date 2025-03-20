"use client";

import { useToast } from "@/hooks/use-toast";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, action, ...props }) => (
        <Toast
          key={id}
          {...props}
          className="bg-zinc-800 border border-memcryptRed shadow-lg"
        >
          <div className="grid gap-1">
            {title && (
              <ToastTitle className="text-memcryptRed font-semibold">
                {title}
              </ToastTitle>
            )}
            {description && (
              <ToastDescription className="text-zinc-200">
                {description}
              </ToastDescription>
            )}
          </div>
          {action}
          <ToastClose className="absolute top-2 right-2 rounded-md p-1 text-zinc-400 opacity-0 transition-opacity hover:text-zinc-100 focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100 group-[.destructive]:text-memcryptRed group-[.destructive]:hover:text-memcryptRed group-[.destructive]:focus:ring-memcryptRed group-[.destructive]:focus:ring-offset-memcryptRed" />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  );
}
