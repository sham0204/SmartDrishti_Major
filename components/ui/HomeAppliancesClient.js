"use client";

import { useState, useMemo } from "react";
import { formatDateTime, maskKey } from "../../lib/utils";

export default function HomeAppliancesClient({
  initialState,
  history,
  projectId,
  apiConfig: initialApiConfig
}) {
  const [current, setCurrent] = useState(initialState);
  const [entries, setEntries] = useState(history);
  const [apiConfig, setApiConfig] = useState(initialApiConfig);
  const [templateId, setTemplateId] = useState(
    initialApiConfig?.templateId || ""
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [loadingConfig, setLoadingConfig] = useState(false);

  const maskedKey = useMemo(
    () => maskKey(apiConfig?.apiKey || ""),
    [apiConfig]
  );

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

  const handleGenerateConfig = async () => {
    if (!templateId.trim()) {
      setError("Please provide a template ID.");
      return;
    }
    setLoadingConfig(true);
    setError("");
    try {
      const res = await fetch("/api/home-appliances/generate-api-key", {
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
      const res = await fetch("/api/home-appliances/update-template", {
        method: "POST",
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
                  placeholder="e.g. TPL-HA-01"
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
          <h2 className="mb-3 text-sm font-semibold">Current State</h2>
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-slate-700 p-3 text-center">
              <div className="text-xs text-slate-400">LED 1</div>
              <div className={`text-lg font-semibold ${current.led1 ? "text-sky-300" : "text-slate-300"}`}>
                {current.led1 ? "ON" : "OFF"}
              </div>
            </div>
            <div className="rounded-lg border border-slate-700 p-3 text-center">
              <div className="text-xs text-slate-400">LED 2</div>
              <div className={`text-lg font-semibold ${current.led2 ? "text-purple-300" : "text-slate-300"}`}>
                {current.led2 ? "ON" : "OFF"}
              </div>
            </div>
            <div className="rounded-lg border border-slate-700 p-3 text-center">
              <div className="text-xs text-slate-400">Fan 1</div>
              <div className={`text-lg font-semibold ${current.fan1 ? "text-emerald-300" : "text-slate-300"}`}>
                {current.fan1 ? "ON" : "OFF"}
              </div>
            </div>
          </div>
        </div>
      </div>

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