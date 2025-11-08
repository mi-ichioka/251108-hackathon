import { useState, useEffect } from 'react';
import type { Task } from './types/task';
import { MEMBERS } from './types/member';
import { TaskClassifier } from './services/taskClassifier';
import { TaskInput } from './components/TaskInput';
import { TaskScatterPlot } from './components/TaskScatterPlot';
import { TaskList } from './components/TaskList';

const STORAGE_KEY = 'task-priority-ai-tasks';

// 通常のダミーデータ
const SAMPLE_TASKS_NORMAL: Task[] = [
  // 山田太郎のタスク (member-1)
  {
    id: 'task-1',
    title: '緊急システム障害対応',
    description: '本番環境で発生した重大な障害の対応が必要',
    priority: 'urgent-important',
    urgencyScore: 9,
    importanceScore: 10,
    assignedTo: 'member-1',
    source: 'slack',
    createdAt: new Date('2025-11-08T09:00:00'),
    updatedAt: new Date('2025-11-08T09:00:00'),
  },
  {
    id: 'task-2',
    title: 'プロジェクト報告書作成',
    description: 'クライアントへの月次報告書を作成',
    priority: 'not-urgent-important',
    urgencyScore: 3,
    importanceScore: 7,
    assignedTo: 'member-1',
    source: 'mail',
    createdAt: new Date('2025-11-08T09:15:00'),
    updatedAt: new Date('2025-11-08T09:15:00'),
  },
  {
    id: 'task-3',
    title: 'コードレビュー',
    description: '新機能のプルリクエストをレビュー',
    priority: 'urgent-not-important',
    urgencyScore: 7,
    importanceScore: 4,
    assignedTo: 'member-1',
    source: 'slack',
    createdAt: new Date('2025-11-08T09:30:00'),
    updatedAt: new Date('2025-11-08T09:30:00'),
  },
  {
    id: 'task-4',
    title: '技術ブログ執筆',
    description: '新しい技術スタックについてのブログ記事を書く',
    priority: 'not-urgent-not-important',
    urgencyScore: 1,
    importanceScore: 4,
    assignedTo: 'member-1',
    source: 'backlog',
    createdAt: new Date('2025-11-08T09:45:00'),
    updatedAt: new Date('2025-11-08T09:45:00'),
  },

  // 佐藤花子のタスク (member-2)
  {
    id: 'task-5',
    title: '顧客プレゼン資料作成',
    description: '来週のプレゼンの資料を準備',
    priority: 'not-urgent-important',
    urgencyScore: 2,
    importanceScore: 9,
    assignedTo: 'member-2',
    source: 'jira',
    createdAt: new Date('2025-11-08T10:00:00'),
    updatedAt: new Date('2025-11-08T10:00:00'),
  },
  {
    id: 'task-6',
    title: '会議資料準備',
    description: 'プロジェクトキックオフ会議の資料作成',
    priority: 'not-urgent-important',
    urgencyScore: 4,
    importanceScore: 6,
    assignedTo: 'member-2',
    source: 'mail',
    createdAt: new Date('2025-11-08T10:15:00'),
    updatedAt: new Date('2025-11-08T10:15:00'),
  },
  {
    id: 'task-7',
    title: '打ち合わせ準備',
    description: '定例ミーティングのアジェンダ作成',
    priority: 'urgent-not-important',
    urgencyScore: 8,
    importanceScore: 3,
    assignedTo: 'member-2',
    source: 'slack',
    createdAt: new Date('2025-11-08T10:30:00'),
    updatedAt: new Date('2025-11-08T10:30:00'),
  },
  {
    id: 'task-8',
    title: 'チームイベント企画',
    description: '来月のチームイベントの企画',
    priority: 'not-urgent-not-important',
    urgencyScore: 1,
    importanceScore: 3,
    assignedTo: 'member-2',
    source: 'slack',
    createdAt: new Date('2025-11-08T10:45:00'),
    updatedAt: new Date('2025-11-08T10:45:00'),
  },
  {
    id: 'task-9',
    title: 'メールの整理',
    description: '未読メールの整理と返信',
    priority: 'not-urgent-not-important',
    urgencyScore: 2,
    importanceScore: 2,
    assignedTo: 'member-2',
    source: 'mail',
    createdAt: new Date('2025-11-08T11:00:00'),
    updatedAt: new Date('2025-11-08T11:00:00'),
  },

  // 鈴木一郎のタスク (member-3)
  {
    id: 'task-10',
    title: 'デプロイ準備',
    description: '本番環境へのデプロイ準備作業',
    priority: 'urgent-important',
    urgencyScore: 7,
    importanceScore: 8,
    assignedTo: 'member-3',
    source: 'backlog',
    createdAt: new Date('2025-11-08T11:15:00'),
    updatedAt: new Date('2025-11-08T11:15:00'),
  },
  {
    id: 'task-11',
    title: '新機能の要件定義',
    description: '次期プロジェクトの機能設計',
    priority: 'not-urgent-important',
    urgencyScore: 2,
    importanceScore: 8,
    assignedTo: 'member-3',
    source: 'jira',
    createdAt: new Date('2025-11-08T11:30:00'),
    updatedAt: new Date('2025-11-08T11:30:00'),
  },
  {
    id: 'task-12',
    title: 'メール返信',
    description: '社内からの問い合わせメールに返信',
    priority: 'urgent-not-important',
    urgencyScore: 6,
    importanceScore: 2,
    assignedTo: 'member-3',
    source: 'mail',
    createdAt: new Date('2025-11-08T11:45:00'),
    updatedAt: new Date('2025-11-08T11:45:00'),
  },
  {
    id: 'task-13',
    title: 'セキュリティ研修受講',
    description: '必須のセキュリティ研修を受講',
    priority: 'not-urgent-important',
    urgencyScore: 1,
    importanceScore: 6,
    assignedTo: 'member-3',
    source: 'backlog',
    createdAt: new Date('2025-11-08T12:00:00'),
    updatedAt: new Date('2025-11-08T12:00:00'),
  },

  // 田中美咲のタスク (member-4)
  {
    id: 'task-14',
    title: 'デザインレビュー',
    description: '新UIデザインの確認',
    priority: 'not-urgent-important',
    urgencyScore: 3,
    importanceScore: 7,
    assignedTo: 'member-4',
    source: 'jira',
    createdAt: new Date('2025-11-08T12:15:00'),
    updatedAt: new Date('2025-11-08T12:15:00'),
  },
  {
    id: 'task-15',
    title: 'ユーザビリティテスト計画',
    description: 'ユーザビリティテストの計画作成',
    priority: 'urgent-important',
    urgencyScore: 6,
    importanceScore: 6,
    assignedTo: 'member-4',
    source: 'backlog',
    createdAt: new Date('2025-11-08T12:30:00'),
    updatedAt: new Date('2025-11-08T12:30:00'),
  },
  {
    id: 'task-16',
    title: 'SNSチェック',
    description: '業界のトレンドを確認',
    priority: 'not-urgent-not-important',
    urgencyScore: 1,
    importanceScore: 2,
    assignedTo: 'member-4',
    source: 'slack',
    createdAt: new Date('2025-11-08T12:45:00'),
    updatedAt: new Date('2025-11-08T12:45:00'),
  },
  {
    id: 'task-17',
    title: 'オフィス備品の発注',
    description: '文房具の在庫確認と発注',
    priority: 'urgent-not-important',
    urgencyScore: 5,
    importanceScore: 1,
    assignedTo: 'member-4',
    source: 'mail',
    createdAt: new Date('2025-11-08T13:00:00'),
    updatedAt: new Date('2025-11-08T13:00:00'),
  },

  // 高橋健太のタスク (member-5)
  {
    id: 'task-18',
    title: '書類作成',
    description: '提出用の書類を作成',
    priority: 'urgent-not-important',
    urgencyScore: 9,
    importanceScore: 4,
    assignedTo: 'member-5',
    source: 'mail',
    createdAt: new Date('2025-11-08T13:15:00'),
    updatedAt: new Date('2025-11-08T13:15:00'),
  },
  {
    id: 'task-19',
    title: 'リリース準備',
    description: '来週のリリースに向けた準備',
    priority: 'not-urgent-important',
    urgencyScore: 2,
    importanceScore: 9,
    assignedTo: 'member-5',
    source: 'jira',
    createdAt: new Date('2025-11-08T13:30:00'),
    updatedAt: new Date('2025-11-08T13:30:00'),
  },
  {
    id: 'task-20',
    title: 'ドキュメント更新',
    description: 'プロジェクトドキュメントの更新',
    priority: 'not-urgent-important',
    urgencyScore: 1,
    importanceScore: 5,
    assignedTo: 'member-5',
    source: 'backlog',
    createdAt: new Date('2025-11-08T13:45:00'),
    updatedAt: new Date('2025-11-08T13:45:00'),
  },
  {
    id: 'task-21',
    title: '電話対応',
    description: '外部からの問い合わせ電話対応',
    priority: 'urgent-not-important',
    urgencyScore: 7,
    importanceScore: 2,
    assignedTo: 'member-5',
    source: 'slack',
    createdAt: new Date('2025-11-08T14:00:00'),
    updatedAt: new Date('2025-11-08T14:00:00'),
  },
  {
    id: 'task-22',
    title: 'ランチミーティング',
    description: 'チームメンバーとのランチミーティング',
    priority: 'not-urgent-not-important',
    urgencyScore: 1,
    importanceScore: 3,
    assignedTo: 'member-5',
    source: 'slack',
    createdAt: new Date('2025-11-08T14:15:00'),
    updatedAt: new Date('2025-11-08T14:15:00'),
  },
];

// 平和モードのダミーデータ（緊急でも重要でもないタスクが多い状態）
const SAMPLE_TASKS_PEACEFUL: Task[] = [
  // 山田太郎のタスク (member-1)
  {
    id: 'task-1',
    title: '技術ブログ執筆',
    description: '新しい技術スタックについてのブログ記事を書く',
    priority: 'not-urgent-not-important',
    urgencyScore: 2,
    importanceScore: 3,
    assignedTo: 'member-1',
    source: 'slack',
    createdAt: new Date('2025-11-08T09:00:00'),
    updatedAt: new Date('2025-11-08T09:00:00'),
  },
  {
    id: 'task-2',
    title: '開発環境の整理',
    description: '使わなくなったツールやライブラリを整理',
    priority: 'not-urgent-not-important',
    urgencyScore: 1,
    importanceScore: 2,
    assignedTo: 'member-1',
    source: 'mail',
    createdAt: new Date('2025-11-08T09:15:00'),
    updatedAt: new Date('2025-11-08T09:15:00'),
  },
  {
    id: 'task-3',
    title: 'オンライン勉強会の視聴',
    description: '気になっていたオンライン勉強会のアーカイブを見る',
    priority: 'not-urgent-not-important',
    urgencyScore: 1,
    importanceScore: 3,
    assignedTo: 'member-1',
    source: 'slack',
    createdAt: new Date('2025-11-08T09:30:00'),
    updatedAt: new Date('2025-11-08T09:30:00'),
  },
  {
    id: 'task-4',
    title: 'デスク周りの整理整頓',
    description: 'デスクを綺麗にして作業環境を快適に',
    priority: 'not-urgent-not-important',
    urgencyScore: 2,
    importanceScore: 1,
    assignedTo: 'member-1',
    source: 'backlog',
    createdAt: new Date('2025-11-08T09:45:00'),
    updatedAt: new Date('2025-11-08T09:45:00'),
  },

  // 佐藤花子のタスク (member-2)
  {
    id: 'task-5',
    title: 'チームビルディングアイデア検討',
    description: '次のチームイベントのアイデアを考える',
    priority: 'not-urgent-not-important',
    urgencyScore: 1,
    importanceScore: 2,
    assignedTo: 'member-2',
    source: 'jira',
    createdAt: new Date('2025-11-08T10:00:00'),
    updatedAt: new Date('2025-11-08T10:00:00'),
  },
  {
    id: 'task-6',
    title: '業界ニュースのチェック',
    description: '最新の業界トレンドをキャッチアップ',
    priority: 'not-urgent-not-important',
    urgencyScore: 2,
    importanceScore: 3,
    assignedTo: 'member-2',
    source: 'mail',
    createdAt: new Date('2025-11-08T10:15:00'),
    updatedAt: new Date('2025-11-08T10:15:00'),
  },
  {
    id: 'task-7',
    title: 'お気に入り記事の整理',
    description: 'ブックマークしている記事を整理',
    priority: 'not-urgent-not-important',
    urgencyScore: 1,
    importanceScore: 1,
    assignedTo: 'member-2',
    source: 'slack',
    createdAt: new Date('2025-11-08T10:30:00'),
    updatedAt: new Date('2025-11-08T10:30:00'),
  },
  {
    id: 'task-8',
    title: 'コーヒーブレイク',
    description: 'リフレッシュのためのコーヒータイム',
    priority: 'not-urgent-not-important',
    urgencyScore: 3,
    importanceScore: 2,
    assignedTo: 'member-2',
    source: 'slack',
    createdAt: new Date('2025-11-08T10:45:00'),
    updatedAt: new Date('2025-11-08T10:45:00'),
  },
  {
    id: 'task-9',
    title: '古いメールの整理',
    description: '溜まっている古いメールをアーカイブ',
    priority: 'not-urgent-not-important',
    urgencyScore: 1,
    importanceScore: 1,
    assignedTo: 'member-2',
    source: 'mail',
    createdAt: new Date('2025-11-08T11:00:00'),
    updatedAt: new Date('2025-11-08T11:00:00'),
  },

  // 鈴木一郎のタスク (member-3)
  {
    id: 'task-10',
    title: '新しいツールの調査',
    description: '話題の開発ツールを試してみる',
    priority: 'not-urgent-not-important',
    urgencyScore: 2,
    importanceScore: 3,
    assignedTo: 'member-3',
    source: 'backlog',
    createdAt: new Date('2025-11-08T11:15:00'),
    updatedAt: new Date('2025-11-08T11:15:00'),
  },
  {
    id: 'task-11',
    title: 'テストコードのリファクタリング',
    description: 'テストコードを読みやすく整理',
    priority: 'not-urgent-important',
    urgencyScore: 1,
    importanceScore: 5,
    assignedTo: 'member-3',
    source: 'jira',
    createdAt: new Date('2025-11-08T11:30:00'),
    updatedAt: new Date('2025-11-08T11:30:00'),
  },
  {
    id: 'task-12',
    title: 'ドキュメントの誤字修正',
    description: '見つけた誤字を修正',
    priority: 'not-urgent-not-important',
    urgencyScore: 1,
    importanceScore: 2,
    assignedTo: 'member-3',
    source: 'mail',
    createdAt: new Date('2025-11-08T11:45:00'),
    updatedAt: new Date('2025-11-08T11:45:00'),
  },
  {
    id: 'task-13',
    title: 'ストレッチ休憩',
    description: '体をほぐして健康維持',
    priority: 'not-urgent-not-important',
    urgencyScore: 2,
    importanceScore: 2,
    assignedTo: 'member-3',
    source: 'backlog',
    createdAt: new Date('2025-11-08T12:00:00'),
    updatedAt: new Date('2025-11-08T12:00:00'),
  },

  // 田中美咲のタスク (member-4)
  {
    id: 'task-14',
    title: 'デザイン事例の収集',
    description: '参考になるデザインを集める',
    priority: 'not-urgent-not-important',
    urgencyScore: 2,
    importanceScore: 3,
    assignedTo: 'member-4',
    source: 'jira',
    createdAt: new Date('2025-11-08T12:15:00'),
    updatedAt: new Date('2025-11-08T12:15:00'),
  },
  {
    id: 'task-15',
    title: 'カラーパレットの整理',
    description: 'よく使うカラーパレットを整理',
    priority: 'not-urgent-not-important',
    urgencyScore: 1,
    importanceScore: 2,
    assignedTo: 'member-4',
    source: 'backlog',
    createdAt: new Date('2025-11-08T12:30:00'),
    updatedAt: new Date('2025-11-08T12:30:00'),
  },
  {
    id: 'task-16',
    title: 'デザイントレンドのリサーチ',
    description: '最新のデザイントレンドを調査',
    priority: 'not-urgent-not-important',
    urgencyScore: 2,
    importanceScore: 3,
    assignedTo: 'member-4',
    source: 'slack',
    createdAt: new Date('2025-11-08T12:45:00'),
    updatedAt: new Date('2025-11-08T12:45:00'),
  },
  {
    id: 'task-17',
    title: '観葉植物の水やり',
    description: 'オフィスの観葉植物に水をあげる',
    priority: 'not-urgent-not-important',
    urgencyScore: 3,
    importanceScore: 1,
    assignedTo: 'member-4',
    source: 'mail',
    createdAt: new Date('2025-11-08T13:00:00'),
    updatedAt: new Date('2025-11-08T13:00:00'),
  },

  // 高橋健太のタスク (member-5)
  {
    id: 'task-18',
    title: 'ファイルの整理',
    description: 'デスクトップのファイルを整理',
    priority: 'not-urgent-not-important',
    urgencyScore: 2,
    importanceScore: 2,
    assignedTo: 'member-5',
    source: 'mail',
    createdAt: new Date('2025-11-08T13:15:00'),
    updatedAt: new Date('2025-11-08T13:15:00'),
  },
  {
    id: 'task-19',
    title: '技術記事の読書',
    description: '気になっていた技術記事を読む',
    priority: 'not-urgent-important',
    urgencyScore: 1,
    importanceScore: 5,
    assignedTo: 'member-5',
    source: 'jira',
    createdAt: new Date('2025-11-08T13:30:00'),
    updatedAt: new Date('2025-11-08T13:30:00'),
  },
  {
    id: 'task-20',
    title: 'Slackの絵文字追加',
    description: 'チームで使える楽しい絵文字を追加',
    priority: 'not-urgent-not-important',
    urgencyScore: 1,
    importanceScore: 1,
    assignedTo: 'member-5',
    source: 'backlog',
    createdAt: new Date('2025-11-08T13:45:00'),
    updatedAt: new Date('2025-11-08T13:45:00'),
  },
  {
    id: 'task-21',
    title: '同僚との雑談',
    description: 'チームメンバーと軽い雑談',
    priority: 'not-urgent-not-important',
    urgencyScore: 2,
    importanceScore: 2,
    assignedTo: 'member-5',
    source: 'slack',
    createdAt: new Date('2025-11-08T14:00:00'),
    updatedAt: new Date('2025-11-08T14:00:00'),
  },
  {
    id: 'task-22',
    title: '散歩',
    description: '気分転換に軽く散歩',
    priority: 'not-urgent-not-important',
    urgencyScore: 2,
    importanceScore: 2,
    assignedTo: 'member-5',
    source: 'slack',
    createdAt: new Date('2025-11-08T14:15:00'),
    updatedAt: new Date('2025-11-08T14:15:00'),
  },
];

// 危機モードのダミーデータ（緊急かつ重要なタスクが多い状態）
const SAMPLE_TASKS_CRISIS: Task[] = [
  // 山田太郎のタスク (member-1)
  {
    id: 'task-1',
    title: '緊急システム障害対応',
    description: '本番環境で発生した重大な障害の対応が必要',
    priority: 'urgent-important',
    urgencyScore: 9,
    importanceScore: 10,
    assignedTo: 'member-1',
    source: 'slack',
    createdAt: new Date('2025-11-08T09:00:00'),
    updatedAt: new Date('2025-11-08T09:00:00'),
  },
  {
    id: 'task-2',
    title: 'クライアント向け緊急報告書作成',
    description: '重大インシデントのクライアントへの報告が今日中に必要',
    priority: 'urgent-important',
    urgencyScore: 8,
    importanceScore: 9,
    assignedTo: 'member-1',
    source: 'mail',
    createdAt: new Date('2025-11-08T09:15:00'),
    updatedAt: new Date('2025-11-08T09:15:00'),
  },
  {
    id: 'task-3',
    title: 'セキュリティパッチ適用',
    description: '重大な脆弱性のパッチを緊急で適用する必要がある',
    priority: 'urgent-important',
    urgencyScore: 9,
    importanceScore: 8,
    assignedTo: 'member-1',
    source: 'slack',
    createdAt: new Date('2025-11-08T09:30:00'),
    updatedAt: new Date('2025-11-08T09:30:00'),
  },
  {
    id: 'task-4',
    title: 'データベースバックアップ復旧',
    description: 'データ損失を防ぐため緊急でバックアップから復旧',
    priority: 'urgent-important',
    urgencyScore: 10,
    importanceScore: 9,
    assignedTo: 'member-1',
    source: 'backlog',
    createdAt: new Date('2025-11-08T09:45:00'),
    updatedAt: new Date('2025-11-08T09:45:00'),
  },

  // 佐藤花子のタスク (member-2)
  {
    id: 'task-5',
    title: '重要顧客プレゼン資料作成',
    description: '明日の大型案件プレゼンの資料を今日中に完成させる',
    priority: 'urgent-important',
    urgencyScore: 8,
    importanceScore: 9,
    assignedTo: 'member-2',
    source: 'jira',
    createdAt: new Date('2025-11-08T10:00:00'),
    updatedAt: new Date('2025-11-08T10:00:00'),
  },
  {
    id: 'task-6',
    title: 'プロジェクト予算承認取得',
    description: '期限が迫っているプロジェクト予算の承認を得る',
    priority: 'urgent-important',
    urgencyScore: 7,
    importanceScore: 8,
    assignedTo: 'member-2',
    source: 'mail',
    createdAt: new Date('2025-11-08T10:15:00'),
    updatedAt: new Date('2025-11-08T10:15:00'),
  },
  {
    id: 'task-7',
    title: '契約書の最終確認',
    description: '明日締結予定の契約書の最終確認と修正',
    priority: 'urgent-important',
    urgencyScore: 8,
    importanceScore: 7,
    assignedTo: 'member-2',
    source: 'slack',
    createdAt: new Date('2025-11-08T10:30:00'),
    updatedAt: new Date('2025-11-08T10:30:00'),
  },
  {
    id: 'task-8',
    title: 'チームメンバーの緊急対応',
    description: 'メンバーの急病により業務の引き継ぎが必要',
    priority: 'urgent-important',
    urgencyScore: 7,
    importanceScore: 7,
    assignedTo: 'member-2',
    source: 'slack',
    createdAt: new Date('2025-11-08T10:45:00'),
    updatedAt: new Date('2025-11-08T10:45:00'),
  },
  {
    id: 'task-9',
    title: 'メールの整理',
    description: '未読メールの整理と返信',
    priority: 'not-urgent-not-important',
    urgencyScore: 2,
    importanceScore: 2,
    assignedTo: 'member-2',
    source: 'mail',
    createdAt: new Date('2025-11-08T11:00:00'),
    updatedAt: new Date('2025-11-08T11:00:00'),
  },

  // 鈴木一郎のタスク (member-3)
  {
    id: 'task-10',
    title: '本番環境デプロイ',
    description: '重要機能のリリース期限が今日中',
    priority: 'urgent-important',
    urgencyScore: 9,
    importanceScore: 8,
    assignedTo: 'member-3',
    source: 'backlog',
    createdAt: new Date('2025-11-08T11:15:00'),
    updatedAt: new Date('2025-11-08T11:15:00'),
  },
  {
    id: 'task-11',
    title: 'API障害の原因調査',
    description: '顧客に影響が出ているAPI障害の原因特定が急務',
    priority: 'urgent-important',
    urgencyScore: 10,
    importanceScore: 9,
    assignedTo: 'member-3',
    source: 'jira',
    createdAt: new Date('2025-11-08T11:30:00'),
    updatedAt: new Date('2025-11-08T11:30:00'),
  },
  {
    id: 'task-12',
    title: 'パフォーマンス改善',
    description: '顧客からのクレーム対応でパフォーマンス改善が必須',
    priority: 'urgent-important',
    urgencyScore: 8,
    importanceScore: 8,
    assignedTo: 'member-3',
    source: 'mail',
    createdAt: new Date('2025-11-08T11:45:00'),
    updatedAt: new Date('2025-11-08T11:45:00'),
  },
  {
    id: 'task-13',
    title: '監視システムの修正',
    description: 'システム監視が正常に動作していない問題を修正',
    priority: 'urgent-important',
    urgencyScore: 7,
    importanceScore: 7,
    assignedTo: 'member-3',
    source: 'backlog',
    createdAt: new Date('2025-11-08T12:00:00'),
    updatedAt: new Date('2025-11-08T12:00:00'),
  },

  // 田中美咲のタスク (member-4)
  {
    id: 'task-14',
    title: 'UI緊急修正',
    description: '本番環境のUI崩れを緊急で修正する必要がある',
    priority: 'urgent-important',
    urgencyScore: 9,
    importanceScore: 7,
    assignedTo: 'member-4',
    source: 'jira',
    createdAt: new Date('2025-11-08T12:15:00'),
    updatedAt: new Date('2025-11-08T12:15:00'),
  },
  {
    id: 'task-15',
    title: 'ユーザビリティテスト実施',
    description: 'リリース前の最終ユーザビリティテストが今日中に必要',
    priority: 'urgent-important',
    urgencyScore: 8,
    importanceScore: 8,
    assignedTo: 'member-4',
    source: 'backlog',
    createdAt: new Date('2025-11-08T12:30:00'),
    updatedAt: new Date('2025-11-08T12:30:00'),
  },
  {
    id: 'task-16',
    title: 'アクセシビリティ対応',
    description: '法的要件を満たすためのアクセシビリティ対応が急務',
    priority: 'urgent-important',
    urgencyScore: 7,
    importanceScore: 9,
    assignedTo: 'member-4',
    source: 'slack',
    createdAt: new Date('2025-11-08T12:45:00'),
    updatedAt: new Date('2025-11-08T12:45:00'),
  },
  {
    id: 'task-17',
    title: 'デザインシステム更新',
    description: 'ブランドリニューアルに伴うデザインシステムの更新',
    priority: 'urgent-important',
    urgencyScore: 7,
    importanceScore: 7,
    assignedTo: 'member-4',
    source: 'mail',
    createdAt: new Date('2025-11-08T13:00:00'),
    updatedAt: new Date('2025-11-08T13:00:00'),
  },

  // 高橋健太のタスク (member-5)
  {
    id: 'task-18',
    title: '顧客向け提案書作成',
    description: '明日の商談に向けた重要な提案書を今日中に完成',
    priority: 'urgent-important',
    urgencyScore: 9,
    importanceScore: 8,
    assignedTo: 'member-5',
    source: 'mail',
    createdAt: new Date('2025-11-08T13:15:00'),
    updatedAt: new Date('2025-11-08T13:15:00'),
  },
  {
    id: 'task-19',
    title: 'リリース最終確認',
    description: '今夜リリース予定の機能の最終確認とテスト',
    priority: 'urgent-important',
    urgencyScore: 10,
    importanceScore: 9,
    assignedTo: 'member-5',
    source: 'jira',
    createdAt: new Date('2025-11-08T13:30:00'),
    updatedAt: new Date('2025-11-08T13:30:00'),
  },
  {
    id: 'task-20',
    title: '緊急ドキュメント作成',
    description: '監査対応のため緊急でドキュメントを作成',
    priority: 'urgent-important',
    urgencyScore: 8,
    importanceScore: 7,
    assignedTo: 'member-5',
    source: 'backlog',
    createdAt: new Date('2025-11-08T13:45:00'),
    updatedAt: new Date('2025-11-08T13:45:00'),
  },
  {
    id: 'task-21',
    title: '重要顧客からの問い合わせ対応',
    description: '大口顧客からの緊急問い合わせに対応',
    priority: 'urgent-important',
    urgencyScore: 8,
    importanceScore: 8,
    assignedTo: 'member-5',
    source: 'slack',
    createdAt: new Date('2025-11-08T14:00:00'),
    updatedAt: new Date('2025-11-08T14:00:00'),
  },
  {
    id: 'task-22',
    title: 'インシデント報告会議',
    description: '経営陣向けのインシデント報告会議の準備',
    priority: 'urgent-important',
    urgencyScore: 7,
    importanceScore: 8,
    assignedTo: 'member-5',
    source: 'slack',
    createdAt: new Date('2025-11-08T14:15:00'),
    updatedAt: new Date('2025-11-08T14:15:00'),
  },
];

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isClassifying, setIsClassifying] = useState(false);
  const [viewMode, setViewMode] = useState<'scatter' | 'list'>('scatter');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [isTaskInputOpen, setIsTaskInputOpen] = useState(false);
  const [logoClickCount, setLogoClickCount] = useState(0);
  const [taskMode, setTaskMode] = useState<0 | 1 | 2>(0); // 0: 通常, 1: 危機, 2: 平和

  // ローカルストレージからタスクを読み込み
  useEffect(() => {
    const storedTasks = localStorage.getItem(STORAGE_KEY);
    if (storedTasks) {
      try {
        const parsedTasks = JSON.parse(storedTasks);
        setTasks(parsedTasks);
      } catch (error) {
        console.error('タスクの読み込みに失敗しました:', error);
        // エラーの場合はダミーデータを表示
        setTasks(SAMPLE_TASKS_NORMAL);
      }
    } else {
      // 初回起動時はダミーデータを表示
      setTasks(SAMPLE_TASKS_NORMAL);
    }
  }, []);

  // タスクをローカルストレージに保存
  useEffect(() => {
    if (tasks.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }
  }, [tasks]);

  const handleAddTask = async (title: string, description?: string) => {
    setIsClassifying(true);

    try {
      const classifier = new TaskClassifier();
      const { priority, urgencyScore, importanceScore } = await classifier.classifyTask(title, description);

      const newTask: Task = {
        id: crypto.randomUUID(),
        title,
        description,
        priority,
        urgencyScore,
        importanceScore,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setTasks((prev) => [...prev, newTask]);
    } catch (error) {
      console.error('タスクの追加に失敗しました:', error);
      alert('タスクの分類に失敗しました。');
    } finally {
      setIsClassifying(false);
    }
  };

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const handleMemberClick = (memberId: string) => {
    setSelectedMemberIds((prev) => {
      if (prev.includes(memberId)) {
        // すでに選択されている場合は削除
        return prev.filter((id) => id !== memberId);
      } else {
        // 選択されていない場合は追加
        return [...prev, memberId];
      }
    });
  };

  // 隠しコマンド: ロゴを3回クリックで通常→危機→平和→通常...と切り替え
  const handleLogoClick = () => {
    setLogoClickCount((prev) => prev + 1);
  };

  // ロゴクリックカウントが3になったらモード切り替え
  useEffect(() => {
    if (logoClickCount >= 3) {
      const newMode = ((taskMode + 1) % 3) as 0 | 1 | 2;
      setTaskMode(newMode);

      // モードに応じてタスクを切り替え
      switch (newMode) {
        case 0:
          setTasks(SAMPLE_TASKS_NORMAL);
          console.log('✅ 通常モードに切り替わりました');
          break;
        case 1:
          setTasks(SAMPLE_TASKS_CRISIS);
          console.log('🚨 危機モードに切り替わりました');
          break;
        case 2:
          setTasks(SAMPLE_TASKS_PEACEFUL);
          console.log('🌸 平和モードに切り替わりました');
          break;
      }

      setLogoClickCount(0);
    }
  }, [logoClickCount, taskMode]);

  // ロゴクリックカウントを2秒後にリセット
  useEffect(() => {
    if (logoClickCount > 0 && logoClickCount < 3) {
      const timer = setTimeout(() => {
        setLogoClickCount(0);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [logoClickCount]);

  // フィルタリングされたタスク
  const filteredTasks =
    selectedMemberIds.length > 0
      ? tasks.filter((task) => task.assignedTo && selectedMemberIds.includes(task.assignedTo))
      : tasks;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <div className="flex justify-start">
            <img
              src="/taskrader_logo.png"
              alt="TaskRadar"
              className="h-24 w-auto cursor-pointer"
              onClick={handleLogoClick}
              title="ロゴを3回クリックでモード切り替え"
            />
          </div>
        </header>

        {/* メンバーフィルタ */}
        <div className="mb-6">
          <div className="flex justify-center gap-2 mb-3 items-center">
              <button
                onClick={() => setSelectedMemberIds(MEMBERS.map((m) => m.id))}
                className="text-xs px-3 py-1 bg-primary-100 text-primary-700 rounded-full hover:bg-primary-200 transition-colors"
              >
                すべて選択
              </button>
              <button
                onClick={() => setSelectedMemberIds([])}
                className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
              >
                選択解除
              </button>
              {selectedMemberIds.length > 0 && (
                <span className="text-xs text-gray-600 ml-2">
                  {selectedMemberIds.length}人選択中 / 表示タスク: {filteredTasks.length}件
                </span>
              )}
            </div>
            <div className="flex justify-center gap-3 flex-wrap">
              {MEMBERS.map((member) => {
              const isSelected = selectedMemberIds.includes(member.id);
              const memberTaskCount = tasks.filter(
                (task) => task.assignedTo === member.id
              ).length;

              return (
                <button
                  key={member.id}
                  onClick={() => handleMemberClick(member.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                    isSelected
                      ? 'bg-white shadow-lg scale-105'
                      : 'bg-white/50 hover:bg-white hover:shadow-md'
                  }`}
                  style={{
                    border: isSelected ? `3px solid ${member.color}` : '3px solid transparent',
                  }}
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white flex-shrink-0">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="font-medium text-gray-800">{member.name}</span>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600">
                    {memberTaskCount}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex justify-center gap-4 flex-wrap items-center">
            <div className="flex gap-2 bg-white rounded-lg shadow-sm p-1">
              <button
                onClick={() => setViewMode('scatter')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'scatter'
                    ? 'bg-primary-500 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                散布図表示
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'list'
                    ? 'bg-primary-500 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                一覧表示
              </button>
            </div>
          </div>
        </div>

        {viewMode === 'scatter' ? (
          <TaskScatterPlot tasks={filteredTasks} onDeleteTask={handleDeleteTask} />
        ) : (
          <TaskList tasks={filteredTasks} onDeleteTask={handleDeleteTask} />
        )}

        {/* 新しいタスクを追加（折りたたみ可能） */}
        <div className="mt-8">
          <button
            onClick={() => setIsTaskInputOpen(!isTaskInputOpen)}
            className="w-full bg-white rounded-lg shadow-md p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">➕</span>
              <span className="font-semibold text-gray-800">新しいタスクを追加</span>
            </div>
            <svg
              className={`w-5 h-5 text-gray-600 transition-transform ${
                isTaskInputOpen ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {isTaskInputOpen && (
            <div className="mt-4">
              <TaskInput onAddTask={handleAddTask} isClassifying={isClassifying} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
