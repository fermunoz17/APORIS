import React from "react";

/** Compact KPI ribbon used inside the Play card */
export default function KpiCards({ kpis, week }) {
  const Box = ({ label, value, hint }) => (
    <div className="ap-kpi">
      <div className="ap-kpi__label">{label}</div>
      <div className="ap-kpi__value">{value}</div>
      {hint && <div className="ap-kpi__hint">{hint}</div>}
    </div>
  );

  return (
    <div className="ap-grid" style={{ gridTemplateColumns: "repeat(6, minmax(0, 1fr))" }}>
      <Box label="Week" value={week} />
      <Box label="Uptime" value={`${kpis.uptime}%`} />
      <Box label="Cyber Risk (lower=better)" value={kpis.cyberRisk} />
      <Box label="Compliance" value={kpis.compliance} />
      <Box label="Efficiency" value={kpis.efficiency} />
      <Box label="Total Score" value={kpis.total} />
    </div>
  );
}
