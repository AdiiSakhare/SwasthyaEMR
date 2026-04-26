import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, AlertTriangle, CheckCircle2, UserPlus } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input, Field, FieldGroup, Label, FieldHint, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useStore } from "@/data/store";
import { useToast } from "@/components/ui/toast";

export default function PatientRegister() {
  const { addPatient, findDuplicatePatient } = useStore();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    dob: "",
    gender: "M",
    phone: "",
    address: "",
    bloodGroup: "",
  });
  const [duplicate, setDuplicate] = useState(null);
  const [touched, setTouched] = useState({});

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const onPhoneBlur = () => {
    if (!form.phone) return;
    const dup = findDuplicatePatient(form.phone);
    setDuplicate(dup);
  };

  const requiredOk = form.name.trim() && form.dob && form.gender && form.phone.trim();

  const submit = (e) => {
    e.preventDefault();
    setTouched({ name: true, dob: true, phone: true });
    if (!requiredOk) return;
    const dup = findDuplicatePatient(form.phone);
    if (dup) {
      setDuplicate(dup);
      return;
    }
    const p = addPatient(form);
    toast({ type: "success", title: "Patient registered", description: `${p.name} · ${p.id}` });
    navigate(`/reception/patients/${p.id}`);
  };

  return (
    <div className="max-w-2xl mx-auto fade-up-enter">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="size-4" /> Back
      </button>

      <PageHeader
        eyebrow="Step 1 of 2"
        title="Register New Patient"
        description="Required fields: name, date of birth, gender, phone."
      />

      <form onSubmit={submit} className="bg-card rounded-2xl border border-border p-5 sm:p-6">
        <FieldGroup>
          <Field>
            <Label htmlFor="name">Full name *</Label>
            <Input
              id="name"
              placeholder="e.g. Arun Verma"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, name: true }))}
              autoFocus
            />
            {touched.name && !form.name.trim() && (
              <FieldHint className="text-destructive">Name is required.</FieldHint>
            )}
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field>
              <Label htmlFor="dob">Date of birth *</Label>
              <Input
                id="dob"
                type="date"
                value={form.dob}
                onChange={(e) => set("dob", e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, dob: true }))}
              />
              {touched.dob && !form.dob && (
                <FieldHint className="text-destructive">Date of birth is required.</FieldHint>
              )}
            </Field>
            <Field>
              <Label htmlFor="gender">Gender *</Label>
              <Select id="gender" value={form.gender} onChange={(e) => set("gender", e.target.value)}>
                <option value="M">Male</option>
                <option value="F">Female</option>
                <option value="O">Other</option>
              </Select>
            </Field>
          </div>

          <Field>
            <Label htmlFor="phone">Phone *</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+91 98201 11122"
              value={form.phone}
              onChange={(e) => {
                set("phone", e.target.value);
                setDuplicate(null);
              }}
              onBlur={onPhoneBlur}
            />
            {touched.phone && !form.phone.trim() && (
              <FieldHint className="text-destructive">Phone number is required.</FieldHint>
            )}
            {duplicate && (
              <div className="mt-2 p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
                <AlertTriangle className="size-4 text-amber-700 mt-0.5 shrink-0" />
                <div className="flex-1 text-sm">
                  <p className="font-medium text-amber-900">A patient with this phone already exists.</p>
                  <p className="text-amber-800 mt-0.5">{duplicate.name} · {duplicate.id}</p>
                  <button
                    type="button"
                    onClick={() => navigate(`/reception/patients/${duplicate.id}`)}
                    className="mt-2 text-xs font-medium text-amber-900 underline underline-offset-2 hover:text-amber-700"
                  >
                    View existing profile →
                  </button>
                </div>
              </div>
            )}
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field>
              <Label htmlFor="bloodGroup">Blood group</Label>
              <Select id="bloodGroup" value={form.bloodGroup} onChange={(e) => set("bloodGroup", e.target.value)}>
                <option value="">Optional</option>
                {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </Select>
            </Field>
            <Field>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                placeholder="Optional"
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
              />
            </Field>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground">
              <CheckCircle2 className="size-3.5 inline mr-1 text-emerald-600" />
              Patient ID auto-generated
            </p>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!requiredOk}>
                <UserPlus className="size-4" />
                Register Patient
              </Button>
            </div>
          </div>
        </FieldGroup>
      </form>
    </div>
  );
}
