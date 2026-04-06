import { useState, useEffect } from 'react';
import axios from 'axios';
import ActiveTaskCard from './components/ActiveTaskCard';
import OvertimeModal from './components/OvertimeModal';
import TaskQueue from './components/TaskQueue'; 
import AddTaskModal from './components/AddTaskModal'; 
import EditTaskModal from './components/EditTaskModal'; 
import MoodSelectorModal from './components/MoodSelectorModal'; 
import SleepCountdown from './components/SleepCountdown'; 
import { applyEnergyWave, applyTimeBonus } from './utils/algorithm';
import MasterTaskList from './components/MasterTaskList'; 
import ProjectSummary from './components/ProjectSummary'; 
import ConsistencyHeatmap from './components/ConsistencyHeatmap';
import EveningTimeline from './components/ProgressBar';
import RechargeCheckModal from './components/RechargeCheckModal';

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
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);

  // Recharge Modal State
  const [isRechargeModalOpen, setIsRechargeModalOpen] = useState(false);
  const [pendingCompletionData, setPendingCompletionData] = useState(null);

  const syncLayoutToStorage = (active, queue) => {
    if (active) localStorage.setItem('activeTaskId', active._id);
    else localStorage.removeItem('activeTaskId');
    
    if (queue) localStorage.setItem('queueTaskIds', JSON.stringify(queue.map(t => t._id)));
  };

  const processAndQueueTasks = (mood, rawTasks) => {
    let processedTasks = rawTasks.filter(task => task.status !== 'completed');

    // 1. FILTERING: High Priority tasks NEVER get deleted, regardless of mood.
    processedTasks = processedTasks.filter(task => {
      if (task.priority === 'High') return true; 

      if (mood === 'Burned Out') return task.energyLevel === 'Recharge';
      if (mood === 'Neutral') return task.energyLevel !== 'High Focus';
      
      return true; 
    });

    // 2. MICRO-SPRINTS
    processedTasks = processedTasks.map(task => {
      if (task.priority === 'High') {
        if (mood === 'Burned Out' && task.energyLevel !== 'Recharge') {
          return { ...task, estimatedMinutes: Math.min(task.estimatedMinutes, 10), title: `🚨 Micro-Sprint: ${task.title}` };
        } else if (mood === 'Neutral' && task.energyLevel === 'High Focus') {
          return { ...task, estimatedMinutes: Math.min(task.estimatedMinutes, 15), title: `🚨 Sprint: ${task.title}` };
        }
      }
      return task;
    });

    // 3. Optional: Apply Energy Wave for long tasks if you feel okay
    if (mood !== 'Burned Out') {
      processedTasks = applyEnergyWave(processedTasks);
    }

    // 4. Calculate Time Until Bedtime
    const now = new Date();
    const bedtime = new Date();
    bedtime.setHours(23, 0, 0, 0); 
    if (now > bedtime) bedtime.setDate(bedtime.getDate() + 1);

    let minutesUntilSleep = Math.floor((bedtime - now) / 60000);
    if (minutesUntilSleep <= 0) minutesUntilSleep = 60; 

    // 5. Group by Priority
    const highTasks = processedTasks.filter(t => t.priority === 'High');
    const medTasks = processedTasks.filter(t => t.priority === 'Medium');
    const lowTasks = processedTasks.filter(t => t.priority === 'Low');

    let finalQueue = [];
    let timeRemaining = minutesUntilSleep;

    // 6. Proportional Squeezing
    const processGroup = (group) => {
      if (group.length === 0 || timeRemaining <= 0) return;

      const groupTotalTime = group.reduce((sum, t) => sum + t.estimatedMinutes, 0);

      if (groupTotalTime <= timeRemaining) {
        finalQueue.push(...group);
        timeRemaining -= groupTotalTime;
      } else {
        const ratio = timeRemaining / groupTotalTime;
        group.forEach(t => {
          const squeezedTime = Math.max(5, Math.floor(t.estimatedMinutes * ratio)); 
          finalQueue.push({
            ...t,
            estimatedMinutes: squeezedTime,
            title: t.title.includes('Sprint') ? t.title : `⏱️ Squeezed: ${t.title}`
          });
        });
        timeRemaining = 0; 
      }
    };

    processGroup(highTasks);
    processGroup(medTasks);
    processGroup(lowTasks);

    // 7. Update the UI
    if (finalQueue.length > 0) {
      setActiveTask(finalQueue[0]);
      setQueueTasks(finalQueue.slice(1));
      syncLayoutToStorage(finalQueue[0], finalQueue.slice(1)); 
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
        
        if (localStorage.getItem('hasEveningStarted') === 'true') {
          const savedActiveId = localStorage.getItem('activeTaskId');
          const savedQueueIds = JSON.parse(localStorage.getItem('queueTaskIds') || '[]');

          const hydratedActive = response.data.find(t => t._id === savedActiveId) || null;
          const hydratedQueue = savedQueueIds.map(id => response.data.find(t => t._id === id)).filter(Boolean);

          if (hydratedActive) {
            setActiveTask(hydratedActive);
            setQueueTasks(hydratedQueue);
          } else {
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

  const openEditModal = (task) => {
    setTaskToEdit(task);
    setIsEditModalOpen(true);
  };

  const handleTaskUpdated = (updatedTask) => {
    const updatedAllTasks = allTasks.map(t => t._id === updatedTask._id ? updatedTask : t);
    setAllTasks(updatedAllTasks);

    if (activeTask && activeTask._id === updatedTask._id) {
      setActiveTask(updatedTask);
      syncLayoutToStorage(updatedTask, queueTasks);
    }

    const updatedQueue = queueTasks.map(t => t._id === updatedTask._id ? updatedTask : t);
    setQueueTasks(updatedQueue);
    syncLayoutToStorage(activeTask, updatedQueue);
  };

  const finalizeTaskCompletion = async (taskId, timeSpent) => {
    const undertime = activeTask.estimatedMinutes - timeSpent;
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
        syncLayoutToStorage(updatedQueue[0], updatedQueue.slice(1)); 
      } else {
        setActiveTask(null);
        setQueueTasks([]);
        syncLayoutToStorage(null, []);
      }
    } catch (error) {
      console.error("Error completing task:", error);
    }
  };

  const handleComplete = async (taskId, actualMinutesSpent) => {
    const timeSpent = actualMinutesSpent || activeTask.estimatedMinutes;
    const overtime = timeSpent - activeTask.estimatedMinutes;

    if (overtime > 0) {
      setActiveTask({ ...activeTask, timeSpent: timeSpent }); 
      setIsOvertimeModalOpen(true);
      return; 
    }

    if (activeTask.energyLevel === 'Recharge' && currentMood !== 'Energized') {
      setPendingCompletionData({ taskId, timeSpent });
      setIsRechargeModalOpen(true);
      return;
    }

    finalizeTaskCompletion(taskId, timeSpent);
  };

  const handleLevelUpMood = () => {
    setIsRechargeModalOpen(false);
    const newMood = currentMood === 'Burned Out' ? 'Neutral' : 'Energized';
    setCurrentMood(newMood);
    localStorage.setItem('currentMood', newMood);
    
    finalizeTaskCompletion(pendingCompletionData.taskId, pendingCompletionData.timeSpent).then(() => {
      processAndQueueTasks(newMood, allTasks);
    });
  };

  const handleStayRelaxed = () => {
    setIsRechargeModalOpen(false);
    finalizeTaskCompletion(pendingCompletionData.taskId, pendingCompletionData.timeSpent);
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await axios.delete(`http://localhost:5000/api/tasks/${taskId}`);
      setAllTasks(allTasks.filter(task => task._id !== taskId));
    } catch (error) {
      console.error(error);
    }
  };

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
            
            <MasterTaskList 
              tasks={allTasks.filter(task => task.status !== 'completed')} 
              onDelete={handleDeleteTask} 
              onEdit={openEditModal} 
            />
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

            <EveningTimeline activeTask={activeTask} queueTasks={queueTasks} />

            {activeTask ? (
              <ActiveTaskCard task={activeTask} onComplete={handleComplete} />
            ) : (
              <div className="p-8 text-center border border-dashed border-white/20 rounded-2xl bg-white/5 mb-6">
                <p className="text-gray-400">No active tasks match your current mood. You are free!</p>
              </div>
            )}

            <TaskQueue tasks={queueTasks} onReorder={handleReorderQueue} />
          </>
        )}

        <MoodSelectorModal isOpen={isMoodModalOpen} onSelectMood={applyMoodAndStart} onClose={() => setIsMoodModalOpen(false)} />
        <AddTaskModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onTaskAdded={handleTaskAdded} />
        
        <EditTaskModal 
          isOpen={isEditModalOpen} 
          onClose={() => setIsEditModalOpen(false)} 
          taskToEdit={taskToEdit} 
          onTaskUpdated={handleTaskUpdated} 
        />

        <RechargeCheckModal 
          isOpen={isRechargeModalOpen} 
          onLevelUp={handleLevelUpMood} 
          onStayRelaxed={handleStayRelaxed} 
        />

        <OvertimeModal isOpen={isOvertimeModalOpen} taskTitle={activeTask?.title} overtimeMinutes={activeTask ? activeTask.timeSpent - activeTask.estimatedMinutes : 0} onDropTask={() => setIsOvertimeModalOpen(false)} onPushBedtime={() => setIsOvertimeModalOpen(false)} />
      </div>
    </div>
  );
}

export default App;