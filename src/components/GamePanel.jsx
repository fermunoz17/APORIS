// src/components/GamePanel.jsx
import React, { useEffect, useState } from "react";
import { getState, subscribe, setState } from "../game/store";
import RecommendPanel from "./RecommendPanel";
import KpiCards from "./KpiCards";
import AuditLog from "./AuditLog";
import { simulateWeek } from "../game/engine/simulator";

/**
 * GamePanel
 * - Shows KPIs, AI recommendations, and audit log
 * - Runs the weekly simulation when the player accepts a plan
 *
 * Props:
 *  - onSimulated?: () => void   // optional callback fired after a successful simulate
 */
export default function GamePanel({ onSimulated }) {
  const [s, setS] = useState(getState());

  useEffect(() => {
    // subscribe to game store updates
    const unsub = subscribe(() => setS(getState()));
    return () => unsub();
  }, []);

  const onAcceptPlan = (plan) => {
    const res = simulateWeek(getState(), plan);

    setState({
      assets: res.newAssets,
      kpis: res.kpis,
      audit: [...getState().audit, ...res.auditEntries],
      week: getState().week + 1,
      acceptedPlan: plan,
    });

    if (typeof onSimulated === "function") onSimulated();
  };

  return (
    <div className="space-y-6">
      <KpiCards kpis={s.kpis} week={s.week} />
      <RecommendPanel assets={s.assets} onAccept={onAcceptPlan} />
      <AuditLog rows={s.audit} />
    </div>
  );
}
