import React from 'react';

const EveningTimeline = ({ activeTask, queueTasks }) => {
  if (!activeTask) return null;

  const allEveningTasks = [activeTask, ...queueTasks];
  const totalPlannedMinutes = allEveningTasks.reduce((acc, t) => acc + t.estimatedMinutes, 0);

  return (
    <div className="mb-8 bg-white/5 border border-white/10 rounded-[24px] p-5 shadow-lg">
      
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-white flex items-center gap-2">
          <span>⏱️</span> Nightly Split
        </h3>
        <span className="text-sm font-mono font-bold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
          {totalPlannedMinutes} mins packed
        </span>
      </div>

      {/* The Chunky Progress Bar */}
      <div className="flex w-full h-14 rounded-xl overflow-hidden shadow-inner gap-1 bg-[#0d0d12] border border-white/5 p-1">
        {allEveningTasks.map((task, index) => {
          const widthPct = (task.estimatedMinutes / totalPlannedMinutes) * 100;
          const isActive = index === 0;

          return (
            <div
              key={task._id + index}
              style={{ width: `${widthPct}%` }}
              title={`${task.title} (${task.estimatedMinutes}m)`}
              className={`h-full rounded-lg flex items-center justify-center relative group transition-all duration-300 ${
                isActive
                  ? 'bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.6)]' // Bright Blue for active
                  : task.priority === 'High' 
                  ? 'bg-red-500/80'   // Red for High Pri
                  : task.priority === 'Medium' 
                  ? 'bg-yellow-500/80' // Yellow for Med Pri
                  : 'bg-gray-500/50'   // Gray for Low Pri
              }`}
            >
              {/* Only show the number if the block is wide enough */}
              {widthPct > 12 && (
                <span className="text-[12px] font-extrabold text-white truncate px-2 drop-shadow-md">
                  {task.estimatedMinutes}m
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Clear Legend */}
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