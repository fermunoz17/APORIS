export function scoreKPIs(prev, sim) {
  // Base
  let uptime = Math.max(0, 100 - (sim.totalDowntimeMin / 60) * 5 - sim.outagePenalty);
  let cyberRisk = Math.max(0, prev.cyberRisk - sim.totalRiskDrop * 100 + sim.riskAddFromEvents * 100);
  let compliance = Math.max(0, prev.compliance - sim.compliancePenalty + sim.complianceGain);
  let efficiency = Math.max(0, prev.efficiency + sim.batchingBonus - sim.overtimePenalty - sim.rejectedPenalty);

  const total = Math.round(0.30 * uptime + 0.35 * (100 - cyberRisk) + 0.25 * compliance + 0.10 * efficiency);

  return {
    uptime: Number(uptime.toFixed(1)),
    cyberRisk: Number(cyberRisk.toFixed(1)),
    compliance: Number(compliance.toFixed(1)),
    efficiency: Number(efficiency.toFixed(1)),
    total
  };
}
