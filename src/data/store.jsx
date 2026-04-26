import { createContext, useContext, useState, useCallback } from "react";
import seed from "./seed.json";
import { genId } from "@/lib/utils";

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [clinic] = useState(seed.clinic);
  const [users] = useState(seed.users);
  const [patients, setPatients] = useState(seed.patients);
  const [vitals, setVitals] = useState(seed.vitals);
  const [visits, setVisits] = useState(seed.visits);
  const [appointments, setAppointments] = useState(seed.appointments);
  const [medicines] = useState(seed.medicines);
  const [prescriptions, setPrescriptions] = useState(seed.prescriptions);
  const [templates, setTemplates] = useState(seed.templates);
  const [invoices, setInvoices] = useState(seed.invoices);

  const addPatient = useCallback((data) => {
    const id = genId("P");
    const patient = { id, allergies: [], conditions: [], createdAt: new Date().toISOString().slice(0, 10), ...data };
    setPatients((p) => [patient, ...p]);
    return patient;
  }, []);

  const updatePatient = useCallback((id, updates) => {
    setPatients((arr) => arr.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  }, []);

  const findDuplicatePatient = useCallback((phone) => {
    if (!phone) return null;
    const normalized = phone.replace(/\D/g, "").slice(-10);
    return patients.find((p) => p.phone.replace(/\D/g, "").slice(-10) === normalized) || null;
  }, [patients]);

  const addAppointment = useCallback((data) => {
    const id = genId("A");
    const appt = { id, status: data.type === "walkin" ? "waiting" : "scheduled", ...data };
    setAppointments((a) => [appt, ...a]);
    return appt;
  }, []);

  const updateAppointmentStatus = useCallback((id, status) => {
    setAppointments((a) => a.map((x) => (x.id === id ? { ...x, status, ...(status === "waiting" && !x.checkInAt ? { checkInAt: new Date().toISOString() } : {}) } : x)));
  }, []);

  const completeConsultation = useCallback((appointmentId, { complaint, notes, diagnosis, followUp, prescriptionItems }) => {
    const appt = appointments.find((a) => a.id === appointmentId);
    if (!appt) return null;
    const visitId = genId("V");
    const rxId = prescriptionItems?.length ? genId("RX") : null;

    const visit = {
      id: visitId,
      patientId: appt.patientId,
      doctorId: appt.doctorId,
      date: appt.date,
      complaint,
      notes,
      diagnosis,
      followUp,
      prescriptionId: rxId,
    };
    setVisits((v) => [visit, ...v]);

    if (rxId) {
      const rx = {
        id: rxId,
        visitId,
        patientId: appt.patientId,
        doctorId: appt.doctorId,
        date: appt.date,
        items: prescriptionItems,
        dispensed: false,
      };
      setPrescriptions((p) => [rx, ...p]);
    }

    setAppointments((a) => a.map((x) => (x.id === appointmentId ? { ...x, status: "completed" } : x)));

    const invId = genId("INV");
    const invoice = {
      id: invId,
      patientId: appt.patientId,
      appointmentId,
      date: appt.date,
      items: [{ label: "Consultation", amount: clinic.consultationFee }],
      total: clinic.consultationFee,
      paymentMode: null,
      status: "pending",
    };
    setInvoices((inv) => [invoice, ...inv]);

    return { visit, prescriptionId: rxId, invoiceId: invId };
  }, [appointments, clinic.consultationFee]);

  const recordPayment = useCallback((invoiceId, mode, status = "paid") => {
    setInvoices((inv) => inv.map((x) => (x.id === invoiceId ? { ...x, paymentMode: mode, status } : x)));
  }, []);

  const updateInvoice = useCallback((invoiceId, updates) => {
    setInvoices((inv) => inv.map((x) => (x.id === invoiceId ? { ...x, ...updates } : x)));
  }, []);

  const dispensePrescription = useCallback((rxId) => {
    setPrescriptions((p) => p.map((x) => (x.id === rxId ? { ...x, dispensed: true } : x)));
  }, []);

  const addTemplate = useCallback((doctorId, name, items) => {
    const t = { id: genId("T"), doctorId, name, lastUsed: new Date().toISOString().slice(0, 10), items };
    setTemplates((arr) => [t, ...arr]);
    return t;
  }, []);

  const recordVitals = useCallback((patientId, data) => {
    const entry = { patientId, date: new Date().toISOString().slice(0, 10), ...data };
    setVitals((v) => [entry, ...v]);
  }, []);

  const value = {
    clinic, users, patients, vitals, visits, appointments, medicines, prescriptions, templates, invoices,
    addPatient, updatePatient, findDuplicatePatient, addAppointment, updateAppointmentStatus, completeConsultation,
    recordPayment, updateInvoice, dispensePrescription, addTemplate, recordVitals,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
