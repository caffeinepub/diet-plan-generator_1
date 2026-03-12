import { useMemo, useState } from "react";

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

  function toggle() {
    setOpen((v) => !v);
  }

  return (
    <div style={{ marginLeft: depth > 0 ? 24 : 0 }}>
      <button
        type="button"
        className="w-full flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-teal-50 transition-colors cursor-pointer border border-transparent hover:border-teal-100 text-left"
        onClick={toggle}
        data-ocid="admin.tree.row"
      >
        {node.children.length > 0 && (
          <span className="text-teal-600 font-bold text-sm w-4">
            {open ? "▼" : "▶"}
          </span>
        )}
        {node.children.length === 0 && <span className="w-4" />}
        <div className="flex-1 flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="font-semibold text-gray-800 text-sm">
            {node.entry.name}
          </span>
          <span className="text-gray-500 text-xs">{node.entry.whatsapp}</span>
          <span className="bg-teal-50 text-teal-700 text-xs px-2 py-0.5 rounded-full font-medium">
            {node.entry.goal}
          </span>
          <span className="text-green-700 text-xs font-bold">
            ₹{node.entry.amount} paid
          </span>
          {reward > 0 && (
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                node.entry.rewardPaid
                  ? "bg-gray-100 text-gray-400 line-through"
                  : "bg-yellow-50 text-yellow-700"
              }`}
            >
              Reward: ₹{reward}
            </span>
          )}
          {node.entry.referredBy && (
            <span className="text-gray-400 text-xs">
              ← {node.entry.referredBy}
            </span>
          )}
        </div>
        <span className="text-gray-400 text-xs whitespace-nowrap">
          {new Date(node.entry.paidAt).toLocaleDateString("en-IN")}
        </span>
      </button>
      {open && node.children.length > 0 && (
        <div className="border-l-2 border-teal-100 ml-5">
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
  }

  const stats = useMemo(() => {
    const totalRevenue = reports.reduce((s, r) => s + r.amount, 0);
    const rewardsPaid = reports
      .filter((r) => r.rewardPaid && r.referredBy)
      .reduce((s, r) => s + r.amount * 0.5, 0);
    const rewardsPending = reports
      .filter((r) => !r.rewardPaid && r.referredBy)
      .reduce((s, r) => s + r.amount * 0.5, 0);
    return { totalRevenue, rewardsPaid, rewardsPending };
  }, [reports]);

  const tree = useMemo(() => buildTree(reports), [reports]);

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-cyan-100 px-4">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-teal-600 to-cyan-600 px-8 py-8 text-center">
            <div className="text-4xl mb-2">🛡️</div>
            <h1 className="text-2xl font-black text-white">HN Coach</h1>
            <p className="text-teal-100 text-sm mt-1">Admin Panel</p>
          </div>
          <div className="px-8 py-8 space-y-4">
            <div>
              <label
                htmlFor="admin-password"
                className="block text-sm font-semibold text-gray-700 mb-2"
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
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all"
                placeholder="Enter admin password"
              />
            </div>
            {error && (
              <p
                data-ocid="admin.error_state"
                className="text-red-600 text-sm font-medium"
              >
                {error}
              </p>
            )}
            <button
              data-ocid="admin.primary_button"
              type="button"
              onClick={handleLogin}
              className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-bold py-3 rounded-xl hover:from-teal-700 hover:to-cyan-700 transition-all shadow-lg"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <img
            src="/assets/uploads/IMG-20260226-WA0000-2.jpg"
            alt="HN Coach"
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <h1 className="text-xl font-black text-gray-900">HN Coach Admin</h1>
            <p className="text-gray-500 text-xs">Report & Referral Dashboard</p>
          </div>
        </div>
        <button
          data-ocid="admin.secondary_button"
          type="button"
          onClick={() => setAuthed(false)}
          className="text-sm text-gray-500 hover:text-red-600 transition-colors font-medium px-4 py-2 rounded-lg hover:bg-red-50"
        >
          Logout
        </button>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Reports", value: reports.length, icon: "📋" },
            {
              label: "Total Revenue",
              value: `₹${stats.totalRevenue}`,
              icon: "💰",
            },
            {
              label: "Rewards Pending",
              value: `₹${stats.rewardsPending}`,
              icon: "⏳",
            },
            {
              label: "Rewards Paid",
              value: `₹${stats.rewardsPaid}`,
              icon: "✅",
            },
          ].map((stat, i) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: static list
              key={i}
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-100"
            >
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-2xl font-black text-gray-900">
                {stat.value}
              </div>
              <div className="text-gray-500 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* View Toggle */}
        <div className="flex gap-2">
          <button
            data-ocid="admin.tab"
            type="button"
            onClick={() => setView("table")}
            className={`px-5 py-2 rounded-lg font-semibold text-sm transition-all ${
              view === "table"
                ? "bg-teal-600 text-white shadow-md"
                : "bg-white text-gray-600 hover:bg-teal-50 border border-gray-200"
            }`}
          >
            📊 Table View
          </button>
          <button
            data-ocid="admin.tab"
            type="button"
            onClick={() => setView("tree")}
            className={`px-5 py-2 rounded-lg font-semibold text-sm transition-all ${
              view === "tree"
                ? "bg-teal-600 text-white shadow-md"
                : "bg-white text-gray-600 hover:bg-teal-50 border border-gray-200"
            }`}
          >
            🌲 Tree View
          </button>
        </div>

        {/* Table View */}
        {view === "table" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {reports.length === 0 ? (
              <div
                data-ocid="admin.empty_state"
                className="text-center py-16 text-gray-400"
              >
                <div className="text-5xl mb-3">📭</div>
                <p className="font-semibold">No reports yet</p>
                <p className="text-sm mt-1">
                  Reports will appear here after users complete payment
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table data-ocid="admin.table" className="w-full text-sm">
                  <thead>
                    <tr className="bg-teal-50 text-teal-800 text-left">
                      <th className="px-4 py-3 font-semibold">#</th>
                      <th className="px-4 py-3 font-semibold">Name</th>
                      <th className="px-4 py-3 font-semibold">WhatsApp</th>
                      <th className="px-4 py-3 font-semibold">Referred By</th>
                      <th className="px-4 py-3 font-semibold">Goal</th>
                      <th className="px-4 py-3 font-semibold">Amount</th>
                      <th className="px-4 py-3 font-semibold">Reward (50%)</th>
                      <th className="px-4 py-3 font-semibold">Date</th>
                      <th className="px-4 py-3 font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((r, idx) => (
                      <tr
                        key={r.id}
                        data-ocid={`admin.row.${idx + 1}`}
                        className={`border-t border-gray-100 ${
                          idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                        }`}
                      >
                        <td className="px-4 py-3 text-gray-400 font-mono">
                          {idx + 1}
                        </td>
                        <td className="px-4 py-3 font-semibold text-gray-900">
                          {r.name}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {r.whatsapp}
                        </td>
                        <td className="px-4 py-3">
                          {r.referredBy ? (
                            <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-medium">
                              {r.referredBy}
                            </span>
                          ) : (
                            <span className="text-gray-300 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className="bg-teal-50 text-teal-700 px-2 py-0.5 rounded text-xs font-medium">
                            {r.goal}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-bold text-green-700">
                          ₹{r.amount}
                        </td>
                        <td className="px-4 py-3">
                          {r.referredBy ? (
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-medium ${
                                r.rewardPaid
                                  ? "bg-gray-100 text-gray-400"
                                  : "bg-yellow-50 text-yellow-700"
                              }`}
                            >
                              {r.rewardPaid ? "✓ " : ""}₹{r.amount * 0.5}
                            </span>
                          ) : (
                            <span className="text-gray-300 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                          {new Date(r.paidAt).toLocaleDateString("en-IN")}
                        </td>
                        <td className="px-4 py-3">
                          {r.referredBy && !r.rewardPaid ? (
                            <button
                              data-ocid="admin.save_button"
                              type="button"
                              onClick={() => handleMarkRewardPaid(r.id)}
                              className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                            >
                              Mark Paid
                            </button>
                          ) : r.rewardPaid ? (
                            <span className="text-green-600 text-xs font-semibold">
                              ✓ Paid
                            </span>
                          ) : (
                            <span className="text-gray-300 text-xs">—</span>
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
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              Referral Tree
            </h2>
            {tree.length === 0 ? (
              <div
                data-ocid="admin.empty_state"
                className="text-center py-16 text-gray-400"
              >
                <div className="text-5xl mb-3">🌱</div>
                <p className="font-semibold">No referral data yet</p>
                <p className="text-sm mt-1">
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
