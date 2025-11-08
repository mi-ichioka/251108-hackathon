import type { Priority } from '../types/task';

export interface ClassificationResult {
  priority: Priority;
  urgencyScore: number;
  importanceScore: number;
  reasoning: string;
}

export class TaskClassifier {
  constructor() {
    // モック実装のためコンストラクタは空
  }

  async classifyTask(title: string, description?: string): Promise<ClassificationResult> {
    const taskText = (description ? `${title} ${description}` : title).toLowerCase();

    // キーワードベースのスコア計算
    const urgentKeywords = [
      { word: '今すぐ', score: 10 },
      { word: '緊急', score: 10 },
      { word: '至急', score: 9 },
      { word: '今日', score: 9 },
      { word: 'asap', score: 9 },
      { word: '明日', score: 7 },
      { word: '締切', score: 8 },
      { word: '期限', score: 8 },
      { word: '急ぎ', score: 7 },
      { word: 'すぐ', score: 7 },
    ];

    const importantKeywords = [
      { word: 'クリティカル', score: 10 },
      { word: '必須', score: 9 },
      { word: '重要', score: 9 },
      { word: 'プロジェクト', score: 8 },
      { word: '本番', score: 9 },
      { word: 'リリース', score: 8 },
      { word: '報告', score: 7 },
      { word: '会議', score: 6 },
      { word: '発表', score: 7 },
      { word: '提出', score: 7 },
    ];

    // スコア計算
    let urgencyScore = 3; // ベーススコア
    let importanceScore = 3; // ベーススコア

    urgentKeywords.forEach(({ word, score }) => {
      if (taskText.includes(word)) {
        urgencyScore = Math.max(urgencyScore, score);
      }
    });

    importantKeywords.forEach(({ word, score }) => {
      if (taskText.includes(word)) {
        importanceScore = Math.max(importanceScore, score);
      }
    });

    // 優先度の決定（5を閾値とする）
    const isUrgent = urgencyScore >= 5;
    const isImportant = importanceScore >= 5;

    let priority: Priority;
    let reasoning: string;

    if (isUrgent && isImportant) {
      priority = 'urgent-important';
      reasoning = `緊急度: ${urgencyScore}/10, 重要度: ${importanceScore}/10 - 最優先タスク`;
    } else if (!isUrgent && isImportant) {
      priority = 'not-urgent-important';
      reasoning = `緊急度: ${urgencyScore}/10, 重要度: ${importanceScore}/10 - 計画的に取り組むタスク`;
    } else if (isUrgent && !isImportant) {
      priority = 'urgent-not-important';
      reasoning = `緊急度: ${urgencyScore}/10, 重要度: ${importanceScore}/10 - 委任を検討できるタスク`;
    } else {
      priority = 'not-urgent-not-important';
      reasoning = `緊急度: ${urgencyScore}/10, 重要度: ${importanceScore}/10 - 後回しまたは削除を検討`;
    }

    // モックなので少し遅延を入れて実際のAPI呼び出しっぽくする
    await new Promise(resolve => setTimeout(resolve, 500));

    return { priority, urgencyScore, importanceScore, reasoning };
  }
}
