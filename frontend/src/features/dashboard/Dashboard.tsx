import HeroSection from "./components/HeroSection";
import RevenueCard from "./components/RevenueCard";
import ScheduleCard from "./components/ScheduleCard";
import WaitingQueue from "./components/WaitingQueue";
import ActivityFeed from "./components/ActivityFeed";

export default function Dashboard() {
  return (
    <div className="space-y-8">
      <HeroSection />

      <div className="grid gap-6 xl:grid-cols-2">
        <WaitingQueue />
        <RevenueCard />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ActivityFeed />
        <ScheduleCard />
      </div>
    </div>
  );
}