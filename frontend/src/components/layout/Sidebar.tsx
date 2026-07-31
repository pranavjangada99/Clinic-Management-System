import { NavLink } from "react-router-dom";
import { HeartPulse } from "lucide-react";
import { navigation } from "@/constants/navigation";

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 flex h-screen w-72 flex-col border-r border-slate-200 bg-white">
      {/* Logo */}
      <div className="flex h-20 items-center gap-3 px-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 shadow-lg">
          <HeartPulse className="h-6 w-6 text-white" />
        </div>

        <div>
          <h1 className="text-lg font-semibold tracking-tight text-slate-900">
            ClinicPro
          </h1>

          <p className="text-sm text-slate-500">
            Management System
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {navigation.map((section) => (
          <div key={section.title} className="mt-8">
            <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              {section.title}
            </p>

            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.title}
                    to={item.path}
                    className={({ isActive }) =>
                      `group flex h-12 items-center gap-3 rounded-2xl px-4 transition-all duration-200 ${
                        isActive
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon
                          className={`h-5 w-5 ${
                            isActive
                              ? "text-white"
                              : "text-slate-400 group-hover:text-slate-700"
                          }`}
                        />

                        <span className="text-sm font-medium">
                          {item.title}
                        </span>
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* User */}
      <div className="border-t border-slate-200 p-5">
        <button className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 transition-all duration-200 hover:border-slate-300 hover:bg-white">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
            P
          </div>

          <div className="text-left">
            <p className="text-sm font-semibold text-slate-900">
              Dr. Pranav
            </p>

            <p className="text-xs text-slate-500">
              Administrator
            </p>
          </div>
        </button>
      </div>
    </aside>
  );
}