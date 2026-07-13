import React from 'react';

const ConsistencyHeatmap = ({ tasks }) => {
  // Generate an array of the last 28 days (YYYY-MM-DD)
  const last28Days = Array.from({ length: 28 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (27 - i));
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });

  // 1. THE NEW LOGIC: Scan every task's permanent history array!
  const activityMap = tasks.reduce((acc, task) => {
    if (task.completedDates && task.completedDates.length > 0) {
      task.completedDates.forEach(dateStr => {
        acc[dateStr] = (acc[dateStr] || 0) + 1;
      });
    }
    return acc;
  }, {});

  const getColor = (count) => {
    if (count === 0) return 'bg-white/5 border-white/5'; 
    if (count === 1) return 'bg-green-900/50 border-green-800/50';
    if (count === 2) return 'bg-green-700/70 border-green-600/50';
    return 'bg-green-500 border-green-400 shadow-[0_0_10px_rgba(34,197,94,0.4)]'; 
  };

  return (
    <div className="w-full max-w-md mx-auto mb-8 bg-[#1a1a24] border border-white/10 rounded-[24px] p-6 shadow-xl">
      <div className="flex justify-between items-end mb-4">
        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">🔥 Consistency Streak</h3>
        <span className="text-xs text-gray-500 font-mono">Last 28 Days</span>
      </div>
      
      <div className="grid grid-cols-7 gap-2">
        {last28Days.map((dateStr) => {
          const count = activityMap[dateStr] || 0;
          return (
            <div 
              key={dateStr}
              title={`${count} tasks completed on ${dateStr}`}
              className={`w-full aspect-square rounded-md border transition-all duration-300 hover:scale-110 cursor-help ${getColor(count)}`}
            ></div>
          );
        })}
      </div>
      
      <div className="mt-4 flex justify-between items-center text-xs text-gray-500 font-medium">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-sm bg-white/5"></div>
          <div className="w-3 h-3 rounded-sm bg-green-900/50"></div>
          <div className="w-3 h-3 rounded-sm bg-green-700/70"></div>
          <div className="w-3 h-3 rounded-sm bg-green-500"></div>
        </div>
        <span>More</span>
      </div>
    </div>
  );
};

export default ConsistencyHeatmap;