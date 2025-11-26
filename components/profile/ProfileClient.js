"use client";

import { useState } from "react";

export default function ProfileClient({
  user,
  userProjects,
  stats,
  initialMode
}) {
  const [mode, setMode] = useState(
    initialMode.changePassword ? "password" : initialMode.edit ? "edit" : "view"
  );
  const [name, setName] = useState(user.name || "");
  const [email, setEmail] = useState(user.email || "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changing, setChanging] = useState(false);

  const handleSaveProfile = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to update profile.");
      } else {
        setMessage("Profile updated successfully.");
      }
    } catch {
      setError("Unexpected error updating profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }
    setChanging(true);
    try {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to change password.");
      } else {
        setMessage("Password changed successfully.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch {
      setError("Unexpected error changing password.");
    } finally {
      setChanging(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="card p-5">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-semibold">Profile</h1>
            <p className="text-xs text-slate-400">
              Manage your personal details and account security.
            </p>
          </div>
          <div className="flex gap-2 text-xs">
            <button
              onClick={() => setMode("view")}
              className={`rounded-full border px-3 py-1 ${
                mode === "view"
                  ? "border-sky-500 bg-sky-500/10 text-sky-100"
                  : "border-slate-700 text-slate-300"
              }`}
            >
              View
            </button>
            <button
              onClick={() => setMode("edit")}
              className={`rounded-full border px-3 py-1 ${
                mode === "edit"
                  ? "border-emerald-500 bg-emerald-500/10 text-emerald-100"
                  : "border-slate-700 text-slate-300"
              }`}
            >
              Edit Profile
            </button>
            <button
              onClick={() => setMode("password")}
              className={`rounded-full border px-3 py-1 ${
                mode === "password"
                  ? "border-purple-500 bg-purple-500/10 text-purple-100"
                  : "border-slate-700 text-slate-300"
              }`}
            >
              Change Password
            </button>
          </div>
        </div>

        {message && (
          <div className="mb-3 rounded-lg border border-emerald-500/60 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
            {message}
          </div>
        )}
        {error && (
          <div className="mb-3 rounded-lg border border-red-500/60 bg-red-500/10 px-3 py-2 text-xs text-red-300">
            {error}
          </div>
        )}

        {mode === "view" && (
          <div className="space-y-2 text-sm">
            <p>
              <span className="text-slate-400">Name: </span>
              <span className="text-slate-100">{user.name}</span>
            </p>
            <p>
              <span className="text-slate-400">Username: </span>
              <span className="text-slate-100">{user.username}</span>
            </p>
            <p>
              <span className="text-slate-400">Email: </span>
              <span className="text-slate-100">{user.email}</span>
            </p>
            <p>
              <span className="text-slate-400">Role: </span>
              <span className="font-semibold text-sky-300">{user.role}</span>
            </p>
            <p>
              <span className="text-slate-400">Joined: </span>
              <span className="text-slate-100">
                {new Date(user.createdAt).toLocaleString()}
              </span>
            </p>
            <div className="mt-4">
              <h2 className="mb-1 font-semibold">Project summary</h2>
              <p className="text-xs text-slate-300">
                Completed:{" "}
                <span className="font-semibold text-emerald-300">
                  {stats.completed}
                </span>{" "}
                · In Progress:{" "}
                <span className="font-semibold text-sky-300">
                  {stats.inProgress}
                </span>
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Water level entries:{" "}
                <span className="text-sky-200">{stats.waterCount}</span> ·
                Appliance states:{" "}
                <span className="text-emerald-200">{stats.applianceCount}</span>
              </p>
            </div>
          </div>
        )}

        {mode === "edit" && (
          <form className="space-y-4 text-sm" onSubmit={handleSaveProfile}>
            <div>
              <label className="mb-1 block text-slate-300">Name</label>
              <input
                className="w-full rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm outline-none focus:border-sky-500"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-slate-300">Email</label>
              <input
                type="email"
                className="w-full rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm outline-none focus:border-sky-500"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="btn-gradient disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
          </form>
        )}

        {mode === "password" && (
          <form className="space-y-4 text-sm" onSubmit={handleChangePassword}>
            <div>
              <label className="mb-1 block text-slate-300">
                Current password
              </label>
              <input
                type="password"
                className="w-full rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm outline-none focus:border-sky-500"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-slate-300">New password</label>
              <input
                type="password"
                className="w-full rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm outline-none focus:border-sky-500"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-slate-300">
                Confirm new password
              </label>
              <input
                type="password"
                className="w-full rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm outline-none focus:border-sky-500"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              disabled={changing}
              className="btn-gradient disabled:cursor-not-allowed disabled:opacity-60"
            >
              {changing ? "Changing..." : "Change password"}
            </button>
          </form>
        )}
      </div>

      <div className="card p-5 text-sm">
        <h2 className="mb-3 font-semibold">Project status</h2>
        <div className="space-y-2">
          {userProjects.map((project) => (
            <div
              key={project.id}
              className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2"
            >
              <div>
                <div className="text-slate-100">{project.project.title}</div>
                <div className="text-[11px] text-slate-400">
                  Last activity: {new Date(project.lastActivityAt).toLocaleString()}
                </div>
              </div>
              <span
                className={`rounded-full border px-3 py-1 text-[11px] ${
                  project.status === "COMPLETED"
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-100"
                    : project.status === "IN_PROGRESS"
                    ? "border-sky-500 bg-sky-500/10 text-sky-100"
                    : "border-slate-500 bg-slate-700/30 text-slate-200"
                }`}
              >
                {project.status.replace("_", " ")}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

