import { useEffect, useState } from 'react';

interface StreakCelebrationProps {
  streak: number;
  isMilestone: boolean;
  onClose: () => void;
}

export default function StreakCelebration({
  streak,
  isMilestone,
  onClose,
}: StreakCelebrationProps) {
  const [show, setShow] = useState(true);
  const [playSound, setPlaySound] = useState(true);

  useEffect(() => {
    // 播放音效（如果启用）
    if (playSound) {
      // 这里可以添加实际的音效播放逻辑
      // 例如使用 Web Audio API 或 HTML5 Audio
      console.log('Playing celebration sound');
    }

    // 自动关闭
    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(onClose, 300); // 等待动画完成
    }, isMilestone ? 4000 : 3000);

    return () => clearTimeout(timer);
  }, [playSound, isMilestone, onClose]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div
        className={`bg-white rounded-lg p-8 max-w-md mx-4 transform transition-all ${
          show ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        <div className="text-center">
          <div className="text-6xl mb-4">
            {isMilestone ? '🎉' : '✨'}
          </div>
          <h2 className="text-3xl font-bold mb-2 text-gray-800">
            恭喜！
          </h2>
          <p className="text-xl text-gray-600 mb-4">
            已连续打卡 <span className="font-bold text-blue-600">{streak}</span> 天！
          </p>
          {isMilestone && (
            <p className="text-sm text-yellow-600 font-semibold mb-4">
              🏆 里程碑达成！
            </p>
          )}
          <button
            onClick={() => {
              setShow(false);
              onClose();
            }}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            太棒了！
          </button>
        </div>
      </div>
    </div>
  );
}




