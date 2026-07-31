import {
  Activity,
  CalendarDays,
  IndianRupee,
  Users,
} from "lucide-react";

export const dashboardData = {
  clinic: {
    name: "Shree Mahavir Homoeopathic Clinic",
  },

  user: {
    name: "Dr. Pranav",
    role: "Administrator",
  },

  summary: [
    {
      title: "Patients Today",
      value: "32",
      icon: Users,
      color: "blue",
    },
    {
      title: "Waiting",
      value: "4",
      icon: Activity,
      color: "amber",
    },
    {
      title: "Revenue",
      value: "₹12,540",
      icon: IndianRupee,
      color: "emerald",
    },
    {
      title: "Follow-ups",
      value: "6",
      icon: CalendarDays,
      color: "violet",
    },
  ],

  waitingQueue: [
    {
      id: 1,
      name: "Amit Shah",
      room: "Room 1",
      waiting: "12 min",
      priority: "High",
    },
    {
      id: 2,
      name: "Neha Patel",
      room: "Room 2",
      waiting: "7 min",
      priority: "Medium",
    },
    {
      id: 3,
      name: "Rajesh Jain",
      room: "Room 3",
      waiting: "2 min",
      priority: "Low",
    },
  ],

  schedule: [
    {
      id: 1,
      time: "09:00",
      patient: "Amit Shah",
      type: "Follow-up",
      status: "Completed",
    },
    {
      id: 2,
      time: "09:30",
      patient: "Neha Patel",
      type: "Consultation",
      status: "In Progress",
    },
    {
      id: 3,
      time: "10:15",
      patient: "Rajesh Jain",
      type: "Review",
      status: "Upcoming",
    },
  ],

  activity: [
    {
      id: 1,
      title: "Payment Received",
      subtitle: "₹500 • Amit Shah",
      time: "10:20 AM",
    },
    {
      id: 2,
      title: "Patient Registered",
      subtitle: "Neha Patel",
      time: "10:05 AM",
    },
    {
      id: 3,
      title: "Prescription Generated",
      subtitle: "Rajesh Jain",
      time: "09:40 AM",
    },
  ],

  revenue: [
    { day: "Mon", revenue: 12000 },
    { day: "Tue", revenue: 15000 },
    { day: "Wed", revenue: 13200 },
    { day: "Thu", revenue: 18100 },
    { day: "Fri", revenue: 16400 },
    { day: "Sat", revenue: 20300 },
    { day: "Sun", revenue: 22400 },
  ],
};