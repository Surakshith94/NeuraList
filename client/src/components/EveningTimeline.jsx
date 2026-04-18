import React, { useState, useEffect } from 'react';

const EveningTimeline = ({ activeTask, queueTasks }) => {
  const [liveSeconds, setLiveSeconds] = useState(0);

  // Forcefully fetch the live timer from memory every single second
  useEffect(() => {
    if (!activeTask) {
      setLiveSeconds(0);
      return;
    }
    
    const fetchTime = () => {
      const savedTime = localStorage.getItem(`timer_${activeTask._id}`);
      setLiveSeconds(savedTime ? parseInt(savedTime, 10) : 0);
    };

    fetchTime(); // Initial grab
    const interval = setInterval(fetchTime, 1000); // 1-second heartbeat
    
    return () => clearInterval(interval);
  }, [activeTask]);

  if (!activeTask) return null;

  // 1. Calculate EXACT remaining time down to the second
  const activeSecondsRemaining = Math.max(0, (activeTask.estimatedMinutes * 60) - liveSeconds);
  const activeMinutesRemaining = Math.floor(activeSecondsRemaining / 60);
  
  // 2. Add the queue time
  const queueSeconds = queueTasks.reduce((acc, t) => acc + (t.estimatedMinutes * 60), 0);
  const totalSecondsRemaining = activeSecondsRemaining + queueSeconds;

  // 3. Format for the ticking badge
  const displayTotalMins = Math.floor(totalSecondsRemaining / 60);
  const displayTotalSecs = (totalSecondsRemaining % 60).toString().padStart(2, '0');

  // 4. Calculate display widths
  const displayTasks = [
    { ...activeTask, displayMins: Math.max(1, activeMinutesRemaining) }, // Max 1 ensures the block doesn't completely disappear while active
    ...queueTasks.map(t => ({ ...t, displayMins: t.estimatedMinutes }))
  ];
  const totalOriginalMinutes = displayTasks.reduce((acc, t) => acc + t.displayMins, 0);

  return (
    <div className="mb-8 bg-white/5 border border-white/10 rounded-[24px] p-5 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-white flex items-center gap-2">
          <span>⏱️</span> Live Nightly Split
        </h3>
        <span className="text-sm font-mono font-bold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.2)]">
          {displayTotalMins}m {displayTotalSecs}s of work left
        </span>
      </div>

      <div className="flex w-full h-14 rounded-xl overflow-hidden shadow-inner gap-1 bg-[#0d0d12] border border-white/5 p-1 transition-all duration-1000">
        {displayTasks.map((task, index) => {
          if (task.displayMins <= 0) return null;

          const widthPct = (task.displayMins / totalOriginalMinutes) * 100;
          const isActive = index === 0;

          return (
            <div
              key={task._id + index}
              style={{ width: `${widthPct}%` }}
              title={`${task.title} (${task.displayMins}m)`}
              className={`h-full rounded-lg relative group transition-all duration-1000 overflow-hidden flex items-center justify-center ${
                isActive
                  ? 'bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.6)] border border-blue-400/50' 
                  : task.priority === 'High' ? 'bg-red-500/80' 
                  : task.priority === 'Medium' ? 'bg-yellow-500/80' 
                  : 'bg-gray-500/50'
              }`}
            >
              {widthPct > 8 && (
                <span className="text-[12px] font-extrabold text-white drop-shadow-md z-10">
                  {task.displayMins}m
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