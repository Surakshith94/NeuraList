import { useState, useEffect } from 'react';
import axios from 'axios';
import ActiveTaskCard from './components/ActiveTaskCard';
import OvertimeModal from './components/OvertimeModal';
import TaskQueue from './components/TaskQueue'; 
import AddTaskModal from './components/AddTaskModal'; 
import MoodSelectorModal from './components/MoodSelectorModal'; 
import SleepCountdown from './components/SleepCountdown'; 
import { applyEnergyWave, applyTimeBonus } from './utils/algorithm';
import MasterTaskList from './components/MasterTaskList'; 
import ProjectSummary from './components/ProjectSummary'; 
import ConsistencyHeatmap from './components/ConsistencyHeatmap'; 

function App() {
  const [allTasks, setAllTasks] = useState([]); 
  const [activeTask, setActiveTask] = useState(null);
  const [queueTasks, setQueueTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [hasEveningStarted, setHasEveningStarted] = useState(() => localStorage.getItem('hasEveningStarted') === 'true');
  const [currentMood, setCurrentMood] = useState(() => localStorage.getItem('currentMood') || null);
  
  const [isMoodModalOpen, setIsMoodModalOpen] = useState(false);
  const [isOvertimeModalOpen, setIsOvertimeModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // --- UPGRADED: Save the IDs of the active task and queue to storage ---
  const syncLayoutToStorage = (active, queue) => {
    if (active) localStorage.setItem('activeTaskId', active._id);
    else localStorage.removeItem('activeTaskId');
    
    if (queue) localStorage.setItem('queueTaskIds', JSON.stringify(queue.map(t => t._id)));
  };

  const processAndQueueTasks = (mood, rawTasks) => {
    let processedTasks = rawTasks.filter(task => task.status !== 'completed');

    if (mood === 'Burned Out') {
      processedTasks = processedTasks.filter(task => task.energyLevel === 'Recharge' || task.priority === 'High');
      processedTasks = processedTasks.map(task => {
        if (task.priority === 'High' && task.energyLevel !== 'Recharge') {
          return { ...task, estimatedMinutes: Math.min(task.estimatedMinutes, 25), title: `🚨 Sprint: ${task.title}` };
        }
        return task;
      });
    } else {
      if (mood === 'Neutral') processedTasks = processedTasks.filter(task => task.energyLevel !== 'High Focus');
      processedTasks = applyEnergyWave(processedTasks);
    }

    const priorityValues = { 'High': 3, 'Medium': 2, 'Low': 1 };
    processedTasks.sort((a, b) => priorityValues[b.priority] - priorityValues[a.priority]);

    if (processedTasks.length > 0) {
      setActiveTask(processedTasks[0]);
      setQueueTasks(processedTasks.slice(1));
      syncLayoutToStorage(processedTasks[0], processedTasks.slice(1)); // Save the initial algorithm layout
    } else {
      setActiveTask(null);
      setQueueTasks([]);
      syncLayoutToStorage(null, []);
    }
  };

  useEffect(() => {
    const fetchDatabaseTasks = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/tasks');
        setAllTasks(response.data);
        
        // --- UPGRADED: Re-hydrate using exact saved IDs to preserve drag-and-drop order ---
        if (localStorage.getItem('hasEveningStarted') === 'true') {
          const savedActiveId = localStorage.getItem('activeTaskId');
          const savedQueueIds = JSON.parse(localStorage.getItem('queueTaskIds') || '[]');

          const hydratedActive = response.data.find(t => t._id === savedActiveId) || null;
          // Assemble the queue in the EXACT order of the saved IDs
          const hydratedQueue = savedQueueIds.map(id => response.data.find(t => t._id === id)).filter(Boolean);

          if (hydratedActive) {
            setActiveTask(hydratedActive);
            setQueueTasks(hydratedQueue);
          } else {
            // Failsafe: if data is missing, re-run the algorithm
            const savedMood = localStorage.getItem('currentMood');
            processAndQueueTasks(savedMood, response.data);
          }
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching from MongoDB:", error);
        setIsLoading(false);
      }
    };
    fetchDatabaseTasks();
  }, []);

  const applyMoodAndStart = (mood) => {
    setCurrentMood(mood);
    setIsMoodModalOpen(false);
    setHasEveningStarted(true);
    localStorage.setItem('hasEveningStarted', 'true');
    localStorage.setItem('currentMood', mood);
    processAndQueueTasks(mood, allTasks);
  };

  const handleEndSession = () => {
    setHasEveningStarted(false);
    setCurrentMood(null);
    setActiveTask(null);
    setQueueTasks([]);
    
    // Wipe EVERYTHING from storage so we start fresh next time
    localStorage.removeItem('hasEveningStarted');
    localStorage.removeItem('currentMood');
    localStorage.removeItem('activeTaskId');
    localStorage.removeItem('queueTaskIds');
  };

  const handleTaskAdded = (newTask) => {
    setAllTasks([...allTasks, newTask]);
    if (hasEveningStarted) {
      const wavedNewTasks = applyEnergyWave([newTask]);
      if (!activeTask) {
        setActiveTask(wavedNewTasks[0]);
        setQueueTasks(wavedNewTasks.slice(1));
        syncLayoutToStorage(wavedNewTasks[0], wavedNewTasks.slice(1));
      } else {
        const newQueue = [...queueTasks, ...wavedNewTasks];
        setQueueTasks(newQueue);
        syncLayoutToStorage(activeTask, newQueue);
      }
    }
  };

  const handleComplete = async (taskId, actualMinutesSpent) => {
    const timeSpent = actualMinutesSpent || activeTask.estimatedMinutes;
    const overtime = timeSpent - activeTask.estimatedMinutes;
    const undertime = activeTask.estimatedMinutes - timeSpent;

    if (overtime > 0) {
      setActiveTask({ ...activeTask, timeSpent: timeSpent }); 
      setIsOvertimeModalOpen(true);
      return; 
    }

    let updatedQueue = [...queueTasks];
    if (undertime > 0) {
      updatedQueue = applyTimeBonus(updatedQueue, undertime);
    }

    try {
      if (!activeTask.isSystemGenerated) {
        await axios.put(`http://localhost:5000/api/tasks/${taskId}`, { status: 'completed', completedAt: new Date() });
        setAllTasks(allTasks.map(t => t._id === taskId ? { ...t, status: 'completed', completedAt: new Date() } : t));
      }

      if (updatedQueue.length > 0) {
        setActiveTask(updatedQueue[0]);
        setQueueTasks(updatedQueue.slice(1));
        syncLayoutToStorage(updatedQueue[0], updatedQueue.slice(1)); // Save new state
      } else {
        setActiveTask(null);
        setQueueTasks([]);
        syncLayoutToStorage(null, []);
      }
    } catch (error) {
      console.error("Error completing task:", error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await axios.delete(`http://localhost:5000/api/tasks/${taskId}`);
      setAllTasks(allTasks.filter(task => task._id !== taskId));
    } catch (error) {
      console.error(error);
    }
  };

  // --- UPGRADED: Save the new queue order when you drag and drop ---
  const handleReorderQueue = (newOrderedTasks) => {
    setQueueTasks(newOrderedTasks);
    syncLayoutToStorage(activeTask, newOrderedTasks);
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
        <header className="mb-10 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500 tracking-tight">Good Evening.</h1>
          <div className="flex items-center gap-4">
            <SleepCountdown targetBedtime="23:00" />
            <button onClick={() => setIsAddModalOpen(true)} className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-xl font-bold transition-colors cursor-pointer border border-white/10" title="Add New Task">+</button>
          </div>
        </header>

        {!hasEveningStarted ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white/5 border border-white/10 rounded-[32px] mb-8">
            <h2 className="text-2xl font-bold mb-2">Ready to begin?</h2>
            <p className="text-gray-400 mb-8 text-center px-6">Your tasks are synced. Let the algorithm optimize your night.</p>
            <button onClick={() => setIsMoodModalOpen(true)} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-lg shadow-blue-500/20 cursor-pointer border border-blue-400/50 mb-6">Start My Evening</button>
            <ConsistencyHeatmap tasks={allTasks} />
            <ProjectSummary tasks={allTasks.filter(t => t.status !== 'completed')} />
            <MasterTaskList tasks={allTasks.filter(task => task.status !== 'completed')} onDelete={handleDeleteTask} />
          </div>
        ) : (
          <>
            <div className="mb-6 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Current State:</span>
                <span className="bg-white/10 px-3 py-1 rounded-full text-xs font-bold text-blue-400 border border-blue-500/30">{currentMood}</span>
              </div>
              <button onClick={handleEndSession} className="text-xs font-bold text-gray-400 hover:text-white transition-colors border border-white/10 hover:border-white/30 bg-white/5 px-4 py-2 rounded-full cursor-pointer flex items-center gap-2">🏠 Back to Dashboard</button>
            </div>

            {activeTask ? (
              <ActiveTaskCard task={activeTask} onComplete={handleComplete} />
            ) : (
              <div className="p-8 text-center border border-dashed border-white/20 rounded-2xl bg-white/5 mb-6">
                <p className="text-gray-400">No active tasks match your current mood. You are free!</p>
              </div>
            )}

            {/* UPGRADED: Passes the new handleReorderQueue function */}
            <TaskQueue tasks={queueTasks} onReorder={handleReorderQueue} />
          </>
        )}

        <MoodSelectorModal isOpen={isMoodModalOpen} onSelectMood={applyMoodAndStart} onClose={() => setIsMoodModalOpen(false)} />
        <AddTaskModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onTaskAdded={handleTaskAdded} />
        <OvertimeModal isOpen={isOvertimeModalOpen} taskTitle={activeTask?.title} overtimeMinutes={activeTask ? activeTask.timeSpent - activeTask.estimatedMinutes : 0} onDropTask={() => setIsOvertimeModalOpen(false)} onPushBedtime={() => setIsOvertimeModalOpen(false)} />
      </div>
    </div>
  );
}

export default App;