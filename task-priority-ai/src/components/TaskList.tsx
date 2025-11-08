import { useState } from 'react';
import type { Task } from '../types/task';
import { MEMBERS } from '../types/member';
import { PRIORITY_LABELS } from '../types/task';

interface TaskListProps {
  tasks: Task[];
  onDeleteTask: (id: string) => void;
}

type SortField = 'title' | 'urgency' | 'importance' | 'createdAt';
type SortOrder = 'asc' | 'desc';

export function TaskList({ tasks, onDeleteTask }: TaskListProps) {
  const [sortField, setSortField] = useState<SortField>('urgency');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    let compareValue = 0;

    switch (sortField) {
      case 'title':
        compareValue = a.title.localeCompare(b.title);
        break;
      case 'urgency':
        compareValue = a.urgencyScore - b.urgencyScore;
        break;
      case 'importance':
        compareValue = a.importanceScore - b.importanceScore;
        break;
      case 'createdAt':
        compareValue = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
    }

    return sortOrder === 'asc' ? compareValue : -compareValue;
  });

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <span className="text-gray-400">⇅</span>;
    }
    return sortOrder === 'asc' ? <span>↑</span> : <span>↓</span>;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">タスク一覧</h2>
        <span className="text-sm text-gray-600">全 {tasks.length} 件</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-700">担当者</th>
              <th
                className="text-left py-3 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('title')}
              >
                <div className="flex items-center gap-2">
                  タスク名 <SortIcon field="title" />
                </div>
              </th>
              <th
                className="text-center py-3 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('urgency')}
              >
                <div className="flex items-center justify-center gap-2">
                  緊急度 <SortIcon field="urgency" />
                </div>
              </th>
              <th
                className="text-center py-3 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('importance')}
              >
                <div className="flex items-center justify-center gap-2">
                  重要度 <SortIcon field="importance" />
                </div>
              </th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">優先度</th>
              <th
                className="text-left py-3 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-50"
                onClick={() => handleSort('createdAt')}
              >
                <div className="flex items-center gap-2">
                  作成日時 <SortIcon field="createdAt" />
                </div>
              </th>
              <th className="text-center py-3 px-4 font-semibold text-gray-700">操作</th>
            </tr>
          </thead>
          <tbody>
            {sortedTasks.map((task) => {
              const member = MEMBERS.find((m) => m.id === task.assignedTo);
              const priorityInfo = task.priority ? PRIORITY_LABELS[task.priority] : null;

              return (
                <tr
                  key={task.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-4 px-4">
                    {member && (
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-gray-200 flex-shrink-0">
                          <img
                            src={member.avatar}
                            alt={member.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          {member.name}
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <div>
                      <div className="font-semibold text-gray-800">{task.title}</div>
                      {task.description && (
                        <div className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {task.description}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-orange-500 h-2 rounded-full transition-all"
                          style={{ width: `${task.urgencyScore * 10}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold text-gray-700 w-8">
                        {task.urgencyScore}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all"
                          style={{ width: `${task.importanceScore * 10}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold text-gray-700 w-8">
                        {task.importanceScore}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    {priorityInfo && (
                      <div
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${priorityInfo.bgColor} ${priorityInfo.color}`}
                      >
                        {priorityInfo.title}
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-gray-600">
                      {new Date(task.createdAt).toLocaleString('ja-JP', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <button
                      onClick={() => onDeleteTask(task.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded transition-colors"
                      aria-label="タスクを削除"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {tasks.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            タスクがありません
          </div>
        )}
      </div>
    </div>
  );
}
