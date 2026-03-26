import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createTask, deleteTask, listTasks, updateTask } from "../lib/api";
import { useAuth } from "../state/AuthContext";
import { MessageBar } from "../components/MessageBar";
import "./Dashboard.css";
import "../styles/forms.css";

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  dueDate: string | null;
  ownerId: string;
};

function toDateInputValue(d: string | null | undefined) {
  if (!d) return "";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

export function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [createTitle, setCreateTitle] = useState("");
  const [createDescription, setCreateDescription] = useState("");
  const [createStatus, setCreateStatus] = useState<Task["status"]>("TODO");
  const [createDueDate, setCreateDueDate] = useState("");

  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStatus, setEditStatus] = useState<Task["status"]>("TODO");
  const [editDueDate, setEditDueDate] = useState("");

  const roleText = useMemo(() => {
    if (!user) return "";
    return user.role === "ADMIN" ? "Admin" : "User";
  }, [user]);

  const refresh = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await listTasks();
      setTasks(res.tasks as Task[]);
    } catch (err: any) {
      setMessage({ type: "error", text: err?.message ?? "Failed to load tasks" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createTitle.trim()) return;
    setMessage(null);
    try {
      await createTask({
        title: createTitle.trim(),
        description: createDescription.trim() ? createDescription.trim() : undefined,
        status: createStatus,
        dueDate: createDueDate ? createDueDate : null,
      });
      setCreateTitle("");
      setCreateDescription("");
      setCreateStatus("TODO");
      setCreateDueDate("");
      setMessage({ type: "success", text: "Task created successfully." });
      await refresh();
    } catch (err: any) {
      setMessage({ type: "error", text: err?.message ?? "Create failed" });
    }
  };

  const startEdit = (t: Task) => {
    setEditingTaskId(t.id);
    setEditTitle(t.title);
    setEditDescription(t.description ?? "");
    setEditStatus(t.status);
    setEditDueDate(toDateInputValue(t.dueDate));
  };

  const cancelEdit = () => {
    setEditingTaskId(null);
    setEditTitle("");
    setEditDescription("");
    setEditStatus("TODO");
    setEditDueDate("");
  };

  const onUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTaskId) return;
    if (!editTitle.trim()) return;

    setMessage(null);
    try {
      await updateTask(editingTaskId, {
        title: editTitle.trim(),
        description: editDescription.trim() ? editDescription.trim() : "",
        status: editStatus,
        dueDate: editDueDate ? editDueDate : null,
      });
      setMessage({ type: "success", text: "Task updated successfully." });
      cancelEdit();
      await refresh();
    } catch (err: any) {
      setMessage({ type: "error", text: err?.message ?? "Update failed" });
    }
  };

  const onDelete = async (taskId: string) => {
    const ok = window.confirm("Delete this task?");
    if (!ok) return;
    setMessage(null);
    try {
      await deleteTask(taskId);
      setMessage({ type: "success", text: "Task deleted." });
      await refresh();
    } catch (err: any) {
      setMessage({ type: "error", text: err?.message ?? "Delete failed" });
    }
  };

  const onLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <div className="user-info">
            Signed in as <b>{user?.email}</b> ({roleText})
          </div>
        </div>
        <div>
          <button onClick={onLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>

      {message ? <MessageBar type={message.type} message={message.text} /> : null}

      <h2 style={{ marginTop: 22 }}>Create Task</h2>
      <form onSubmit={onCreate} className="task-form">
        <label className="form-label">
          <div>Title</div>
          <input className="form-input" value={createTitle} onChange={(e) => setCreateTitle(e.target.value)} required />
        </label>
        <label className="form-label">
          <div>Description</div>
          <input
            className="form-input"
            value={createDescription}
            onChange={(e) => setCreateDescription(e.target.value)}
            placeholder="Optional"
          />
        </label>
        <label className="form-label">
          <div>Status</div>
          <select className="form-select" value={createStatus} onChange={(e) => setCreateStatus(e.target.value as Task["status"])}>
            <option value="TODO">TODO</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="DONE">DONE</option>
          </select>
        </label>
        <label className="form-label">
          <div>Due Date</div>
          <input className="form-input" type="date" value={createDueDate} onChange={(e) => setCreateDueDate(e.target.value)} />
        </label>
        <button type="submit" className="submit-btn">
          Create
        </button>
      </form>

      <h2 style={{ marginTop: 28 }}>Your Tasks</h2>
      {loading ? (
        <div className="loading">Loading tasks...</div>
      ) : tasks.length === 0 ? (
        <div className="no-tasks">No tasks found.</div>
      ) : (
        <div className="tasks-grid">
          {tasks.map((t) => {
            const isEditing = editingTaskId === t.id;
            return (
              <div
                key={t.id}
                className="task-card"
              >
                {!isEditing ? (
                  <>
                    <div className="task-header">
                      <div>
                        <div className="task-title">{t.title}</div>
                        <div className="task-meta">
                          Status: <b>{t.status}</b>
                          {t.dueDate ? (
                            <>
                              {" "}
                              | Due: <b>{toDateInputValue(t.dueDate)}</b>
                            </>
                          ) : null}
                        </div>
                        {t.description ? <div className="task-description">{t.description}</div> : null}
                      </div>
                      <div className="task-actions">
                        <button onClick={() => startEdit(t)} className="edit-btn">
                          Edit
                        </button>
                        <button
                          onClick={() => onDelete(t.id)}
                          className="delete-btn"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <form onSubmit={onUpdate} className="task-form">
                    <label className="form-label">
                      <div>Title</div>
                      <input className="form-input" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} required />
                    </label>
                    <label className="form-label">
                      <div>Description</div>
                      <input className="form-input" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
                    </label>
                    <label className="form-label">
                      <div>Status</div>
                      <select className="form-select" value={editStatus} onChange={(e) => setEditStatus(e.target.value as Task["status"])}>
                        <option value="TODO">TODO</option>
                        <option value="IN_PROGRESS">IN_PROGRESS</option>
                        <option value="DONE">DONE</option>
                      </select>
                    </label>
                    <label className="form-label">
                      <div>Due Date</div>
                      <input className="form-input" type="date" value={editDueDate} onChange={(e) => setEditDueDate(e.target.value)} />
                    </label>
                    <div className="form-actions">
                      <button type="submit" className="submit-btn">
                        Save
                      </button>
                      <button type="button" onClick={cancelEdit} className="cancel-btn">
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

