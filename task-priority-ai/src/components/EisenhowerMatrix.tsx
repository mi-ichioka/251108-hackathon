import type { Task, Priority } from '../types/task';
import { PRIORITY_LABELS } from '../types/task';
import { TaskCard } from './TaskCard';

interface EisenhowerMatrixProps {
  tasks: Task[];
  onDeleteTask: (id: string) => void;
}

export function EisenhowerMatrix({ tasks, onDeleteTask }: EisenhowerMatrixProps) {
  const getTasksByPriority = (priority: Priority) => {
    return tasks.filter((task) => task.priority === priority);
  };

  const renderQuadrant = (priority: Priority) => {
    const quadrant = PRIORITY_LABELS[priority];
    const quadrantTasks = getTasksByPriority(priority);

    return (
      <div
        className={`${quadrant.bgColor} border-2 rounded-lg p-4 min-h-[300px] flex flex-col`}
      >
        <div className="mb-4">
          <h3 className={`text-lg font-bold ${quadrant.color}`}>{quadrant.title}</h3>
          <p className="text-sm text-gray-600">{quadrant.description}</p>
          <p className="text-xs text-gray-500 mt-1">タスク数: {quadrantTasks.length}</p>
        </div>
        <div className="space-y-3 flex-1">
          {quadrantTasks.length === 0 ? (
            <p className="text-gray-400 text-sm italic">タスクはありません</p>
          ) : (
            quadrantTasks.map((task) => (
              <TaskCard key={task.id} task={task} onDelete={onDeleteTask} />
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderQuadrant('urgent-important')}
        {renderQuadrant('not-urgent-important')}
        {renderQuadrant('urgent-not-important')}
        {renderQuadrant('not-urgent-not-important')}
      </div>
    </div>
  );
}
