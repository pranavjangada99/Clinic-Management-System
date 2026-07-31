import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes, ReactNode } from "react";

interface AppButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  leftIcon?: ReactNode;
  variant?: "primary" | "secondary";
}

export default function AppButton({
  children,
  leftIcon,
  variant = "primary",
  className,
  ...props
}: AppButtonProps) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex h-12 items-center justify-center gap-2 rounded-2xl px-5 text-sm font-medium transition-all duration-200 active:scale-[0.98]",
        variant === "primary"
          ? "bg-blue-600 text-white hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg"
          : "border border-slate-200 bg-white text-slate-700 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50",
        className
      )}
    >
      {leftIcon}

      {children}
    </button>
  );
}