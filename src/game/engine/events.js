import { rng } from "./utils";

export function rollEvents(seed, week) {
  const R = rng(seed + week);
  const events = [];

  if (R() < 0.25) {
    events.push({ type: "ZERO_DAY", targetType: "PLC", riskDelta: 0.12, note: "New PLC CVE" });
  }
  if (R() < 0.18) {
    events.push({ type: "LOAD_SPIKE", windowPenalty: 0.2, note: "Weekend demand spike" });
  }
  if (R() < 0.15) {
    events.push({ type: "VENDOR_EMERGENCY", severity: "Critical", note: "Hotfix required" });
  }
  return events;
}

export function applyEvents(events, assets) {
  let extraDowntime = 0, riskDropDelta = 0, compPenaltyDelta = 0;
  const audit = [];

  for (const e of events) {
    if (e.type === "ZERO_DAY") {
      // Increase risk for matching assets slightly (sim shown as negative risk drop)
      const affected = assets.filter(a => a.type === e.targetType);
      riskDropDelta -= e.riskDelta * affected.length;
      audit.push(`Event ZERO_DAY: +risk for ${affected.length} ${e.targetType}s (${e.note})`);
    }
    if (e.type === "LOAD_SPIKE") {
      extraDowntime += 10; // minutes spillover
      audit.push(`Event LOAD_SPIKE: +10 min downtime (${e.note})`);
    }
    if (e.type === "VENDOR_EMERGENCY") {
      compPenaltyDelta += 2; // points penalty due to rush compliance stress
      audit.push(`Event VENDOR_EMERGENCY: +2 compliance penalty (${e.note})`);
    }
  }
  return { downtime: extraDowntime, riskDropDelta, compPenaltyDelta, audit };
}
