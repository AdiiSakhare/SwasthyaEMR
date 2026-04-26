import { Routes, Route } from "react-router-dom";
import { LayoutDashboard, Users, Calendar, Receipt, BarChart3 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useStore } from "@/data/store";
import ReceptionDashboard from "./Dashboard";
import PatientsList from "./PatientsList";
import PatientRegister from "./PatientRegister";
import PatientProfile from "./PatientProfile";
import Appointments from "./Appointments";
import AppointmentCalendar from "./AppointmentCalendar";
import Billing from "./Billing";
import BillingDashboard from "./BillingDashboard";

export function ReceptionRoutes() {
  const { appointments, invoices } = useStore();
  const today = new Date().toISOString().slice(0, 10);
  const todayCount = appointments.filter((a) => a.date === today && a.status !== "completed" && a.status !== "cancelled").length;
  const pendingInvoices = invoices.filter((i) => i.status === "pending").length;

  const navItems = [
    { to: "/reception", end: true, label: "Dashboard", icon: LayoutDashboard, badge: todayCount || null },
    { to: "/reception/patients", label: "Patients", icon: Users },
    { to: "/reception/appointments", label: "Appointments", icon: Calendar },
    { to: "/reception/calendar", label: "Calendar", icon: Calendar },
    { to: "/reception/billing", label: "Billing", icon: Receipt, badge: pendingInvoices || null },
    { to: "/reception/billing-dashboard", label: "Analytics", icon: BarChart3 },
  ];

  return (
    <Routes>
      <Route element={<AppShell navItems={navItems} portalLabel="Reception" />}>
        <Route index element={<ReceptionDashboard />} />
        <Route path="patients" element={<PatientsList />} />
        <Route path="patients/new" element={<PatientRegister />} />
        <Route path="patients/:id" element={<PatientProfile />} />
        <Route path="appointments" element={<Appointments />} />
        <Route path="calendar" element={<AppointmentCalendar />} />
        <Route path="billing" element={<Billing />} />
        <Route path="billing-dashboard" element={<BillingDashboard />} />
      </Route>
    </Routes>
  );
}
