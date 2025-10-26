import React from "react";

export default function AuditLog({ rows }) {
  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-lg">Audit Log</h3>
      <div className="p-3 border rounded h-64 overflow-auto text-sm">
        {rows.length === 0 ? <div className="opacity-60">No audit entries yet.</div> :
          rows.map((r,i)=><div key={i}>• {r}</div>)}
      </div>
    </div>
  );
}
