import { cn } from "@/lib/utils";
import type { HTMLAttributes, ReactNode } from "react";

interface AppCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export default function AppCard({
  children,
  className,
  ...props
}: AppCardProps) {
  return (
    <div
      {...props}
      className={cn(
        "relative overflow-hidden rounded-[28px] border border-slate-200/70 bg-gradient-to-br from-white via-white to-slate-50 shadow-sm transition-all duration-300 hover:shadow-lg",
        className
      )}
    >
      {children}
    </div>
  );
}