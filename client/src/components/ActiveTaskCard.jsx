import React, { useState, useEffect } from 'react';

const ActiveTaskCard = ({ task, onComplete }) => {
  // Convert any existing time spent into seconds, otherwise start at 0
  const [secondsElapsed, setSecondsElapsed] = useState((task.timeSpent || 0) * 60);
  const [isRunning, setIsRunning] = useState(true);

  // The Live Stopwatch Engine
  useEffect(() => {
    let timer;
    if (isRunning) {
      timer = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    }
    // Cleanup the interval when paused or unmounted to prevent memory leaks
    return () => clearInterval(timer);
  }, [isRunning]);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const handleDone = () => {
    // Convert seconds back to minutes for our algorithm, rounding to the nearest minute
    const actualMinutesSpent = Math.round(secondsElapsed / 60);
    // Pass the actual time spent back to App.jsx!
    onComplete(task._id, actualMinutesSpent);
  };

  // Helper to format seconds into a clean MM:SS or HH:MM:SS string
  const formatTime = (totalSeconds) => {
    const h = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return h === '00' ? `${m}:${s}` : `${h}:${m}:${s}`;
  };

  if (!task) return null;

  return (
    <div className={`relative overflow-hidden rounded-[32px] p-1 border transition-all duration-500 mb-8 shadow-2xl ${
      isRunning ? 'bg-gradient-to-br from-blue-500/20 via-purple-500/10 to-transparent border-blue-500/30 shadow-blue-500/10' : 'bg-white/5 border-white/10 shadow-black/50'
    }`}>
      
      {/* Background glow when running */}
      {isRunning && (
        <div className="absolute top-0 left-1/4 w-1/2 h-full bg-blue-500/10 blur-[60px] pointer-events-none"></div>
      )}

      <div className="relative bg-[#121218] rounded-[28px] p-6 md:p-8 z-10">
        
        <div className="flex justify-between items-start mb-6">
          <div>
            <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400 mb-3">
              {isRunning ? (
                <><span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span> Now Playing</>
              ) : (
                <><span className="w-2 h-2 rounded-full bg-yellow-500"></span> Paused</>
              )}
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              {task.title}
            </h2>
          </div>
          
          {/* Tag container */}
          <div className="flex flex-col items-end gap-2">
            <span className="bg-white/10 px-3 py-1 rounded-full text-xs font-bold text-gray-300 border border-white/10">
              {task.energyLevel}
            </span>
          </div>
        </div>

        {/* The Live Timer Display */}
        <div className="flex items-end gap-3 mb-8">
          <div className="text-5xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
            {formatTime(secondsElapsed)}
          </div>
          <div className="text-gray-500 font-medium mb-1">
            / {task.estimatedMinutes} mins total
          </div>
        </div>

        <div className="flex gap-4">
          <button 
            onClick={handleDone}
            className="flex-1 bg-white text-black hover:bg-gray-200 py-4 rounded-2xl font-bold text-lg transition-colors cursor-pointer"
          >
            ✅ Done
          </button>
          
          <button 
            onClick={toggleTimer}
            className={`flex-1 py-4 rounded-2xl font-bold text-lg transition-colors cursor-pointer border ${
              isRunning 
                ? 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 border-yellow-500/20'
                : 'bg-green-500/10 text-green-400 hover:bg-green-500/20 border-green-500/20'
            }`}
          >
            {isRunning ? '⏸ Pause' : '▶️ Resume'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default ActiveTaskCard;