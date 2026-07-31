import { Bell, Menu, Search } from "lucide-react";

export default function Header() {
  return (
    <header className="fixed top-0 right-0 left-[288px] z-40 h-[72px] border-b border-slate-200 bg-white">
      <div className="flex h-full items-center justify-between px-8">
        {/* Left */}
        <div className="flex items-center gap-4">
          <button className="rounded-xl p-2 transition hover:bg-slate-100">
            <Menu className="h-5 w-5 text-slate-700" />
          </button>

          <div className="relative w-[420px]">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              placeholder="Search patients, medicines..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:bg-white"
            />
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-4">
          <button className="rounded-xl p-2 transition hover:bg-slate-100">
            <Bell className="h-5 w-5 text-slate-700" />
          </button>

          <button className="flex items-center gap-3 rounded-xl px-3 py-2 transition hover:bg-slate-100">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-semibold text-white">
              P
            </div>

            <div className="text-left">
              <p className="text-sm font-semibold text-slate-800">
                Dr. Pranav
              </p>

              <p className="text-xs text-slate-500">
                Administrator
              </p>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}