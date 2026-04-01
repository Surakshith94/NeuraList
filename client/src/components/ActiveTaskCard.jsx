import React, { useState, useEffect, useRef } from 'react';

const ActiveTaskCard = ({ task, onComplete }) => {
  const [secondsElapsed, setSecondsElapsed] = useState(() => {
    const savedSeconds = localStorage.getItem(`timer_${task._id}`);
    return savedSeconds ? parseInt(savedSeconds, 10) : (task.timeSpent || 0) * 60;
  });
  
  const [isRunning, setIsRunning] = useState(false); 
  const [hasStarted, setHasStarted] = useState(false); 
  
  const [audioEnabled, setAudioEnabled] = useState(false);
  
  // FIXED 1: We start with a null ref, NOT new Audio()
  const audioRef = useRef(null);

  // FIXED 2: We wait for the HTML element to render, then set its volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.4; 
    }
  }, []);

  // FIXED 3: We tell the HTML element to play/pause
  useEffect(() => {
    if (!audioRef.current) return;
    
    if (isRunning && audioEnabled) {
      audioRef.current.play().catch(e => console.error("Audio blocked:", e));
    } else {
      audioRef.current.pause();
    }
  }, [isRunning, audioEnabled]);

  useEffect(() => {
    let timer;
    if (isRunning) {
      timer = setInterval(() => {
        setSecondsElapsed((prev) => {
          const newTime = prev + 1;
          localStorage.setItem(`timer_${task._id}`, newTime);
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning, task._id]);

  const toggleTimer = () => {
    if (!hasStarted) setHasStarted(true);
    setIsRunning(!isRunning);
  };

  const handleDone = () => {
    localStorage.removeItem(`timer_${task._id}`);
    const actualMinutesSpent = Math.round(secondsElapsed / 60);
    onComplete(task._id, actualMinutesSpent);
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

        {/* FIXED 4: This invisible HTML element is what actually plays the audio.mp3 file */}
        <audio ref={audioRef} src="/audio.mp3" loop className="hidden" />

      </div>
    </div>
  );
};

export default ActiveTaskCard;