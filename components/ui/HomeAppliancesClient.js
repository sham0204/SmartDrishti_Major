"use client";

import { useState } from "react";
import { formatDateTime } from "../../lib/utils";

export default function HomeAppliancesClient({
  initialState,
  history,
  projectId
}) {
  const [current, setCurrent] = useState(initialState);
  const [entries, setEntries] = useState(history);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const toggle = async (field) => {
    setLoading(true);
    setError("");
    const nextState = { ...current, [field]: !current[field] };
    try {
      const res = await fetch("/api/project/home-appliances/state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...nextState, projectId })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to update state.");
      } else {
        setCurrent(nextState);
        setEntries(data.history);
      }
    } catch {
      setError("Unexpected error updating state.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setConfirmDelete(false);
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/project/home-appliances/state", {
        method: "DELETE"
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to delete history.");
      } else {
        setEntries([]);
      }
    } catch {
      setError("Unexpected error deleting history.");
    } finally {
      setLoading(false);
    }
  };

  const renderControl = (label, field, styleClasses) => {
    const isOn = current[field];
    const onClasses = styleClasses.on;
    const offClasses = styleClasses.off;
    return (
      <div className="card flex items-center justify-between p-4">
        <div>
          <div className="text-sm font-medium text-slate-100">{label}</div>
          <div className="text-xs text-slate-400">
            Current:{" "}
            <span className={isOn ? "text-emerald-300" : "text-slate-300"}>
              {isOn ? "ON" : "OFF"}
            </span>
          </div>
        </div>
        <button
          onClick={() => toggle(field)}
          disabled={loading}
          className={`rounded-full border px-4 py-2 text-xs font-semibold shadow hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 ${
            isOn ? onClasses : offClasses
          }`}
        >
          Toggle
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-500/60 bg-red-500/10 px-3 py-2 text-xs text-red-300">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {renderControl("LED 1", "led1", {
          on: "border-sky-500 bg-sky-500/20 text-sky-100",
          off: "border-slate-600 bg-slate-800 text-slate-100"
        })}
        {renderControl("LED 2", "led2", {
          on: "border-purple-500 bg-purple-500/20 text-purple-100",
          off: "border-slate-600 bg-slate-800 text-slate-100"
        })}
        {renderControl("Fan 1", "fan1", {
          on: "border-emerald-500 bg-emerald-500/20 text-emerald-100",
          off: "border-slate-600 bg-slate-800 text-slate-100"
        })}
      </div>

      <div className="card p-5">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold">History</h2>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="rounded-full border border-red-500/60 px-3 py-1 text-[11px] text-red-300 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {confirmDelete ? "Confirm delete" : "Delete history"}
          </button>
        </div>
        <div className="max-h-72 overflow-y-auto rounded-lg border border-slate-800 text-xs">
          <table className="w-full text-left">
            <thead className="border-b border-slate-800 bg-slate-900/80 text-slate-300">
              <tr>
                <th className="px-2 py-1">#</th>
                <th className="px-2 py-1">LED1</th>
                <th className="px-2 py-1">LED2</th>
                <th className="px-2 py-1">Fan1</th>
                <th className="px-2 py-1">Source</th>
                <th className="px-2 py-1">Time</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, index) => (
                <tr
                  key={entry.id}
                  className="border-b border-slate-800/70 last:border-0"
                >
                  <td className="px-2 py-1">{index + 1}</td>
                  <td className="px-2 py-1">{entry.led1 ? "ON" : "OFF"}</td>
                  <td className="px-2 py-1">{entry.led2 ? "ON" : "OFF"}</td>
                  <td className="px-2 py-1">{entry.fan1 ? "ON" : "OFF"}</td>
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
              {entries.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-2 py-4 text-center text-slate-500"
                  >
                    No history yet. Toggle the controls above or connect your device.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

