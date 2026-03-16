import React from 'react';

const ActiveTaskCard = ({ task, onComplete, onPause }) => {
  if (!task) return null;

  return (
    // The main card container: Dark gradient, rounded corners, subtle border, shadow
    <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 to-black rounded-[28px] p-6 shadow-2xl border border-white/5 mb-6">
      
      {/* The glowing accent line at the top */}
      <div className="absolute top-0 left-[10%] w-[80%] h-[2px] bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-80"></div>
      
      {/* Header with Tags */}
      <div className="flex justify-between items-center mb-4">
        <span className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-400">
          Now Playing
        </span>
        <span className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-400">
          {task.energyLevel}
        </span>
      </div>

      {/* Task Title & Time */}
      <h2 className="text-2xl font-bold mb-2 leading-tight text-white">{task.title}</h2>
      <p className="text-sm text-gray-400 mb-6 flex items-center gap-2">
        <span>⏳</span> {task.timeSpent} mins spent / {task.estimatedMinutes} mins total
      </p>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button 
          onClick={() => onComplete(task._id)}
          className="flex-2 flex items-center justify-center gap-2 bg-green-500/10 text-green-400 hover:bg-green-500/20 py-3 px-6 rounded-2xl font-bold text-lg transition-all duration-200 cursor-pointer w-full border border-green-500/20"
        >
          <span className="text-xl">✅</span> Done
        </button>
        
        <button 
          onClick={() => onPause(task._id)}
          className="flex-1 flex items-center justify-center bg-white/5 text-white hover:bg-white/10 py-3 px-6 rounded-2xl font-bold text-lg transition-all duration-200 cursor-pointer w-full border border-white/10"
        >
          ⏸️ Pause
        </button>
      </div>
    </div>
  );
};

export default ActiveTaskCard;