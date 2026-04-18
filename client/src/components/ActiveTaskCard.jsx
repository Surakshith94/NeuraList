import React, { useState, useEffect, useRef } from 'react';

const ActiveTaskCard = ({ task, onComplete }) => {
  const [secondsElapsed, setSecondsElapsed] = useState(() => {
    const savedSeconds = localStorage.getItem(`timer_${task._id}`);
    return savedSeconds ? parseInt(savedSeconds, 10) : (task.timeSpent || 0) * 60;
  });
  
  const [isRunning, setIsRunning] = useState(false); 
  const [hasStarted, setHasStarted] = useState(false); 
  const [audioEnabled, setAudioEnabled] = useState(false);
  
  const audioRef = useRef(null); // Background music
  const alarmRef = useRef(null); // NEW: Alarm bell

  // Setup background audio volume
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = 0.4; 
    if (alarmRef.current) alarmRef.current.volume = 1.0; // Keep alarm loud
  }, []);

  // Handle Background Music
  useEffect(() => {
    if (!audioRef.current) return;
    if (isRunning && audioEnabled) {
      audioRef.current.play().catch(e => console.error("Audio blocked:", e));
    } else {
      audioRef.current.pause();
    }
  }, [isRunning, audioEnabled]);

  // UPGRADE 1: The Bulletproof Background Timer
  useEffect(() => {
    let interval;
    if (isRunning) {
      // Capture the EXACT real-world time we hit play
      const timeAtStart = Date.now();
      const secondsAtStart = secondsElapsed;

      interval = setInterval(() => {
        // Calculate the true delta from the system clock
        const actualSecondsPassed = Math.floor((Date.now() - timeAtStart) / 1000);
        const trueCurrentTime = secondsAtStart + actualSecondsPassed;
        
        setSecondsElapsed(trueCurrentTime);
        localStorage.setItem(`timer_${task._id}`, trueCurrentTime);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]); // ONLY re-runs when you hit play/pause

  // UPGRADE 2: The Alarm Trigger
  // UPGRADE 2: The Recurring Alarm Trigger
  useEffect(() => {
    const targetSeconds = task.estimatedMinutes * 60;
    
    // If we are running, AND we have reached or passed the target...
    if (isRunning && secondsElapsed >= targetSeconds) {
      // Ring exactly at the limit, AND every 60 seconds after that
      if ((secondsElapsed - targetSeconds) % 60 === 0) {
        if (alarmRef.current) {
          alarmRef.current.currentTime = 0; // Reset audio to the beginning
          alarmRef.current.play().catch(e => console.error("Alarm blocked:", e));
        }
      }
    }
  }, [secondsElapsed, isRunning, task.estimatedMinutes]);

  const toggleTimer = () => {
    if (!hasStarted) setHasStarted(true);
    setIsRunning(!isRunning);
  };

  const handleDone = () => {
    localStorage.removeItem(`timer_${task._id}`);
    const actualMinutesSpent = Math.round(secondsElapsed / 60);
    onComplete(task._id, actualMinutesSpent);
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset this timer to 0?")) {
      setIsRunning(false);
      setSecondsElapsed(0);
      localStorage.removeItem(`timer_${task._id}`);
      setHasStarted(false);
    }
  };

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
      
      {isRunning && <div className="absolute top-0 left-1/4 w-1/2 h-full bg-blue-500/10 blur-[60px] pointer-events-none"></div>}

      <div className="relative bg-[#121218] rounded-[28px] p-6 md:p-8 z-10">
        
        <div className="flex justify-between items-start mb-6">
          <div>
            <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400 mb-3">
              {isRunning ? (
                <><span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span> In Progress</>
              ) : (
                <><span className="w-2 h-2 rounded-full bg-yellow-500"></span> {hasStarted ? 'Paused' : 'Ready'}</>
              )}
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">{task.title}</h2>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            <span className="bg-purple-500/10 px-3 py-1 rounded-full text-xs font-bold text-purple-400 border border-purple-500/20">
              📁 {task.project || 'General'}
            </span>
            <span className="bg-white/10 px-3 py-1 rounded-full text-xs font-bold text-gray-300 border border-white/10">
              {task.energyLevel}
            </span>
          </div>
        </div>

        <div className="flex items-end justify-between mb-8 border-b border-white/10 pb-6">
          <div className="flex items-end gap-3">
            <div className="text-5xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              {formatTime(secondsElapsed)}
            </div>
            <div className="text-gray-500 font-medium mb-1">
              / {task.estimatedMinutes} mins total
            </div>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={handleReset}
              className="p-3 rounded-xl bg-white/5 border border-white/10 text-gray-500 hover:text-red-400 hover:border-red-500/30 transition-colors cursor-pointer"
              title="Reset Timer"
            >
              🔄 Reset
            </button>
            <button 
              onClick={() => setAudioEnabled(!audioEnabled)}
              className={`p-3 rounded-xl border transition-colors cursor-pointer ${
                audioEnabled ? 'bg-blue-500/20 border-blue-500/40 text-blue-400' : 'bg-white/5 border-white/10 text-gray-500 hover:text-white'
              }`}
              title="Toggle Focus Audio"
            >
              {audioEnabled ? '🎧 Audio On' : '🔇 Audio Off'}
            </button>
          </div>
        </div>

        <div className="flex gap-4">
          <button onClick={handleDone} className="flex-1 bg-white text-black hover:bg-gray-200 py-4 rounded-2xl font-bold text-lg transition-colors cursor-pointer">
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
            {isRunning ? '⏸ Pause' : (!hasStarted ? '▶️ Start Task' : '▶️ Resume')}
          </button>
        </div>

        {/* The Audio Elements */}
        <audio ref={audioRef} src="/audio.mp3" loop className="hidden" />
        <audio ref={alarmRef} src="/alarm.mp3" className="hidden" />

      </div>
    </div>
  );
};

export default ActiveTaskCard;