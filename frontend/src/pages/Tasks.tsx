import { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { getTasks, createTask, updateTask, deleteTask } from '../api/client';
import type { CycleConfig } from '../utils/calculations';

interface Task {
  id: string;
  name: string;
  description?: string;
  type: string;
  cycleType: string;
  cycleConfig: string;
  targetTime: string;
  color: string;
  status: string;
  startDate?: string | null;
  endDate?: string | null;
}

export default function Tasks() {
  const { user } = useUser();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: '循环',
    cycleType: '每日',
    cycleConfig: {} as CycleConfig,
    targetTime: '21:00',
    color: '#3b82f6',
    status: '进行中',
    startDate: '' as string,
    endDate: '' as string,
  });

  useEffect(() => {
    if (user) {
      loadTasks();
    }
  }, [user]);

  const loadTasks = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await getTasks({ userId: user.id });
      setTasks(data);
    } catch (error) {
      console.error('Load tasks error:', error);
      alert('加载任务失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const payload = {
        ...formData,
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
      };
      if (editingTask) {
        await updateTask(editingTask.id, payload);
      } else {
        await createTask({
          ...payload,
          userId: user.id,
        });
      }
      await loadTasks();
      setShowForm(false);
      setEditingTask(null);
      resetForm();
    } catch (error) {
      console.error('Save task error:', error);
      alert('保存任务失败');
    }
  };

  const formatDateForInput = (d: string | Date | null | undefined): string => {
    if (!d) return '';
    const date = typeof d === 'string' ? new Date(d) : d;
    return date.toISOString().slice(0, 10);
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    let cycleConfig: CycleConfig = {};
    try {
      cycleConfig = typeof task.cycleConfig === 'string'
        ? JSON.parse(task.cycleConfig)
        : task.cycleConfig;
    } catch (e) {
      cycleConfig = {};
    }

    setFormData({
      name: task.name,
      description: task.description || '',
      type: task.type,
      cycleType: task.cycleType,
      cycleConfig,
      targetTime: task.targetTime,
      color: task.color,
      status: task.status,
      startDate: formatDateForInput(task.startDate),
      endDate: formatDateForInput(task.endDate),
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个任务吗？')) return;

    try {
      await deleteTask(id);
      await loadTasks();
    } catch (error) {
      console.error('Delete task error:', error);
      alert('删除任务失败');
    }
  };

  const getDefaultCycleConfig = (cycleType: string): CycleConfig => {
    switch (cycleType) {
      case '每周':
        return { daysOfWeek: [] };
      case '每月':
        return { daysOfMonth: [] };
      case '自定义':
        return { interval: 1, intervalUnit: 'day' };
      default:
        return {};
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: '循环',
      cycleType: '每日',
      cycleConfig: {},
      targetTime: '21:00',
      color: '#3b82f6',
      status: '进行中',
      startDate: '',
      endDate: '',
    });
  };

  if (loading) {
    return (
      <div className="p-4">
        <p>加载中...</p>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">任务管理</h1>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingTask(null);
            resetForm();
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          新建任务
        </button>
      </div>

      {showForm && (
        <div className="mb-6 p-4 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">
            {editingTask ? '编辑任务' : '新建任务'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">任务名称 *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">描述</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">任务类型 *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="循环">循环</option>
                  <option value="一次性">一次性</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">周期类型 *</label>
                <select
                  value={formData.cycleType}
                  onChange={(e) => {
                    const cycleType = e.target.value;
                    setFormData({
                      ...formData,
                      cycleType,
                      cycleConfig: getDefaultCycleConfig(cycleType),
                    });
                  }}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="每日">每日</option>
                  <option value="每周">每周</option>
                  <option value="每月">每月</option>
                  <option value="自定义">自定义</option>
                </select>
              </div>
            </div>

            {formData.cycleType === '每周' && (
              <div>
                <label className="block text-sm font-medium mb-1">选择星期几</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { v: 0, label: '日' },
                    { v: 1, label: '一' },
                    { v: 2, label: '二' },
                    { v: 3, label: '三' },
                    { v: 4, label: '四' },
                    { v: 5, label: '五' },
                    { v: 6, label: '六' },
                  ].map(({ v, label }) => {
                    const days = formData.cycleConfig.daysOfWeek ?? [];
                    const checked = days.includes(v);
                    return (
                      <label key={v} className="inline-flex items-center gap-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {
                            const next = checked
                              ? days.filter((d) => d !== v)
                              : [...days, v].sort((a, b) => a - b);
                            setFormData({
                              ...formData,
                              cycleConfig: { ...formData.cycleConfig, daysOfWeek: next },
                            });
                          }}
                          className="rounded"
                        />
                        <span className="text-sm">{label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {formData.cycleType === '每月' && (
              <div>
                <label className="block text-sm font-medium mb-1">选择每月日期（1-31）</label>
                <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => {
                    const days = formData.cycleConfig.daysOfMonth ?? [];
                    const checked = days.includes(d);
                    return (
                      <label key={d} className="inline-flex items-center cursor-pointer w-10">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {
                            const next = checked
                              ? days.filter((x) => x !== d)
                              : [...days, d].sort((a, b) => a - b);
                            setFormData({
                              ...formData,
                              cycleConfig: { ...formData.cycleConfig, daysOfMonth: next },
                            });
                          }}
                          className="rounded"
                        />
                        <span className="text-sm ml-0.5">{d}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {formData.cycleType === '自定义' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">间隔</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.cycleConfig.interval ?? 1}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        cycleConfig: {
                          ...formData.cycleConfig,
                          interval: Math.max(1, parseInt(e.target.value, 10) || 1),
                        },
                      })
                    }
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">单位</label>
                  <select
                    value={formData.cycleConfig.intervalUnit ?? 'day'}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        cycleConfig: {
                          ...formData.cycleConfig,
                          intervalUnit: e.target.value as 'day' | 'week',
                        },
                      })
                    }
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="day">天</option>
                    <option value="week">周</option>
                  </select>
                </div>
                <p className="text-xs text-gray-500 col-span-2">
                  自定义周期从任务开始日期起算，请填写下方「开始日期」。
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">开始日期</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">结束日期</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">目标时间 * (HH:mm)</label>
              <input
                type="time"
                required
                value={formData.targetTime}
                onChange={(e) => setFormData({ ...formData, targetTime: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">颜色</label>
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-full h-10 border rounded-md"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {editingTask ? '更新' : '创建'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingTask(null);
                  resetForm();
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                取消
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-2">
        {tasks.length === 0 ? (
          <p className="text-gray-500 text-center py-8">还没有任务，创建一个吧！</p>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className="p-4 bg-white rounded-lg shadow flex justify-between items-center"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: task.color }}
                  />
                  <h3 className="font-semibold">{task.name}</h3>
                  <span className="text-sm text-gray-500">{task.targetTime}</span>
                </div>
                {task.description && (
                  <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                )}
                <div className="flex gap-2 mt-2">
                  <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                    {task.type}
                  </span>
                  <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                    {task.cycleType}
                  </span>
                  <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                    {task.status}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(task)}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                >
                  编辑
                </button>
                <button
                  onClick={() => handleDelete(task.id)}
                  className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                >
                  删除
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

