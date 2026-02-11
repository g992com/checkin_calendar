import { useState } from 'react';
import CalendarGrid from '../components/calendar/CalendarGrid';
import StreakCelebration from '../components/rewards/StreakCelebration';
import { useUser } from '../context/UserContext';
import { Link } from 'react-router-dom';

export default function Calendar() {
  const { user, logout } = useUser();
  const [celebration, setCelebration] = useState<{
    streak: number;
    isMilestone: boolean;
  } | null>(null);

  // 这个函数应该从打卡API的响应中调用
  const handleCheckInSuccess = (streak: number, isMilestone: boolean) => {
    if (streak > 2) {
      setCelebration({ streak, isMilestone });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold">打卡日历</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">欢迎，{user?.username}</span>
            <Link
              to="/tasks"
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            >
              任务管理
            </Link>
            <Link
              to="/statistics"
              className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
            >
              统计
            </Link>
            <Link
              to="/groups"
              className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
            >
              组/家庭
            </Link>
            <button
              onClick={logout}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              退出
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto">
        <CalendarGrid onCheckInSuccess={handleCheckInSuccess} />
      </div>

      {celebration && (
        <StreakCelebration
          streak={celebration.streak}
          isMilestone={celebration.isMilestone}
          onClose={() => setCelebration(null)}
        />
      )}
    </div>
  );
}

