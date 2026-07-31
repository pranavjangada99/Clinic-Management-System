import AppInput from "@/components/ui/app/AppInput";
import { Bell, ChevronDown, Menu } from "lucide-react";

export default function Header() {
  return (
    <header className="fixed left-72 right-0 top-0 z-40 bg-slate-50">

      <div className="m-5 flex h-16 items-center justify-between rounded-[24px] border border-slate-200 bg-white px-6 shadow-sm">

        {/* Left */}

        <div className="flex items-center gap-5">

          <button className="rounded-xl p-2 transition hover:bg-slate-100">

            <Menu className="h-5 w-5 text-slate-700" />

          </button>

          <div className="w-[340px]">

            <AppInput
              icon
              placeholder="Search patients..."
            />

          </div>

        </div>

        {/* Right */}

        <div className="flex items-center gap-5">

          <div className="text-right">

            <p className="text-sm font-semibold text-slate-900">

              Friday

            </p>

            <p className="text-xs text-slate-500">

              31 July 2026

            </p>

          </div>

          <button className="relative rounded-xl p-2 hover:bg-slate-100">

            <Bell className="h-5 w-5 text-slate-700"/>

            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500"/>

          </button>

          <button className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 transition hover:shadow-md">

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">

              P

            </div>

            <div className="text-left">

              <p className="text-sm font-semibold">

                Dr. Pranav

              </p>

              <p className="text-xs text-slate-500">

                Administrator

              </p>

            </div>

            <ChevronDown className="h-4 w-4 text-slate-400"/>

          </button>

        </div>

      </div>

    </header>
  );
}