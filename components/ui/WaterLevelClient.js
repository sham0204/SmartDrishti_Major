"use client";

import { useMemo, useState } from "react";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { formatDateTime, maskKey } from "../../lib/utils";

export default function WaterLevelClient({ initialData, projectId }) {
  const [apiConfig, setApiConfig] = useState(initialData.apiConfig);
  const [templateId, setTemplateId] = useState(
    initialData.apiConfig?.templateId || ""
  );
  const [history, setHistory] = useState(initialData.entries || []);
  const [levelInput, setLevelInput] = useState("");
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [loadingEntries, setLoadingEntries] = useState(false);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const latestLevel = history[0]?.levelPercent ?? null;

  const maskedKey = useMemo(
    () => maskKey(apiConfig?.apiKey || ""),
    [apiConfig]
  );

  const lastTen = useMemo(() => {
    return [...history]
      .sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )
      .slice(-10)
      .map((entry) => ({
        ...entry,
        timeLabel: formatDateTime(entry.createdAt)
      }));
  }, [history]);

  const handleGenerateConfig = async () => {
    if (!templateId.trim()) {
      setError("Please provide a template ID.");
      return;
    }
    setLoadingConfig(true);
    setError("");
    try {
      const res = await fetch("/api/user/api-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to generate API key.");
      } else {
        setApiConfig(data.config);
      }
    } catch {
      setError("Unexpected error. Please try again.");
    } finally {
      setLoadingConfig(false);
    }
  };

  const handleUpdateTemplate = async () => {
    if (!templateId.trim()) {
      setError("Template ID is required.");
      return;
    }
    setLoadingConfig(true);
    setError("");
    try {
      const res = await fetch("/api/user/api-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to update template ID.");
      } else {
        setApiConfig(data.config);
      }
    } catch {
      setError("Unexpected error updating template.");
    } finally {
      setLoadingConfig(false);
    }
  };

  const handleSetLevel = async (event) => {
    event.preventDefault();
    const value = parseInt(levelInput, 10);
    if (Number.isNaN(value) || value < 0 || value > 100) {
      setError("Enter a value between 0 and 100.");
      return;
    }
    setLoadingEntries(true);
    setError("");
    try {
      const res = await fetch("/api/project/water-level/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ levelPercent: value, projectId })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create water level entry.");
      } else {
        setHistory(data.entries);
        setLevelInput("");
      }
    } catch {
      setError("Unexpected error updating level.");
    } finally {
      setLoadingEntries(false);
    }
  };

  const handleDeleteAll = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setConfirmDelete(false);
    setLoadingEntries(true);
    setError("");
    try {
      const res = await fetch("/api/project/water-level/entries", {
        method: "DELETE"
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to delete entries.");
      } else {
        setHistory([]);
      }
    } catch {
      setError("Unexpected error deleting entries.");
    } finally {
      setLoadingEntries(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-500/60 bg-red-500/10 px-3 py-2 text-xs text-red-300">
          {error}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[1.2fr,1fr]">
        <div className="card space-y-3 p-5">
          <h2 className="text-sm font-semibold">API Key &amp; Template ID</h2>
          {!apiConfig ? (
            <>
              <p className="text-xs text-slate-400">
                Generate a per-user API key and define a template ID. Use them in your
                ESP32 firmware to authenticate HTTP requests.
              </p>
              <div className="space-y-2 text-sm">
                <label className="text-xs text-slate-300">Template ID</label>
                <input
                  className="w-full rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-xs outline-none focus:border-sky-500"
                  value={templateId}
                  onChange={(event) => setTemplateId(event.target.value)}
                  placeholder="e.g. TPL-01"
                />
              </div>
              <button
                onClick={handleGenerateConfig}
                disabled={loadingConfig}
                className="btn-gradient text-xs disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loadingConfig ? "Generating..." : "Generate API Key"}
              </button>
            </>
          ) : (
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400">API Key: </span>
                <span className="font-mono text-sky-200">{maskedKey}</span>
              </div>
              <div>
                <label className="mb-1 block text-slate-300">Template ID</label>
                <input
                  className="w-full rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-xs outline-none focus:border-sky-500"
                  value={templateId}
                  onChange={(event) => setTemplateId(event.target.value)}
                />
                <button
                  onClick={handleUpdateTemplate}
                  disabled={loadingConfig}
                  className="btn-gradient mt-2 text-xs disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loadingConfig ? "Updating..." : "Update Template ID"}
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                The same API key/template ID pair works for all SmartDrishti IoT
                projects.
              </p>
            </div>
          )}
        </div>

        <div className="card p-5">
          <h2 className="mb-3 text-sm font-semibold">Tank Visualization</h2>
          <div className="flex items-center gap-4">
            <div className="relative h-40 w-24 rounded-xl border border-slate-700 bg-slate-900/80">
              <div className="absolute inset-0 flex items-end">
                <div
                  className="w-full bg-gradient-to-t from-sky-500 via-sky-400 to-sky-200/80 transition-[height]"
                  style={{ height: `${latestLevel != null ? latestLevel : 0}%` }}
                />
              </div>
            </div>
            <div className="flex-1 text-sm">
              <div className="text-xs text-slate-400">Current Water Level</div>
              <div className="text-3xl font-semibold text-sky-300">
                {latestLevel != null ? `${latestLevel}%` : "—"}
              </div>
              <div className="mt-1 text-xs text-slate-500">
                Based on the most recent entry (manual or device).
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr,1fr]">
        <div className="card p-5">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold">History</h2>
            <button
              onClick={handleDeleteAll}
              disabled={loadingEntries}
              className="rounded-full border border-red-500/60 px-3 py-1 text-[11px] text-red-300 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {confirmDelete ? "Confirm delete" : "Delete all entries"}
            </button>
          </div>
          <div className="max-h-64 overflow-y-auto rounded-lg border border-slate-800 text-xs">
            <table className="w-full text-left">
              <thead className="border-b border-slate-800 bg-slate-900/80 text-slate-300">
                <tr>
                  <th className="px-2 py-1">#</th>
                  <th className="px-2 py-1">Level (%)</th>
                  <th className="px-2 py-1">Source</th>
                  <th className="px-2 py-1">Time</th>
                </tr>
              </thead>
              <tbody>
                {history.map((entry, index) => (
                  <tr
                    key={entry.id}
                    className="border-b border-slate-800/70 last:border-0"
                  >
                    <td className="px-2 py-1">{index + 1}</td>
                    <td className="px-2 py-1 text-sky-200">
                      {entry.levelPercent}%
                    </td>
                    <td className="px-2 py-1">
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[10px] ${
                          entry.source === "DEVICE"
                            ? "border-emerald-500 text-emerald-200"
                            : "border-sky-500 text-sky-200"
                        }`}
                      >
                        {entry.source}
                      </span>
                    </td>
                    <td className="px-2 py-1 text-slate-300">
                      {formatDateTime(entry.createdAt)}
                    </td>
                  </tr>
                ))}
                {history.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-2 py-4 text-center text-slate-500"
                    >
                      No entries yet. Send data from your device or add manual
                      readings.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card space-y-3 p-5">
          <h2 className="text-sm font-semibold">Last 10 entries</h2>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lastTen}>
                <XAxis dataKey="timeLabel" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#020617",
                    border: "1px solid #1f2937",
                    fontSize: 11
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="levelPercent"
                  stroke="#38bdf8"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
        <form className="flex items-end gap-3 text-sm" onSubmit={handleSetLevel}>
          <div>
            <label className="mb-1 block text-xs text-slate-300">
              Manual water level (%)
            </label>
            <input
              type="number"
              min={0}
              max={100}
              value={levelInput}
              onChange={(event) => setLevelInput(event.target.value)}
              className="w-32 rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm outline-none focus:border-sky-500"
            />
          </div>
          <button
            type="submit"
            disabled={loadingEntries}
            className="btn-gradient text-xs disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loadingEntries ? "Saving..." : "Set Level"}
          </button>
        </form>
        <p className="text-xs text-slate-400">
          Manual entries are stored with source MANUAL so you can distinguish them
          from device updates.
        </p>
      </div>
    </div>
  );
}

