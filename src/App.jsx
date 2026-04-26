import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { StoreProvider } from "@/data/store";
import { AuthProvider, useAuth } from "@/data/auth";
import { ToastProvider } from "@/components/ui/toast";
import DemoLogin from "@/pages/DemoLogin";
import { ReceptionRoutes } from "@/pages/reception/ReceptionRoutes";
import { DoctorRoutes } from "@/pages/doctor/DoctorRoutes";
import { PharmacyRoutes } from "@/pages/pharmacy/PharmacyRoutes";
import { NurseRoutes } from "@/pages/nurse/NurseRoutes";

function ProtectedPortal({ role, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  if (user.role !== role) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <StoreProvider>
        <AuthProvider>
          <ToastProvider>
            <Routes>
              <Route path="/" element={<DemoLogin />} />
              <Route
                path="/reception/*"
                element={
                  <ProtectedPortal role="receptionist">
                    <ReceptionRoutes />
                  </ProtectedPortal>
                }
              />
              <Route
                path="/doctor/*"
                element={
                  <ProtectedPortal role="doctor">
                    <DoctorRoutes />
                  </ProtectedPortal>
                }
              />
              <Route
                path="/pharmacy/*"
                element={
                  <ProtectedPortal role="pharmacist">
                    <PharmacyRoutes />
                  </ProtectedPortal>
                }
              />
              <Route
                path="/nurse/*"
                element={
                  <ProtectedPortal role="nurse">
                    <NurseRoutes />
                  </ProtectedPortal>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </ToastProvider>
        </AuthProvider>
      </StoreProvider>
    </BrowserRouter>
  );
}
