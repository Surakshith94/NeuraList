import React, { useState, useEffect, useRef } from 'react';
import alarmSound from '/alarm.mp3'; // Ensure you have an alarm sound in this path

const ActiveTaskCard = ({ task, onComplete, onDrop }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  const alarmRef = useRef(typeof window !== 'undefined' ? new Audio(alarmSound) : null);
  // NEW: OS Clock References to defeat browser throttling
  const lastTickRef = useRef(null); 
  const lastRungMinuteRef = useRef(-1); 

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
    lastRungMinuteRef.current = -1; // Reset the alarm history
  }, [task._id]);

  // 1. THE ANTI-THROTTLING CLOCK
  useEffect(() => {
    let interval;
    if (isRunning) {
      lastTickRef.current = Date.now(); // Record exact timestamp when you hit play
      
      interval = setInterval(() => {
        const now = Date.now();
        // Calculate the exact real-world seconds passed since the last tick
        const deltaSeconds = Math.floor((now - lastTickRef.current) / 1000);

        if (deltaSeconds > 0) {
          setSecondsElapsed((prev) => {
            const newTime = prev + deltaSeconds;
            localStorage.setItem(`timer_${task._id}`, newTime);
            return newTime;
          });
          // Move the reference forward by the exact seconds we just added
          lastTickRef.current = lastTickRef.current + (deltaSeconds * 1000); 
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, task._id]);

  // 2. THE JUMP-PROOF ALARM
  useEffect(() => {
    const targetSeconds = task.estimatedMinutes * 60;
    
    if (isRunning && secondsElapsed >= targetSeconds) {
      // Calculate how many minutes into overtime we are
      const overTimeMins = Math.floor((secondsElapsed - targetSeconds) / 60);
      
      // If we entered a new overtime minute (even if the browser jumped past the exact 00s mark!)
      if (overTimeMins > lastRungMinuteRef.current) {
        if (alarmRef.current) {
          alarmRef.current.currentTime = 0; 
          alarmRef.current.play().catch(err => console.error("Browser blocked alarm:", err));
        }
        // Remember that we rang for this minute, don't ring again until the next minute
        lastRungMinuteRef.current = overTimeMins; 
      }
    } else {
      // If we reset or haven't reached the target, reset the alarm state
      lastRungMinuteRef.current = -1;
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
    lastRungMinuteRef.current = -1;
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