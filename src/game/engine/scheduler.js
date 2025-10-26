import { daysUntil, normalize, withinWindow } from "./utils";

const WEIGHTS = {
  vuln: 0.6,
  risk: 0.4,
  deadlineSoon: 20,
  deadlineNear: 10,
  criticality: 10
};

function priorityScore(asset) {
  const daysLeft = daysUntil(asset.complianceDeadline);
  const p =
    WEIGHTS.vuln * normalize(asset.vulnScore, 0, 10) * 100 +
    WEIGHTS.risk * asset.operationalRisk * 100 +
    (daysLeft < 14 ? WEIGHTS.deadlineSoon : daysLeft < 30 ? WEIGHTS.deadlineNear : 0) +
    (asset.criticality >= 5 ? WEIGHTS.criticality : 0) -
    (asset.maintenanceWindows?.length ? 0 : 15);
  return Number(p.toFixed(1));
}

export function recommendPlan(assets, targetWeekday = "Sat") {
  // Rank assets by score and schedule if window fits target weekday
  const ranked = assets
    .map(a => ({ asset: a, score: priorityScore(a) }))
    .sort((a,b)=> b.score - a.score);

  const plan = [];
  for (const r of ranked) {
    const a = r.asset;
    const window = (a.maintenanceWindows || []).find(w => withinWindow(targetWeekday, w));
    if (!window) continue;

    plan.push({
      assetId: a.id,
      assetName: a.name,
      window,
      score: r.score,
      expectedInstallMin: Math.min(45, Math.max(10, Math.round(a.vulnScore * 5))),
      rebootRequired: a.rebootSensitivity !== "low",
      reasons: [
        `vulnScore=${a.vulnScore}`,
        `operationalRisk=${a.operationalRisk}`,
        `daysLeft=${daysUntil(a.complianceDeadline)}`
      ]
    });

    if (plan.length >= 10) break; // keep weekly plan manageable
  }
  return plan;
}
