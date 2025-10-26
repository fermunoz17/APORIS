import React from "react";

/** Simple scrolling audit list (pairs with the Audit tab export) */
export default function AuditLog({ rows }) {
  return (
    <div className="section-card">
      <div className="section-card__head">
        <h3 className="section-card__title">Audit Log</h3>
      </div>
      <div
        style={{
          height: 260,
          overflow: "auto",
          border: "1px solid #eee",
          borderRadius: 10,
          padding: 10,
          background: "#fff",
        }}
      >
        {(!rows || rows.length === 0) ? (
          <div className="ap-kpi__hint">No audit entries yet — accept a plan to run a simulation.</div>
        ) : (
          rows.map((r, i) => <div key={i}>• {r}</div>)
        )}
      </div>
    </div>
  );
}
