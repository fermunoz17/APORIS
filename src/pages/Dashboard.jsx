// src/pages/Dashboard.jsx

import React, { useEffect, useMemo, useState } from "react";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import GamePanel from "../components/GamePanel";
import assetsSeed from "../assets/syntheticAssets.json";
import "../styles/dashboard.css";
import { getState } from "../game/store";

const Pill = ({ tone = "gray", children }) => (
  <span className={`pill pill--${tone}`}>{children}</span>
);

const Stat = ({ label, value, hint }) => (
  <div className="ap-kpi">
    <div className="ap-kpi__label">{label}</div>
    <div className="ap-kpi__value">{value}</div>
    {hint && <div className="ap-kpi__hint">{hint}</div>}
  </div>
);

const SectionCard = ({ title, action, children }) => (
  <section className="section-card">
    <div className="section-card__head">
      <h3 className="section-card__title">{title}</h3>
      {action}
    </div>
    {children}
  </section>
);

export default function Dashboard() {
  const navigate = useNavigate();
  const user = auth.currentUser;
  const userDisplay = user?.displayName || user?.email || "Player";

  const [activeTab, setActiveTab] = useState("play"); // overview | play | assets | audit
  const [query, setQuery] = useState("");

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  // Toast helper (used after simulation)
  const toast = (msg) => {
    const el = document.createElement("div");
    el.textContent = msg;
    el.className = "toast";
    document.body.appendChild(el);
    requestAnimationFrame(() => el.classList.add("show"));
    setTimeout(() => {
      el.classList.remove("show");
      el.remove();
    }, 2200);
  };

  // Export audit CSV
  const exportAuditCSV = () => {
    const rows = getState().audit || [];
    const header = "entry\n";
    const csv =
      header + rows.map((r) => `"${String(r).replace(/"/g, '""')}"`).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "aporis_audit.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // On load: set tab from hash, and bind hotkeys (P/A/L)
  useEffect(() => {
    const tabFromHash = window.location.hash.replace("#", "");
    if (["overview", "play", "assets", "audit"].includes(tabFromHash)) {
      setActiveTab(tabFromHash);
    }
    const onKey = (e) => {
      const k = e.key.toLowerCase();
      if (k === "p") setActiveTab("play");
      if (k === "a") setActiveTab("assets");
      if (k === "l") setActiveTab("audit");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Keep URL hash in sync with active tab
  useEffect(() => {
    history.replaceState(null, "", `#${activeTab}`);
  }, [activeTab]);

  // Filters & stats
  const filteredAssets = useMemo(() => {
    if (!query.trim()) return assetsSeed;
    const q = query.toLowerCase();
    return assetsSeed.filter(
      (a) =>
        a.id.toLowerCase().includes(q) ||
        a.name.toLowerCase().includes(q) ||
        (a.type || "").toLowerCase().includes(q) ||
        (a.vendor || "").toLowerCase().includes(q) ||
        (a.regionShard || "").toLowerCase().includes(q)
    );
  }, [query]);

  const stats = useMemo(() => {
    const total = assetsSeed.length;
    const highCrit = assetsSeed.filter((a) => a.criticality >= 5).length;
    const highVuln = assetsSeed.filter((a) => a.vulnScore >= 8).length;
    const dueSoon = assetsSeed.filter((a) => {
      const days =
        (new Date(a.complianceDeadline) - new Date()) / (1000 * 60 * 60 * 24);
      return days < 30;
    }).length;
    return { total, highCrit, highVuln, dueSoon };
  }, []);

  return (
    <div className="aporis-dashboard">
      {/* Header */}
      <header className="ap-header">
        <div className="ap-header__inner">
          <div className="ap-brand">
            <div className="ap-brand__logo">A</div>
            <div className="ap-brand__title">
              <small>APORIS</small>
              <strong>Smart Grid Defender</strong>
            </div>
          </div>

          <nav className="ap-tabs">
            {[
              { id: "overview", label: "Overview" },
              { id: "play", label: "Play" },
              { id: "assets", label: "Assets" },
              { id: "audit", label: "Audit" },
            ].map((t) => (
              <button
                key={t.id}
                className={`ap-tab ${activeTab === t.id ? "is-active" : ""}`}
                onClick={() => setActiveTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </nav>

          <div className="ap-actions">
            <span>{userDisplay}</span>
            <button className="ap-btn--logout" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="ap-main">
        {/* KPI ribbon (sticky) */}
        <div className="ap-kpi-grid">
          <Stat label="Total Assets" value={stats.total} />
          <Stat
            label="High Criticality"
            value={stats.highCrit}
            hint="criticality ≥ 5"
          />
          <Stat
            label="High Vulnerability"
            value={stats.highVuln}
            hint="vulnScore ≥ 8.0"
          />
          <Stat label="Due < 30 days" value={stats.dueSoon} />
          <Stat label="User" value={userDisplay} />
          <Stat label="Mode" value={<Pill tone="blue">Simulation</Pill>} />
        </div>

        {/* TABS */}
        {activeTab === "overview" && (
          <div className="ap-grid ap-grid--3">
            <SectionCard title="What is APORIS?">
              <p>
                APORIS is an AI-driven decision support platform that simulates
                patch scheduling in a regulated OT environment. It recommends
                safe windows, prioritizes by risk and deadlines, and provides
                explainable audit trails.
              </p>
              <ul className="tip-list" style={{ marginTop: 8 }}>
                <li>Heuristic + learning-based prioritization</li>
                <li>Federated demo by regionShard</li>
                <li>Why/Why-Now explanations</li>
              </ul>
            </SectionCard>

            <SectionCard title="Quick Actions">
              <div
                style={{
                  display: "grid",
                  gap: 12,
                  gridTemplateColumns: "1fr 1fr",
                }}
              >
                <button
                  className="btn btn--primary"
                  onClick={() => setActiveTab("play")}
                >
                  Start Simulation
                </button>
                <button
                  className="btn"
                  onClick={() => setActiveTab("assets")}
                >
                  Review Assets
                </button>
                <button className="btn" onClick={() => setActiveTab("audit")}>
                  View Audit Log
                </button>
                <button
                  className="btn btn--indigo"
                  onClick={() => alert("Leaderboard soon")}
                >
                  Leaderboard (Soon)
                </button>
              </div>
            </SectionCard>

            <SectionCard title="Shortcuts">
              <ul className="tip-list">
                <li>
                  <b>P</b> — Go to Play
                </li>
                <li>
                  <b>A</b> — Open Assets
                </li>
                <li>
                  <b>L</b> — Show Audit Log
                </li>
              </ul>
            </SectionCard>
          </div>
        )}

        {activeTab === "play" && (
          <div className="ap-grid ap-grid--4-1">
            <SectionCard
              title="APORIS — Smart Grid Defender"
              action={<Pill tone="green">Week-by-week Simulation</Pill>}
            >
              <GamePanel
                onSimulated={() =>
                  toast("✅ Week simulated. KPIs & audit updated.")
                }
              />
            </SectionCard>

            <div className="ap-grid" style={{ gap: 16 }}>
              <SectionCard title="Tips">
                <ul className="tip-list">
                  <li>Prefer assets near deadlines & high criticality.</li>
                  <li>
                    Honor maintenance windows to avoid SLA penalties.
                  </li>
                  <li>
                    Batch patches in the same window to improve efficiency.
                  </li>
                </ul>
              </SectionCard>
              <SectionCard title="Modes">
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <Pill tone="blue">Simulation</Pill>
                  <Pill>Federated (demo)</Pill>
                  <Pill tone="yellow">Stress Test</Pill>
                </div>
              </SectionCard>
            </div>
          </div>
        )}

        {activeTab === "assets" && (
          <SectionCard
            title="Assets"
            action={
              <input
                className="input"
                placeholder="Search by ID, name, type, vendor, region…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            }
          >
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Vendor</th>
                    <th>Region</th>
                    <th>Vuln</th>
                    <th>Op Risk</th>
                    <th>Criticality</th>
                    <th>Deadline</th>
                    <th>Reboot</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAssets.map((a) => (
                    <tr key={a.id}>
                      <td>
                        <code>{a.id}</code>
                      </td>
                      <td>{a.name}</td>
                      <td>{a.type}</td>
                      <td>{a.vendor}</td>
                      <td>
                        <Pill tone="blue">{a.regionShard}</Pill>
                      </td>
                      <td>{a.vulnScore}</td>
                      <td>{a.operationalRisk}</td>
                      <td>{a.criticality}</td>
                      <td>
                        {a.complianceDeadline}
                        {(() => {
                          const daysLeft = Math.ceil(
                            (new Date(a.complianceDeadline) - new Date()) /
                              (1000 * 60 * 60 * 24)
                          );
                          const tone =
                            daysLeft < 7
                              ? "red"
                              : daysLeft < 30
                              ? "yellow"
                              : "green";
                          return (
                            <span style={{ marginLeft: 8 }}>
                              <span className={`pill pill--${tone}`}>
                                {isFinite(daysLeft) ? `${daysLeft} days` : "n/a"}
                              </span>
                            </span>
                          );
                        })()}
                      </td>
                      <td>
                        {a.rebootSensitivity ? (
                          <Pill
                            tone={
                              a.rebootSensitivity === "high"
                                ? "red"
                                : a.rebootSensitivity === "medium"
                                ? "yellow"
                                : "gray"
                            }
                          >
                            {a.rebootSensitivity}
                          </Pill>
                        ) : (
                          <Pill>n/a</Pill>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        )}

        {activeTab === "audit" && (
          <SectionCard
            title="Audit Log"
            action={
              <button className="btn" onClick={exportAuditCSV}>
                Export CSV
              </button>
            }
          >
            <p className="tip-list">
              The full audit trail updates live while you play (inside the game
              panel). This section is reserved for consolidated exports &
              analysis.
            </p>
          </SectionCard>
        )}
      </main>

      <footer className="ap-footer">
        © {new Date().getFullYear()} APORIS — Built for El Paso Electric
      </footer>
    </div>
  );
}
