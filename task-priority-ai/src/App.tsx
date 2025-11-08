import { useState, useEffect } from 'react';
import type { Task } from './types/task';
import { TaskClassifier } from './services/taskClassifier';
import { TaskInput } from './components/TaskInput';
import { EisenhowerMatrix } from './components/EisenhowerMatrix';

const STORAGE_KEY = 'task-priority-ai-tasks';

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isClassifying, setIsClassifying] = useState(false);

  // ローカルストレージからタスクを読み込み
  useEffect(() => {
    const storedTasks = localStorage.getItem(STORAGE_KEY);
    if (storedTasks) {
      try {
        const parsedTasks = JSON.parse(storedTasks);
        setTasks(parsedTasks);
      } catch (error) {
        console.error('タスクの読み込みに失敗しました:', error);
      }
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
      const { priority } = await classifier.classifyTask(title, description);

      const newTask: Task = {
        id: crypto.randomUUID(),
        title,
        description,
        priority,
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            AI タスク優先度管理
          </h1>
          <p className="text-gray-600">
            アイゼンハワーマトリクスでタスクを自動分類
          </p>
          {tasks.length > 0 && (
            <div className="mt-4">
              <button
                onClick={handleClearAllTasks}
                className="text-sm text-red-600 hover:text-red-700 underline"
              >
                すべてのタスクを削除
              </button>
            </div>
          )}
        </header>

        <TaskInput onAddTask={handleAddTask} isClassifying={isClassifying} />
        <EisenhowerMatrix tasks={tasks} onDeleteTask={handleDeleteTask} />
      </div>
    </div>
  );
}

export default App;
