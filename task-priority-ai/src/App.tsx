import { useState, useEffect } from 'react';
import type { Task } from './types/task';
import { MEMBERS } from './types/member';
import { TaskClassifier } from './services/taskClassifier';
import { TaskInput } from './components/TaskInput';
import { TaskScatterPlot } from './components/TaskScatterPlot';
import { TaskList } from './components/TaskList';

const STORAGE_KEY = 'task-priority-ai-tasks';

// ダミーデータ
const SAMPLE_TASKS: Task[] = [
  // 山田太郎のタスク (member-1)
  {
    id: 'task-1',
    title: '緊急バグ修正',
    description: 'クリティカルなバグが発見され今すぐ対応が必要',
    priority: 'urgent-important',
    urgencyScore: 10,
    importanceScore: 10,
    assignedTo: 'member-1',
    createdAt: new Date('2025-11-08T09:00:00'),
    updatedAt: new Date('2025-11-08T09:00:00'),
  },
  {
    id: 'task-2',
    title: '今日締切のプロジェクト報告書作成',
    description: 'クライアントへの重要な報告書を本日17時までに提出',
    priority: 'urgent-important',
    urgencyScore: 9,
    importanceScore: 9,
    assignedTo: 'member-1',
    createdAt: new Date('2025-11-08T09:15:00'),
    updatedAt: new Date('2025-11-08T09:15:00'),
  },
  {
    id: 'task-3',
    title: 'コードレビュー',
    description: '新機能のプルリクエストをレビュー',
    priority: 'urgent-not-important',
    urgencyScore: 7,
    importanceScore: 6,
    assignedTo: 'member-1',
    createdAt: new Date('2025-11-08T09:30:00'),
    updatedAt: new Date('2025-11-08T09:30:00'),
  },
  {
    id: 'task-4',
    title: '技術ブログ執筆',
    description: '新しい技術スタックについてのブログ記事を書く',
    priority: 'not-urgent-important',
    urgencyScore: 3,
    importanceScore: 7,
    assignedTo: 'member-1',
    createdAt: new Date('2025-11-08T09:45:00'),
    updatedAt: new Date('2025-11-08T09:45:00'),
  },

  // 佐藤花子のタスク (member-2)
  {
    id: 'task-5',
    title: '顧客プレゼン資料作成',
    description: '明日の重要プレゼンの資料を完成させる',
    priority: 'urgent-important',
    urgencyScore: 9,
    importanceScore: 9,
    assignedTo: 'member-2',
    createdAt: new Date('2025-11-08T10:00:00'),
    updatedAt: new Date('2025-11-08T10:00:00'),
  },
  {
    id: 'task-6',
    title: '来週の会議資料準備',
    description: '重要なプロジェクトキックオフ会議の資料作成',
    priority: 'not-urgent-important',
    urgencyScore: 4,
    importanceScore: 8,
    assignedTo: 'member-2',
    createdAt: new Date('2025-11-08T10:15:00'),
    updatedAt: new Date('2025-11-08T10:15:00'),
  },
  {
    id: 'task-7',
    title: '明日の打ち合わせ準備',
    description: '定例ミーティングのアジェンダ作成',
    priority: 'urgent-not-important',
    urgencyScore: 7,
    importanceScore: 5,
    assignedTo: 'member-2',
    createdAt: new Date('2025-11-08T10:30:00'),
    updatedAt: new Date('2025-11-08T10:30:00'),
  },
  {
    id: 'task-8',
    title: 'チームビルディングイベント企画',
    description: '来月のチームイベントの企画',
    priority: 'not-urgent-not-important',
    urgencyScore: 2,
    importanceScore: 4,
    assignedTo: 'member-2',
    createdAt: new Date('2025-11-08T10:45:00'),
    updatedAt: new Date('2025-11-08T10:45:00'),
  },
  {
    id: 'task-9',
    title: 'メールの整理',
    description: '未読メールの整理と返信',
    priority: 'not-urgent-not-important',
    urgencyScore: 3,
    importanceScore: 3,
    assignedTo: 'member-2',
    createdAt: new Date('2025-11-08T11:00:00'),
    updatedAt: new Date('2025-11-08T11:00:00'),
  },

  // 鈴木一郎のタスク (member-3)
  {
    id: 'task-10',
    title: '本番環境のデプロイ',
    description: '今日中に本番環境へデプロイ作業',
    priority: 'urgent-important',
    urgencyScore: 8,
    importanceScore: 9,
    assignedTo: 'member-3',
    createdAt: new Date('2025-11-08T11:15:00'),
    updatedAt: new Date('2025-11-08T11:15:00'),
  },
  {
    id: 'task-11',
    title: '新機能の要件定義',
    description: '次期プロジェクトの重要な機能設計',
    priority: 'not-urgent-important',
    urgencyScore: 3,
    importanceScore: 8,
    assignedTo: 'member-3',
    createdAt: new Date('2025-11-08T11:30:00'),
    updatedAt: new Date('2025-11-08T11:30:00'),
  },
  {
    id: 'task-12',
    title: '至急メール返信',
    description: '社内からの問い合わせメールに返信',
    priority: 'urgent-not-important',
    urgencyScore: 8,
    importanceScore: 4,
    assignedTo: 'member-3',
    createdAt: new Date('2025-11-08T11:45:00'),
    updatedAt: new Date('2025-11-08T11:45:00'),
  },
  {
    id: 'task-13',
    title: 'セキュリティ研修受講',
    description: '必須のセキュリティ研修を受講',
    priority: 'not-urgent-important',
    urgencyScore: 4,
    importanceScore: 7,
    assignedTo: 'member-3',
    createdAt: new Date('2025-11-08T12:00:00'),
    updatedAt: new Date('2025-11-08T12:00:00'),
  },

  // 田中美咲のタスク (member-4)
  {
    id: 'task-14',
    title: 'デザインレビュー',
    description: '新UIデザインの最終確認',
    priority: 'urgent-important',
    urgencyScore: 7,
    importanceScore: 8,
    assignedTo: 'member-4',
    createdAt: new Date('2025-11-08T12:15:00'),
    updatedAt: new Date('2025-11-08T12:15:00'),
  },
  {
    id: 'task-15',
    title: 'ユーザビリティテスト計画',
    description: '来週のユーザビリティテストの計画作成',
    priority: 'not-urgent-important',
    urgencyScore: 5,
    importanceScore: 7,
    assignedTo: 'member-4',
    createdAt: new Date('2025-11-08T12:30:00'),
    updatedAt: new Date('2025-11-08T12:30:00'),
  },
  {
    id: 'task-16',
    title: 'SNSをチェック',
    description: '業界のトレンドを確認',
    priority: 'not-urgent-not-important',
    urgencyScore: 2,
    importanceScore: 3,
    assignedTo: 'member-4',
    createdAt: new Date('2025-11-08T12:45:00'),
    updatedAt: new Date('2025-11-08T12:45:00'),
  },
  {
    id: 'task-17',
    title: 'オフィス備品の発注',
    description: '文房具の在庫確認と発注',
    priority: 'not-urgent-not-important',
    urgencyScore: 3,
    importanceScore: 2,
    assignedTo: 'member-4',
    createdAt: new Date('2025-11-08T13:00:00'),
    updatedAt: new Date('2025-11-08T13:00:00'),
  },

  // 高橋健太のタスク (member-5)
  {
    id: 'task-18',
    title: '今日中に提出する必須書類の作成',
    description: '期限が今日の重要書類',
    priority: 'urgent-important',
    urgencyScore: 9,
    importanceScore: 8,
    assignedTo: 'member-5',
    createdAt: new Date('2025-11-08T13:15:00'),
    updatedAt: new Date('2025-11-08T13:15:00'),
  },
  {
    id: 'task-19',
    title: '本番リリースの準備',
    description: '来週のリリースに向けた最終確認と準備',
    priority: 'not-urgent-important',
    urgencyScore: 5,
    importanceScore: 9,
    assignedTo: 'member-5',
    createdAt: new Date('2025-11-08T13:30:00'),
    updatedAt: new Date('2025-11-08T13:30:00'),
  },
  {
    id: 'task-20',
    title: 'ドキュメント更新',
    description: 'プロジェクトドキュメントの更新',
    priority: 'not-urgent-important',
    urgencyScore: 4,
    importanceScore: 6,
    assignedTo: 'member-5',
    createdAt: new Date('2025-11-08T13:45:00'),
    updatedAt: new Date('2025-11-08T13:45:00'),
  },
  {
    id: 'task-21',
    title: '電話対応',
    description: '外部からの問い合わせ電話対応',
    priority: 'urgent-not-important',
    urgencyScore: 6,
    importanceScore: 3,
    assignedTo: 'member-5',
    createdAt: new Date('2025-11-08T14:00:00'),
    updatedAt: new Date('2025-11-08T14:00:00'),
  },
  {
    id: 'task-22',
    title: 'ランチミーティング',
    description: 'チームメンバーとのランチミーティング',
    priority: 'not-urgent-not-important',
    urgencyScore: 2,
    importanceScore: 4,
    assignedTo: 'member-5',
    createdAt: new Date('2025-11-08T14:15:00'),
    updatedAt: new Date('2025-11-08T14:15:00'),
  },
];

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isClassifying, setIsClassifying] = useState(false);
  const [viewMode, setViewMode] = useState<'scatter' | 'list'>('scatter');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);

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
        setTasks(SAMPLE_TASKS);
      }
    } else {
      // 初回起動時はダミーデータを表示
      setTasks(SAMPLE_TASKS);
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

  const handleClearAllTasks = () => {
    if (window.confirm('すべてのタスクを削除しますか？')) {
      setTasks([]);
      localStorage.removeItem(STORAGE_KEY);
    }
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

  // フィルタリングされたタスク
  const filteredTasks =
    selectedMemberIds.length > 0
      ? tasks.filter((task) => task.assignedTo && selectedMemberIds.includes(task.assignedTo))
      : tasks;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              AI タスク優先度管理
            </h1>
            <p className="text-gray-600">
              アイゼンハワーマトリクスでタスクを自動分類
            </p>
          </div>

          {/* メンバーフィルタ */}
          <div className="mt-6">
            <div className="flex justify-center gap-2 mb-3 items-center">
              <button
                onClick={() => setSelectedMemberIds(MEMBERS.map((m) => m.id))}
                className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
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
          </div>

          <div className="mt-4 flex justify-center gap-4 flex-wrap items-center">
            <div className="flex gap-2 bg-white rounded-lg shadow-sm p-1">
              <button
                onClick={() => setViewMode('scatter')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'scatter'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                散布図表示
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                一覧表示
              </button>
            </div>
            {tasks.length > 0 && (
              <button
                onClick={handleClearAllTasks}
                className="text-sm text-red-600 hover:text-red-700 underline"
              >
                すべてのタスクを削除
              </button>
            )}
          </div>
        </header>

        <TaskInput onAddTask={handleAddTask} isClassifying={isClassifying} />

        {viewMode === 'scatter' ? (
          <TaskScatterPlot tasks={filteredTasks} onDeleteTask={handleDeleteTask} />
        ) : (
          <TaskList tasks={filteredTasks} onDeleteTask={handleDeleteTask} />
        )}
      </div>
    </div>
  );
}

export default App;
