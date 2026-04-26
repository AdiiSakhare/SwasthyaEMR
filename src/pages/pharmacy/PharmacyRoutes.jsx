import { Routes, Route } from "react-router-dom";
import { Pill } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useStore } from "@/data/store";
import PharmacyToday from "./Today";
import PrescriptionDetail from "./PrescriptionDetail";

export function PharmacyRoutes() {
  const { prescriptions } = useStore();
  const today = new Date().toISOString().slice(0, 10);
  const pending = prescriptions.filter((r) => r.date === today && !r.dispensed).length;

  const navItems = [
    { to: "/pharmacy", end: true, label: "Today's Rx", icon: Pill, badge: pending || null },
  ];

  return (
    <Routes>
      <Route element={<AppShell navItems={navItems} portalLabel="Pharmacy" />}>
        <Route index element={<PharmacyToday />} />
        <Route path="rx/:id" element={<PrescriptionDetail />} />
      </Route>
    </Routes>
  );
}
