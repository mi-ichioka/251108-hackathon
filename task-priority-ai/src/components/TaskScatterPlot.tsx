import { useState } from 'react';
import type { Task } from '../types/task';
import { MEMBERS } from '../types/member';

interface TaskScatterPlotProps {
  tasks: Task[];
  onDeleteTask: (id: string) => void;
}

export function TaskScatterPlot({ tasks, onDeleteTask }: TaskScatterPlotProps) {
  const [hoveredTask, setHoveredTask] = useState<Task | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // グラフの設定
  const width = 800;
  const height = 600;
  const padding = 60;
  const graphWidth = width - padding * 2;
  const graphHeight = height - padding * 2;

  // スコアを座標に変換（X軸は反転: 緊急度が高いほど左）
  const getX = (urgencyScore: number) => {
    return padding + graphWidth - (urgencyScore / 10) * graphWidth;
  };

  const getY = (importanceScore: number) => {
    return padding + graphHeight - (importanceScore / 10) * graphHeight;
  };

  // タスクの色を決定
  const getTaskColor = (task: Task) => {
    const isUrgent = task.urgencyScore >= 5;
    const isImportant = task.importanceScore >= 5;

    if (isUrgent && isImportant) return '#ef4444'; // 赤
    if (!isUrgent && isImportant) return '#3b82f6'; // 青
    if (isUrgent && !isImportant) return '#f59e0b'; // 黄
    return '#9ca3af'; // グレー
  };

  const handleTaskClick = (task: Task) => {
    if (window.confirm(`「${task.title}」を削除しますか？`)) {
      onDeleteTask(task.id);
    }
  };

  const handleMouseMove = (e: React.MouseEvent, task: Task) => {
    const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
    setTooltipPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setHoveredTask(task);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        タスクマトリクス（重要度 × 緊急度）
      </h2>

      <div className="flex justify-center relative">
        <svg
          width={width}
          height={height}
          className="border border-gray-200 rounded"
          onMouseLeave={() => setHoveredTask(null)}
        >
          {/* clipPathの定義 */}
          <defs>
            {tasks.map((task) => (
              <clipPath key={`clip-${task.id}`} id={`clip-${task.id}`} clipPathUnits="objectBoundingBox">
                <circle cx="0.5" cy="0.5" r="0.5" />
              </clipPath>
            ))}
          </defs>

          {/* 背景の4象限 */}
          {/* 右上: 緊急かつ重要（赤） */}
          <rect
            x={padding}
            y={padding}
            width={graphWidth / 2}
            height={graphHeight / 2}
            fill="#fee2e2"
            opacity={0.5}
          />
          {/* 左上: 重要だが緊急でない（青） */}
          <rect
            x={padding + graphWidth / 2}
            y={padding}
            width={graphWidth / 2}
            height={graphHeight / 2}
            fill="#dbeafe"
            opacity={0.5}
          />
          {/* 右下: 緊急だが重要でない（黄） */}
          <rect
            x={padding}
            y={padding + graphHeight / 2}
            width={graphWidth / 2}
            height={graphHeight / 2}
            fill="#fef3c7"
            opacity={0.5}
          />
          {/* 左下: 緊急でも重要でもない（グレー） */}
          <rect
            x={padding + graphWidth / 2}
            y={padding + graphHeight / 2}
            width={graphWidth / 2}
            height={graphHeight / 2}
            fill="#f3f4f6"
            opacity={0.5}
          />

          {/* グリッド線 */}
          {[0, 2, 4, 6, 8, 10].map((value) => (
            <g key={`grid-${value}`}>
              {/* 横線 */}
              <line
                x1={padding}
                y1={getY(value)}
                x2={padding + graphWidth}
                y2={getY(value)}
                stroke="#e5e7eb"
                strokeWidth={value === 5 ? 2 : 1}
                strokeDasharray={value === 5 ? '5,5' : undefined}
              />
              {/* 縦線 */}
              <line
                x1={getX(value)}
                y1={padding}
                x2={getX(value)}
                y2={padding + graphHeight}
                stroke="#e5e7eb"
                strokeWidth={value === 5 ? 2 : 1}
                strokeDasharray={value === 5 ? '5,5' : undefined}
              />
            </g>
          ))}

          {/* X軸 */}
          <line
            x1={padding}
            y1={padding + graphHeight}
            x2={padding + graphWidth}
            y2={padding + graphHeight}
            stroke="#374151"
            strokeWidth={2}
          />

          {/* Y軸 */}
          <line
            x1={padding}
            y1={padding}
            x2={padding}
            y2={padding + graphHeight}
            stroke="#374151"
            strokeWidth={2}
          />

          {/* X軸ラベル（緊急度） */}
          <text
            x={padding + graphWidth / 2}
            y={height - 10}
            textAnchor="middle"
            className="text-sm fill-gray-700"
          >
            緊急度（高 → 低）
          </text>

          {/* Y軸ラベル（重要度） */}
          <text
            x={15}
            y={padding + graphHeight / 2}
            textAnchor="middle"
            transform={`rotate(-90, 15, ${padding + graphHeight / 2})`}
            className="text-sm fill-gray-700"
          >
            重要度（低 → 高）
          </text>

          {/* X軸目盛り */}
          {[10, 8, 6, 4, 2, 0].map((value, index) => (
            <text
              key={`x-${value}`}
              x={padding + (index * graphWidth) / 5}
              y={padding + graphHeight + 20}
              textAnchor="middle"
              className="text-xs fill-gray-600"
            >
              {value}
            </text>
          ))}

          {/* Y軸目盛り */}
          {[0, 2, 4, 6, 8, 10].map((value) => (
            <text
              key={`y-${value}`}
              x={padding - 10}
              y={getY(value) + 4}
              textAnchor="end"
              className="text-xs fill-gray-600"
            >
              {value}
            </text>
          ))}

          {/* タスクのプロット */}
          {tasks.map((task) => {
            const member = MEMBERS.find((m) => m.id === task.assignedTo);
            const x = getX(task.urgencyScore);
            const y = getY(task.importanceScore);
            const size = hoveredTask?.id === task.id ? 48 : 40;

            return (
              <g key={task.id}>
                {/* 背景の円（優先度の色） */}
                <circle
                  cx={x}
                  cy={y}
                  r={size / 2 + 4}
                  fill={getTaskColor(task)}
                  opacity={0.3}
                  className="transition-all"
                />

                {/* メンバーの顔写真（円形にクリップ） */}
                {member && (
                  <image
                    href={member.avatar}
                    x={x - size / 2}
                    y={y - size / 2}
                    width={size}
                    height={size}
                    clipPath={`url(#clip-${task.id})`}
                    className="cursor-pointer transition-all"
                    onClick={() => handleTaskClick(task)}
                    onMouseMove={(e) => handleMouseMove(e, task)}
                    onMouseLeave={() => setHoveredTask(null)}
                    style={{
                      filter: hoveredTask?.id === task.id ? 'brightness(1.1)' : 'none',
                    }}
                  />
                )}

                {/* 円の枠線（優先度の色） */}
                <circle
                  cx={x}
                  cy={y}
                  r={size / 2}
                  fill="none"
                  stroke={getTaskColor(task)}
                  strokeWidth={4}
                  className="pointer-events-none transition-all"
                />

                {/* 外側の白い枠線 */}
                <circle
                  cx={x}
                  cy={y}
                  r={size / 2 + 2}
                  fill="none"
                  stroke="white"
                  strokeWidth={2}
                  className="pointer-events-none"
                />
              </g>
            );
          })}
        </svg>

        {/* ホバー時のツールチップ */}
        {hoveredTask && (
          <div
            className="absolute bg-white rounded-lg shadow-xl border border-gray-200 p-4 pointer-events-none z-50"
            style={{
              left: `${tooltipPosition.x + 15}px`,
              top: `${tooltipPosition.y + 15}px`,
              maxWidth: '300px',
            }}
          >
            <div className="flex items-start gap-3 mb-2">
              {hoveredTask.assignedTo && (
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200 flex-shrink-0">
                  <img
                    src={MEMBERS.find((m) => m.id === hoveredTask.assignedTo)?.avatar}
                    alt="Member"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-800">
                  {hoveredTask.title}
                </h3>
                {hoveredTask.assignedTo && (
                  <p className="text-xs text-gray-500">
                    担当: {MEMBERS.find((m) => m.id === hoveredTask.assignedTo)?.name}
                  </p>
                )}
              </div>
            </div>
            {hoveredTask.description && (
              <p className="text-sm text-gray-600 mb-3">{hoveredTask.description}</p>
            )}
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">緊急度:</span>
                <span className="text-gray-900 font-semibold">
                  {hoveredTask.urgencyScore}/10
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">重要度:</span>
                <span className="text-gray-900 font-semibold">
                  {hoveredTask.importanceScore}/10
                </span>
              </div>
              <div className="flex justify-between text-xs pt-2 border-t border-gray-100">
                <span className="text-gray-500">追加日時:</span>
                <span className="text-gray-600">
                  {new Date(hoveredTask.createdAt).toLocaleString('ja-JP', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-500 italic">クリックで削除</p>
            </div>
          </div>
        )}
      </div>

      {/* 凡例 */}
      <div className="mt-6 flex justify-center gap-6 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-red-500"></div>
          <span className="text-sm text-gray-700">緊急かつ重要</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-blue-500"></div>
          <span className="text-sm text-gray-700">重要だが緊急でない</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
          <span className="text-sm text-gray-700">緊急だが重要でない</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-gray-400"></div>
          <span className="text-sm text-gray-700">緊急でも重要でもない</span>
        </div>
      </div>
    </div>
  );
}
