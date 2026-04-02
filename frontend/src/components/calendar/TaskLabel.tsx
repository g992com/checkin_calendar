interface TaskLabelProps {
  task: {
    id: string;
    name: string;
    targetTime: string;
    color: string;
    user?: {
      username: string;
    };
  };
  checked: boolean;
  onCheck: () => void;
}

export default function TaskLabel({ task, checked, onCheck }: TaskLabelProps) {
  const formatTime = (time: string) => {
    if (time === '全天' || !time) return '全天';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div
      className="flex items-center gap-1 p-1 rounded text-xs cursor-pointer hover:opacity-80"
      style={{ backgroundColor: checked ? task.color : `${task.color}40` }}
      onClick={onCheck}
    >
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">{task.name}</div>
        <div className="text-xs opacity-75">
          {formatTime(task.targetTime)}
          {task.user && task.user.username && (
            <span className="ml-1">({task.user.username})</span>
          )}
        </div>
      </div>
      <div
        className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
          checked
            ? 'bg-white border-white'
            : 'bg-transparent border-gray-400'
        }`}
      >
        {checked && (
          <svg className="w-3 h-3 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </div>
    </div>
  );
}




