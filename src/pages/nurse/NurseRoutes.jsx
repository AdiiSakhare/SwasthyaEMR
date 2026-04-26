import { Routes, Route } from "react-router-dom";
import { HeartPulse, Users } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useStore } from "@/data/store";
import NurseDashboard from "./Dashboard";
import NursePatients from "./Patients";

export function NurseRoutes() {
  const { appointments } = useStore();
  const today = new Date().toISOString().slice(0, 10);
  const waitingCount = appointments.filter(
    (a) => a.date === today && (a.status === "waiting" || a.status === "scheduled")
  ).length;

  const navItems = [
    { to: "/nurse", end: true, label: "Today's Queue", icon: HeartPulse, badge: waitingCount || null },
    { to: "/nurse/patients", label: "All Patients", icon: Users },
  ];

  return (
    <Routes>
      <Route element={<AppShell navItems={navItems} portalLabel="Nurse Station" />}>
        <Route index element={<NurseDashboard />} />
        <Route path="patients" element={<NursePatients />} />
      </Route>
    </Routes>
  );
}
