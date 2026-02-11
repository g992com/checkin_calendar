import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import CalendarGrid from '../components/calendar/CalendarGrid';
import StreakCelebration from '../components/rewards/StreakCelebration';
import { useUser } from '../context/UserContext';
import { getGroup } from '../api/client';

export default function GroupCalendar() {
  const { id } = useParams<{ id: string }>();
  const { user, logout } = useUser();
  const [groupName, setGroupName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [celebration, setCelebration] = useState<{
    streak: number;
    isMilestone: boolean;
  } | null>(null);

  useEffect(() => {
    if (id) {
      getGroup(id)
        .then((group) => setGroupName(group.name))
        .catch(() => setGroupName(''))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [id]);

  const handleCheckInSuccess = (streak: number, isMilestone: boolean) => {
    if (streak > 2) {
      setCelebration({ streak, isMilestone });
    }
  };

  if (!id) {
    return (
      <div className="p-4">
        <p className="text-gray-600">缺少组 ID</p>
        <Link to="/groups" className="text-blue-600 hover:underline">
          返回组管理
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-4">
        <p>加载中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link
              to="/groups"
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              返回组管理
            </Link>
            <h1 className="text-xl font-bold">
              {groupName ? `${groupName} - 组日历` : '组日历'}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">欢迎，{user?.username}</span>
            <Link
              to="/calendar"
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            >
              个人日历
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
        <CalendarGrid groupId={id} onCheckInSuccess={handleCheckInSuccess} />
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
