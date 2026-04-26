import { Routes, Route } from "react-router-dom";
import { LayoutDashboard, Users, ClipboardList, CalendarDays } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useStore } from "@/data/store";
import DoctorDashboard from "./Dashboard";
import DoctorPatients from "./Patients";
import DoctorPatientProfile from "./PatientProfile";
import Consultation from "./Consultation";
import Templates from "./Templates";
import Schedule from "./Schedule";

export function DoctorRoutes() {
  const { appointments } = useStore();
  const today = new Date().toISOString().slice(0, 10);
  const queueCount = appointments.filter(
    (a) => a.date === today && (a.status === "waiting" || a.status === "in-consultation")
  ).length;

  const navItems = [
    { to: "/doctor", end: true, label: "Today's Queue", icon: LayoutDashboard, badge: queueCount || null },
    { to: "/doctor/patients", label: "Patients", icon: Users },
    { to: "/doctor/schedule", label: "Schedule", icon: CalendarDays },
    { to: "/doctor/templates", label: "Templates", icon: ClipboardList },
  ];

  return (
    <Routes>
      <Route element={<AppShell navItems={navItems} portalLabel="Doctor" />}>
        <Route index element={<DoctorDashboard />} />
        <Route path="patients" element={<DoctorPatients />} />
        <Route path="patients/:id" element={<DoctorPatientProfile />} />
        <Route path="consultation/:appointmentId" element={<Consultation />} />
        <Route path="schedule" element={<Schedule />} />
        <Route path="templates" element={<Templates />} />
      </Route>
    </Routes>
  );
}
