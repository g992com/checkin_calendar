import { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { getUserStatistics } from '../api/client';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function Statistics() {
  const { user } = useUser();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadStatistics();
    }
  }, [user]);

  const loadStatistics = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await getUserStatistics(user.id);
      setStats(data);
    } catch (error) {
      console.error('Load statistics error:', error);
      alert('加载统计数据失败');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <p>加载中...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-4">
        <p>暂无数据</p>
      </div>
    );
  }

  // 准备时间分布数据
  const timeDistributionData = stats.timeDistribution.map((count: number, hour: number) => ({
    hour: `${hour}:00`,
    count,
  }));

  // 准备任务完成情况数据
  const taskCompletionData = stats.taskStats.map((task: any) => ({
    name: task.taskName,
    value: task.totalCheckIns,
  }));

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">统计分析</h1>

      {/* 总体统计 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm text-gray-600 mb-1">总打卡次数</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.totalCheckIns}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm text-gray-600 mb-1">总任务数</h3>
          <p className="text-3xl font-bold text-green-600">{stats.totalTasks}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm text-gray-600 mb-1">进行中任务</h3>
          <p className="text-3xl font-bold text-orange-600">{stats.activeTasks}</p>
        </div>
      </div>

      {/* 打卡时间分布 */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">打卡时间分布（24小时）</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={timeDistributionData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hour" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 任务完成情况 */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">任务完成情况</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={taskCompletionData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {taskCompletionData.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* 任务详细统计 */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">任务详细统计</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  任务名称
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  总打卡次数
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  当前连续
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  最长连续
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats.taskStats.map((task: any) => (
                <tr key={task.taskId}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {task.taskName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {task.totalCheckIns}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-semibold">
                    {task.currentStreak} 天
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {task.longestStreak} 天
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}




