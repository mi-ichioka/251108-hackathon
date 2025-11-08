export type Priority =
  | 'urgent-important'      // 緊急かつ重要
  | 'not-urgent-important'  // 緊急ではないが重要
  | 'urgent-not-important'  // 緊急だが重要ではない
  | 'not-urgent-not-important'; // 緊急でも重要でもない

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority?: Priority;
  createdAt: Date;
  updatedAt: Date;
}

export interface PriorityQuadrant {
  title: string;
  description: string;
  color: string;
  bgColor: string;
}

export const PRIORITY_LABELS: Record<Priority, PriorityQuadrant> = {
  'urgent-important': {
    title: '緊急かつ重要',
    description: '今すぐやる',
    color: 'text-red-700',
    bgColor: 'bg-red-50 border-red-200',
  },
  'not-urgent-important': {
    title: '重要だが緊急でない',
    description: '計画して実行',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50 border-blue-200',
  },
  'urgent-not-important': {
    title: '緊急だが重要でない',
    description: '委任を検討',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-50 border-yellow-200',
  },
  'not-urgent-not-important': {
    title: '緊急でも重要でもない',
    description: '後回しまたは削除',
    color: 'text-gray-700',
    bgColor: 'bg-gray-50 border-gray-200',
  },
};
