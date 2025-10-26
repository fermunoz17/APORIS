import React from "react";

export default function KpiCards({ kpis, week }) {
  const Box = ({ label, value }) => (
    <div className="p-4 rounded-xl shadow-sm border">
      <div className="text-sm opacity-70">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
  return (
    <div className="space-y-3">
      <div className="text-lg font-semibold">Week {week}</div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <Box label="Uptime" value={`${kpis.uptime}%`} />
        <Box label="Cyber Risk (lower=better)" value={kpis.cyberRisk} />
        <Box label="Compliance" value={kpis.compliance} />
        <Box label="Efficiency" value={kpis.efficiency} />
        <Box label="Total Score" value={kpis.total} />
      </div>
    </div>
  );
}
