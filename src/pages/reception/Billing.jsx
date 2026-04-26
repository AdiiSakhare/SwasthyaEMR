import { useState, useCallback } from "react";
import { Receipt, Plus, Printer, Trash2, IndianRupee, Wallet, CreditCard, Smartphone } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Empty } from "@/components/ui/empty";
import { Dialog, DialogBody, DialogFooter } from "@/components/ui/dialog";
import { Input, Field, Label, FieldGroup } from "@/components/ui/input";
import { PrintInvoice } from "@/components/PrintInvoice";
import { useStore } from "@/data/store";
import { useToast } from "@/components/ui/toast";
import { formatDate, formatINR } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function Billing() {
  const { invoices, patients, recordPayment, updateInvoice } = useStore();
  const { toast } = useToast();
  const [activeId, setActiveId] = useState(null);

  const today = new Date().toISOString().slice(0, 10);
  const todays = invoices.filter((i) => i.date === today);
  const collected = todays.filter((i) => i.status === "paid").reduce((s, i) => s + i.total, 0);
  const pending = invoices.filter((i) => i.status === "pending");
  const totalPending = pending.reduce((s, i) => s + i.total, 0);

  const patientById = (id) => patients.find((p) => p.id === id);
  const active = invoices.find((i) => i.id === activeId);

  return (
    <div className="max-w-6xl mx-auto fade-up-enter">
      <PageHeader
        eyebrow="Billing"
        title="Today's Billing"
        description="Track collections, manage invoices, record payments."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-8 stagger">
        <StatCard label="Collected today" value={formatINR(collected)} icon={IndianRupee} accent="emerald" />
        <StatCard label="Invoices today" value={todays.length} icon={Receipt} accent="primary" />
        <StatCard label="Pending invoices" value={pending.length} icon={Receipt} accent="amber" />
        <StatCard label="Total pending" value={formatINR(totalPending)} icon={IndianRupee} accent="rose" />
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="p-5 border-b border-border">
          <h2 className="text-base font-semibold tracking-tight">All Invoices</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Click an invoice to record payment or view details.</p>
        </div>
        {invoices.length === 0 ? (
          <Empty icon={Receipt} title="No invoices yet" description="Invoices auto-generate when consultations complete." />
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3 uppercase tracking-wider">Invoice</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3 uppercase tracking-wider">Patient</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3 uppercase tracking-wider hidden md:table-cell">Date</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3 uppercase tracking-wider">Amount</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3 uppercase tracking-wider hidden md:table-cell">Mode</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((i) => {
                const p = patientById(i.patientId);
                return (
                  <tr key={i.id} className="border-b border-border/60 last:border-0 hover:bg-muted/40 transition-colors">
                    <td className="px-5 py-3.5 text-sm font-medium">{i.id}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={p?.name} size="sm" />
                        <span className="text-sm font-medium">{p?.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-muted-foreground hidden md:table-cell">{formatDate(i.date)}</td>
                    <td className="px-5 py-3.5 text-sm font-semibold">{formatINR(i.total)}</td>
                    <td className="px-5 py-3.5 text-sm text-muted-foreground hidden md:table-cell">{i.paymentMode || "—"}</td>
                    <td className="px-5 py-3.5"><Badge variant={i.status}>{i.status}</Badge></td>
                    <td className="px-5 py-3.5 text-right">
                      <Button size="sm" variant={i.status === "pending" ? "default" : "outline"} onClick={() => setActiveId(i.id)}>
                        {i.status === "pending" ? "Record payment" : "View"}
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {active && (
        <InvoiceDialog
          invoice={active}
          patient={patientById(active.patientId)}
          onClose={() => setActiveId(null)}
          onUpdate={(updates) => updateInvoice(active.id, updates)}
          onPay={(mode) => {
            recordPayment(active.id, mode);
            toast({ type: "success", title: "Payment recorded", description: `${mode} · ${formatINR(active.total)}` });
            setActiveId(null);
          }}
        />
      )}
    </div>
  );
}

function InvoiceDialog({ invoice, patient, onClose, onUpdate, onPay }) {
  const { clinic } = useStore();
  const [items, setItems] = useState(invoice.items);
  const [newLabel, setNewLabel] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [mode, setMode] = useState(invoice.paymentMode || "Cash");

  const total = items.reduce((s, i) => s + Number(i.amount || 0), 0);

  const addItem = () => {
    if (!newLabel || !newAmount) return;
    const next = [...items, { label: newLabel, amount: Number(newAmount) }];
    setItems(next);
    onUpdate({ items: next, total: next.reduce((s, i) => s + Number(i.amount), 0) });
    setNewLabel("");
    setNewAmount("");
  };

  const removeItem = (idx) => {
    const next = items.filter((_, i) => i !== idx);
    setItems(next);
    onUpdate({ items: next, total: next.reduce((s, i) => s + Number(i.amount), 0) });
  };

  return (
    <Dialog open onClose={onClose} title={`Invoice ${invoice.id}`} description={patient?.name} size="lg">
      <DialogBody>
        <div className="bg-muted/40 rounded-xl border border-border p-4 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Date</span>
            <span className="font-medium">{formatDate(invoice.date)}</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-1.5">
            <span className="text-muted-foreground">Patient</span>
            <span className="font-medium">{patient?.name} · {patient?.id}</span>
          </div>
        </div>

        <Label className="mb-2 block">Line items</Label>
        <div className="border border-border rounded-xl overflow-hidden mb-3">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-center gap-3 p-3 border-b border-border last:border-0">
              <span className="flex-1 text-sm">{item.label}</span>
              <span className="text-sm font-medium">{formatINR(item.amount)}</span>
              {invoice.status !== "paid" && (
                <button onClick={() => removeItem(idx)} className="size-7 rounded-lg hover:bg-muted text-muted-foreground hover:text-destructive flex items-center justify-center">
                  <Trash2 className="size-3.5" />
                </button>
              )}
            </div>
          ))}
          {invoice.status !== "paid" && (
            <div className="flex items-center gap-2 p-2 bg-muted/40">
              <Input placeholder="Item label" value={newLabel} onChange={(e) => setNewLabel(e.target.value)} className="h-9" />
              <Input placeholder="Amount" type="number" value={newAmount} onChange={(e) => setNewAmount(e.target.value)} className="h-9 w-32" />
              <Button size="sm" variant="outline" onClick={addItem}><Plus className="size-3.5" /></Button>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl bg-primary/5 border border-primary/20 mb-4">
          <span className="text-sm font-semibold">Total</span>
          <span className="text-2xl font-semibold text-primary">{formatINR(total)}</span>
        </div>

        {invoice.status !== "paid" && (
          <FieldGroup>
            <Field>
              <Label>Payment mode</Label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "Cash", icon: Wallet },
                  { id: "UPI", icon: Smartphone },
                  { id: "Card", icon: CreditCard },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMode(m.id)}
                    className={cn(
                      "flex items-center justify-center gap-2 h-11 rounded-xl border text-sm font-medium transition-all",
                      mode === m.id ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-foreground/20"
                    )}
                  >
                    <m.icon className="size-4" />
                    {m.id}
                  </button>
                ))}
              </div>
            </Field>
          </FieldGroup>
        )}
      </DialogBody>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Close</Button>
        <Button
          variant="outline"
          onClick={() => {
            // Mount print content then print
            const liveInvoice = { ...invoice, items, total };
            window._printReady = true;
            window.print();
          }}
        >
          <Printer className="size-4" />
          Print
        </Button>
        {invoice.status !== "paid" && (
          <Button onClick={() => onPay(mode)}>
            <IndianRupee className="size-4" />
            Record Payment
          </Button>
        )}
      </DialogFooter>
      <PrintInvoice
        invoice={{ ...invoice, items, total }}
        patient={patient}
        clinic={clinic}
      />
    </Dialog>
  );
}
