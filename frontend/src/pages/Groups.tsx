import { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { getGroups, createGroup, getGroupCalendar } from '../api/client';
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
  virtualMembers?: Array<{
    id: string;
    name: string;
  }>;
}

interface VirtualMember {
  id: string;
  name: string;
}

export default function Groups() {
  const { user } = useUser();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    members: [] as string[],
  });
  
  // 虚拟组员管理状态
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [currentGroupId, setCurrentGroupId] = useState<string>('');
  const [memberFormData, setMemberFormData] = useState({
    name: '',
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
      
      // 从本地存储加载虚拟组员信息
      const virtualMembersData = localStorage.getItem('virtualMembers');
      const virtualMembersMap = virtualMembersData ? JSON.parse(virtualMembersData) : {};
      
      // 为每个组添加虚拟组员
      const groupsWithVirtualMembers = data.map(group => {
        const virtualMembers = virtualMembersMap[group.id] || [];
        return {
          ...group,
          virtualMembers
        };
      });
      
      setGroups(groupsWithVirtualMembers);
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

    // 验证至少有一个组员
    if (formData.members.length === 0 || formData.members.some(member => !member.trim())) {
      alert('请至少添加一个组员');
      return;
    }

    try {
      const group = await createGroup({
        name: formData.name,
        description: formData.description,
        userId: user.id,
      });
      
      // 保存虚拟组员到本地存储
      const virtualMembersData = localStorage.getItem('virtualMembers');
      const virtualMembersMap = virtualMembersData ? JSON.parse(virtualMembersData) : {};
      
      // 创建虚拟组员对象
      const virtualMembers = formData.members.map(name => ({
        id: `vm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: name.trim()
      }));
      
      virtualMembersMap[group.id] = virtualMembers;
      localStorage.setItem('virtualMembers', JSON.stringify(virtualMembersMap));
      
      await loadGroups();
      setShowCreateForm(false);
      setFormData({ name: '', description: '', members: [] });
    } catch (error) {
      console.error('Create group error:', error);
      alert('创建组失败');
    }
  };



  // 打开添加组员表单
  const openMemberForm = (groupId: string) => {
    setCurrentGroupId(groupId);
    setMemberFormData({ name: '' });
    setShowMemberForm(true);
  };

  // 处理添加虚拟组员
  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentGroupId || !memberFormData.name.trim()) return;

    try {
      // 从本地存储加载虚拟组员信息
      const virtualMembersData = localStorage.getItem('virtualMembers');
      const virtualMembersMap = virtualMembersData ? JSON.parse(virtualMembersData) : {};
      
      // 获取当前组的虚拟组员
      const groupVirtualMembers = virtualMembersMap[currentGroupId] || [];
      
      // 检查组员名称是否重复
      const isNameExists = groupVirtualMembers.some((member: VirtualMember) => 
        member.name === memberFormData.name.trim()
      );
      
      if (isNameExists) {
        alert('组员名称已存在，请使用其他名称');
        return;
      }
      
      // 添加新的虚拟组员
      const newMember: VirtualMember = {
        id: `vm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: memberFormData.name.trim()
      };
      
      const updatedMembers = [...groupVirtualMembers, newMember];
      virtualMembersMap[currentGroupId] = updatedMembers;
      
      // 保存到本地存储
      localStorage.setItem('virtualMembers', JSON.stringify(virtualMembersMap));
      
      // 更新状态
      setGroups(prevGroups => 
        prevGroups.map(group => 
          group.id === currentGroupId
            ? { ...group, virtualMembers: updatedMembers }
            : group
        )
      );
      
      // 关闭表单
      setShowMemberForm(false);
      setMemberFormData({ name: '' });
    } catch (error) {
      console.error('Add member error:', error);
      alert('添加组员失败');
    }
  };

  // 处理删除虚拟组员
  const handleDeleteMember = (groupId: string, memberId: string) => {
    if (!confirm('确定要删除这个组员吗？')) return;

    try {
      // 从本地存储加载虚拟组员信息
      const virtualMembersData = localStorage.getItem('virtualMembers');
      const virtualMembersMap = virtualMembersData ? JSON.parse(virtualMembersData) : {};
      
      // 获取当前组的虚拟组员
      const groupVirtualMembers = virtualMembersMap[groupId] || [];
      
      // 删除指定组员
      const updatedMembers = groupVirtualMembers.filter((member: VirtualMember) => 
        member.id !== memberId
      );
      
      virtualMembersMap[groupId] = updatedMembers;
      
      // 保存到本地存储
      localStorage.setItem('virtualMembers', JSON.stringify(virtualMembersMap));
      
      // 更新状态
      setGroups(prevGroups => 
        prevGroups.map(group => 
          group.id === groupId
            ? { ...group, virtualMembers: updatedMembers }
            : group
        )
      );
    } catch (error) {
      console.error('Delete member error:', error);
      alert('删除组员失败');
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
            <div>
              <label className="block text-sm font-medium mb-1">组员姓名 *（至少添加一个组员）</label>
              <div className="space-y-2">
                {formData.members.map((member, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      required
                      value={member}
                      onChange={(e) => {
                        const newMembers = [...formData.members];
                        newMembers[index] = e.target.value;
                        setFormData({ ...formData, members: newMembers });
                      }}
                      className="flex-1 px-3 py-2 border rounded-md"
                      placeholder="请输入组员姓名"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newMembers = formData.members.filter((_, i) => i !== index);
                        setFormData({ ...formData, members: newMembers });
                      }}
                      className="px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
                    >
                      删除
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, members: [...formData.members, ''] });
                  }}
                  className="w-full px-3 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200"
                >
                  添加组员
                </button>
              </div>
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
                  setFormData({ name: '', description: '', members: [] });
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                取消
              </button>
            </div>
          </form>
        </div>
      )}



      {showMemberForm && (
        <div className="mb-6 p-4 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">添加组员</h2>
          <form onSubmit={handleAddMember} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">组员姓名 *</label>
              <input
                type="text"
                required
                value={memberFormData.name}
                onChange={(e) => setMemberFormData({ ...memberFormData, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="请输入组员姓名"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                添加
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowMemberForm(false);
                  setMemberFormData({ name: '' });
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
                <div className="flex gap-2">
                  <button
                    onClick={() => openMemberForm(group.id)}
                    className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
                  >
                    添加组员
                  </button>
                  <Link
                    to={`/groups/${group.id}/calendar`}
                    className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                  >
                    查看日历
                  </Link>
                  <Link
                    to={`/groups/${group.id}/statistics`}
                    className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
                  >
                    统计分析
                  </Link>
                </div>
              </div>
              <div className="mt-3">
                <p className="text-sm text-gray-600 mb-2">
                  组ID：<span className="font-mono font-semibold">{group.id}</span>
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  邀请码：<span className="font-mono font-semibold">{group.inviteCode}</span>
                </p>
                <div className="mb-3">
                  <h4 className="text-sm font-medium text-gray-700 mb-1">组内成员</h4>
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
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">虚拟组员</h4>
                  <div className="flex flex-wrap gap-2">
                    {group.virtualMembers && group.virtualMembers.length > 0 ? (
                      group.virtualMembers.map((member) => (
                        <div key={member.id} className="flex items-center gap-1">
                          <span
                            className="px-2 py-1 text-xs bg-blue-100 rounded"
                          >
                            {member.name}
                          </span>
                          <button
                            onClick={() => handleDeleteMember(group.id, member.id)}
                            className="text-xs text-red-500 hover:text-red-700"
                          >
                            ×
                          </button>
                        </div>
                      ))
                    ) : (
                      <span className="text-xs text-gray-500">暂无虚拟组员</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}




