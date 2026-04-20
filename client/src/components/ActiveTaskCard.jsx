import React, { useState, useEffect, useRef } from 'react';

const ActiveTaskCard = ({ task, onComplete, onDrop }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  // 1. Point this exactly to the file in your public folder!
  const alarmRef = useRef(typeof window !== 'undefined' ? new Audio('/alarm.mp3') : null);

  // Load existing time if paused/refreshed
  useEffect(() => {
    const savedTime = localStorage.getItem(`timer_${task._id}`);
    if (savedTime) {
      setSecondsElapsed(parseInt(savedTime, 10));
      setHasStarted(true);
    } else {
      setSecondsElapsed(0);
      setHasStarted(false);
    }
    setIsRunning(false);
  }, [task._id]);

  // The Ticking Clock
  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => {
        setSecondsElapsed((prev) => {
          const newTime = prev + 1;
          localStorage.setItem(`timer_${task._id}`, newTime);
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, task._id]);

  // 2. THE BULLETPROOF ALARM
  useEffect(() => {
    const targetSeconds = task.estimatedMinutes * 60;
    
    // If the timer is running and we are at or past the target time...
    if (isRunning && secondsElapsed >= targetSeconds) {
      // Ring EXACTLY on the minute mark (e.g., 15:00, 16:00, 17:00)
      if ((secondsElapsed - targetSeconds) % 60 === 0) {
        if (alarmRef.current) {
          alarmRef.current.currentTime = 0; // Rewind to start
          // The .catch prevents the app from crashing if Chrome blocks the audio
          alarmRef.current.play().catch(err => console.error("Browser blocked the alarm sound:", err));
        }
      }
    }
  }, [secondsElapsed, isRunning, task.estimatedMinutes]);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
    if (!hasStarted) setHasStarted(true);
  };

  const handleDone = () => {
    setIsRunning(false);
    localStorage.removeItem(`timer_${task._id}`);
    onComplete(task._id, Math.floor(secondsElapsed / 60));
  };

  const handleReset = () => {
    setIsRunning(false);
    setSecondsElapsed(0);
    localStorage.removeItem(`timer_${task._id}`);
  };

  const formatTime = (totalSeconds) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isOvertime = secondsElapsed > task.estimatedMinutes * 60;

  return (
    <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 mb-8 relative overflow-hidden shadow-2xl">
      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}></div>
            <span className="text-sm font-bold text-gray-400 tracking-widest uppercase">
              {isRunning ? 'Active Focus' : 'Paused'}
            </span>
          </div>
          <h2 className="text-4xl font-extrabold text-white tracking-tight">{task.title}</h2>
        </div>
        
        <div className="flex flex-col gap-2 items-end">
          <span className="bg-white/10 text-blue-300 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
            📁 {task.project || 'General'}
          </span>
          <span className="bg-white/5 text-gray-400 px-4 py-2 rounded-xl text-sm font-bold border border-white/5">
            {task.energyLevel}
          </span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div className="flex items-baseline gap-2">
          <span className={`text-7xl font-mono font-bold tracking-tighter ${isOvertime ? 'text-red-400' : 'text-blue-400'}`}>
            {formatTime(secondsElapsed)}
          </span>
          <span className="text-xl text-gray-500 font-bold mb-2">
            / {task.estimatedMinutes} mins total
          </span>
        </div>

        {/* Removed the Music button, kept the Reset button */}
        <div className="flex gap-3">
          <button 
            onClick={handleReset}
            className="w-20 h-20 rounded-2xl bg-white/5 hover:bg-white/10 flex flex-col items-center justify-center text-gray-400 hover:text-white transition-colors cursor-pointer border border-white/10"
          >
            <span className="text-2xl mb-1">🔄</span>
            <span className="text-xs font-bold">Reset</span>
          </button>
        </div>
      </div>

      <div className="flex gap-4">
        <button 
          onClick={handleDone} 
          className="flex-1 bg-white text-black hover:bg-gray-200 py-4 rounded-2xl font-bold text-lg transition-colors cursor-pointer shadow-lg shadow-white/10"
        >
          ✅ Done
        </button>
        
        <button 
          onClick={toggleTimer}
          className={`flex-1 py-4 rounded-2xl font-bold text-lg transition-colors cursor-pointer border ${
            isRunning 
              ? 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 border-yellow-500/20'
              : 'bg-green-500/10 text-green-400 hover:bg-green-500/20 border-green-500/20 shadow-lg shadow-green-500/10'
          }`}
        >
          {isRunning ? '⏸ Pause' : (!hasStarted ? '▶️ Start Task' : '▶️ Resume')}
        </button>

        <button 
          onClick={() => onDrop(task._id)} 
          className="px-5 py-4 rounded-2xl font-bold text-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-colors cursor-pointer"
          title="Drop Task for Tonight"
        >
          ⏭️ Skip
        </button>
      </div>
    </div>
  );
};

export default ActiveTaskCard;