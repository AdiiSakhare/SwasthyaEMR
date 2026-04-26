import { createContext, useContext, useState } from "react";
import { useStore } from "./store";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { users } = useStore();
  const [user, setUser] = useState(null);

  const loginAs = (role) => {
    const u = users.find((x) => x.role === role);
    setUser(u);
    return u;
  };
  const logout = () => setUser(null);

  return <AuthContext.Provider value={{ user, loginAs, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
