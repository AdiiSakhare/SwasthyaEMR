import { useNavigate } from "react-router-dom";
import { Stethoscope, UserRound, HeartPulse, Pill, Shield, ArrowRight, Sparkles } from "lucide-react";
import { useAuth } from "@/data/auth";
import { useStore } from "@/data/store";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/utils";

const ROLE_META = {
  doctor: {
    icon: Stethoscope,
    description: "View patient queue, conduct consultations, write prescriptions",
    accent: "from-emerald-500 to-teal-600",
    iconBg: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    path: "/doctor",
  },
  receptionist: {
    icon: UserRound,
    description: "Register patients, manage appointments, handle billing",
    accent: "from-blue-500 to-indigo-600",
    iconBg: "bg-blue-50 text-blue-700 ring-blue-100",
    path: "/reception",
  },
  nurse: {
    icon: HeartPulse,
    description: "Record vitals, prepare patients for consultation",
    accent: "from-pink-500 to-rose-600",
    iconBg: "bg-pink-50 text-pink-700 ring-pink-100",
    path: "/nurse",
  },
  pharmacist: {
    icon: Pill,
    description: "View prescriptions, mark medicines as dispensed",
    accent: "from-purple-500 to-fuchsia-600",
    iconBg: "bg-purple-50 text-purple-700 ring-purple-100",
    path: "/pharmacy",
  },
  admin: {
    icon: Shield,
    description: "Manage staff, configure clinic settings, view analytics",
    accent: "from-amber-500 to-orange-600",
    iconBg: "bg-amber-50 text-amber-700 ring-amber-100",
    path: "/admin",
    disabled: true,
  },
};

export default function DemoLogin() {
  const { users } = useStore();
  const { loginAs } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (role) => {
    const meta = ROLE_META[role];
    if (meta?.disabled) return;
    loginAs(role);
    navigate(meta.path);
  };

  return (
    <div className="min-h-full flex flex-col items-center justify-center p-4 sm:p-6 lg:p-10">
      <div className="w-full max-w-5xl">
        <div className="flex flex-col items-center text-center mb-10 fade-up-enter">
          <Logo size={48} />
          <div className="mt-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium ring-1 ring-primary/20">
            <Sparkles className="size-3.5" />
            Demo Mode — choose a role to explore
          </div>
          <h1 className="mt-5 text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
            Welcome to Sunrise Family Clinic
          </h1>
          <p className="mt-2.5 text-muted-foreground max-w-lg text-sm sm:text-base">
            One-click login as any team member. No password required for the demo experience.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 stagger">
          {users.map((u) => {
            const meta = ROLE_META[u.role] || {};
            const Icon = meta.icon || UserRound;
            return (
              <button
                key={u.id}
                onClick={() => handleLogin(u.role)}
                disabled={meta.disabled}
                className={cn(
                  "group relative bg-card text-left rounded-2xl border border-border p-5 flex flex-col gap-4 overflow-hidden transition-all duration-200",
                  "hover:border-primary/30 hover:shadow-[0_8px_24px_-12px_rgba(42,157,143,0.18)] hover:-translate-y-0.5",
                  meta.disabled && "opacity-50 cursor-not-allowed hover:translate-y-0 hover:border-border hover:shadow-none"
                )}
                style={{ transitionTimingFunction: "cubic-bezier(0.23, 1, 0.32, 1)" }}
              >
                <div className="flex items-start justify-between">
                  <div className={cn("size-11 rounded-xl flex items-center justify-center ring-1", meta.iconBg)}>
                    <Icon className="size-5" />
                  </div>
                  {meta.disabled ? (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground uppercase tracking-wider">
                      Soon
                    </span>
                  ) : (
                    <ArrowRight className="size-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {u.role}
                  </p>
                  <h3 className="text-base font-semibold text-foreground tracking-tight">{u.name}</h3>
                  {u.specialty && (
                    <p className="text-xs text-muted-foreground">{u.specialty}</p>
                  )}
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed">{meta.description}</p>

                {!meta.disabled && (
                  <div className="mt-auto pt-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary">
                      {u.loginLabel}
                      <ArrowRight className="size-3.5" />
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8">
          SwasthyaEMR · v1.0 MVP · Built for Indian clinics
        </p>
      </div>
    </div>
  );
}
