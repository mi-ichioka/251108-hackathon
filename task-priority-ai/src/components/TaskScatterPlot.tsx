import { useState, useRef, useEffect } from 'react';
import type { Task, TaskSource } from '../types/task';
import { MEMBERS } from '../types/member';

// タスクソースのロゴマッピング
const SOURCE_LOGOS: Record<TaskSource, string> = {
  slack: '/slack-logo.png',
  jira: '/jira_logo.png',
  backlog: '/backlog_icon.png',
  mail: '/mail_icon.png',
};

interface TaskScatterPlotProps {
  tasks: Task[];
  onDeleteTask: (id: string) => void;
}

export function TaskScatterPlot({ tasks, onDeleteTask }: TaskScatterPlotProps) {
  const [hoveredTask, setHoveredTask] = useState<Task | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState({ width: 1200, height: 700 });
  const containerRef = useRef<HTMLDivElement>(null);

  // コンテナのサイズを取得してSVGのサイズを設定
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        // 幅はコンテナいっぱい、高さは幅の約58%（アスペクト比を維持）
        const newWidth = Math.max(containerWidth - 48, 800); // 最小800px
        const newHeight = Math.max(newWidth * 0.58, 600); // 最小600px
        setDimensions({ width: newWidth, height: newHeight });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // グラフの設定
  const width = dimensions.width;
  const height = dimensions.height;
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
    <div ref={containerRef} className="bg-white rounded-lg shadow-md p-6">
      <div className="relative w-full flex justify-center">
        <svg
          width={width}
          height={height}
          className="border border-gray-200 rounded max-w-full"
          onMouseLeave={() => setHoveredTask(null)}
        >
          {/* clipPathと矢印マーカーの定義 */}
          <defs>
            {tasks.map((task) => (
              <clipPath key={`clip-${task.id}`} id={`clip-${task.id}`} clipPathUnits="objectBoundingBox">
                <circle cx="0.5" cy="0.5" r="0.5" />
              </clipPath>
            ))}

            {/* X軸（緊急度）用の矢印マーカー */}
            <marker
              id="arrowhead-x"
              markerWidth="10"
              markerHeight="10"
              refX="5"
              refY="5"
              orient="auto"
            >
              <polygon points="0 0, 10 5, 0 10" fill="#f97316" />
            </marker>

            {/* Y軸（重要度）用の矢印マーカー */}
            <marker
              id="arrowhead-y"
              markerWidth="10"
              markerHeight="10"
              refX="5"
              refY="5"
              orient="auto"
            >
              <polygon points="0 0, 10 5, 0 10" fill="#3b82f6" />
            </marker>
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
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
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

          {/* Y軸（重要度）- 矢印付き */}
          <line
            x1={padding}
            y1={padding + graphHeight}
            x2={padding}
            y2={padding}
            stroke="#3b82f6"
            strokeWidth={5}
            strokeLinecap="round"
            strokeLinejoin="round"
            markerEnd="url(#arrowhead-y)"
          />

          {/* X軸（緊急度）- 矢印付き */}
          <line
            x1={padding + graphWidth}
            y1={padding + graphHeight}
            x2={padding}
            y2={padding + graphHeight}
            stroke="#f97316"
            strokeWidth={5}
            strokeLinecap="round"
            strokeLinejoin="round"
            markerEnd="url(#arrowhead-x)"
          />

          {/* X軸ラベル（緊急度）- 軸に沿って中央に配置 */}
          <text
            x={padding + graphWidth / 2}
            y={padding + graphHeight + 40}
            textAnchor="middle"
            className="text-base font-bold fill-orange-600"
          >
            緊急度
          </text>

          {/* Y軸ラベル（重要度）- 軸に沿って中央に配置（回転） */}
          <text
            x={20}
            y={padding + graphHeight / 2}
            textAnchor="middle"
            transform={`rotate(-90, 20, ${padding + graphHeight / 2})`}
            className="text-base font-bold fill-blue-600"
          >
            重要度
          </text>

          {/* X軸の端のラベル */}
          <text
            x={padding - 5}
            y={padding + graphHeight + 20}
            textAnchor="end"
            className="text-xs font-medium fill-orange-500"
          >
            高
          </text>
          <text
            x={padding + graphWidth + 5}
            y={padding + graphHeight + 20}
            textAnchor="start"
            className="text-xs font-medium fill-gray-400"
          >
            低
          </text>

          {/* Y軸の端のラベル */}
          <text
            x={padding - 35}
            y={padding + 5}
            textAnchor="middle"
            className="text-xs font-medium fill-blue-500"
          >
            高
          </text>
          <text
            x={padding - 35}
            y={padding + graphHeight + 5}
            textAnchor="middle"
            className="text-xs font-medium fill-gray-400"
          >
            低
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

            // 緊急度と重要度に基づいてサイズを動的に計算
            // 左上（緊急かつ重要）ほど大きく表示するため、積を使用
            const baseSize = 60; // 25 * 2.4
            const maxSize = 150; // 70 * 2.14
            const scoreProduct = (task.urgencyScore / 10) * (task.importanceScore / 10); // 0-1の範囲に正規化してから積を取る
            const calculatedSize = baseSize + scoreProduct * (maxSize - baseSize);
            const size = hoveredTask?.id === task.id ? calculatedSize * 1.15 : calculatedSize;

            // 緊急かつ重要なタスクの場合は焦っている顔の画像を使用
            const isUrgentAndImportant = task.urgencyScore >= 5 && task.importanceScore >= 5;
            const avatarPath = member && isUrgentAndImportant
              ? member.avatar.replace('.png', '_upset.png')
              : member?.avatar;

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
                {member && avatarPath && (
                  <image
                    href={avatarPath}
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

                {/* サービスロゴ（右下に配置） */}
                {task.source && (
                  <g>
                    {/* ロゴの背景（白い円） */}
                    <circle
                      cx={x + size * 0.3}
                      cy={y + size * 0.3}
                      r={size * 0.2}
                      fill="white"
                      stroke="#e5e7eb"
                      strokeWidth={1}
                      className="pointer-events-none"
                    />
                    {/* ロゴ画像 */}
                    <image
                      href={SOURCE_LOGOS[task.source]}
                      x={x + size * 0.3 - size * 0.15}
                      y={y + size * 0.3 - size * 0.15}
                      width={size * 0.3}
                      height={size * 0.3}
                      className="pointer-events-none"
                    />
                  </g>
                )}
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
