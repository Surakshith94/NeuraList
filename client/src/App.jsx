import { useState, useEffect } from 'react';
import axios from 'axios';
import ActiveTaskCard from './components/ActiveTaskCard';
import OvertimeModal from './components/OvertimeModal';
import TaskQueue from './components/TaskQueue'; 
import AddTaskModal from './components/AddTaskModal'; 
import MoodSelectorModal from './components/MoodSelectorModal'; 
// --- NEW: Importing our custom algorithm engine ---
import { applyEnergyWave, applyTimeBonus } from './utils/algorithm';

function App() {
  const [allTasks, setAllTasks] = useState([]); 
  const [activeTask, setActiveTask] = useState(null);
  const [queueTasks, setQueueTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [hasEveningStarted, setHasEveningStarted] = useState(false);
  const [currentMood, setCurrentMood] = useState(null);
  const [isMoodModalOpen, setIsMoodModalOpen] = useState(false);
  const [isOvertimeModalOpen, setIsOvertimeModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    const fetchDatabaseTasks = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/tasks');
        setAllTasks(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching from MongoDB:", error);
        setIsLoading(false);
      }
    };
    fetchDatabaseTasks();
  }, []);

  // --- UPGRADED: The Smart Filtering & Slicing Engine ---
  const applyMoodAndStart = (mood) => {
    setCurrentMood(mood);
    setIsMoodModalOpen(false);
    setHasEveningStarted(true);

    let processedTasks = [...allTasks];

    if (mood === 'Burned Out') {
      // Keep only Recharge AND High Priority tasks
      processedTasks = processedTasks.filter(
        task => task.energyLevel === 'Recharge' || task.priority === 'High'
      );
      // Shrink High Priority tasks to 25-min sprints
      processedTasks = processedTasks.map(task => {
        if (task.priority === 'High' && task.energyLevel !== 'Recharge') {
          return { 
            ...task, 
            estimatedMinutes: Math.min(task.estimatedMinutes, 25), 
            title: `🚨 Sprint: ${task.title}` 
          };
        }
        return task;
      });
    } else {
      // If Neutral, remove High Focus
      if (mood === 'Neutral') {
        processedTasks = processedTasks.filter(task => task.energyLevel !== 'High Focus');
      }
      // Apply the Energy Wave to slice up massive blocks of work
      processedTasks = applyEnergyWave(processedTasks);
    }

    // Sort by Priority
    const priorityValues = { 'High': 3, 'Medium': 2, 'Low': 1 };
    processedTasks.sort((a, b) => priorityValues[b.priority] - priorityValues[a.priority]);

    if (processedTasks.length > 0) {
      setActiveTask(processedTasks[0]);
      setQueueTasks(processedTasks.slice(1));
    } else {
      setActiveTask(null);
      setQueueTasks([]);
    }
  };

  const handleTaskAdded = (newTask) => {
    setAllTasks([...allTasks, newTask]);
    if (hasEveningStarted) {
      // Run the new task through the energy wave just in case it's huge
      const wavedNewTasks = applyEnergyWave([newTask]);
      if (!activeTask) {
        setActiveTask(wavedNewTasks[0]);
        setQueueTasks(wavedNewTasks.slice(1));
      } else {
        setQueueTasks([...queueTasks, ...wavedNewTasks]);
      }
    }
  };

  // --- UPGRADED: Handle Overtime AND Time Bonuses ---
  const handleComplete = async (taskId) => {
    // We assume timeSpent comes from your backend tracking, or a timer component.
    // For this example logic, we are checking the delta.
    const timeSpent = activeTask.timeSpent || activeTask.estimatedMinutes; // Fallback if no timer is actively running
    const overtime = timeSpent - activeTask.estimatedMinutes;
    const undertime = activeTask.estimatedMinutes - timeSpent;
    
    // 1. If Overtime, trigger the modal and wait for user input
    if (overtime > 0) {
      setIsOvertimeModalOpen(true);
      return; 
    }

    // 2. If Undertime (Option A), reward the user by extending the next break!
    let updatedQueue = [...queueTasks];
    if (undertime > 0) {
      updatedQueue = applyTimeBonus(updatedQueue, undertime);
    }

    // 3. Complete the task in MongoDB and shift the queue
    try {
      // Don't try to delete system-generated breaks from the database
      if (!activeTask.isSystemGenerated) {
        await axios.delete(`http://localhost:5000/api/tasks/${taskId}`);
      }

      if (updatedQueue.length > 0) {
        setActiveTask(updatedQueue[0]);
        setQueueTasks(updatedQueue.slice(1));
      } else {
        setActiveTask(null);
        setQueueTasks([]);
      }
      
    } catch (error) {
      console.error("Error completing task:", error);
    }
  };

  const handlePause = (taskId) => {
    alert('Task paused. Go grab a break!');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0d0d12] text-white flex items-center justify-center font-sans">
        <p className="text-xl text-gray-400 animate-pulse">Syncing with database...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d12] text-white p-6 md:p-12 font-sans selection:bg-green-500/30">
      <div className="max-w-md mx-auto">
        
        <header className="mb-10 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500 tracking-tight">
            Good Evening.
          </h1>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-xl font-bold transition-colors cursor-pointer border border-white/10"
          >
            +
          </button>
        </header>

        {!hasEveningStarted ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white/5 border border-white/10 rounded-[32px] mb-8">
            <h2 className="text-2xl font-bold mb-2">Ready to begin?</h2>
            <p className="text-gray-400 mb-8 text-center px-6">Your tasks are synced. Let the algorithm optimize your night.</p>
            <button 
              onClick={() => setIsMoodModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-lg shadow-blue-500/20 cursor-pointer border border-blue-400/50"
            >
              Start My Evening
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center gap-2">
              <span className="text-sm text-gray-400">Current State:</span>
              <span className="bg-white/10 px-3 py-1 rounded-full text-xs font-bold text-blue-400 border border-blue-500/30">
                {currentMood}
              </span>
            </div>

            {activeTask ? (
              <ActiveTaskCard task={activeTask} onComplete={() => handleComplete(activeTask._id)} onPause={handlePause} />
            ) : (
              <div className="p-8 text-center border border-dashed border-white/20 rounded-2xl bg-white/5 mb-6">
                <p className="text-gray-400">No active tasks match your current mood. You are free!</p>
              </div>
            )}

            <TaskQueue tasks={queueTasks} />
          </>
        )}

        <MoodSelectorModal isOpen={isMoodModalOpen} onSelectMood={applyMoodAndStart} />
        <AddTaskModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onTaskAdded={handleTaskAdded} />
        <OvertimeModal 
          isOpen={isOvertimeModalOpen}
          taskTitle={activeTask?.title}
          overtimeMinutes={activeTask ? activeTask.timeSpent - activeTask.estimatedMinutes : 0}
          onDropTask={() => {
             // Logic to drop a queue item goes here
             setIsOvertimeModalOpen(false);
          }}
          onPushBedtime={() => setIsOvertimeModalOpen(false)}
        />

      </div>
    </div>
  );
}

export default App;