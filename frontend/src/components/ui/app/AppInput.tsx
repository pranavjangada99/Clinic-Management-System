import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { InputHTMLAttributes } from "react";

interface AppInputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: boolean;
}

export default function AppInput({
  className,
  icon = false,
  ...props
}: AppInputProps) {
  return (
    <div className="relative w-full">

      {icon && (
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      )}

      <input
        {...props}
        className={cn(
          "h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100",
          icon && "pl-11",
          className
        )}
      />

    </div>
  );
}