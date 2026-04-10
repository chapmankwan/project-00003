interface OverdueTask {
  _id: string;
  text: string;
  dueDate: string;
  priority: "minor" | "moderate" | "major";
  listId: {
    _id: string;
    name: string;
  } | null;
}

interface OverdueCardProps {
  tasks: OverdueTask[];
}

function formatOverdue(dueDate: string): string {
  const due = new Date(dueDate);
  const now = new Date();
  const diffMs = now.getTime() - due.getTime();
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffDays === 0) return "due today";
  if (diffDays === 1) return "1 day ago";
  return `${diffDays} days ago`;
}

export const OverdueCard = ({ tasks }: OverdueCardProps) => {
  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-medium uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
          Overdue
        </p>
        {tasks.length > 0 && (
          <span className="text-xs font-medium text-red-500 dark:text-red-400">
            {tasks.length}
          </span>
        )}
      </div>

      {tasks.length === 0 && (
        <p className="text-sm text-zinc-400 dark:text-zinc-500">
          Nothing overdue.
        </p>
      )}

      <div className="flex flex-col gap-3">
        {tasks.map(task => (
          <div key={task._id} className="flex items-start gap-3">
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-400 dark:bg-red-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-zinc-900 dark:text-zinc-100 truncate">
                {task.text}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                {task.listId && (
                  <span className="text-xs text-zinc-400 dark:text-zinc-500">
                    {task.listId.name}
                  </span>
                )}
                <span className="text-xs font-medium text-red-400 dark:text-red-500 bg-red-50 dark:bg-red-950 px-1.5 py-0.5 rounded">
                  {formatOverdue(task.dueDate)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}