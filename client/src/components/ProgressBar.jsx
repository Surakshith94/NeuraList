import React, { useState, useEffect } from 'react';

const EveningTimeline = ({ activeTask, queueTasks }) => {
  const [liveSeconds, setLiveSeconds] = useState(0);

  useEffect(() => {
    if (!activeTask) return;
    
    const initialVal = localStorage.getItem(`timer_${activeTask._id}`);
    if (initialVal) setLiveSeconds(parseInt(initialVal, 10));

    const interval = setInterval(() => {
      const val = localStorage.getItem(`timer_${activeTask._id}`);
      if (val) setLiveSeconds(parseInt(val, 10));
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTask]);

  if (!activeTask) return null;

  const allEveningTasks = [activeTask, ...queueTasks];
  
  // This is used to draw the physical widths of the color blocks
  const totalOriginalMinutes = allEveningTasks.reduce((acc, t) => acc + t.estimatedMinutes, 0);

  // NEW: This calculates the ACTUAL time left to display in the UI text
  const activeMinutesRemaining = Math.max(0, activeTask.estimatedMinutes - Math.floor(liveSeconds / 60));
  const queueMinutes = queueTasks.reduce((acc, t) => acc + t.estimatedMinutes, 0);
  const actualRemainingWork = activeMinutesRemaining + queueMinutes;

  return (
    <div className="mb-8 bg-white/5 border border-white/10 rounded-[24px] p-5 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-white flex items-center gap-2">
          <span>⏱️</span> Live Nightly Split
        </h3>
        {/* NEW: The label now perfectly matches reality */}
        <span className="text-sm font-mono font-bold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
          {actualRemainingWork} mins of work left
        </span>
      </div>

      <div className="flex w-full h-14 rounded-xl overflow-hidden shadow-inner gap-1 bg-[#0d0d12] border border-white/5 p-1">
        {allEveningTasks.map((task, index) => {
          const widthPct = (task.estimatedMinutes / totalOriginalMinutes) * 100;
          const isActive = index === 0;
          const taskTotalSeconds = task.estimatedMinutes * 60;
          const progressPct = isActive ? Math.min((liveSeconds / taskTotalSeconds) * 100, 100) : 0;

          return (
            <div
              key={task._id + index}
              style={{ width: `${widthPct}%` }}
              title={`${task.title} (${task.estimatedMinutes}m)`}
              className={`h-full rounded-lg relative group transition-all duration-300 overflow-hidden ${
                isActive
                  ? 'bg-blue-900/40 shadow-[0_0_15px_rgba(37,99,235,0.4)] border border-blue-500/50' 
                  : task.priority === 'High' ? 'bg-red-500/80' 
                  : task.priority === 'Medium' ? 'bg-yellow-500/80' 
                  : 'bg-gray-500/50'
              }`}
            >
              {isActive && (
                <div 
                  className="absolute top-0 left-0 h-full bg-blue-500 transition-all duration-1000 ease-linear"
                  style={{ width: `${progressPct}%` }}
                />
              )}
              {widthPct > 12 && (
                <span className="absolute inset-0 flex items-center justify-center text-[12px] font-extrabold text-white drop-shadow-md z-10">
                  {task.estimatedMinutes}m
                </span>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="flex flex-wrap gap-4 mt-5 text-[10px] uppercase font-bold text-gray-400 justify-center">
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-blue-600 shadow-[0_0_5px_rgba(37,99,235,1)]"></div> Active Now</div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-red-500/80"></div> High Priority</div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-yellow-500/80"></div> Med Priority</div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-gray-500/50"></div> Low Priority</div>
      </div>
    </div>
  );
};

export default EveningTimeline;