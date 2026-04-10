import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import TaskLabel from './TaskLabel';
import { getTasks, getCheckIns, getGroupCalendar, createCheckIn, deleteCheckIn } from '../../api/client';
import { useUser } from '../../context/UserContext';
import { shouldCheckInOnDate } from '../../utils/calculations';

interface Task {
  id: string;
  name: string;
  targetTime: string;
  color: string;
  cycleType: string;
  cycleConfig: string;
  startDate?: string | null;
  endDate?: string | null;
  userId: string;
}

interface CheckIn {
  id: string;
  taskId: string;
  checkInDate: string;
}

interface CalendarDay {
  date: Date;
  tasks: (Task & { checked: boolean; checkInId?: string })[];
}

interface CalendarGridProps {
  groupId?: string;
  userId?: string;
  onCheckInSuccess?: (streak: number, isMilestone: boolean) => void;
}

export default function CalendarGrid({ groupId, userId, onCheckInSuccess }: CalendarGridProps = {}) {
  const { user } = useUser();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, currentMonth, groupId, userId]);

  const loadData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      if (groupId) {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(currentMonth);
        const data = await getGroupCalendar(groupId, {
          startDate: format(monthStart, 'yyyy-MM-dd'),
          endDate: format(monthEnd, 'yyyy-MM-dd'),
        });
        
        // 显示所有用户的任务和打卡记录
        setTasks(data.tasks ?? []);
        setCheckIns(data.checkIns ?? []);
      } else {
        const targetUserId = userId || user.id;
        const [tasksData, checkInsData] = await Promise.all([
          getTasks({ userId: targetUserId }),
          getCheckIns({ userId: targetUserId }),
        ]);
        setTasks(tasksData);
        setCheckIns(checkInsData);
      }
    } catch (error) {
      console.error('Load calendar data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (taskId: string, date: Date) => {
    if (!user) return;

    // 权限检查：只能操作自己的任务
    const task = tasks.find(t => t.id === taskId);
    if (!task) {
      alert('任务不存在');
      return;
    }
    
    // 只有任务的所有者才能操作
    if (task.userId !== user.id) {
      alert('您没有权限操作其他用户的打卡任务');
      return;
    }

    try {
      // 检查是否已打卡
      const existingCheckIn = checkIns.find(
        (ci) => ci.taskId === taskId && isSameDay(new Date(ci.checkInDate), date)
      );

      if (existingCheckIn) {
        // 取消打卡
        await deleteCheckIn(existingCheckIn.id);
        setCheckIns(checkIns.filter((ci) => ci.id !== existingCheckIn.id));
      } else {
        // 打卡
        const result = await createCheckIn({
          taskId,
          userId: user.id,
          checkInDate: format(date, 'yyyy-MM-dd'),
        });
        setCheckIns([...checkIns, result.checkIn]);

        // 触发激励提示（如果连续打卡>2次）
        if (result.streak > 2 && onCheckInSuccess) {
          const milestones = [3, 7, 14, 30, 60, 100];
          const isMilestone = milestones.includes(result.streak);
          onCheckInSuccess(result.streak, isMilestone);
        }
      }

      await loadData();
    } catch (error) {
      console.error('Check in error:', error);
      alert('打卡失败');
    }
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // 组织日历数据
  const calendarDays: CalendarDay[] = days.map((date) => {
    const dayTasks = tasks
      .filter((task) => {
        const taskStart = task.startDate ? new Date(task.startDate) : undefined;
        const taskEnd = task.endDate ? new Date(task.endDate) : undefined;
        return shouldCheckInOnDate(
          task.cycleType,
          task.cycleConfig,
          date,
          taskStart,
          taskEnd
        );
      })
      .map((task) => {
        const checkIn = checkIns.find(
          (ci) => ci.taskId === task.id && isSameDay(new Date(ci.checkInDate), date)
        );
        return {
          ...task,
          checked: !!checkIn,
          checkInId: checkIn?.id,
        };
      });

    return {
      date,
      tasks: dayTasks,
    };
  });

  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  if (loading) {
    return <div className="p-4">加载中...</div>;
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() =>
            setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
          }
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          上个月
        </button>
        <h2 className="text-xl font-bold">
          {format(currentMonth, 'yyyy年MM月', { locale: zhCN })}
        </h2>
        <button
          onClick={() =>
            setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
          }
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          下个月
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {/* 星期标题 */}
        {weekDays.map((day) => (
          <div key={day} className="p-2 text-center font-semibold text-gray-600">
            {day}
          </div>
        ))}

        {/* 日历日期 */}
        {calendarDays.map((day) => (
          <div
            key={day.date.toISOString()}
            className={`min-h-24 p-1 border rounded ${
              isToday(day.date) ? 'bg-blue-50 border-blue-300' : 'bg-white'
            }`}
          >
            <div
              className={`text-sm font-medium mb-1 ${
                isToday(day.date) ? 'text-blue-600' : 'text-gray-700'
              }`}
            >
              {format(day.date, 'd')}
            </div>
            <div className="space-y-1">
              {day.tasks.slice(0, 3).map((task) => (
                <TaskLabel
                  key={task.id}
                  task={task}
                  checked={task.checked}
                  onCheck={() => handleCheckIn(task.id, day.date)}
                />
              ))}
              {day.tasks.length > 3 && (
                <div className="text-xs text-gray-500">+{day.tasks.length - 3} 更多</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

