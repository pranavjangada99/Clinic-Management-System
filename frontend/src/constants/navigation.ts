import {
  Activity,
  BarChart3,
  CalendarDays,
  CreditCard,
  LayoutDashboard,
  Receipt,
  Settings,
  Users,
} from "lucide-react";

export interface NavigationItem {
  title: string;
  icon: typeof LayoutDashboard;
  path: string;
}

export interface NavigationSection {
  title: string;
  items: NavigationItem[];
}

export const navigation: NavigationSection[] = [
  {
    title: "MAIN",
    items: [
      {
        title: "Dashboard",
        icon: LayoutDashboard,
        path: "/",
      },
      {
        title: "Patients",
        icon: Users,
        path: "/patients",
      },
      {
        title: "Visits",
        icon: Activity,
        path: "/visits",
      },
      {
        title: "Appointments",
        icon: CalendarDays,
        path: "/appointments",
      },
    ],
  },

  {
    title: "FINANCE",
    items: [
      {
        title: "Billing",
        icon: Receipt,
        path: "/billing",
      },
      {
        title: "Payments",
        icon: CreditCard,
        path: "/payments",
      },
    ],
  },

  {
    title: "REPORTS",
    items: [
      {
        title: "Reports",
        icon: BarChart3,
        path: "/reports",
      },
    ],
  },

  {
    title: "SYSTEM",
    items: [
      {
        title: "Settings",
        icon: Settings,
        path: "/settings",
      },
    ],
  },
];