import { Router, Request, Response } from "express";
import db from "../db";
import type { Task } from "../entity/Task";

const router = Router();

// GET /api/tasks
router.get("/", (_req: Request, res: Response) => {
  const tasks = db
    .prepare("SELECT * FROM task ORDER BY createdAt DESC")
    .all() as unknown as Task[];
  res.json(tasks);
});

// POST /api/tasks
router.post("/", (req: Request, res: Response) => {
  const { title, description, priority, assignee, dueDate, issueType } =
    req.body as Partial<Task>;
  if (!title?.trim()) {
    res.status(400).json({ message: "title is required" });
    return;
  }
  const task = db
    .prepare(
      `INSERT INTO task (title, description, status, priority, assignee, dueDate, issueType)
       VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING *`
    )
    .get(
      title.trim(),
      description ?? "",
      "open",
      priority ?? "normal",
      assignee ?? "",
      dueDate ?? null,
      issueType ?? "task"
    ) as unknown as Task;
  res.status(201).json(task);
});

// PUT /api/tasks/:id
router.put("/:id", (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const existing = db.prepare("SELECT * FROM task WHERE id = ?").get(id) as
    | Task
    | undefined;
  if (!existing) {
    res.status(404).json({ message: "Task not found" });
    return;
  }
  const { title, description, status, priority, assignee, dueDate, issueType } =
    req.body as Partial<Task>;

  const newTitle = title !== undefined ? title.trim() : existing.title;
  const newDescription = description !== undefined ? description : existing.description;
  const newStatus = status !== undefined ? status : existing.status;
  const newPriority = priority !== undefined ? priority : existing.priority;
  const newAssignee = assignee !== undefined ? assignee : existing.assignee;
  const newDueDate = dueDate !== undefined ? dueDate : existing.dueDate;
  const newIssueType = issueType !== undefined ? issueType : existing.issueType;

  const updated = db
    .prepare(
      `UPDATE task SET title = ?, description = ?, status = ?, priority = ?,
       assignee = ?, dueDate = ?, issueType = ?,
       updatedAt = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = ? RETURNING *`
    )
    .get(
      newTitle, newDescription, newStatus, newPriority,
      newAssignee, newDueDate, newIssueType, id
    ) as unknown as Task;
  res.json(updated);
});

// DELETE /api/tasks/:id
router.delete("/:id", (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const existing = db.prepare("SELECT * FROM task WHERE id = ?").get(id) as
    | Task
    | undefined;
  if (!existing) {
    res.status(404).json({ message: "Task not found" });
    return;
  }
  db.prepare("DELETE FROM task WHERE id = ?").run(id);
  res.status(204).send();
});

export default router;
