import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { getGroupStatistics } from '../api/client';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function GroupStatistics() {
  const { user } = useUser();
  const navigate = useNavigate();
  const { id: groupId } = useParams<{ id: string }>();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && groupId) {
      loadStatistics();
    }
  }, [user, groupId]);

  const loadStatistics = async () => {
    if (!user || !groupId) return;

    try {
      setLoading(true);
      const data = await getGroupStatistics(groupId);
      setStats(data);
    } catch (error) {
      console.error('Load group statistics error:', error);
      alert('加载组统计数据失败');
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

  // 准备雷达图数据
  const radarData = stats.memberStats.map((member: any) => ({
    subject: member.username,
    '总任务数': member.totalTasks,
    '总打卡次数': member.totalCheckIns,
    '打卡率': member.checkInRate,
    '当前最长连续': member.maxCurrentStreak,
    '历史最长连续': member.maxLongestStreak,
  }));

  // 准备柱状图数据
  const barData = stats.memberStats.map((member: any) => ({
    name: member.username,
    '总任务数': member.totalTasks,
    '总打卡次数': member.totalCheckIns,
    '打卡率': member.checkInRate,
  }));

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate(`/groups/${groupId}/calendar`)}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          返回组日历
        </button>
        <h1 className="text-2xl font-bold">家庭统计分析</h1>
        <div className="w-24"></div> {/* 占位，保持标题居中 */}
      </div>

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
          <h3 className="text-sm text-gray-600 mb-1">家庭成员数</h3>
          <p className="text-3xl font-bold text-orange-600">{stats.totalMembers}</p>
        </div>
      </div>

      {/* 成员打卡对比 */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">成员打卡对比</h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="总任务数" fill="#3b82f6" />
            <Bar dataKey="总打卡次数" fill="#10b981" />
            <Bar dataKey="打卡率" fill="#f59e0b" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 成员综合能力雷达图 */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">成员综合能力对比</h2>
        <ResponsiveContainer width="100%" height={500}>
          <RadarChart outerRadius={150} data={radarData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" />
            <PolarRadiusAxis angle={30} domain={[0, 'dataMax']} />
            <Radar name="总任务数" dataKey="总任务数" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
            <Radar name="总打卡次数" dataKey="总打卡次数" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
            <Radar name="打卡率" dataKey="打卡率" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} />
            <Radar name="当前最长连续" dataKey="当前最长连续" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} />
            <Radar name="历史最长连续" dataKey="历史最长连续" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} />
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* 成员详细统计 */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">成员详细统计</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  成员名称
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  总任务数
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  总打卡次数
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  打卡率
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  当前最长连续
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  历史最长连续
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats.memberStats.map((member: any) => (
                <tr key={member.userId}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {member.username}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {member.totalTasks}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {member.totalCheckIns}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {member.checkInRate}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-semibold">
                    {member.maxCurrentStreak} 天
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {member.maxLongestStreak} 天
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
