import React from 'react';

const MasterTaskList = ({ tasks, onDelete }) => {
  if (!tasks || tasks.length === 0) return null;

  return (
    <div className="mt-12 w-full max-w-md mx-auto">
      <h3 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
        <span>🗄️</span> Database Backlog
      </h3>
      <div className="flex flex-col gap-3">
        {tasks.map((task) => (
          <div key={task._id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all group">
            <div>
              <h4 className="font-semibold text-gray-200 group-hover:text-white transition-colors">{task.title}</h4>
              <p className="text-xs text-gray-500 mt-1">⏳ {task.estimatedMinutes} mins | {task.energyLevel}</p>
            </div>
            <button onClick={() => onDelete(task._id)} className="text-gray-500 hover:text-red-400 hover:bg-red-500/10 p-2 rounded-lg transition-colors cursor-pointer">
              🗑️
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MasterTaskList;