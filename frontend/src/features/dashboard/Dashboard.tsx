import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Users,
  Wallet,
  Stethoscope,
  CalendarDays,
} from "lucide-react";

const stats = [
  {
    title: "Patients",
    value: "1,248",
    icon: Users,
  },
  {
    title: "Today's Visits",
    value: "32",
    icon: Stethoscope,
  },
  {
    title: "Revenue",
    value: "₹12,540",
    icon: Wallet,
  },
  {
    title: "Appointments",
    value: "18",
    icon: CalendarDays,
  },
];

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          Good Evening 👋
        </h1>

        <p className="mt-2 text-slate-500">
          Welcome back. Here's today's clinic overview.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <Card
              key={item.title}
              className="transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm text-slate-500">
                  {item.title}
                </CardTitle>

                <Icon className="h-5 w-5 text-blue-600" />
              </CardHeader>

              <CardContent>
                <p className="text-3xl font-bold text-slate-900">
                  {item.value}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}