"use client";

import { useEffect, useState } from "react";
import {
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  Cell
} from "recharts";

const COLORS = ["#22c55e", "#f97316"];

export default function AdminClient({ initial }) {
  const [users] = useState(initial.users);
  const [selectedUser, setSelectedUser] = useState(initial.users[0] || null);
  const [userDetail, setUserDetail] = useState(initial.userDetail);
  const [loading, setLoading] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [pwdMessage, setPwdMessage] = useState("");
  const [pwdError, setPwdError] = useState("");
  const [pwdLoading, setPwdLoading] = useState(false);

  useEffect(() => {
    if (!selectedUser) return;
    async function loadDetail() {
      setLoading(true);
      try {
        const res = await fetch(`/api/user/admin/${selectedUser.id}`);
        const data = await res.json();
        if (res.ok) {
          setUserDetail(data);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    loadDetail();
  }, [selectedUser]);

  const handleStatusChange = async (userId, projectId, status) => {
    setLoading(true);
    try {
      await fetch("/api/project/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, projectId, status })
      });
      const res = await fetch(`/api/user/admin/${userId}`);
      const data = await res.json();
      if (res.ok) setUserDetail(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (event) => {
    event.preventDefault();
    if (!selectedUser) return;
    if (!newPassword) {
      setPwdError("Password is required.");
      return;
    }
    setPwdError("");
    setPwdMessage("");
    setPwdLoading(true);
    try {
      const res = await fetch("/api/user/admin/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: selectedUser.id, newPassword })
      });
      const data = await res.json();
      if (!res.ok) {
        setPwdError(data.error || "Failed to change password.");
      } else {
        setPwdMessage("Password updated.");
        setNewPassword("");
      }
    } catch {
      setPwdError("Unexpected error.");
    } finally {
      setPwdLoading(false);
    }
  };

  const projectStats = initial.projectStats;
  const pieData = (key) => {
    const stat = projectStats[key] || { completed: 0, notCompleted: 0 };
    return [
      { name: "Completed", value: stat.completed },
      { name: "Not completed", value: stat.notCompleted }
    ];
  };

  const userPie =
    userDetail?.projects?.length > 0
      ? [
          {
            name: "Completed",
            value: userDetail.projects.filter((p) => p.status === "COMPLETED")
              .length
          },
          {
            name: "Remaining",
            value:
              userDetail.projects.length -
              userDetail.projects.filter((p) => p.status === "COMPLETED").length
          }
        ]
      : [];

  return (
    <div className="space-y-6">
      <div className="card p-5">
        <h1 className="text-xl font-semibold">Admin Panel</h1>
        <p className="text-xs text-slate-400">
          Manage users, track project completion, and update credentials.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.6fr,1.4fr]">
        <div className="card p-5">
          <h2 className="mb-2 text-sm font-semibold">Users</h2>
          <div className="max-h-72 overflow-y-auto rounded-lg border border-slate-800 text-xs">
            <table className="w-full text-left">
              <thead className="border-b border-slate-800 bg-slate-900/80 text-slate-300">
                <tr>
                  <th className="px-2 py-1">Name</th>
                  <th className="px-2 py-1">Username</th>
                  <th className="px-2 py-1">Role</th>
                  <th className="px-2 py-1">Created</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u.id}
                    className={`cursor-pointer border-b border-slate-800/70 last:border-0 hover:bg-slate-800/40 ${
                      selectedUser?.id === u.id ? "bg-slate-800/70" : ""
                    }`}
                    onClick={() => setSelectedUser(u)}
                  >
                    <td className="px-2 py-1">{u.name}</td>
                    <td className="px-2 py-1 font-mono">{u.username}</td>
                    <td className="px-2 py-1">
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[10px] ${
                          u.role === "ADMIN"
                            ? "border-purple-500 text-purple-200"
                            : "border-sky-500 text-sky-200"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-2 py-1">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selectedUser && userDetail && (
            <div className="mt-4 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-100">
                    {userDetail.user.name} ({userDetail.user.username})
                  </div>
                  <div className="text-slate-400">{userDetail.user.email}</div>
                </div>
                <div className="text-[11px] text-slate-400">
                  Water entries:{" "}
                  <span className="text-sky-300">{userDetail.waterCount}</span>{" "}
                  · Appliance states:{" "}
                  <span className="text-emerald-300">
                    {userDetail.applianceCount}
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                {userDetail.projects.map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2"
                  >
                    <div>
                      <div className="text-slate-100">
                        {project.project.title}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Status: {project.status}
                      </div>
                    </div>
                    <div className="flex gap-1 text-[10px]">
                      {["NOT_STARTED", "IN_PROGRESS", "COMPLETED"].map(
                        (status) => (
                          <button
                            key={status}
                            onClick={() =>
                              handleStatusChange(
                                userDetail.user.id,
                                project.project.id,
                                status
                              )
                            }
                            className={`rounded-full border px-2 py-0.5 ${
                              project.status === status
                                ? "border-emerald-500 bg-emerald-500/10 text-emerald-100"
                                : "border-slate-600 text-slate-200"
                            }`}
                          >
                            {status.replace("_", " ")}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {loading && (
            <div className="mt-2 text-[11px] text-slate-500">Loading...</div>
          )}
        </div>

        <div className="space-y-4">
          <div className="card p-5">
            <h2 className="mb-2 text-sm font-semibold">
              Project completion (all users)
            </h2>
            <div className="grid gap-3 md:grid-cols-2">
              {["water-level", "home-appliances"].map((key) => (
                <div key={key} className="space-y-1">
                  <div className="text-xs text-slate-300">
                    {key === "water-level"
                      ? "Water Level Detector"
                      : "Home Appliances Monitoring"}
                  </div>
                  <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData(key)}
                          dataKey="value"
                          outerRadius={50}
                          label
                        >
                          {pieData(key).map((entry, index) => (
                            <Cell
                              key={entry.name}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#020617",
                            border: "1px solid #1f2937",
                            fontSize: 11
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <h2 className="mb-2 text-sm font-semibold">
              Completion (selected user)
            </h2>
            {userPie.length > 0 ? (
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={userPie} dataKey="value" outerRadius={50} label>
                      {userPie.map((entry, index) => (
                        <Cell
                          key={entry.name}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#020617",
                        border: "1px solid #1f2937",
                        fontSize: 11
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-xs text-slate-400">
                Select a user to see their completion breakdown.
              </p>
            )}
          </div>

          <div className="card p-5">
            <h2 className="mb-2 text-sm font-semibold">
              Admin change user password
            </h2>
            {selectedUser ? (
              <form className="space-y-2 text-xs" onSubmit={handlePasswordChange}>
                <div>
                  <div className="mb-1 text-slate-300">
                    For: <span className="font-mono">{selectedUser.username}</span>
                  </div>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-xs outline-none focus:border-sky-500"
                    placeholder="New password"
                  />
                </div>
                {pwdError && (
                  <div className="rounded-lg border border-red-500/60 bg-red-500/10 px-3 py-1 text-[11px] text-red-300">
                    {pwdError}
                  </div>
                )}
                {pwdMessage && (
                  <div className="rounded-lg border border-emerald-500/60 bg-emerald-500/10 px-3 py-1 text-[11px] text-emerald-200">
                    {pwdMessage}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={pwdLoading}
                  className="btn-gradient text-xs disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {pwdLoading ? "Updating..." : "Update password"}
                </button>
              </form>
            ) : (
              <p className="text-xs text-slate-400">
                Select a user from the table above.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

