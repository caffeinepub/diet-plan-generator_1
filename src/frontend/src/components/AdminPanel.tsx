import { useEffect, useMemo, useState } from "react";
import { createActorWithConfig } from "../config";

interface ReportEntry {
  id: string;
  name: string;
  whatsapp: string;
  referredBy: string;
  goal: string;
  amount: number;
  paidAt: string;
  rewardPaid: boolean;
}

function mergeReports(
  local: ReportEntry[],
  remote: ReportEntry[],
): ReportEntry[] {
  const map = new Map<string, ReportEntry>();
  for (const r of local) map.set(r.id, r);
  for (const r of remote) map.set(r.id, r);
  return Array.from(map.values()).sort(
    (a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime(),
  );
}

function loadReports(): ReportEntry[] {
  try {
    return JSON.parse(localStorage.getItem("hn_coach_reports") || "[]");
  } catch (_) {
    return [];
  }
}

function saveReports(reports: ReportEntry[]) {
  localStorage.setItem("hn_coach_reports", JSON.stringify(reports));
}

interface TreeNodeData {
  entry: ReportEntry;
  children: TreeNodeData[];
}

function buildTree(reports: ReportEntry[]): TreeNodeData[] {
  const byWhatsapp: Record<string, ReportEntry[]> = {};
  for (const r of reports) {
    const key = r.referredBy?.trim() || "";
    if (!byWhatsapp[key]) byWhatsapp[key] = [];
    byWhatsapp[key].push(r);
  }
  const allWhatsapps = new Set(reports.map((r) => r.whatsapp));
  function buildChildren(parentWhatsapp: string): TreeNodeData[] {
    return (byWhatsapp[parentWhatsapp] || []).map((entry) => ({
      entry,
      children: buildChildren(entry.whatsapp),
    }));
  }
  const roots: TreeNodeData[] = [];
  for (const r of reports) {
    const ref = r.referredBy?.trim() || "";
    if (!ref || !allWhatsapps.has(ref)) {
      roots.push({ entry: r, children: buildChildren(r.whatsapp) });
    }
  }
  return roots;
}

function TreeNode({ node, depth }: { node: TreeNodeData; depth: number }) {
  const [open, setOpen] = useState(true);
  const reward = node.entry.referredBy ? node.entry.amount * 0.5 : 0;

  return (
    <div style={{ marginLeft: depth > 0 ? 24 : 0 }}>
      <button
        type="button"
        className="w-full flex items-center gap-2 py-2.5 px-3 rounded-lg transition-all cursor-pointer text-left"
        onClick={() => setOpen((v) => !v)}
        data-ocid="admin.tree.row"
        style={{
          background: "transparent",
          border: "1px solid transparent",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background =
            "rgba(129,140,248,0.06)";
          (e.currentTarget as HTMLButtonElement).style.borderColor =
            "rgba(129,140,248,0.12)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background =
            "transparent";
          (e.currentTarget as HTMLButtonElement).style.borderColor =
            "transparent";
        }}
      >
        {node.children.length > 0 && (
          <span className="text-xs font-bold w-4" style={{ color: "#818cf8" }}>
            {open ? "▼" : "▶"}
          </span>
        )}
        {node.children.length === 0 && <span className="w-4" />}
        <div className="flex-1 flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="font-semibold text-sm" style={{ color: "#f1f5f9" }}>
            {node.entry.name}
          </span>
          <span className="text-xs" style={{ color: "#818cf8" }}>
            {node.entry.whatsapp}
          </span>
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{ background: "rgba(99,102,241,0.15)", color: "#a5b4fc" }}
          >
            {node.entry.goal}
          </span>
          <span className="text-xs font-bold" style={{ color: "#fbbf24" }}>
            ₹{node.entry.amount} paid
          </span>
          {reward > 0 && (
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{
                background: node.entry.rewardPaid
                  ? "rgba(100,116,139,0.15)"
                  : "rgba(250,204,21,0.1)",
                color: node.entry.rewardPaid ? "#64748b" : "#fcd34d",
                textDecoration: node.entry.rewardPaid ? "line-through" : "none",
              }}
            >
              Reward: ₹{reward}
            </span>
          )}
          {node.entry.referredBy && (
            <span className="text-xs" style={{ color: "#475569" }}>
              ← {node.entry.referredBy}
            </span>
          )}
        </div>
        <span
          className="text-xs whitespace-nowrap"
          style={{ color: "#64748b" }}
        >
          {new Date(node.entry.paidAt).toLocaleDateString("en-IN")}
        </span>
      </button>
      {open && node.children.length > 0 && (
        <div
          style={{
            borderLeft: "1.5px solid rgba(129,140,248,0.15)",
            marginLeft: 20,
          }}
        >
          {node.children.map((child) => (
            <TreeNode key={child.entry.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminPanel() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [error, setError] = useState("");
  const [view, setView] = useState<"table" | "tree">("table");
  const [reports, setReports] = useState<ReportEntry[]>(loadReports);

  useEffect(() => {
    createActorWithConfig()
      .then((actor) => actor.getAdminReports())
      .then((remote) => {
        setReports((prev) => mergeReports(prev, remote as ReportEntry[]));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    function handleFocus() {
      const local = loadReports();
      setReports(local);
      createActorWithConfig()
        .then((actor) => actor.getAdminReports())
        .then((remote) => {
          setReports((prev) => mergeReports(prev, remote as ReportEntry[]));
        })
        .catch(() => {});
    }
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  function handleRefresh() {
    const local = loadReports();
    setReports(local);
    createActorWithConfig()
      .then((actor) => actor.getAdminReports())
      .then((remote) => {
        setReports((prev) => mergeReports(prev, remote as ReportEntry[]));
      })
      .catch(() => {});
  }

  function handleLogin() {
    if (password === "hncoach2024") {
      setAuthed(true);
      setError("");
    } else {
      setError("Incorrect password. Please try again.");
    }
  }

  function handleMarkRewardPaid(id: string) {
    const updated = reports.map((r) =>
      r.id === id ? { ...r, rewardPaid: true } : r,
    );
    setReports(updated);
    saveReports(updated);
    createActorWithConfig()
      .then((actor) => actor.markRewardPaid(id))
      .catch(() => {});
  }

  const stats = useMemo(() => {
    const totalRevenue = reports.reduce((s, r) => s + r.amount, 0);
    const rewardsPaid = reports
      .filter((r) => r.rewardPaid && r.referredBy)
      .reduce((s, r) => s + r.amount * 0.5, 0);
    const rewardsPending = reports
      .filter((r) => !r.rewardPaid && r.referredBy)
      .reduce((s, r) => s + r.amount * 0.5, 0);
    const referredCount = reports.filter((r) => r.referredBy).length;
    return { totalRevenue, rewardsPaid, rewardsPending, referredCount };
  }, [reports]);

  const tree = useMemo(() => buildTree(reports), [reports]);

  if (!authed) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{
          background:
            "linear-gradient(145deg, #020617 0%, #0f0728 50%, #1e1048 100%)",
        }}
      >
        <div className="mesh-orb" />
        <div className="w-full max-w-sm rounded-2xl overflow-hidden relative z-10 glass-card">
          {/* Status gradient top */}
          <div className="status-bar-gradient" />
          <div
            className="px-8 py-8 text-center"
            style={{
              background:
                "linear-gradient(135deg, rgba(129,140,248,0.1) 0%, rgba(99,102,241,0.06) 100%)",
            }}
          >
            <div
              className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 mx-auto"
              style={{
                background: "rgba(129,140,248,0.12)",
                border: "1px solid rgba(129,140,248,0.25)",
              }}
            >
              <span className="text-2xl">🛡️</span>
            </div>
            <h1
              className="text-xl font-black"
              style={{ color: "#f1f5f9", letterSpacing: "-0.02em" }}
            >
              HN Coach
            </h1>
            <p
              className="text-xs mt-1 uppercase tracking-widest font-medium"
              style={{ color: "#818cf8" }}
            >
              Admin Panel
            </p>
          </div>
          <div className="px-8 py-8 space-y-4">
            <div>
              <label
                htmlFor="admin-password"
                className="block text-xs font-semibold mb-2 uppercase tracking-widest"
                style={{ color: "#94a3b8" }}
              >
                Password
              </label>
              <input
                id="admin-password"
                data-ocid="admin.input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="w-full rounded-xl px-4 py-3 text-sm form-input-2026"
                placeholder="Enter admin password"
              />
            </div>
            {error && (
              <p
                data-ocid="admin.error_state"
                className="text-sm font-medium"
                style={{ color: "#f87171" }}
              >
                {error}
              </p>
            )}
            <button
              data-ocid="admin.primary_button"
              type="button"
              onClick={handleLogin}
              className="w-full text-white font-bold py-3 rounded-xl neo-button transition-all"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{
        background: "linear-gradient(145deg, #020617 0%, #0f0728 100%)",
      }}
    >
      {/* Status bar */}
      <div className="status-bar-gradient" />

      <header
        className="border-b px-6 py-4 flex items-center justify-between"
        style={{
          background: "rgba(2,6,23,0.9)",
          borderColor: "rgba(129,140,248,0.1)",
          backdropFilter: "blur(20px)",
        }}
      >
        <div className="flex items-center gap-3">
          <img
            src="/assets/uploads/IMG-20260226-WA0000-2.jpg"
            alt="HN Coach"
            className="w-9 h-9 rounded-full object-cover"
            style={{ boxShadow: "0 0 0 2px rgba(129,140,248,0.3)" }}
          />
          <div>
            <h1
              className="text-base font-black"
              style={{ color: "#f1f5f9", letterSpacing: "-0.02em" }}
            >
              HN Coach Admin
            </h1>
            <p
              className="text-[10px] uppercase tracking-widest font-medium"
              style={{ color: "#818cf8" }}
            >
              Report & Referral Dashboard
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            data-ocid="admin.secondary_button"
            type="button"
            onClick={handleRefresh}
            className="text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
            style={{
              background: "rgba(129,140,248,0.08)",
              border: "1px solid rgba(129,140,248,0.15)",
              color: "#a5b4fc",
            }}
          >
            🔄 Refresh
          </button>
          <button
            data-ocid="admin.secondary_button"
            type="button"
            onClick={() => setAuthed(false)}
            className="text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
            style={{ color: "#64748b" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = "#f87171";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = "#64748b";
            }}
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Bento Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {
              label: "Total Reports",
              value: reports.length.toString(),
              icon: "📋",
              accent: "#818cf8",
              bg: "rgba(99,102,241,0.08)",
            },
            {
              label: "Total Revenue",
              value: `₹${stats.totalRevenue.toLocaleString()}`,
              icon: "💰",
              accent: "#fbbf24",
              bg: "rgba(250,204,21,0.06)",
            },
            {
              label: "Rewards Pending",
              value: `₹${stats.rewardsPending.toLocaleString()}`,
              icon: "⏳",
              accent: "#fb923c",
              bg: "rgba(249,115,22,0.07)",
            },
            {
              label: "Referral Signups",
              value: stats.referredCount.toString(),
              icon: "🔗",
              accent: "#4ade80",
              bg: "rgba(74,222,128,0.06)",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bento-stat rounded-xl p-4"
              style={{ borderTop: `2px solid ${stat.accent}30` }}
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-xl">{stat.icon}</span>
                <div
                  className="w-1.5 h-1.5 rounded-full mt-1"
                  style={{ background: stat.accent }}
                />
              </div>
              <div
                className="text-2xl font-black mb-0.5"
                style={{ color: "#f1f5f9", letterSpacing: "-0.02em" }}
              >
                {stat.value}
              </div>
              <div className="text-xs font-medium" style={{ color: "#64748b" }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* View Toggle */}
        <div
          className="flex gap-1.5 p-1 rounded-xl w-fit"
          style={{
            background: "rgba(15,7,40,0.7)",
            border: "1px solid rgba(129,140,248,0.1)",
          }}
        >
          {(["table", "tree"] as const).map((v) => (
            <button
              key={v}
              data-ocid="admin.tab"
              type="button"
              onClick={() => setView(v)}
              className="px-4 py-2 rounded-lg font-semibold text-sm transition-all"
              style={
                view === v
                  ? {
                      background: "rgba(99,102,241,0.2)",
                      color: "#a5b4fc",
                      border: "1px solid rgba(129,140,248,0.25)",
                    }
                  : { color: "#64748b" }
              }
            >
              {v === "table" ? "📊 Table View" : "🌲 Tree View"}
            </button>
          ))}
        </div>

        {/* Table View */}
        {view === "table" && (
          <div
            className="rounded-xl overflow-hidden"
            style={{ border: "1px solid rgba(129,140,248,0.1)" }}
          >
            {reports.length === 0 ? (
              <div
                data-ocid="admin.empty_state"
                className="text-center py-16"
                style={{ color: "#818cf8" }}
              >
                <div className="text-5xl mb-3">📭</div>
                <p className="font-semibold" style={{ color: "#a5b4fc" }}>
                  No reports yet
                </p>
                <p className="text-sm mt-1" style={{ color: "#64748b" }}>
                  Reports will appear here after users complete payment
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table data-ocid="admin.table" className="w-full text-sm">
                  <thead>
                    <tr
                      style={{
                        background: "rgba(15,7,40,0.9)",
                        borderBottom: "1px solid rgba(129,140,248,0.12)",
                      }}
                    >
                      {[
                        "#",
                        "Name",
                        "WhatsApp",
                        "Referred By",
                        "Goal",
                        "Amount",
                        "Reward (50%)",
                        "Date",
                        "Action",
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-left text-[11px] uppercase tracking-widest font-semibold"
                          style={{ color: "#64748b" }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((r, idx) => (
                      <tr
                        key={r.id}
                        data-ocid={`admin.row.${idx + 1}`}
                        style={{
                          background:
                            idx % 2 === 0
                              ? "rgba(15,7,40,0.5)"
                              : "rgba(15,7,40,0.3)",
                          borderBottom: "1px solid rgba(129,140,248,0.06)",
                        }}
                      >
                        <td
                          className="px-4 py-3 font-mono text-xs"
                          style={{ color: "#475569" }}
                        >
                          {idx + 1}
                        </td>
                        <td
                          className="px-4 py-3 font-semibold text-sm"
                          style={{ color: "#f1f5f9" }}
                        >
                          {r.name}
                        </td>
                        <td
                          className="px-4 py-3 text-sm"
                          style={{ color: "#94a3b8" }}
                        >
                          {r.whatsapp}
                        </td>
                        <td className="px-4 py-3">
                          {r.referredBy ? (
                            <span
                              className="text-xs px-2 py-0.5 rounded font-medium"
                              style={{
                                background: "rgba(99,102,241,0.1)",
                                color: "#818cf8",
                              }}
                            >
                              {r.referredBy}
                            </span>
                          ) : (
                            <span
                              className="text-xs"
                              style={{ color: "#334155" }}
                            >
                              —
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="text-xs px-2 py-0.5 rounded font-medium"
                            style={{
                              background: "rgba(129,140,248,0.08)",
                              color: "#a5b4fc",
                            }}
                          >
                            {r.goal}
                          </span>
                        </td>
                        <td
                          className="px-4 py-3 font-bold text-sm"
                          style={{ color: "#fbbf24" }}
                        >
                          ₹{r.amount}
                        </td>
                        <td className="px-4 py-3">
                          {r.referredBy ? (
                            <span
                              className="text-xs px-2 py-0.5 rounded font-medium"
                              style={{
                                background: r.rewardPaid
                                  ? "rgba(100,116,139,0.1)"
                                  : "rgba(250,204,21,0.08)",
                                color: r.rewardPaid ? "#64748b" : "#fcd34d",
                              }}
                            >
                              {r.rewardPaid ? "✓ " : ""}₹{r.amount * 0.5}
                            </span>
                          ) : (
                            <span
                              className="text-xs"
                              style={{ color: "#334155" }}
                            >
                              —
                            </span>
                          )}
                        </td>
                        <td
                          className="px-4 py-3 text-xs whitespace-nowrap"
                          style={{ color: "#818cf8" }}
                        >
                          {new Date(r.paidAt).toLocaleDateString("en-IN")}
                        </td>
                        <td className="px-4 py-3">
                          {r.referredBy && !r.rewardPaid ? (
                            <button
                              data-ocid="admin.save_button"
                              type="button"
                              onClick={() => handleMarkRewardPaid(r.id)}
                              className="text-white text-xs font-semibold px-3 py-1.5 rounded-lg neo-button transition-all whitespace-nowrap"
                            >
                              Mark Paid
                            </button>
                          ) : r.rewardPaid ? (
                            <span
                              className="text-xs font-semibold"
                              style={{ color: "#4ade80" }}
                            >
                              ✓ Paid
                            </span>
                          ) : (
                            <span
                              className="text-xs"
                              style={{ color: "#334155" }}
                            >
                              —
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tree View */}
        {view === "tree" && (
          <div
            className="rounded-xl p-6"
            style={{
              border: "1px solid rgba(129,140,248,0.1)",
              background: "rgba(15,7,40,0.5)",
            }}
          >
            <h2
              className="text-base font-bold mb-4"
              style={{ color: "#e2e8f0" }}
            >
              Referral Tree
            </h2>
            {tree.length === 0 ? (
              <div
                data-ocid="admin.empty_state"
                className="text-center py-16"
                style={{ color: "#818cf8" }}
              >
                <div className="text-5xl mb-3">🌱</div>
                <p className="font-semibold" style={{ color: "#a5b4fc" }}>
                  No referral data yet
                </p>
                <p className="text-sm mt-1" style={{ color: "#64748b" }}>
                  Referral chains will appear here after users join
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {tree.map((node) => (
                  <TreeNode key={node.entry.id} node={node} depth={0} />
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
