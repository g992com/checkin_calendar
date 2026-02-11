import { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { getGroups, createGroup, joinGroup, getGroupCalendar } from '../api/client';
import { Link } from 'react-router-dom';

interface Group {
  id: string;
  name: string;
  description?: string;
  inviteCode: string;
  members: Array<{
    id: string;
    userId: string;
    role: string;
    user: {
      id: string;
      username: string;
    };
  }>;
}

export default function Groups() {
  const { user } = useUser();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    inviteCode: '',
    groupId: '',
  });

  useEffect(() => {
    if (user) {
      loadGroups();
    }
  }, [user]);

  const loadGroups = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await getGroups({ userId: user.id });
      setGroups(data);
    } catch (error) {
      console.error('Load groups error:', error);
      alert('加载组列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await createGroup({
        name: formData.name,
        description: formData.description,
        userId: user.id,
      });
      await loadGroups();
      setShowCreateForm(false);
      setFormData({ name: '', description: '', inviteCode: '', groupId: '' });
    } catch (error) {
      console.error('Create group error:', error);
      alert('创建组失败');
    }
  };

  const handleJoinGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await joinGroup(formData.groupId, formData.inviteCode);
      await loadGroups();
      setShowJoinForm(false);
      setFormData({ name: '', description: '', inviteCode: '', groupId: '' });
    } catch (error) {
      console.error('Join group error:', error);
      alert('加入组失败');
    }
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
        <h1 className="text-2xl font-bold">组/家庭管理</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            创建组
          </button>
          <button
            onClick={() => setShowJoinForm(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            加入组
          </button>
        </div>
      </div>

      {showCreateForm && (
        <div className="mb-6 p-4 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">创建组</h2>
          <form onSubmit={handleCreateGroup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">组名称 *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="例如：我的家庭"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">描述</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                rows={3}
                placeholder="组的描述信息（可选）"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                创建
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setFormData({ name: '', description: '', inviteCode: '', groupId: '' });
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                取消
              </button>
            </div>
          </form>
        </div>
      )}

      {showJoinForm && (
        <div className="mb-6 p-4 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">加入组</h2>
          <form onSubmit={handleJoinGroup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">组ID *</label>
              <input
                type="text"
                required
                value={formData.groupId}
                onChange={(e) => setFormData({ ...formData, groupId: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="请输入组ID"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">邀请码 *</label>
              <input
                type="text"
                required
                value={formData.inviteCode}
                onChange={(e) => setFormData({ ...formData, inviteCode: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="请输入邀请码"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                加入
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowJoinForm(false);
                  setFormData({ name: '', description: '', inviteCode: '', groupId: '' });
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                取消
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {groups.length === 0 ? (
          <p className="text-gray-500 text-center py-8">还没有加入任何组，创建一个或加入一个吧！</p>
        ) : (
          groups.map((group) => (
            <div key={group.id} className="p-4 bg-white rounded-lg shadow">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-lg font-semibold">{group.name}</h3>
                  {group.description && (
                    <p className="text-sm text-gray-600 mt-1">{group.description}</p>
                  )}
                </div>
                <Link
                  to={`/groups/${group.id}/calendar`}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                >
                  查看日历
                </Link>
              </div>
              <div className="mt-3">
                <p className="text-sm text-gray-600 mb-2">
                  邀请码：<span className="font-mono font-semibold">{group.inviteCode}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {group.members.map((member) => (
                    <span
                      key={member.id}
                      className="px-2 py-1 text-xs bg-gray-100 rounded"
                    >
                      {member.user.username}
                      {member.role === '创建者' && ' (创建者)'}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}




