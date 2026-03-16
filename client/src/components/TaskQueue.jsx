import React from 'react';

const TaskQueue = ({ tasks }) => {
  if (!tasks || tasks.length === 0) {
    return (
      <div className="mt-8 text-center p-8 border border-dashed border-white/20 rounded-2xl bg-white/5">
        <p className="text-gray-400">Your queue is empty. Time to relax!</p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
        <span>📋</span> Up Next
      </h3>
      
      <div className="flex flex-col gap-3">
        {tasks.map((task, index) => (
          <div 
            key={task._id} 
            className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group"
          >
            {/* Left side: Order number and Title */}
            <div className="flex items-center gap-4">
              <span className="text-gray-500 font-mono text-sm">{index + 1}</span>
              <div>
                <h4 className="font-semibold text-gray-200 group-hover:text-white transition-colors">
                  {task.title}
                </h4>
                <p className="text-xs text-gray-500 mt-1">
                  ⏳ {task.estimatedMinutes} mins | {task.energyLevel}
                </p>
              </div>
            </div>

            {/* Right side: Priority Tag */}
            <div>
              <span className={`text-xs px-2 py-1 rounded-md font-medium border ${
                task.priority === 'High' 
                  ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                  : task.priority === 'Medium'
                  ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                  : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
              }`}>
                {task.priority}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskQueue;