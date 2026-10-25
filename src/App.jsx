import { useEffect, useMemo, useState } from "react";

const STATUSES = ["Todo", "In Progress", "Completed"];
const PRIORITIES = ["Low", "Medium", "High"];

const initialTasks = [
  {
    id: 1,
    title: "Design landing page",
    description: "Create the initial layout and color palette.",
    priority: "High",
    dueDate: "2026-10-28",
    status: "Todo",
  },
  {
    id: 2,
    title: "Build authentication",
    description: "Implement login and signup screens.",
    priority: "Medium",
    dueDate: "2026-10-30",
    status: "In Progress",
  },
  {
    id: 3,
    title: "Setup project",
    description: "Initialize the React project and Tailwind CSS.",
    priority: "Low",
    dueDate: "2026-10-24",
    status: "Completed",
  },
];

const priorityStyles = {
  Low: "bg-sky-50 text-sky-700",
  Medium: "bg-amber-50 text-amber-700",
  High: "bg-rose-50 text-rose-700",
};

const statusStyles = {
  Todo: "bg-slate-100 text-slate-600",
  "In Progress": "bg-violet-100 text-violet-700",
  Completed: "bg-emerald-100 text-emerald-700",
};

function readTasks() {
  try {
    const saved = localStorage.getItem("kanban-tasks");
    return saved === null ? initialTasks : JSON.parse(saved);
  } catch {
    return initialTasks;
  }
}

function TaskModal({ task, onSave, onClose }) {
  const [form, setForm] = useState(
    task || {
      title: "",
      description: "",
      priority: "Medium",
      dueDate: "",
      status: "Todo",
    }
  );
  const [error, setError] = useState("");

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function submit(e) {
    e.preventDefault();

    if (!form.title.trim()) {
      setError("Task title is required.");
      return;
    }

    if (form.dueDate && form.dueDate < new Date().toLocaleDateString("en-CA")) {
      setError("Please choose today or a future due date.");
      return;
    }

    onSave({ ...form, title: form.title.trim() });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <form
        onSubmit={submit}
        className="w-full max-w-lg space-y-5 rounded-3xl border border-white/70 bg-white p-6 shadow-[0_24px_80px_-20px_rgba(15,23,42,0.35)] sm:p-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-violet-600">
              TASK MANAGEMENT
            </p>
            <h2 className="mt-1 text-xl font-bold text-slate-900">
              {task ? "Edit task" : "Create a task"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-lg px-3 py-2 text-xl text-slate-500 hover:bg-slate-100"
          >
            ×
          </button>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Task title *
          </label>
          <input
            autoFocus
            maxLength={100}
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            placeholder="What needs to be done?"
            className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Description
          </label>
          <textarea
            rows={3}
            maxLength={500}
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            placeholder="Add some details..."
            className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Priority
            </label>
            <select
              value={form.priority}
              onChange={(e) => update("priority", e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 outline-none focus:border-violet-500"
            >
              {PRIORITIES.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Due date
            </label>
            <input
              type="date"
              value={form.dueDate}
              min={new Date().toLocaleDateString("en-CA")}
              onChange={(e) => update("dueDate", e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 outline-none focus:border-violet-500"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Status
          </label>
          <select
            value={form.status}
            onChange={(e) => update("status", e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 outline-none focus:border-violet-500"
          >
            {STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>

        {error && (
          <p role="alert" className="text-sm font-medium text-rose-600">
            {error}
          </p>
        )}

        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 px-4 py-3 font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 rounded-xl bg-violet-600 px-4 py-3 font-semibold text-white hover:bg-violet-700"
          >
            {task ? "Save changes" : "Create task"}
          </button>
        </div>
      </form>
    </div>
  );
}

function TaskCard({ task, onEdit, onDelete, onStatusChange }) {
  const overdue =
    task.dueDate &&
    task.dueDate < new Date().toLocaleDateString("en-CA") &&
    task.status !== "Completed";

  return (
    <article className="group rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_2px_10px_rgba(15,23,42,0.03)] transition duration-200 hover:-translate-y-1 hover:border-violet-200 hover:shadow-[0_12px_28px_rgba(91,33,182,0.09)]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${priorityStyles[task.priority]}`}
        >
          {task.priority} priority
        </span>
        <button
          onClick={() => onDelete(task.id)}
          aria-label={`Delete ${task.title}`}
          className="rounded-lg px-2 py-1 text-lg leading-none text-slate-400 hover:bg-rose-50 hover:text-rose-600"
        >
          ×
        </button>
      </div>

      <h3 className="mt-3 wrap-break-word font-bold text-slate-800">
        {task.title}
      </h3>
      <p className="mt-1 whitespace-pre-wrap wrap-break-word text-sm leading-6 text-slate-500">
        {task.description || "No description provided."}
      </p>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
        <span
          className={`text-xs font-medium ${overdue ? "text-rose-600" : "text-slate-500"}`}
        >
          {task.dueDate
            ? `${overdue ? "Overdue · " : "Due · "}${task.dueDate}`
            : "No due date"}
        </span>
        <button
          onClick={() => onEdit(task)}
          className="text-sm font-semibold text-violet-600 hover:text-violet-800"
        >
          Edit
        </button>
      </div>

      <select
        aria-label={`Change status of ${task.title}`}
        value={task.status}
        onChange={(e) => onStatusChange(task.id, e.target.value)}
        className="mt-3 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 outline-none focus:border-violet-500"
      >
        {STATUSES.map((status) => (
          <option key={status}>{status}</option>
        ))}
      </select>
    </article>
  );
}

function KanbanColumn({ status, tasks, onEdit, onDelete, onStatusChange, openCreate }) {
  const dotColors = {
    Todo: "bg-slate-400",
    "In Progress": "bg-violet-500",
    Completed: "bg-emerald-500",
  };

  return (
    <section className="min-w-0 rounded-3xl border border-slate-200/80 bg-slate-100/70 p-3 sm:p-4">
      <div className="mb-4 flex items-center justify-between gap-2 border-b border-slate-200/80 px-1 pb-4">
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${dotColors[status]}`} />
          <h2 className="font-bold text-slate-800">{status}</h2>
        </div>
        <span className="rounded-lg bg-white px-2.5 py-1 text-xs font-bold text-slate-600">
          {tasks.length}
        </span>
      </div>

      <div className="space-y-3">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onEdit={onEdit}
            onDelete={onDelete}
            onStatusChange={onStatusChange}
          />
        ))}

        {tasks.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 px-3 py-10 text-center transition hover:border-violet-300 hover:bg-white">
            <button
            onClick={openCreate}
             className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-white text-xl text-slate-400 cursor-pointer">
              +
            </button>
            <p className="mt-3 text-sm font-semibold text-slate-600">
              No tasks yet
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Tasks in this column will appear here.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

export default function App() {
  const [tasks, setTasks] = useState(readTasks);
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [modalTask, setModalTask] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    localStorage.setItem("kanban-tasks", JSON.stringify(tasks));
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    const query = search.trim().toLowerCase();

    return tasks.filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query);

      const matchesPriority =
        priorityFilter === "All" || task.priority === priorityFilter;

      const matchesStatus =
        statusFilter === "All" || task.status === statusFilter;

      return matchesSearch && matchesPriority && matchesStatus;
    });
  }, [tasks, search, priorityFilter, statusFilter]);

  const stats = [
    { label: "Total tasks", value: tasks.length },
    { label: "To do", value: tasks.filter((t) => t.status === "Todo").length },
    {
      label: "In progress",
      value: tasks.filter((t) => t.status === "In Progress").length,
    },
    {
      label: "Completed",
      value: tasks.filter((t) => t.status === "Completed").length,
    },
  ];

  function openCreate() {
    setModalTask(null);
    setModalOpen(true);
  }

  function saveTask(form) {
    if (modalTask) {
      setTasks((current) =>
        current.map((t) =>
          t.id === modalTask.id ? { ...form, id: modalTask.id } : t
        )
      );
      setNotice("Task updated successfully.");
    } else {
      setTasks((current) => [{ ...form, id: crypto.randomUUID() }, ...current]);
      setNotice("Task created successfully.");
    }

    setModalOpen(false);
  }

  function deleteTask(id) {
    if (!window.confirm("Are you sure you want to delete this task?")) return;

    setTasks((current) => current.filter((task) => task.id !== id));
    setNotice("Task deleted.");
  }

  function changeStatus(id, status) {
    setTasks((current) =>
      current.map((task) => (task.id === id ? { ...task, status } : task))
    );
  }

  useEffect(() => {
    if (!notice) return;
    const timeout = setTimeout(() => setNotice(""), 2500);
    return () => clearTimeout(timeout);
  }, [notice]);

  const noMatches = filteredTasks.length === 0;

  return (
    <main className="min-h-screen bg-[#f7f8fc] text-slate-900 selection:bg-violet-100 selection:text-violet-900">
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <a href="#" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-linear-to-br from-violet-600 to-indigo-600 text-xl font-black text-white shadow-md shadow-violet-200">
              K
            </span>
            <span>
              <span className="block text-lg font-extrabold tracking-tight">
                TaskFlow
              </span>
              <span className="block text-xs text-slate-500">
                Your work, organized.
              </span>
            </span>
          </a>

          <button
            onClick={openCreate}
            className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-bold text-white shadow-[0_6px_16px_rgba(124,58,237,0.22)] transition duration-200 hover:-translate-y-0.5 hover:bg-violet-700 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-violet-200"
          >
            + <span className="hidden sm:inline">Add task</span>
            <span className="sm:hidden"> Add</span>
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-360 px-4 py-8 sm:px-6 lg:px-8 xl:py-10">
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600">
            WORKSPACE / MY BOARD
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
            My Kanban Board
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
            Plan your day, track your progress, and get things done.
          </p>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="group rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_2px_12px_rgba(15,23,42,0.025)] transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md sm:p-5"
            >
              <p className="text-sm text-slate-500">{stat.label}</p>
              <p className="mt-2 text-3xl font-extrabold">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="mb-5 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm sm:p-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_180px_180px]">
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                ⌕
              </span>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tasks by title or description..."
                aria-label="Search tasks"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
              />
            </div>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              aria-label="Filter by priority"
              className="cursor-pointer rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
            >
              <option value="All">All priorities</option>
              {PRIORITIES.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by status"
              className="cursor-pointer rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
            >
              <option value="All">All statuses</option>
              {STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>

          {(search || priorityFilter !== "All" || statusFilter !== "All") && (
            <div className="mt-3 flex items-center justify-between gap-3 px-1">
              <p className="text-xs text-slate-500">
                Showing {filteredTasks.length} of {tasks.length} tasks
              </p>
              <button
                onClick={() => {
                  setSearch("");
                  setPriorityFilter("All");
                  setStatusFilter("All");
                }}
                className="text-xs font-semibold text-violet-600 hover:text-violet-800"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>

        {noMatches ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
            <div className="text-4xl">⌕</div>
            <h2 className="mt-3 text-lg font-bold">
              {tasks.length === 0 ? "Your board is empty" : "No tasks found"}
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              {tasks.length === 0
                ? "Create your first task and start organizing your work."
                : "Try a different search term or clear your filters."}
            </p>
            {tasks.length === 0 ? (
              <button
                onClick={openCreate}
                className="mt-5 rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white hover:bg-violet-700"
              >
                + Create your first task
              </button>
            ) : (
              <button
                onClick={() => {
                  setSearch("");
                  setPriorityFilter("All");
                  setStatusFilter("All");
                }}
                className="mt-5 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold hover:bg-slate-50"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-3 lg:gap-5">
            {STATUSES.map((status) => (
              <KanbanColumn
              openCreate={openCreate}
                key={status}
                status={status}
                tasks={filteredTasks.filter((t) => t.status === status)}
                onEdit={(task) => {
                  setModalTask(task);
                  setModalOpen(true);
                }}
                onDelete={deleteTask}
                onStatusChange={changeStatus}
              />
            ))}
          </div>
        )}

        <footer className="mt-8 border-t border-slate-200 py-5 text-center text-xs text-slate-400">
          TaskFlow · Stay focused. Make progress.
        </footer>
      </div>

      {modalOpen && (
        <TaskModal
          task={modalTask}
          onSave={saveTask}
          onClose={() => setModalOpen(false)}
        />
      )}

      {notice && (
        <div
          role="status"
          className="fixed bottom-5 right-5 z-60 rounded-2xl border border-white/10 bg-slate-900 px-5 py-3 text-sm font-medium text-white shadow-2xl"
        >
          {notice}
        </div>
      )}
    </main>
  );
}
