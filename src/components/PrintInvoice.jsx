/**
 * PrintInvoice — renders a print-ready invoice inside a .print-area div.
 * The @media print CSS in index.css hides everything else and shows only .print-area.
 *
 * Usage: mount before calling window.print(), unmount after.
 */
import { createPortal } from "react-dom";
import { formatDate, formatINR } from "@/lib/utils";

export function PrintInvoice({ invoice, patient, clinic }) {
  const content = (
    <div className="print-area" style={{ display: "none" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div>
          <div className="print-title">{clinic?.name}</div>
          <div style={{ fontSize: 9, color: "#555", marginTop: 2 }}>{clinic?.address}</div>
          <div style={{ fontSize: 9, color: "#555" }}>{clinic?.phone} · {clinic?.workingHours}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#2a9d8f" }}>INVOICE</div>
          <div className="print-label" style={{ marginTop: 4 }}>{invoice.id}</div>
        </div>
      </div>

      <div className="print-divider" />

      {/* Bill to */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, margin: "12pt 0" }}>
        <div>
          <div className="print-label">Bill To</div>
          <div style={{ fontWeight: 600, marginTop: 4 }}>{patient?.name}</div>
          <div style={{ fontSize: 9, color: "#555" }}>{patient?.id} · {patient?.phone}</div>
          {patient?.address && <div style={{ fontSize: 9, color: "#555" }}>{patient.address}</div>}
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="print-label">Invoice Date</div>
          <div style={{ fontWeight: 500, marginTop: 4 }}>{formatDate(invoice.date)}</div>
          <div className="print-label" style={{ marginTop: 8 }}>Status</div>
          <div style={{ fontWeight: 600, color: invoice.status === "paid" ? "#16a34a" : "#f59e0b", marginTop: 4, textTransform: "uppercase" }}>
            {invoice.status}
          </div>
        </div>
      </div>

      <div className="print-divider" />

      {/* Line items table */}
      <table className="print-table" style={{ width: "100%", borderCollapse: "collapse", marginTop: 8 }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left" }}>#</th>
            <th style={{ textAlign: "left" }}>Description</th>
            <th style={{ textAlign: "right" }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item, i) => (
            <tr key={i}>
              <td style={{ color: "#888" }}>{i + 1}</td>
              <td>{item.label}</td>
              <td style={{ textAlign: "right" }}>{formatINR(item.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="print-divider" />

      {/* Total */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
        <div style={{ textAlign: "right" }}>
          <div className="print-label">Total Amount</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#2a9d8f", marginTop: 2 }}>{formatINR(invoice.total)}</div>
          {invoice.paymentMode && (
            <div style={{ fontSize: 9, color: "#555", marginTop: 4 }}>Paid via {invoice.paymentMode}</div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="print-footer" style={{ marginTop: 32 }}>
        <div className="print-divider" />
        Thank you for choosing {clinic?.name}. This is a computer-generated invoice.
        <br />
        SwasthyaEMR · {clinic?.phone}
      </div>
    </div>
  );

  return createPortal(content, document.body);
}

export function PrintPrescription({ prescription, patient, doctor, clinic }) {
  const content = (
    <div className="print-area" style={{ display: "none" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div>
          <div className="print-title">{clinic?.name}</div>
          <div style={{ fontSize: 9, color: "#555", marginTop: 2 }}>{clinic?.address} · {clinic?.phone}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: "#2a9d8f" }}>PRESCRIPTION</div>
          <div style={{ fontSize: 9, color: "#555", marginTop: 2 }}>{prescription.id}</div>
        </div>
      </div>

      <div className="print-divider" />

      {/* Patient + Doctor row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, margin: "10pt 0" }}>
        <div>
          <div className="print-label">Patient</div>
          <div style={{ fontWeight: 600, marginTop: 4 }}>{patient?.name}</div>
          <div style={{ fontSize: 9, color: "#555" }}>{patient?.id} · {patient?.gender} · {patient?.phone}</div>
          {patient?.allergies?.length > 0 && (
            <div style={{ fontSize: 9, color: "#c00", marginTop: 4 }}>⚠ Allergies: {patient.allergies.join(", ")}</div>
          )}
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="print-label">Prescribed by</div>
          <div style={{ fontWeight: 600, marginTop: 4 }}>{doctor?.name}</div>
          <div style={{ fontSize: 9, color: "#555" }}>{doctor?.specialty}{doctor?.regNo && ` · Reg: ${doctor.regNo}`}</div>
          <div className="print-label" style={{ marginTop: 8 }}>Date</div>
          <div style={{ fontWeight: 500, marginTop: 2 }}>{formatDate(prescription.date)}</div>
        </div>
      </div>

      <div className="print-divider" />

      {/* Medicines */}
      <div style={{ marginTop: 10 }}>
        <div className="print-label" style={{ marginBottom: 8 }}>Medicines</div>
        {prescription.items.map((it, i) => (
          <div key={i} style={{ display: "flex", gap: 12, padding: "6pt 0", borderBottom: "0.5pt solid #eee" }}>
            <div style={{ width: 20, fontWeight: 700, color: "#2a9d8f", flexShrink: 0 }}>{i + 1}.</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 11 }}>{it.name}</div>
              <div style={{ fontSize: 9, color: "#444", marginTop: 2 }}>
                {it.dosage} &nbsp;·&nbsp; {it.frequency} &nbsp;·&nbsp; {it.duration}
              </div>
              {it.instructions && (
                <div style={{ fontSize: 9, color: "#888", fontStyle: "italic", marginTop: 2 }}>
                  {it.instructions}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Signature area */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 32 }}>
        <div style={{ textAlign: "center", borderTop: "1px solid #000", paddingTop: 4, width: 160 }}>
          <div style={{ fontSize: 9 }}>{doctor?.name}</div>
          <div style={{ fontSize: 8, color: "#888" }}>Signature &amp; Stamp</div>
        </div>
      </div>

      <div className="print-footer">
        <div className="print-divider" />
        Valid for 30 days from the date of issue. SwasthyaEMR · {clinic?.name}
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
