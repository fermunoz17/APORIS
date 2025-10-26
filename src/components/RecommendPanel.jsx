import React, { useMemo, useState } from "react";
import { recommendPlan } from "../game/engine/scheduler";

function fmtM(m) {
  return `${m}m`;
}

/**
 * Shows AI recommendations for the selected weekday,
 * allows multi-select, and triggers simulation via onAccept(plan).
 */
export default function RecommendPanel({ assets, onAccept }) {
  const [weekday, setWeekday] = useState("Sat");
  const plan = useMemo(() => recommendPlan(assets, weekday), [assets, weekday]);
  const [selected, setSelected] = useState(() => plan.map(p => p.assetId));

  // Keep selections in sync if the plan changes
  React.useEffect(() => {
    setSelected(prev => {
      const ids = new Set(plan.map(p => p.assetId));
      return prev.filter(id => ids.has(id));
    });
  }, [plan]);

  const toggle = (id) =>
    setSelected((sel) => (sel.includes(id) ? sel.filter((x) => x !== id) : [...sel, id]));

  const allChecked = selected.length === plan.length && plan.length > 0;
  const toggleAll = () =>
    setSelected(allChecked ? [] : plan.map((p) => p.assetId));

  return (
    <div className="section-card">
      <div className="section-card__head">
        <h3 className="section-card__title">AI Recommendations</h3>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <label className="ap-kpi__hint">Window day</label>
          <select
            className="input"
            value={weekday}
            onChange={(e) => setWeekday(e.target.value)}
            style={{ width: 120 }}
          >
            {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {plan.length === 0 ? (
        <div className="ap-kpi__hint">No assets have a maintenance window on {weekday}. Try another day.</div>
      ) : (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="checkbox"
                checked={allChecked}
                onChange={toggleAll}
              />
              <span className="ap-kpi__hint">
                Select all ({selected.length}/{plan.length})
              </span>
            </label>
            <button
              className="btn btn--primary"
              onClick={() => onAccept(plan.filter((p) => selected.includes(p.assetId)))}
              disabled={selected.length === 0}
            >
              Accept Selected & Simulate
            </button>
          </div>

          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th></th>
                  <th>Asset</th>
                  <th>Priority</th>
                  <th>Window</th>
                  <th>Install</th>
                  <th>Method</th>
                  <th>Reasons</th>
                </tr>
              </thead>
              <tbody>
                {plan.map((item) => (
                  <tr key={item.assetId}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selected.includes(item.assetId)}
                        onChange={() => toggle(item.assetId)}
                        aria-label={`select ${item.assetName}`}
                      />
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{item.assetName}</div>
                      <div className="ap-kpi__hint">{item.assetId}</div>
                    </td>
                    <td>{item.score}</td>
                    <td>
                      <span className="pill pill--blue">
                        {item.window.day} {item.window.start}-{item.window.end}
                      </span>
                    </td>
                    <td>{fmtM(item.expectedInstallMin)}</td>
                    <td>
                      <span className={`pill ${item.rebootRequired ? "pill--red" : "pill--green"}`}>
                        {item.rebootRequired ? "Reboot" : "Hot/Rolling"}
                      </span>
                    </td>
                    <td className="ap-kpi__hint">{item.reasons.join(", ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="ap-kpi__hint" style={{ marginTop: 8 }}>
            Tip: batching multiple patches in the same window increases efficiency.
          </div>
        </>
      )}
    </div>
  );
}
