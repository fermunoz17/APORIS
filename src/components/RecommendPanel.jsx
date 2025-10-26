import React, { useMemo, useState } from "react";
import { recommendPlan } from "../game/engine/scheduler";

export default function RecommendPanel({ assets, onAccept }) {
  const [weekday, setWeekday] = useState("Sat");
  const plan = useMemo(() => recommendPlan(assets, weekday), [assets, weekday]);
  const [selected, setSelected] = useState(() => plan.map(p => p.assetId));

  const toggle = (id) =>
    setSelected(sel => sel.includes(id) ? sel.filter(x=>x!==id) : [...sel, id]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h3 className="font-semibold text-lg">AI Recommendations</h3>
        <select className="border rounded px-2 py-1" value={weekday} onChange={e=>setWeekday(e.target.value)}>
          {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d=><option key={d}>{d}</option>)}
        </select>
      </div>

      <div className="space-y-2">
        {plan.map(item => (
          <label key={item.assetId} className="flex items-center gap-3 p-3 border rounded">
            <input type="checkbox" checked={selected.includes(item.assetId)} onChange={()=>toggle(item.assetId)} />
            <div className="grow">
              <div className="font-medium">{item.assetName} • Priority {item.score}</div>
              <div className="text-xs opacity-70">
                Window {item.window.day} {item.window.start}-{item.window.end} ·
                Install {item.expectedInstallMin}m · {item.rebootRequired ? "Reboot" : "Hot/Rolling"}
              </div>
              <div className="text-xs opacity-70">Reasons: {item.reasons.join(", ")}</div>
            </div>
          </label>
        ))}
      </div>

      <button
        className="px-4 py-2 rounded-lg bg-black text-white"
        onClick={() => onAccept(plan.filter(p => selected.includes(p.assetId)))}
      >
        Accept Selected & Simulate
      </button>
    </div>
  );
}
