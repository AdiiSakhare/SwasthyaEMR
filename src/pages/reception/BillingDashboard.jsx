import { useMemo } from "react";
import { TrendingUp, Wallet, AlertCircle, Zap } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useStore } from "@/data/store";
import { formatINR, formatDate } from "@/lib/utils";

export default function BillingDashboard() {
  const { invoices, patients } = useStore();

  const today = new Date().toISOString().slice(0, 10);
  const thisWeekStart = new Date();
  thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());
  const thisWeekStartStr = thisWeekStart.toISOString().slice(0, 10);

  const thisMonthStart = new Date();
  thisMonthStart.setDate(1);
  const thisMonthStartStr = thisMonthStart.toISOString().slice(0, 10);

  const patientById = (id) => patients.find((p) => p.id === id);

  // Calculations
  const todayInvoices = useMemo(
    () => invoices.filter((i) => i.date === today),
    [invoices, today]
  );

  const thisWeekInvoices = useMemo(
    () => invoices.filter((i) => i.date >= thisWeekStartStr && i.date <= today),
    [invoices, thisWeekStartStr, today]
  );

  const thisMonthInvoices = useMemo(
    () => invoices.filter((i) => i.date >= thisMonthStartStr && i.date <= today),
    [invoices, thisMonthStartStr, today]
  );

  const todayCollected = todayInvoices
    .filter((i) => i.status === "paid")
    .reduce((s, i) => s + i.total, 0);

  const weekCollected = thisWeekInvoices
    .filter((i) => i.status === "paid")
    .reduce((s, i) => s + i.total, 0);

  const monthCollected = thisMonthInvoices
    .filter((i) => i.status === "paid")
    .reduce((s, i) => s + i.total, 0);

  const pendingInvoices = invoices.filter((i) => i.status === "pending");
  const totalPending = pendingInvoices.reduce((s, i) => s + i.total, 0);

  // Payment mode breakdown
  const paymentModeBreakdown = useMemo(() => {
    const paid = invoices.filter((i) => i.status === "paid");
    const modes = {};
    paid.forEach((i) => {
      const mode = i.paymentMode || "Other";
      modes[mode] = (modes[mode] || 0) + i.total;
    });
    return Object.entries(modes)
      .map(([mode, amount]) => ({ mode, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [invoices]);

  // Recent transactions (last 7 days, paid only)
  const recentTransactions = useMemo(() => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().slice(0, 10);

    return invoices
      .filter((i) => i.status === "paid" && i.date >= sevenDaysAgoStr && i.date <= today)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 8);
  }, [invoices, today]);

  // Daily totals for past 7 days
  const dailyTotals = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().slice(0, 10);
      const dayInvoices = invoices.filter((inv) => inv.date === dateStr && inv.status === "paid");
      const total = dayInvoices.reduce((s, inv) => s + inv.total, 0);
      days.push({ date: dateStr, total, count: dayInvoices.length });
    }
    return days;
  }, [invoices]);

  const maxDaily = Math.max(...dailyTotals.map((d) => d.total), 1);

  return (
    <div className="max-w-6xl mx-auto fade-up-enter">
      <PageHeader
        eyebrow="Analytics"
        title="Billing Dashboard"
        description="Track collections, pending payments, and payment trends."
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-8 stagger">
        <StatCard label="Collected today" value={formatINR(todayCollected)} icon={Wallet} accent="emerald" />
        <StatCard label="This week" value={formatINR(weekCollected)} icon={TrendingUp} accent="blue" />
        <StatCard label="This month" value={formatINR(monthCollected)} icon={TrendingUp} accent="primary" />
        <StatCard label="Pending amount" value={formatINR(totalPending)} icon={AlertCircle} accent="rose" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Daily Collection Trend */}
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border overflow-hidden">
          <div className="p-5 border-b border-border">
            <h2 className="text-base font-semibold tracking-tight">7-Day Collection Trend</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Daily revenue collected</p>
          </div>

          <div className="p-5">
            <div className="flex items-end justify-between gap-3 h-32">
              {dailyTotals.map((day, idx) => {
                const heightPercent = maxDaily > 0 ? (day.total / maxDaily) * 100 : 0;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                    <div className="w-full bg-muted rounded-t-lg relative overflow-hidden group-hover:bg-muted/80 transition-colors" style={{ height: `${Math.max(heightPercent, 8)}%` }}>
                      <div className="absolute inset-0 bg-primary/30 group-hover:bg-primary/50 transition-colors" />
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] font-medium text-foreground">{formatINR(day.total)}</p>
                      <p className="text-[9px] text-muted-foreground mt-0.5">
                        {new Date(day.date).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Payment Mode Breakdown */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="p-5 border-b border-border">
            <h2 className="text-base font-semibold tracking-tight">Payment Modes</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Revenue by method</p>
          </div>

          <div className="p-5 space-y-3">
            {paymentModeBreakdown.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">No payments yet</p>
            ) : (
              paymentModeBreakdown.map((item) => {
                const total = paymentModeBreakdown.reduce((s, m) => s + m.amount, 0);
                const percent = total > 0 ? (item.amount / total) * 100 : 0;
                return (
                  <div key={item.mode}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium">{item.mode}</span>
                      <span className="text-xs font-semibold text-primary">{percent.toFixed(0)}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">{formatINR(item.amount)}</p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mt-6">
        {/* Pending Invoices */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="p-5 border-b border-border">
            <h2 className="text-base font-semibold tracking-tight">Pending Invoices</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{pendingInvoices.length} invoice{pendingInvoices.length !== 1 ? "s" : ""}</p>
          </div>

          <div className="divide-y divide-border max-h-80 overflow-y-auto">
            {pendingInvoices.length === 0 ? (
              <div className="p-5 text-center text-muted-foreground text-sm">
                All invoices paid! 🎉
              </div>
            ) : (
              pendingInvoices.slice(0, 10).map((invoice) => {
                const p = patientById(invoice.patientId);
                return (
                  <div key={invoice.id} className="p-4 hover:bg-muted/40 transition-colors">
                    <div className="flex items-center gap-3 mb-2">
                      <Avatar name={p?.name} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{p?.name}</p>
                        <p className="text-xs text-muted-foreground">{invoice.id}</p>
                      </div>
                      <span className="text-sm font-semibold">{formatINR(invoice.total)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] text-muted-foreground">{formatDate(invoice.date)}</p>
                      <Badge variant="pending" className="text-[10px]">Pending</Badge>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="p-5 border-b border-border">
            <h2 className="text-base font-semibold tracking-tight">Recent Transactions</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Last 7 days</p>
          </div>

          <div className="divide-y divide-border max-h-80 overflow-y-auto">
            {recentTransactions.length === 0 ? (
              <div className="p-5 text-center text-muted-foreground text-sm">
                No transactions yet
              </div>
            ) : (
              recentTransactions.map((invoice) => {
                const p = patientById(invoice.patientId);
                return (
                  <div key={invoice.id} className="p-4 hover:bg-muted/40 transition-colors">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="size-7 rounded-lg bg-emerald-50 flex items-center justify-center">
                        <Zap className="size-3.5 text-emerald-700" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{p?.name}</p>
                        <p className="text-xs text-muted-foreground">{invoice.paymentMode || "Unknown"}</p>
                      </div>
                      <span className="text-sm font-semibold text-emerald-700">{formatINR(invoice.total)}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">{formatDate(invoice.date)}</p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
