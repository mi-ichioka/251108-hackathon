import type { Priority } from '../types/task';

export interface ClassificationResult {
  priority: Priority;
  reasoning: string;
}

export class TaskClassifier {
  constructor() {
    // モック実装のためコンストラクタは空
  }

  async classifyTask(title: string, description?: string): Promise<ClassificationResult> {
    const taskText = (description ? `${title} ${description}` : title).toLowerCase();

    // キーワードベースの簡易分類ロジック
    const urgentKeywords = ['今日', '明日', '締切', '期限', '急ぎ', 'すぐ', '至急', '緊急', '今すぐ', 'asap'];
    const importantKeywords = ['重要', '必須', 'クリティカル', 'プロジェクト', '報告', '会議', '発表', '提出', 'リリース', '本番'];

    const isUrgent = urgentKeywords.some(keyword => taskText.includes(keyword));
    const isImportant = importantKeywords.some(keyword => taskText.includes(keyword));

    let priority: Priority;
    let reasoning: string;

    if (isUrgent && isImportant) {
      priority = 'urgent-important';
      reasoning = '緊急性と重要性の高いキーワードが含まれているため、最優先タスクとして分類しました。';
    } else if (!isUrgent && isImportant) {
      priority = 'not-urgent-important';
      reasoning = '重要なキーワードが含まれていますが緊急性は低いため、計画的に取り組むタスクとして分類しました。';
    } else if (isUrgent && !isImportant) {
      priority = 'urgent-not-important';
      reasoning = '緊急性はありますが重要度は低いため、委任を検討できるタスクとして分類しました。';
    } else {
      priority = 'not-urgent-not-important';
      reasoning = '緊急性・重要性ともに低いキーワードのため、後回しまたは削除を検討できるタスクとして分類しました。';
    }

    // モックなので少し遅延を入れて実際のAPI呼び出しっぽくする
    await new Promise(resolve => setTimeout(resolve, 500));

    return { priority, reasoning };
  }
}
