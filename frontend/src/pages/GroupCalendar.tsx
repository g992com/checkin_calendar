import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import CalendarGrid from '../components/calendar/CalendarGrid';
import StreakCelebration from '../components/rewards/StreakCelebration';
import { useUser } from '../context/UserContext';
import { getGroup } from '../api/client';

interface GroupMember {
  userId: string;
  username: string;
  avatar?: string;
}

export default function GroupCalendar() {
  const { id } = useParams<{ id: string }>();
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const [groupName, setGroupName] = useState<string>('');
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>(user?.id);
  const [currentUser, setCurrentUser] = useState<GroupMember | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [celebration, setCelebration] = useState<{
    streak: number;
    isMilestone: boolean;
  } | null>(null);

  useEffect(() => {
    if (id) {
      getGroup(id)
        .then((group) => {
          setGroupName(group.name);
          // 提取成员信息
          const memberList: GroupMember[] = [];
          
          // 从本地存储加载虚拟组员信息
          const virtualMembersData = localStorage.getItem('virtualMembers');
          const virtualMembersMap = virtualMembersData ? JSON.parse(virtualMembersData) : {};
          const virtualMembers = virtualMembersMap[id] || [];
          
          // 添加虚拟组员（可选组员仅包含虚拟组员，不包含创建者）
          virtualMembers.forEach((member: any) => {
            memberList.push({
              userId: member.id,
              username: member.name,
              avatar: undefined
            });
          });
          
          setMembers(memberList);
          
          // 初始化currentUser为当前登录用户
          if (user) {
            const currentMember = memberList.find(member => member.userId === user.id);
            setCurrentUser(currentMember);
          }
        })
        .catch(() => {
          setGroupName('');
          setMembers([]);
          setCurrentUser(undefined);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    if (user) {
      setCurrentUserId(user.id);
      // 从members中找到当前用户
      const currentMember = members.find(member => member.userId === user.id);
      setCurrentUser(currentMember);
    }
  }, [user, members]);

  const handleCheckInSuccess = (streak: number, isMilestone: boolean) => {
    if (streak > 2) {
      setCelebration({ streak, isMilestone });
    }
  };

  const handleUserChange = (userId: string) => {
    setCurrentUserId(userId);
    // 根据选择的userId更新currentUser
    const selectedUser = members.find(member => member.userId === userId);
    setCurrentUser(selectedUser);
  };

  const handleSetTask = () => {
    if (id && currentUserId) {
      // 跳转到任务管理页面，并传递组ID和组员ID作为查询参数
      navigate(`/tasks?groupId=${id}&memberId=${currentUserId}`);
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
            <span className="text-sm text-gray-600">欢迎，{currentUser?.username || user?.username}</span>
            {/* 用户切换下拉菜单 */}
            <div className="relative">
              <select
                value={currentUserId}
                onChange={(e) => handleUserChange(e.target.value)}
                className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {members.map((member) => (
                  <option key={member.userId} value={member.userId}>
                    {member.username}
                    {/* 标记虚拟组员 */}
                    {member.avatar === undefined && ' (虚拟)'}
                  </option>
                ))}
              </select>
            </div>

            <Link
              to={`/groups/${id}/statistics`}
              className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
            >
              统计分析
            </Link>
            <button
              onClick={handleSetTask}
              className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
            >
              设置任务
            </button>
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
        <CalendarGrid 
          groupId={id} 
          userId={currentUserId} 
          onCheckInSuccess={handleCheckInSuccess} 
        />
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
