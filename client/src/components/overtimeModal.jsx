import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const OvertimeModal = ({ isOpen, taskTitle, overtimeMinutes, queueTasks, onDropTask, onPushBedtime }) => {
  const [isSelecting, setIsSelecting] = useState(false);

  // Reset the view every time the modal opens
  useEffect(() => {
    if (!isOpen) setIsSelecting(false);
  }, [isOpen]);

  // Sort the queue so Low priority tasks are listed first (the easiest to drop)
  const droppableTasks = queueTasks ? [...queueTasks].sort((a, b) => {
    const prio = { 'Low': 1, 'Medium': 2, 'High': 3 };
    return prio[a.priority] - prio[b.priority];
  }) : [];

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-[425px] bg-[#121218] border-white/10 text-white rounded-[24px] [&>button]:hidden">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-red-400 mb-2 flex items-center gap-2">
            <span>⏱️</span> Overtime Detected
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            You spent <strong className="text-white">{overtimeMinutes} extra minutes</strong> on "{taskTitle}".
            To maintain your schedule, the algorithm needs instructions.
          </DialogDescription>
        </DialogHeader>

        {!isSelecting ? (
          <div className="flex flex-col gap-4 mt-4">
            <div 
              className="p-4 rounded-xl border border-white/10 bg-white/5 hover:border-red-500/50 hover:bg-red-500/5 transition-colors cursor-pointer group" 
              onClick={() => setIsSelecting(true)}
            >
              <h4 className="font-bold text-white mb-1 group-hover:text-red-400 transition-colors">Option 1: Sacrifice a Task</h4>
              <p className="text-sm text-gray-400">Select a less important task to skip tonight so you still hit your bedtime.</p>
            </div>
            
            <div 
              className="p-4 rounded-xl border border-white/10 bg-white/5 hover:border-blue-500/50 hover:bg-blue-500/5 transition-colors cursor-pointer group" 
              onClick={onPushBedtime}
            >
              <h4 className="font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">Option 2: Push Bedtime</h4>
              <p className="text-sm text-gray-400">Keep all tasks, but go to sleep {overtimeMinutes} minutes later than planned.</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col mt-4">
            <h4 className="font-bold text-white mb-3 text-center">Which task should we drop?</h4>
            <div className="max-h-[250px] overflow-y-auto flex flex-col gap-2 pr-1">
              {droppableTasks.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">No tasks left in the queue to drop.</p>
              ) : (
                droppableTasks.map(task => (
                  <button
                    key={task._id}
                    onClick={() => onDropTask(task._id)}
                    className={`flex justify-between items-center p-3 rounded-xl border transition-colors cursor-pointer ${
                      task.priority === 'Low' ? 'border-gray-500/30 bg-gray-500/10 hover:bg-gray-500/30' :
                      task.priority === 'Medium' ? 'border-yellow-500/30 bg-yellow-500/10 hover:bg-yellow-500/20' :
                      'border-red-500/30 bg-red-500/10 hover:bg-red-500/20'
                    }`}
                  >
                    <span className="text-sm font-semibold truncate max-w-[200px] text-left">{task.title}</span>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-gray-400 font-mono">{task.estimatedMinutes}m</span>
                      <span className={`px-2 py-1 rounded border ${
                        task.priority === 'High' ? 'text-red-400 border-red-500/30' : 
                        task.priority === 'Medium' ? 'text-yellow-400 border-yellow-500/30' : 
                        'text-gray-400 border-gray-500/30'
                      }`}>{task.priority}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
            <button onClick={() => setIsSelecting(false)} className="mt-6 text-sm font-bold text-gray-500 hover:text-white transition-colors cursor-pointer">
              ← Back to options
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default OvertimeModal;