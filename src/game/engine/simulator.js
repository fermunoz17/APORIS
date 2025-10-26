import { rollEvents, applyEvents } from "./events";
import { scoreKPIs } from "./scoring";

export function simulateWeek(state, acceptedPlan) {
  // Aggregate impact from actions
  let totalDowntimeMin = 0;
  let totalRiskDrop = 0;
  let complianceGain = 0;
  let rejectedPenalty = 0;
  let batchingBonus = 0;

  const updates = [];
  const audit = [];

  const groupedByWindow = {}; // for batching bonus
  for (const act of acceptedPlan) {
    totalDowntimeMin += act.expectedInstallMin * (act.rebootRequired ? 1 : 0.3);
    const asset = state.assets.find(a => a.id === act.assetId);
    const riskDrop = (asset.vulnScore / 10) * (asset.criticality / 5) * 0.4; // 0..0.4
    totalRiskDrop += riskDrop;

    const overdue = new Date() > new Date(asset.complianceDeadline);
    complianceGain += overdue ? 5 : 2; // catch-up gives more

    updates.push({ id: asset.id, lastPatchedAt: new Date().toISOString().slice(0,10), vulnScore: Math.max(0, asset.vulnScore - 2.0) });

    const winKey = `${act.window.day}-${act.window.start}-${act.window.end}`;
    groupedByWindow[winKey] = (groupedByWindow[winKey] || 0) + 1;

    audit.push(`Patched ${asset.id} (${asset.name}) | riskDrop=${riskDrop.toFixed(2)} | dt=${act.expectedInstallMin}m`);
  }

  batchingBonus = Object.values(groupedByWindow).reduce((acc, n) => acc + (n > 1 ? (n - 1) * 1 : 0), 0);

  // Random events
  const events = rollEvents(state.seed, state.week);
  const ev = applyEvents(events, state.assets);
  const riskAddFromEvents = Math.max(0, -ev.riskDropDelta);

  // Simple penalties
  const outagePenalty = totalDowntimeMin > 90 ? 5 : 0;
  const overtimePenalty = totalDowntimeMin > 60 ? 2 : 0;

  // Score new KPIs
  const kpis = scoreKPIs(state.kpis, {
    totalDowntimeMin,
    totalRiskDrop,
    compliancePenalty: ev.compPenaltyDelta,
    complianceGain,
    outagePenalty,
    overtimePenalty,
    rejectedPenalty,
    batchingBonus,
    riskAddFromEvents
  });

  // Apply partial asset updates
  const newAssets = state.assets.map(a => {
    const u = updates.find(x => x.id === a.id);
    return u ? { ...a, lastPatchedAt: u.lastPatchedAt, vulnScore: u.vulnScore } : a;
    // (You could also reduce operationalRisk slightly, etc.)
  });

  const auditEntries = [
    ...audit,
    ...ev.audit,
    `Totals: dt=${Math.round(totalDowntimeMin)}m, riskDrop=${(totalRiskDrop*100).toFixed(1)}pts, compGain=${complianceGain}`
  ];

  return { newAssets, kpis, auditEntries };
}
