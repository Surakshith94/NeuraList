import React, { useState } from 'react';

const MasterTaskList = ({ tasks, onDelete, onEdit, onRestore }) => {
  const [showCompleted, setShowCompleted] = useState(false);

  if (!tasks || tasks.length === 0) return null;

  // Split the tasks into two groups
  const pendingTasks = tasks.filter(t => t.status !== 'completed');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  return (
    <div className="mt-12 w-full max-w-md mx-auto">
      <h3 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
        <span>🗄️</span> Database Backlog
      </h3>
      
      {/* 1. Pending Tasks */}
      <div className="flex flex-col gap-3 mb-6">
        {pendingTasks.map((task) => (
          <div key={task._id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all group">
            <div>
              <h4 className="font-semibold text-gray-200 group-hover:text-white transition-colors">{task.title}</h4>
              <p className="text-xs text-gray-500 mt-1">⏳ {task.estimatedMinutes} mins | {task.energyLevel}</p>
            </div>
            
            <div className="flex items-center gap-2">
              <button onClick={() => onEdit(task)} className="text-gray-500 hover:text-blue-400 hover:bg-blue-500/10 p-2 rounded-lg transition-colors cursor-pointer" title="Edit Task">
                ✏️
              </button>
              <button onClick={() => onDelete(task._id)} className="text-gray-500 hover:text-red-400 hover:bg-red-500/10 p-2 rounded-lg transition-colors cursor-pointer" title="Delete Task">
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 2. Completed Tasks (With Undo Button) */}
      {completedTasks.length > 0 && (
        <div className="mt-8">
          <button 
            onClick={() => setShowCompleted(!showCompleted)} 
            className="text-sm font-bold text-gray-500 hover:text-white transition-colors mb-4 flex items-center gap-2 cursor-pointer"
          >
            {showCompleted ? '▼ Hide' : '▶ Show'} Completed Tasks ({completedTasks.length})
          </button>

          {showCompleted && (
            <div className="flex flex-col gap-3 opacity-60 hover:opacity-100 transition-opacity">
              {completedTasks.map((task) => (
                <div key={task._id} className="flex items-center justify-between p-4 rounded-2xl bg-green-500/5 border border-green-500/10 transition-all">
                  <div>
                    <h4 className="font-semibold text-gray-400 line-through">{task.title}</h4>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => onRestore(task._id)} 
                      className="text-gray-500 hover:text-green-400 hover:bg-green-500/10 px-3 py-2 rounded-lg transition-colors cursor-pointer text-sm font-bold"
                      title="Undo Completion"
                    >
                      ↩️ Undo
                    </button>
                    <button onClick={() => onDelete(task._id)} className="text-gray-500 hover:text-red-400 hover:bg-red-500/10 p-2 rounded-lg transition-colors cursor-pointer" title="Delete Permanently">
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MasterTaskList;